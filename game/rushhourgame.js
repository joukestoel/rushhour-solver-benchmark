var RushHourGame = function(canvas, images) {
	var context = canvas.getContext("2d");
	
	var rh = RushHour(context, images);

	var grid, vehicles, nrOfMoves, solved;

	var endAnimStartTime;
	var levelInfo;

	function init(gameConfigJson) {
		var freeCells = [];

		solved = false;
		vehicles = [];
		nrOfMoves = 0;
		levelInfo = {};
		endAnimStartTime = -1;

		var config = JSON.parse(gameConfigJson);

		for (var i = 0; i < config.freeCells.length; i++) {
			freeCells.push(new rh.Cell(config.freeCells[i][0], config.freeCells[i][1]));
		}
		rh.init(freeCells);

		levelInfo.name = config.name;
		levelInfo.difficulty = config.difficulty;
		levelInfo.threeStars = config.threeStars;
		levelInfo.twoStars = config.twoStars;

		images.load(function () {
			grid = images.grid;

			for (var j = 0; j < config.vehicles.length; j++) {
				var v = config.vehicles[j];
				vehicles.push(new rh.Vehicle(
							new rh.Cell(v.initPos[0], v.initPos[1]),
							v.size, 
							v.orient === "H" ? 0 : 1, 
							images.vehicles[v.img]));
			}		

			//checkSetup();

			drawGame();
		});

		// initialise event handling
		var canvasOffset = {
			x: canvas.offsetLeft,
			y: canvas.offsetTop
		}

		function getMouseCoor(event) {
			return {
				x: event.pageX - canvasOffset.x,
				y: event.pageY - canvasOffset.y
			};
		}

		canvas.addEventListener('mousemove', function (event) {
			event.preventDefault();

			if (!solved) {
				var mouse = getMouseCoor(event);

				for (var i = 0; i < vehicles.length; i++) {
					vehicles[i].checkPotentialMove(mouse.x, mouse.y);
					vehicles[i].checkHover(mouse.x, mouse.y);
				}

				drawGame();
			}
		});

		canvas.addEventListener('click', function (event) {
			event.preventDefault();

			if (!solved) {
				var mouse = getMouseCoor(event);

				for (var i = 0; i < vehicles.length; i++) {
					if (vehicles[i].checkMove(mouse.x, mouse.y)) {
						nrOfMoves += 1;
					} else {
						vehicles[i].checkSelect(mouse.x, mouse.y);			
					}
				}

				drawGame();
				checkGameDone();
			}
		});
	}

	function checkSetup() {
		for (var i; i < vehicles.length; i++) {

		}
	}

	function checkGameDone() {
		solved = vehicles[0].getCurrentPos().x === 5;

		if (solved) {
			initializeEndGameAnim();
		}
	}

	function drawEndGame(elapsed) {

		function renderSolved() {
			context.save();

			var fontSize = Math.floor(elapsed / 5) > 100 ? 100 : Math.floor(elapsed / 5);

			context.font = "bold " + fontSize + "px Monaco";
			context.textAlign = "center";
			context.fillText("SOLVED!", canvas.width / 2, canvas.height / 2 + 50);
			context.strokeStyle="#fff";
			context.strokeText("SOLVED!", canvas.width / 2, canvas.height / 2 + 50);

			context.restore();
		}

		function renderOneStar() {
			if (elapsed > 700) {
				drawStar(canvas.width / 2 - 25, canvas.height / 2 - 80, 50, 5, 0.5);
			}
		}

		function renderTwoStars() {
			if (elapsed > 700) {
				drawStar(canvas.width / 2 - 70, canvas.height / 2 - 80, 50, 5, 0.5);
			}
			if (elapsed > 1000) {
				drawStar(canvas.width / 2 + 30, canvas.height / 2 - 80, 50, 5, 0.5);
			}			
		}

		function renderThreeStars() {
			if (elapsed > 700) {
				drawStar(canvas.width / 2 - 120, canvas.height / 2 - 80, 50, 5, 0.5);
			}
			if (elapsed > 1000) {
				drawStar(canvas.width / 2 - 25, canvas.height / 2 - 80, 50, 5, 0.5);
			}
			if (elapsed > 1300) {
				drawStar(canvas.width / 2 + 70, canvas.height / 2 - 80, 50, 5, 0.5);			
			} 
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(grid, 0, 0);

		for (var i = 0; i < vehicles.length; i++) {
			vehicles[i].drawEndGame(i == 0, elapsed);
		}

		renderSolved(elapsed);

		if (nrOfMoves <= levelInfo.threeStars) {
			renderThreeStars();
		} else if (nrOfMoves <= levelInfo.twoStars) {
			renderTwoStars();
		} else {
			renderOneStar();
		}
		drawHud();				
	}

	function drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(grid, 0, 0);

		for (var i = 0; i < vehicles.length; i++) {
			vehicles[i].draw();
		}

		drawHud();
	}

	function drawHud() {
		context.save();

		context.font = "20px Monaco";
		context.fillText("Moves: " + nrOfMoves, 42, 525);

		context.fillText(levelInfo.difficulty + ": " + levelInfo.name, 42, 38);

		context.font = "12px Monaco";
		context.fillText(levelInfo.threeStars + " max", 90, 540);
		context.fillText(levelInfo.twoStars + " max", 90, 555);
		context.fillText("> " + levelInfo.twoStars, 90, 570);

		drawStar(47, 536, 7, 5, .5); drawStar(61, 536, 7, 5, .5); drawStar(75, 536, 7, 5, .5);
		drawStar(47, 550, 7, 5, .5); drawStar(61, 550, 7, 5, .5); 
		drawStar(47, 564, 7, 5, .5);

		context.restore();
	}

	function drawStar(x, y, r, p, m) {
	    context.save();
	    context.beginPath();
	    context.fillStyle = "gold";
	    context.translate(x, y);
	    context.moveTo(0,0-r);
	    
	    for (var i = 0; i < p; i++) {
	        context.rotate(Math.PI / p);
	        context.lineTo(0, 0 - (r*m));
	        context.rotate(Math.PI / p);
	        context.lineTo(0, 0 - r);
	    }

	    context.fill();
	    context.restore();
	}


    var initializeEndGameAnim = function() {
	    var animFrame = requestAnimationFrame;

        var recursiveAnim = function(time) {
        	if (endAnimStartTime === -1) {
				endAnimStartTime = time;
        	}

            drawEndGame(time - endAnimStartTime);

            if (time - endAnimStartTime < 2000) {
	            animFrame(recursiveAnim);
            } 
        };

        animFrame(recursiveAnim);
    }

    return {
    	init: init
    }
};