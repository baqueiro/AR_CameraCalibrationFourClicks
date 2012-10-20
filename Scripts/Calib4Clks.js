/**
 *  Guillermo Baqueiro, baqueiro@cimat.mx
 */


/**
 * En este programa mostraré un proyecto tecnológico que hice en el CIMAT (www.cimat.mx). Voy a hacerlo esta vez en javascript
 * Divido el proyecto en los siguientes pasos:
 * -Funcionalidad para recuperar la posición de 4 puntos de un rectángulo en la escena
 *      1) Primera forma, directo de 4 clicks
 *      2) Segunda forma, usando un algoritmo de detección de puntos (que debo programar al parecer)
 *      3) tercera forma, transformada de hough para detectar las líneas que definen ese rectángulo (forma robusta)
 * -Hacer algoritmo para recuperar los parámetros de la cámara
 * -Dibujar algo en la escena
 */

$(document).ready(function() {
});



/*
	Compute focal length from 4 points
	Assuming:
	- Rectangular pixels, i.e. sk = 0,
	- Aspect ratio tau = 1,
	- Center of camera equals to center of image,
	i.e., matrix of internal parameters:
			f   0   u_0     1/f    0   -u/f
			0   f   v_0      0   1/(f*t)  -v/(f*t) 
			0   0    1       0    0      1
	where u_0 = img.width/2 and v_0 = img.height/2,
	We will find focal length assuming that rectangle (of 4 points) are viewing in
	perspective mode, computing the vanishing points.
	
*/
function focalL(pr,pts,u0,v0){
	
	// compute lines (2D) of rectangle
	var lrect1 = pts[0].cross(pts[1]);
	var lrect2 = pts[1].cross(pts[2]);
	var lrect3 = pts[2].cross(pts[3]);
	var lrect4 = pts[3].cross(pts[0]);
	
	// compute vanishing points
	var vsh1 = lrect1.cross(lrect3);
	var vsh2 = lrect2.cross(lrect4);
	
	if( vsh1.z === 0 || vsh2.z === 0){
		// The rectangle aren't in perspective position
		return 0;
	}else{
		vsh1.div(vsh1.z);
		vsh2.div(vsh2.z);
	}
	
	var aux = -(vsh1.x - u0)*(vsh2.x - u0) - (vsh1.y - v0)*(vsh2.y - v0);
	
	if( aux >= 0 ){
		return Math.sqrt( aux );
	}else{
		return -1;
	}
}

// Even row of dlt matrix by a single point
function DLTEvenRow(pt,u){
	return [pt.x, pt.y, 1, 0, 0, 0, -u*pt.x, -u*pt.y, -u]
}

// Odd row of dlt matrix by a single point
function DLTOddRow(pt,v){
	return [0, 0, 0, pt.x, pt.y, 1, -v*pt.x, -v*pt.y, -v];
}

/**
     Assuming:
		- pts are points of Image, over same plane
					z = 0
 */
function HomographyFrom4Pts(pts,u,v){
	
	// DLT Matrix
	var A = new Array(); 
	for(var i=0; i<pts.length; i++){
		A[2*i] = DLTEvenRow(pts[i],u);
		A[2*i+1] = DLTOddRow(pts[i],v);
	}
	
	// Homography are the solution of Ah=0
    // i.e., the eigenvector with the smallest eigenvalue of (A^t)*(A)   (1)
	// or else, the singular vector with the smallest singular value of A (applying SVD to A)   (2)

	// but, I don't find an SVD program in javascript, then I use (1) to find homography for now
	
	var At = numeric.transpose(A);
	var AtA = numeric.dot(At,A);
	var eig = numeric.eig(AtA); // d, v
	
	var idxInf = numeric.toArray(eig.d).indexOf(numeric.toArray(numeric.inf(eig.d)));
	
	if(idxInf !== -1){
		
		var h = numeric.toArray(eig.v)[idxInf];
		
		var d = h[8];
		
		return [ [h[0]/d,h[1]/d,h[2]/d],[h[3]/d,h[4]/d,h[5]/d],[h[6]/d,h[7]/d,1]  ];
	
	}else{
	
		alert("TODO: lo hallaremos de otra forma");
	}	
	
	//numeric.toArray(numeric.transpose(A));
	
}


function ProjectionM(pr,pts,sz){
	
	// compute internal parameters
	var u0 = sz.w/2;
	var v0 = sz.h/2;
	var f = focalL(pr,pts,u0,v0); // focal length
	
	if(f > 0){
		// compute homography
		var H = HomographyFrom4Pts(pts,u0,v0);
		
		// compute scale
		var Kinv = [ [1/f, 0, -u0/f]
					,[0, 1/f, -v0/f]
					,[0, 0, 1]
				   ];
		var P = numeric.toArray(numeric.dot(Kinv,H));   //   P  =   +-   Lambda * ( r1  r2  t )   :=  (  shi1 shi2 shi3  )
		var shi1 = [ P[0][0], P[1][0], P[2][0] ];
		var shi2 = [ P[0][1], P[1][1], P[2][1] ];
		var L1 = numeric.toArray(numeric.norm2( shi1 ));
		var L2 = numeric.toArray(numeric.norm2( shi2 ));
		var sc = L1/L2;
		
		// Rotation matrix
		var r1 = numeric.toArray(numeric.div(shi1,L1));
		var r2 = numeric.toArray(numeric.div(shi2,L1)); // L1!
		var r3 = [
					r1[1]*r2[2]-r1[2]*r2[1],
					r1[2]*r2[0]-r1[0]*r2[2],
					r1[0]*r2[2]-r1[2]*r2[0]
				 ];
		
		var t = [ P[0][2]/L1, P[1][2]/L1, P[2][2]/L1 ];
		
		var K = [ [f, 0, u0], [0, f, v0], [0, 0, 1]];
		
		var Rt = [
					[r1[0],r2[0],r3[0],t[0]],
					[r1[1],r2[1],r3[1],t[1]],
					[r1[2],r2[2],r3[2],t[2]]
				];
		
		var P2 = numeric.toArray(numeric.dot(K,Rt));
		
		return P2;
		
	}else{
		alert("Recarga y Elige otros puntos. Error: " + f.ToString());
		return [];
	}
}

function drawPoint(pr,pt){
	pr.ellipse(pt.x, pt.y, 5, 5);
}

function drawLine(pr,pt1,pt2){
	pr.line(pt1.x,pt1.y,pt2.x,pt2.y);
}

// Simple way to attach js code to the canvas is by using a function  
function sketchProc(pr) {  
	
	// Background Image
	var img;
	
	// Four Points of image, in Homogeneous coordinates
	var fPts = new Array(4);
	for(var i=0; i<4; i++){
		fPts[i] = new pr.PVector(0,0,1);
	}
	
	//var fPts = [{x:0,y:0,w:1},{x:0,y:0,w:1},{x:0,y:0,w:1},{x:0,y:0,w:1}];
	
	// Selected current point
	var selPt = -1;
	
	// flag for initialize process
	var initProc = false;
	
	// Background Image preload
	pr.setup = function(){
		pr.size(800, 600); // TODO: redimensionar bien a la imagen
		img = pr.loadImage("Images/t1.jpg");
		// aquí no carga img.width ni img.height
	}
	
	// 60 frames per second by default
	pr.draw = function() {
		try{
			// draw background image
			pr.image(img, 0, 0);
			
			// Drawing First 4 Points from fPts[]
			for( var i = 0; i<fPts.length; i++){
				if( selPt >= i ){
					drawPoint(pr,fPts[i]);
					if( i >= 1 ){
						if(i<fPts.length){
							drawLine(pr,fPts[i],fPts[i-1]);
						}
						if( i === fPts.length-1){
							drawLine(pr,fPts[i],fPts[0]);
						}
					}
				}
			}
			
			// Maybe TODO others things, like hough lines, or Interest points for
			// defining 4 points, that, for eviting an user correction
			
			// Defining a condition to init the process
			var conditionProcessInit = selPt === fPts.length-1;
			
			// Process, after finding 4 points
			if ( conditionProcessInit && initProc === false){
				initProc = true;
				
				// Get Projection Matrix
				var P = ProjectionM(pr,fPts, {w: img.width, h:img.height});
				
				// draw Cube
				var p13D = [0,0,1,1];
				var p23D = [0,1,1,1];
				var p33D = [1,1,1,1];
				var p43D = [1,0,1,1];
				
				var i1 = numeric.toArray(numeric.dot(P,p13D));
				var i2 = numeric.toArray(numeric.dot(P,p23D));
				var i3 = numeric.toArray(numeric.dot(P,p33D));
				var i4 = numeric.toArray(numeric.dot(P,p43D));
				
				var p1 = new pr.PVector( i1[0]/i1[2], i1[1]/i1[2] );
				var p2 = new pr.PVector( i2[0]/i2[2], i2[1]/i2[2] );
				var p3 = new pr.PVector( i3[0]/i3[2], i3[1]/i3[2] );
				var p4 = new pr.PVector( i4[0]/i4[2], i4[1]/i4[2] );
				
				
				drawLine(pr,p1,p2);
				drawLine(pr,p2,p3);
				drawLine(pr,p3,p4);
				drawLine(pr,p4,p1);
				
				
			}
		}catch(e){
			alert(e.toString());
		}
	};
    
	
	pr.mouseReleased = function() {
		if(selPt < fPts.length-1){
			selPt++;
			for( var i = 0; i<fPts.length; i++){
				if(selPt===i){
					fPts[i].x = pr.mouseX;
					fPts[i].y = pr.mouseY;
				}
			}
		}
	};
}  
  
var canvas = document.getElementById("canvas1");  
// attaching the sketchProc function to the canvas  
var p = new Processing(canvas, sketchProc);  
// p.exit(); to detach it  













