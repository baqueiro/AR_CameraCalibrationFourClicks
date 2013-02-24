/**
 *  Guillermo Baqueiro, baqueiro@gmail.com
 */

$(document).ready(function() {
});

/**
 * Compute focal length from 4 points
 * Assuming:
 * - Rectangular pixels, i.e. sk = 0,
 * - Aspect ratio tau = 1,
 * - Center of camera equals to center of image,
 * i.e., matrix of internal parameters:
 * f   0   u_0     1/f    0   -u/f
 * 0   f   v_0      0   1/(f*t)  -v/(f*t)
 * 0   0    1       0    0      1
 * where u_0 = img.width/2 and v_0 = img.height/2,
 * We will find focal length assuming that rectangle (of 4 points) are viewing in
 * perspective mode, computing the vanishing points. 
 */
function focalL(pts, u0, v0) {

	// compute lines (2D) of rectangle
	var lrect1 = pts[0].cross(pts[1]);
	var lrect2 = pts[1].cross(pts[2]);
	var lrect3 = pts[2].cross(pts[3]);
	var lrect4 = pts[3].cross(pts[0]);

	// compute vanishing points
	var vsh1 = lrect1.cross(lrect3);
	var vsh2 = lrect2.cross(lrect4);

	if (vsh1.z === 0 || vsh2.z === 0) {
		throw ("The rectangle isn't in a perspective position");
	} else {
		vsh1.div(vsh1.z);
		vsh2.div(vsh2.z);
	}

	var aux = -(vsh1.x - u0) * (vsh2.x - u0) - (vsh1.y - v0) * (vsh2.y - v0);

	if (aux >= 0) {
		return Math.sqrt(aux);
	} else {
		return 0;
		//throw "[internal] Sqrt of Focal length must be positive";
	}
}


/**
 *  Assuming:
 * - pts are points of Image, over same plane z = 0 
 */
function HomographyFrom4Pts(pts) {

	// DLT Matrix (http://en.wikipedia.org/wiki/Direct_linear_transformation) from camera to 3D cube scene
	var A = new Array();

	A[0] = [0, 0, 1, 0, 0, 0, 0, 0, -pts[0].x];
	A[1] = [0, 0, 0, 0, 0, 1, 0, 0, -pts[0].y];
	A[2] = [0, 1, 1, 0, 0, 0, 0, -pts[1].x, -pts[1].x];
	A[3] = [0, 0, 0, 0, 1, 1, 0, -pts[1].y, -pts[1].y];
	A[4] = [1, 1, 1, 0, 0, 0, -pts[2].x, -pts[2].x, -pts[2].x];
	A[5] = [0, 0, 0, 1, 1, 1, -pts[2].y, -pts[2].y, -pts[2].y];
	A[6] = [1, 0, 1, 0, 0, 0, -pts[3].x, 0, -pts[3].x];
	A[7] = [0, 0, 0, 1, 0, 1, -pts[3].y, 0, -pts[3].y];

	// Homography are the solution of Ah=0
	// i.e., the eigenvector with the smallest eigenvalue of (A^t)*(A)   (1)
	// or else, the singular vector with the smallest singular value of A (applying SVD to A)   (2)

	var At = numeric.transpose(A);
	var AtA = numeric.dot(At, A);
	var USV = numeric.svd(AtA);

	var d = USV.V[8][8];
	return [[USV.V[0][8] / d, USV.V[1][8] / d, USV.V[2][8] / d], [USV.V[3][8] / d, USV.V[4][8] / d, USV.V[5][8] / d], [USV.V[6][8] / d, USV.V[7][8] / d, 1]];
}

/**
 * Compute inverse matrix of internal parameters
 */ 
function InternalMatrixInverse(f, tau, u0, v0) {
	var _f = 1.0 / f;
	var _ftau = 1.0 / (f * tau);

	return [[_f, 0.0, -u0 * _f], [0.0, _ftau, -v0 * _ftau], [0.0, 0.0, 1.0]];
}

/**
 * Compute projection Matrix 
 * @param {Object} pts
 * @param {Object} sz
 */
function ComputeProjectionMatrix(pts, sz, fcnWriter) {

	// compute internal parameters
	var u0 = sz.w * 0.5;
	var v0 = sz.h * 0.5;
	var f = focalL(pts, u0, v0);
	// focal length
	fcnWriter.WriteFocalLength(f);

	try {
		// compute homography
		var H = HomographyFrom4Pts(pts);

		// compute scale
		var Kinv = InternalMatrixInverse(f, 1.0, u0, v0);
		var P = numeric.dot(Kinv, H);
		//   P  =   +-   Lambda * ( r1  r2  t )   :=  (  shi1 shi2 shi3  )

		var shi1 = [P[0][0], P[1][0], P[2][0]];
		var shi2 = [P[0][1], P[1][1], P[2][1]];

		// version 1
		var L1 = numeric.norm2(shi1);
		var L2 = numeric.norm2(shi2);
		var sc = L1 / L2;
		// TODO: devolver esta escala

		// Rotation matrix
		var r1 = numeric.div(shi1, L1);
		var r2 = numeric.div(shi2, L1);
		// S�, usamos L1! y no L2
		var r3 = [r1[1] * r2[2] - r1[2] * r2[1], r1[2] * r2[0] - r1[0] * r2[2], r1[0] * r2[2] - r1[2] * r2[0]];

		var t = [P[0][2] / L1, P[1][2] / L1, P[2][2] / L1];

		var K = [[f, 0, u0], [0, f, v0], [0, 0, 1]];

		var Rt = [[r1[0], r2[0], r3[0], t[0]], [r1[1], r2[1], r3[1], t[1]], [r1[2], r2[2], r3[2], t[2]]];

		var P2 = numeric.dot(K, Rt);

		return P2;

	} catch(e) {
		alert("Error: " + e);
		return [];
	}
}

function drawPoint(pr, pt) {
	pr.ellipse(pt.x, pt.y, 5, 5);
}

function drawLine(pr, pt1, pt2) {
	pr.line(pt1.x, pt1.y, pt2.x, pt2.y);
}

/**
 * draw Cube 
 * @param {Object} P
 * @param {Object} pr
 * @param {Object} fPts
 */
function drawCube(P, pr, fPts) {

	var p13D = [0, 0, 1, 1];
	var p23D = [0, 1, 1, 1];
	var p33D = [1, 1, 1, 1];
	var p43D = [1, 0, 1, 1];

	var i1 = numeric.dot(P, p13D);
	var i2 = numeric.dot(P, p23D);
	var i3 = numeric.dot(P, p33D);
	var i4 = numeric.dot(P, p43D);

	var p1 = new pr.PVector(i1[0] / i1[2], i1[1] / i1[2]);
	var p2 = new pr.PVector(i2[0] / i2[2], i2[1] / i2[2]);
	var p3 = new pr.PVector(i3[0] / i3[2], i3[1] / i3[2]);
	var p4 = new pr.PVector(i4[0] / i4[2], i4[1] / i4[2]);

	//pr.triangle(fPts[0].x, fPts[0].y, fPts[1].x, fPts[1].y, (p1.x + fPts[0].x) * 0.5, (p1.y + fPts[0].y) * 0.5);
	//pr.triangle(fPts[0].x, fPts[0].y, fPts[3].x, fPts[3].y, (p1.x + fPts[0].x)*0.5, (p1.y + fPts[0].y)*0.5);

	drawLine(pr, p1, p2);
	drawLine(pr, p2, p3);
	drawLine(pr, p3, p4);
	drawLine(pr, p4, p1);

	drawLine(pr, fPts[0], p1);
	drawLine(pr, fPts[1], p2);
	drawLine(pr, fPts[2], p3);
	drawLine(pr, fPts[3], p4);
}

// Find distance of two points
function Distance(pt1, pt2) {
	var xSqr = (pt1.x - pt2.x);
	var ySqr = (pt1.y - pt2.y);
	return Math.sqrt(xSqr * xSqr + ySqr * ySqr);
}

// Find min distance of pt to pts
function minDistance(pts, pt) {
	var l = pts.length;
	var min = 100000;
	var k = 0;

	for (var i = 0; i < l; i++) {
		var currDist = Distance(pt, pts[i]);
		if (currDist < min) {
			min = currDist;
			k = i;
		}
	}

	return k;
}

/**
 *  for external writer
 */
var writer = {};

writer.WriteFocalLength = function(f){
	$("#focalLength").val(f.toString());
};


var mousePressed = false;
var idxMin = 0;

// Simple way to attach js code to the canvas is by using a function
function sketchProc(pr) {

	// Background Image
	var img;

	// Four Points of image, in Homogeneous coordinates
	var fPts = new Array(4);
	for (var i = 0; i < 4; i++) {
		fPts[i] = new pr.PVector(0, 0, 1);
	}

	// Selected current point
	var selPt = -1;

	// flag for initialize process
	var initProc = false;

	// Background Image preload
	pr.setup = function() {
		img = pr.loadImage("images/t5.JPG");
	}
	// Projection matrix
	var P;

	// 60 frames per second by default
	pr.draw = function() {
		try {
			pr.size(img.width, img.height);
			// draw background image
			pr.image(img, 0, 0);

			// Drawing First 4 Points from fPts[]
			for (var i = 0; i < fPts.length; i++) {
				if (selPt >= i) {
					drawPoint(pr, fPts[i]);
					if (i >= 1) {
						if (i < fPts.length) {
							drawLine(pr, fPts[i], fPts[i - 1]);
						}
						if (i === fPts.length - 1) {
							drawLine(pr, fPts[i], fPts[0]);
						}
					}
				}
			}

			// TODO: use hough lines, or Interest points for defining 4 points

			// Defining a condition to init the process
			var conditionProcessInit = selPt === fPts.length - 1;

			// Get Projection matrix, after finding 4 points
			if (conditionProcessInit && initProc === false) {
				initProc = true;

				// Get Projection Matrix
				P = ComputeProjectionMatrix(fPts, {
					w : img.width,
					h : img.height
				}, writer);
			}

			if (initProc === true) {
				drawCube(P, pr, fPts);
			}
		} catch(e) {
			alert(e.toString());
		}
	};

	// saving 4 click points in fPts[]
	pr.mouseReleased = function() {
		if (selPt < fPts.length - 1) {
			selPt++;
			for (var i = 0; i < fPts.length; i++) {
				if (selPt === i) {
					fPts[i].x = pr.mouseX;
					fPts[i].y = pr.mouseY;
				}
			}
		}
	};

	pr.mousePressed = function() {
		if (initProc === true) {
			mousePressed = true;

			var currPoint = new pr.PVector(0, 0, 1);
			currPoint.x = pr.mouseX;
			currPoint.y = pr.mouseY;

			idxMin = minDistance(fPts, currPoint);

			// TODO: seleccionar punto mas cercano de los cuatro, d�rselo, y dibuj�rselo
		}
	}

	pr.mouseDragged = function() {
		if (mousePressed === true) {

			fPts[idxMin].x = pr.mouseX;
			fPts[idxMin].y = pr.mouseY;

			// Re-compute Projection Matrix
			P = ComputeProjectionMatrix(fPts, {
				w : img.width,
				h : img.height
			}, writer);
		}
	};
	
	pr.box(40);
}

function calculateAngle(sizeW, distance) {
	return Math.atan2(sizeW*0.5, distance) * 360 / Math.PI;
}


$("#setPyramid").click(function(){
    var focalLength = $("#focalLength").val();
    
    
    var angle = calculateAngle(800, parseFloat(focalLength));
   
});

var canvas = document.getElementById("canvas1");
// attaching the sketchProc function to the canvas
var p = new Processing(canvas, sketchProc);
// p.exit(); to detach it

