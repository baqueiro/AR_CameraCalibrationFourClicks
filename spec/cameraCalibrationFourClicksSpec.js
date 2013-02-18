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
