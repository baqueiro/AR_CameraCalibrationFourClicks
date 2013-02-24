
describe("Compute focal Length", function(){
	
	var fl;
	
	beforeEach(function(){
		
		var fPts = new Array(4);
		
		var p = new Processing();
		
		fPts[0] = new p.PVector(242, 347, 1);
		fPts[1] = new p.PVector(371, 362, 1);
		fPts[2] = new p.PVector(335, 475, 1);
		fPts[3] = new p.PVector(198, 454, 1);
		
		fl = focalL(fPts, 387, 257.5);
	});
	
	it("Focal length of (242, 347, 1), (371, 362, 1), (335, 475, 1), (198, 454, 1) are 1040.1360446512274", function(){
		expect(fl).toEqual(1040.1360446512274);
	});
	
	it("Permuting points in order, we get the same result :)", function(){
		
		var fPts = new Array(4);
		
		var p = new Processing();
		
		fPts[2] = new p.PVector(242, 347, 1);
		fPts[3] = new p.PVector(371, 362, 1);
		fPts[0] = new p.PVector(335, 475, 1);
		fPts[1] = new p.PVector(198, 454, 1);
		var flPerm = focalL(fPts, 387, 257.5);
		
		expect(flPerm).toEqual(fl);
	});
	
	it("Permuting in contra-order, we get the same result :)", function(){
		var fPts = new Array(4);
		
		var p = new Processing();
		
		fPts[2] = new p.PVector(242, 347, 1);
		fPts[1] = new p.PVector(371, 362, 1);
		fPts[0] = new p.PVector(335, 475, 1);
		fPts[3] = new p.PVector(198, 454, 1);
		var flPerm = focalL(fPts, 387, 257.5);
		
		expect(flPerm).toEqual(fl);
	});
	
	it("Other permutations, we don't get the same result", function(){
	var fPts = new Array(4);
		
		var p = new Processing();
		
		fPts[1] = new p.PVector(242, 347, 1);
		fPts[2] = new p.PVector(371, 362, 1);
		fPts[0] = new p.PVector(335, 475, 1);
		fPts[3] = new p.PVector(198, 454, 1);
		var flPerm = focalL(fPts, 387, 257.5);
		
		expect(flPerm).not.toEqual(fl);
	})
	
});


describe("Homography from 4 points", function() {
	
	var H;
	
	beforeEach(function(){
		var fPts = new Array(4);
		
		var p = new Processing();
		
		fPts[0] = new p.PVector(242, 347, 1);
		fPts[1] = new p.PVector(371, 362, 1);
		fPts[2] = new p.PVector(335, 475, 1);
		fPts[3] = new p.PVector(198, 454, 1);
		H = HomographyFrom4Pts(fPts);
	});
	
	it("Homography of points (242, 347, 1), (371, 362, 1), (335, 475, 1), (198, 454, 1) expect not to be null", function(){
		expect(H).not.toBeNull();
	});
	
	
	it("Homography should be equal to [ [ -57.6576953299273, 114.05672233723436, 241.99999999121167 ], [ 75.683870271845, 0.4192277169958697, 346.9999999977178 ], [ -0.06897825932495182, -0.04027837648671176, 1 ] ] ", function(){
		expect(H).toEqual([ [ -57.6576953299273, 114.05672233723436, 241.99999999121167 ], [ 75.683870271845, 0.4192277169958697, 346.9999999977178 ], [ -0.06897825932495182, -0.04027837648671176, 1 ] ] );
	});
	
});

describe("Inverse matrix calculation", function() {
	
	var invMatrix;
	
	beforeEach(function(){
		invMatrix = InternalMatrixInverse(100, 1, 100, 100);
	});
	
	it("InternalMatrixInverse of (100, 1, 100, 100) should be not null", function(){
		expect(invMatrix).not.toBeNull();
	});
	
	
	it("InternalMatrixInverse of (100, 1, 100, 100) should be equal to [ [ 0.01, 0, -1 ], [ 0, 0.01, -1 ], [ 0, 0, 1 ] ] ", function(){
		expect(invMatrix).toEqual([ [ 0.01, 0, -1 ], [ 0, 0.01, -1 ], [ 0, 0, 1 ] ] );
	});
	
});

describe("Compute Projection Matrix", function(){
	var projM;
	
	var writer = {};
	
	writer.WriteFocalLength = function(f){
		// do nothing
	};
	
	beforeEach(function(){
		var fPts = new Array(4);
		
		var p = new Processing();
		
		fPts[0] = new p.PVector(242, 347, 1);
		fPts[1] = new p.PVector(371, 362, 1);
		fPts[2] = new p.PVector(335, 475, 1);
		fPts[3] = new p.PVector(198, 454, 1);
		projM = ComputeProjectionMatrix(fPts, {w : 774, h : 515}, writer);
	});
	
	it("Projection Matrix of (242, 347, 1), (371, 362, 1), (335, 475, 1), (198, 454, 1) should be not null or empty", function(){
		expect(projM).not.toBeNull();
		expect(projM).not.toEqual([]);
	});
	
	it("Projection Matrix must be [ [ -492.32683487778934, 973.9061678325367, 56.27094087519731, 2066.3866870560973 ], [ 646.2485204971101, 3.5796965837877934, -559.0201972994353, 2962.959423263592 ], [ -0.5889907304568586, -0.3439285163280871, 0.7142786242979087, 8.538787963351814 ] ]", function(){
		expect(projM).toEqual([ [ -492.32683487778934, 973.9061678325367, 56.27094087519731, 2066.3866870560973 ], [ 646.2485204971101, 3.5796965837877934, -559.0201972994353, 2962.959423263592 ], [ -0.5889907304568586, -0.3439285163280871, 0.7142786242979087, 8.538787963351814 ] ]);
	});
});
