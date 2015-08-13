
var RushHour = function(context, images) {
	var dir = {
		H: 0,
		V: 1
	}

	var offset = {x:45,y:68};
	var cellSize = {w: 72, h: 72};

	var freeCells;

	var NO_CELL = new Cell(-1,-1);

	function Cell(x,y) {
		this.x = x;
		this.y = y;
	}

	function FreeCells(cells) {
		var freeCells = cells;

		function cellAt(mouseX, mouseY) {
			var cellX = Math.floor((mouseX - offset.x) / cellSize.w);
			var cellY = Math.floor((mouseY - offset.y) / cellSize.h);

			return getCell(cellX, cellY);
		}

		function getCell(x, y) {
			for (var i = 0; i < freeCells.length; i++) {
				if (freeCells[i].x === x && freeCells[i].y === y) {
					return freeCells[i]
				}
			}

			return NO_CELL;
		}

		function swap(oldCell, newCell) {
			for (var i = 0; i < freeCells.length; i++) {
				if (freeCells[i].x === oldCell.x && freeCells[i].y === oldCell.y) {
					freeCells[i] = newCell;
				}
			}
		}

		function printFreeCells() {
			var fcStr = "";

			for (var i = 0; i < freeCells.length; i++) {
				fcStr += "(" + freeCells[i].x + "," + freeCells[i].y + ")";
			}

			return "[" + fcStr + "]";
		}

		return {
			cellAt: cellAt,
			getCell: getCell,
			swap: swap,
			printFreeCells: printFreeCells
		}
	}

	function Vehicle(initialCell, size, orient, img) {		
		var current = initialCell;
		var size = size;
		var orientation = orient;
		var img = img;

		var hover, selected;
		var couldMoveTo = NO_CELL;

		function getBoundingBox(head) {
			var boundingBox = {};

			if (orientation === dir.H) {
				boundingBox.x = offset.x + (head.x * cellSize.w) - (cellSize.w * (size - 1));
				boundingBox.y = offset.y + head.y * cellSize.h;
			
				boundingBox.w = cellSize.w * size;
				boundingBox.h = cellSize.h;
			} else {
				boundingBox.x = offset.x + (head.x * cellSize.w);
				boundingBox.y = offset.y + (head.y * cellSize.h);
			
				boundingBox.w = cellSize.w;
				boundingBox.h = cellSize.h * size;
			}

			return boundingBox;
		}

		function mouseInside(mouseX, mouseY) {
			var bb = getBoundingBox(current);
			return 	(mouseX >= bb.x && mouseX <= bb.x + bb.w) &&
					(mouseY >= bb.y && mouseY <= bb.y + bb.h);
		}

		function checkHover(mouseX, mouseY) {
			hover = mouseInside(mouseX, mouseY);
		}

		function checkSelect(mouseX, mouseY) {
			selected = mouseInside(mouseX, mouseY);
		}

		function isHorizontalPathFree(fromCell, toCell) {
			for (var x = fromCell.x; x <= toCell.x; x++) {
				if (freeCells.getCell(x, toCell.y) === NO_CELL) {
					return false;
				}
			}

			return true;
		}

		function isVerticalPathFree(fromCell, toCell) {
			for (var y = fromCell.y; y <= toCell.y; y++) {
				if (freeCells.getCell(toCell.x, y) === NO_CELL) {
					return false;
				}
			}

			return true;
		}


		function checkPotentialMove(mouseX, mouseY) {
			couldMoveTo = NO_CELL;

			if (selected) {
				var newCell = freeCells.cellAt(mouseX, mouseY);

				if (newCell !== NO_CELL) {
					if (orientation === dir.H && current.y === newCell.y) {
						var fromX = newCell.x > current.x ? current.x + 1: newCell.x + (size - 1);
						var toX = newCell.x > current.x ? newCell.x : current.x - size;
						
						if (isHorizontalPathFree(new Cell(fromX, current.y) ,new Cell(toX, current.y))) {
							couldMoveTo = newCell.x > current.x ? newCell : new Cell(newCell.x + (size - 1), newCell.y);
						}
					}
					else if (orientation === dir.V && current.x === newCell.x) {
						var fromY = newCell.y > current.y ? current.y + size : newCell.y;
						var toY = newCell.y > current.y ? newCell.y : current.y - 1;

						if (isVerticalPathFree(new Cell(current.x, fromY), new Cell(current.x, toY))) {
							couldMoveTo = newCell.y < current.y ? newCell : new Cell(newCell.x, newCell.y - (size - 1));
							console.log(couldMoveTo.x + ", " + couldMoveTo.y);
						}
					}
				}
			}
		}

		function checkMove() {
			if (selected && couldMoveTo !== NO_CELL) {
				var i;
				if (orientation === dir.H) {
					for (i = 0; i < Math.abs(couldMoveTo.x - current.x); i++) {
						if (couldMoveTo.x < current.x) {
							moveOneLeft(new Cell(current.x - i, current.y));								
						} else {
							moveOneRight(new Cell(current.x + i, current.y));
						}
					}
				} else {
					for (i = 0; i < Math.abs(couldMoveTo.y - current.y); i++) {
						if (couldMoveTo.y > current.y) {
							moveOneDown(new Cell(current.x, current.y + i));
						} else {
							moveOneUp(new Cell(current.x, current.y - i));
						}
					}
				}

				current = couldMoveTo;
				selected = false;
				couldMoveTo = NO_CELL;

				return true;
			}

			return false;
		}

		function getCurrentPos() {
			return current;
		}

		function moveOneLeft(fromCell) {
			freeCells.swap(new Cell(fromCell.x - size, fromCell.y), fromCell);
		}

		function moveOneRight(fromCell) {
			freeCells.swap(new Cell(fromCell.x + 1, fromCell.y), new Cell(fromCell.x - (size - 1), fromCell.y));
		}	

		function moveOneUp(fromCell) {
			freeCells.swap(new Cell(fromCell.x, fromCell.y - 1), new Cell(fromCell.x, fromCell.y + (size - 1)));
		}

		function moveOneDown(fromCell) {
			freeCells.swap(new Cell(fromCell.x, fromCell.y + size), fromCell);
		}

		function drawIsolated(drawFunc, bb) {
				context.save();
				context.beginPath();

				drawFunc(bb);

				context.closePath();
				context.stroke();
				context.restore();
		}

		function drawHover(bb) {
				context.setLineDash([5]);
				context.lineWidth = 2;
				context.rect(bb.x, bb.y, bb.w, bb.h);
		}

		function drawSelected(bb) {
				context.strokeStyle = "#FF0000";
				context.lineWidth = 2;
				context.rect(bb.x, bb.y, bb.w, bb.h);
		}

		var draw = function() {
			var bb = getBoundingBox(current);

			if (orientation === dir.H) {				
				images.drawHorizontal(context, img, bb.x, bb.y);

			} else {
				images.drawVertical(context, img, bb.x, bb.y + bb.h);				
			}

			if (selected) {
				drawIsolated(drawSelected, bb);
			}
			else if (hover) {
				drawIsolated(drawHover, bb);
			}

			if (couldMoveTo !== NO_CELL) {
				var newBb = getBoundingBox(couldMoveTo);

				if (orientation === dir.H) {
					images.drawHorizontal(context, img, newBb.x, newBb.y, 0.5);		
				} else {
					images.drawVertical(context, img, newBb.x, newBb.y + newBb.h, 0.5);
				}
			}
		}

		function drawEndGame(doAnim, elapsed) {
			var bb = getBoundingBox(current);

			if (doAnim) {
				if (elapsed <= 1500) {
					// move car to right and fade out
					var deltaX = elapsed / 5;
					var opacity = Math.max(0, 1 - elapsed / 750);

					images.drawHorizontal(context, img, bb.x + deltaX, bb.y, opacity);
				}
			} else {
				if (orientation === dir.H) {				
					images.drawHorizontal(context, img, bb.x, bb.y);

				} else {
					images.drawVertical(context, img, bb.x, bb.y + bb.h);				
				}				
			}
		}

		return {
			draw: draw,
			drawEndGame: drawEndGame,
			checkHover: checkHover,
			checkSelect: checkSelect,
			checkPotentialMove: checkPotentialMove,
			checkMove: checkMove,
			getCurrentPos: getCurrentPos
		}
	}

	function init(initialFreeCells) {
		freeCells = new FreeCells(initialFreeCells);
	} 

	return {
		Cell: Cell,
		Vehicle: Vehicle,
		FreeCells: FreeCells,
		init: init
	}
};