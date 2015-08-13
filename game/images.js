var RushHourImages = function() {
	var onload;
	var _this = this;
	
	var TO_RADIANS = Math.PI/180; 

	var nrOfLoadedImages = 0;
	var totalNrOfImages = 17;

	var grid = new Image();

	var vehicles = {};
	vehicles.redCar = new Image();
	vehicles.lightGreenCar = new Image();
	vehicles.orangeCar = new Image();
	vehicles.blueCar = new Image();
	vehicles.pinkCar = new Image();
	vehicles.purpleCar = new Image();
	vehicles.greenCar = new Image();
	vehicles.blackCar = new Image();
	vehicles.lightBrownCar = new Image();
	vehicles.yellowCar = new Image();
	vehicles.darkBrownCar = new Image();
	vehicles.darkGreenCar = new Image();
	vehicles.yellowTruck = new Image();
	vehicles.purpleTruck = new Image();
	vehicles.blueTruck = new Image();
	vehicles.greenTruck = new Image();
	
	var load = function(onload) {
		if (nrOfLoadedImages === totalNrOfImages) {
			onload();
		} else {
			_this.onload = onload;

			grid.onload = imgLoaded;
			grid.src = "img/grid.gif";

			for (var v in vehicles) {
				vehicles[v].onload = imgLoaded;
				vehicles[v].src = "img/" + v + ".gif";
			}
		}
	}

	var imgLoaded = function() {
		nrOfLoadedImages += 1;
		if (nrOfLoadedImages === totalNrOfImages) {
			_this.onload();
		}		
	}

	var drawHorizontal = function(context, img, x, y, alpha) {
		if (alpha === undefined) {
			alpha = 1;
		}

		context.save();
		
		context.globalAlpha = alpha;
		context.drawImage(img, x, y);

		context.restore();
	}

	var drawVertical = function(context, img, x, y, alpha) {
		if (alpha === undefined) {
			alpha = 1;
		}

		context.save(); 

		context.translate(x, y);
		context.rotate(-90 * TO_RADIANS);
		context.globalAlpha = alpha;
		context.drawImage(img, 0, 0);
	 
		context.restore(); 
	}

	return {
		load: load,
		grid: grid,
		vehicles: vehicles,
		drawHorizontal: drawHorizontal,
		drawVertical: drawVertical
	}	
};
