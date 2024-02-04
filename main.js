//board dimensions
cell_width = 10;					//cell width
cell_x_count = 80;					//width of board
cell_y_count = 80;					//height of board
const CELL_MARGIN = 1;				//thickness of gridcell lines

//interval variables
var interval;						//id of created interval
interval_timeout = 125;				//interval timeout (1/interval_timeout = frequency of calculating generations)

//cells data
living_cells = [];					//2D arrays of cells {x,y}:				current displayed generation
first_generation = [];				//2D arrays of cells {x,y}:				first generation
new_generation = [];				//2D arrays of cells {x,y}:				used for calculate new generation
buffor_cells = [];					//array of 2D arrays of cells {x,y}:	for "redo", "undo" operations
buffor_cells_pointer = 0;			//pointer of "undo", "redo" operations. Pointer indicate place in buffor_cells array which is now displayed.
const MAX_BUFFOR_CELLS_LENGTH = 30;	//max length of buffor_cells (maximum number of "undo" operations)

//miscellaneous
mouse_pushed = false;				//is any mouse button is pressed?
last_mouse_cell_position = null;	//last cell position pointed with cursor
started = false;					//is simulation is started?
generation = 1;						//generation iterator

//window.onload=function() - executes when loading site
window.onload=function()
{
	if(cell_x_count != this.parseInt(cell_x_count) || cell_y_count != this.parseInt(cell_y_count))
		throw 'cell_x_count or cell_y_count is not integer !!!';

	//initializing canvas and simulation
	init_canvas();
	init_simulation();

	//adding event listeners
	canv.addEventListener("mousemove",mouseMove);
	canv.addEventListener("mousedown",mouseDown);
	canv.addEventListener("mouseup",mouseUp);
	document.addEventListener("keydown",keyDown);
	document.getElementById("input_x_cells").addEventListener("change",dimensionsFormChanged);
	document.getElementById("input_y_cells").addEventListener("change",dimensionsFormChanged);
	document.getElementById("input_cell_width").addEventListener("change",dimensionsFormChanged);
	canv.oncontextmenu  = function(e)
	{
		var evt = new Object({keyCode:93});
		if(e.preventDefault != undefined)
			e.preventDefault();
		if(e.stopPropagation != undefined)
			e.stopPropagation();
	}
	interval = setInterval(simulation,interval_timeout);

	//displaying initial speed
	document.getElementById("p_speed").innerHTML = "Speed = " + 1000/interval_timeout + " generations per sec"

	//initial calculating canvas dimensions for user
	dimensionsFormChanged();
}

function whichCell(x,y,canBeOnGridcell)
{
	if( ((x % cell_width >= cell_width - CELL_MARGIN || y % cell_width >= cell_width - CELL_MARGIN) && !canBeOnGridcell) ||
		x < 0 || x >= canv.width || y < 0 || y >= canv.height)    // if cursor is(not) on gridcell or outside of canvas
		return null;
	cell_x = Math.floor(x / cell_width);
	cell_y = Math.floor(y / cell_width);
	if(!(x >= 0 && x < canv.width && y >= 0 && y < canv.height))    // if cursor is outside canvas
		return null;
	return {x:cell_x, y:cell_y};
}

// function pencilErase(evt) - pencil and erase tool - drawing or erasing cells on canvas
// evt - event (used to get position of cursor and pressed mouse button)
function pencilErase(evt)
{
	// Getting position of curson on canvas
	x = parseInt(evt.offsetX);
	y = parseInt(evt.offsetY);

	// Getting cell position on canvas
	if(last_mouse_cell_position != null) // if there is previous cell
		cell = whichCell(x,y,true);		// get pointed cell (even if cursor is on gridcell)
	else
		cell = whichCell(x,y,false);	// get pointed cell (if cursor is on cell)

	// Drawing cells
	if(cell == null && last_mouse_cell_position == null)    // if there is no cell and there is no previous cell: do not draw
	{
		return;
	}
	else if(cell!=null)		// if there is cell
	{
		if(last_mouse_cell_position != null)	//if there is previous cell - draw line between cells
		{
			if(evt.buttons === 1)		//left mouse button - draw
			{
				cells = makeCellsLine(last_mouse_cell_position,cell,"white");
				createAndDrawCells(cells);
			}
			if(evt.buttons === 2)		//left mouse button - erase
			{
				cells = makeCellsLine(last_mouse_cell_position,cell,"black");
				killAndDrawCells(cells);
			}
		}
		else	//if there is no previous cell - draw pointed cell
		{
			if(evt.buttons === 1)
				createAndDrawCells([cell]);
			if(evt.buttons === 2)
				killAndDrawCells([cell]);
		}
	}
	last_mouse_cell_position = cell;    //save previous cell
}

function init_canvas()
{
    //setting canvas dimensions
	canv=document.getElementById("canv");
	canv.width = cell_x_count * cell_width;
	canv.height = cell_y_count * cell_width;

	//filling canvas with gridcell
	ctx=canv.getContext("2d");
	ctx.fillStyle="#404040";
	ctx.fillRect(0,0,canv.width,canv.height);
	ctx.fillStyle="black";
	for(i = 0; i < cell_x_count; i++)
		for(j = 0; j < cell_y_count; j++)
			ctx.fillRect(i*cell_width,j*cell_width,cell_width-CELL_MARGIN,cell_width-CELL_MARGIN);
}

// function init_simulation() - initializes simulation - it's reseting arrays and pointer "buffor_cells_pointer"
function init_simulation()
{
	living_cells = [];
	new_generation = [];
	buffor_cells = [];
	buffor_cells_pointer = 0;
	buffor_cells.push([]);
	for(i = 0; i < cell_x_count; i++)
	{
		living_cells.push([]);
		new_generation.push([]);
		buffor_cells[0].push([]);
		for(j = 0; j < cell_y_count; j++)
		{
			living_cells[i].push(false);
			new_generation[i].push(false);
			buffor_cells[0][i].push(false);
		}
	}
}

function mouseMove(evt)
{
	if(mouse_pushed == true)
		pencilErase(evt);
}

// function mouseDown(evt) - executes when pressing mouse button (on canvas)
// evt - event (used to get mouse button)
function mouseDown(evt)
{
	mouse_pushed = true;
	pencilErase(evt);
}

// function mouseDown() - executes when leaving mouse button (on canvas)
function mouseUp()
{
	mouse_pushed = false;
	last_mouse_cell_position = null;
	
	//copying set of cells to buffor_cells for "undo", "redo" operations
	if (buffor_cells_pointer >= buffor_cells.length)
		throw 'buffor_cells_pointer < buffor_cells.length';
	if(buffor_cells_pointer < buffor_cells.length - 1)
	{
		var buf = buffor_cells.length - 1 - buffor_cells_pointer;
		for(i = 0; i < buf; i++)
		{
			buffor_cells.pop();
		}
	}
	if (buffor_cells_pointer != buffor_cells.length-1)
		throw 'buffor_cells_pointer == buffor_cells.length-1';
	if(buffor_cells.length == MAX_BUFFOR_CELLS_LENGTH)
	{
		buffor_cells.shift();
		buffor_cells_pointer--;
	}
	buffor_cells.push([]);
	for(i = 0; i < living_cells.length; i++)
	{
		buffor_cells[buffor_cells.length-1].push([]);
		for(j = 0; j < living_cells[i].length; j++)
		{
			buffor_cells[buffor_cells.length-1][i].push(living_cells[i][j]);
		}
	}
	buffor_cells_pointer++;
}

// function keyDown(evt) - executes when pressing key
// evt - event (used to get key)
function keyDown(evt)
{
	if(evt.ctrlKey == true)
	{
		if(evt.key == 'z')
			button_undo();
		else if(evt.key == 'y')
			button_redo();
	}
	else if(evt.key == 's')
	{
		if(document.getElementById("p_start_status").innerHTML == "Simulation started")
			button_stop();
		else if(document.getElementById("p_start_status").innerHTML == "Simulation stopped")
			button_start();
	}
	else if(evt.key == 'q')
		button_speedDown();
	else if(evt.key == 'e')
		button_speedUp();
	else if(evt.key == 'r')
		button_backTo1Gen();
	else if(evt.key == 'c')
		button_clear();
}

function dimensionsFormChanged()
{
    document.getElementById("a_w").innerHTML = parseInt(document.getElementById("input_x_cells").value * parseInt(document.getElementById("input_cell_width").value));
    document.getElementById("a_h").innerHTML = parseInt(document.getElementById("input_y_cells").value * parseInt(document.getElementById("input_cell_width").value));
}

// function button_submit() - function takes input parameters, checks if they are correct and applies them
function button_submit()
{
    cx = parseInt(document.getElementById("input_x_cells").value);
    cy = parseInt(document.getElementById("input_y_cells").value);
    cd = parseInt(document.getElementById("input_cell_width").value);
    if(!(cx >= 5 && cx <= 250))
        alert("Error: width of board must be between 5 and 250");
    else if(!(cy >= 5 && cy <= 250))
        alert("Error: height of board must be between 5 and 250");
    else if(!(cd >= 3 && cd <= 25))
        alert("Error: cell width must be between 3 and 25");
    else
    {
        cell_x_count = cx;
        cell_y_count = cy;
        cell_width = cd;
        button_clear();
        if(cx*cy >= 20000)
            alert("Warning: you created " + (cx*cy) + " cells - it might be diffucult for your computer to calculate it !!!!!");
        document.getElementById("a_current_cells_x").innerHTML = cx;
        document.getElementById("a_current_cells_y").innerHTML = cy;
        document.getElementById("a_current_cells_width").innerHTML = cd;
    }
}

// function button_undo() - undo operation - loads previous set of drawed cells and decrements pointer
function button_undo()
{
    if(buffor_cells_pointer > 0)
    {
        buffor_cells_pointer--;
        living_cells = [];
        for(i = 0; i < buffor_cells[buffor_cells_pointer].length; i++)
        {
            living_cells.push([]);
            for(j = 0; j < buffor_cells[buffor_cells_pointer][i].length; j++)
            {
                living_cells[i].push(buffor_cells[buffor_cells_pointer][i][j]);
            }
        }
        drawGeneration();
    }
}

// function button_redo() - redo operation - loads next set of drawed cells and increments pointer
function button_redo()
{
    if(buffor_cells_pointer < buffor_cells.length - 1)
    {
        buffor_cells_pointer++;
        living_cells = [];
        for(i = 0; i < buffor_cells[buffor_cells_pointer].length; i++)
        {
            living_cells.push([]);
            for(j = 0; j < buffor_cells[buffor_cells_pointer][i].length; j++)
            {
                living_cells[i].push(buffor_cells[buffor_cells_pointer][i][j]);
            }
        }
        drawGeneration();
    }
}

// function button_start() - starts simulation
function button_start()
{
    //is simulation started (boolean)
    started = true;

    //transforming start button into stop button
    document.getElementById("image_start_stop").src = "img/icon_stop.png";
    document.getElementById("image_start_stop").title = "stop [S]";
    document.getElementById("button_start_stop").href = "javascript:button_stop();"

    //updating information
    document.getElementById("p_start_status").innerHTML = "Simulation started";
}

// function button_stop() - stops simulation
function button_stop()
{
    started = false;

    //transforming stop button into start button
    document.getElementById("image_start_stop").src = "img/icon_start.png";
    document.getElementById("image_start_stop").title = "start [S]";
    document.getElementById("button_start_stop").href = "javascript:button_start();"

    //updating information
    document.getElementById("p_start_status").innerHTML = "Simulation stopped";
}

// function button_speedDown() - speeds down simulation
function button_speedDown()
{
    //decreasing frequency of calculating new generations
    clearInterval(interval);
    if(interval_timeout < 16000)
        interval_timeout *= 2;
    interval = setInterval(simulation,interval_timeout);

    //updating information
	document.getElementById("p_speed").innerHTML = "Speed = " + 1000/interval_timeout + " generations per sec"
}

// function button_speedUp() - speeds up simulation
function button_speedUp()
{
    //increasing frequency of calculating new generations
    clearInterval(interval);
    if(interval_timeout > 16)
        interval_timeout /= 2;
    interval = setInterval(simulation,interval_timeout);

    //updating information
	document.getElementById("p_speed").innerHTML = "Speed = " + 1000/interval_timeout + " generations per sec"
}

// function button_backTo1Gen() - goes back to first generation
function button_backTo1Gen()
{
    button_stop();
    if(generation > 1)
    {
        living_cells = [];
        for(i = 0; i < first_generation.length; i++)
		{
			living_cells.push([]);
			for(j = 0; j < first_generation[i].length; j++)
			{
				living_cells[i].push(first_generation[i][j]);
			}
        }
        drawGeneration();
        generation = 1;
        
        //update displaying generation number
        document.getElementById("p_generation").innerHTML = "Generation = " + generation;
        
        enableDisableUndoRedo(true);
    }
}

// function button_clear() - go back to first generation and clear board
function button_clear()
{
	button_backTo1Gen();
    init_canvas();
    init_simulation();
}

// function enableDisableUndoRedo(enable) - enables or disables "undo" and "redo" button
// enable - boolean: if true - enables buttons, if false - vice versa
function enableDisableUndoRedo(enable)
{
    if(enable == true)
    {
        document.getElementById("button_undo").style = "pointer-events: all; opacity: 1;";
        document.getElementById("button_redo").style = "pointer-events: all; opacity: 1;";
    }
    else
    {
        document.getElementById("button_undo").style = "pointer-events: none; opacity: 0.6;";
        document.getElementById("button_redo").style = "pointer-events: none; opacity: 0.6;";
    }
}

function drawGeneration()
{
	//filling canvas with gridcell
	ctx.fillStyle="black";
	for(i = 0; i < cell_x_count; i++)
	{
		for(j = 0; j < cell_y_count; j++)
		{
			ctx.fillRect(i*cell_width,j*cell_width,cell_width-CELL_MARGIN,cell_width-CELL_MARGIN);
		}
	}

	//drawing cells
	for(i = 0; i < living_cells.length; i++)
		for(j = 0; j < living_cells.length; j++)
			if(living_cells[i][j] == true)
				drawCell({x:i,y:j},"white");
}

// function simulation() - simulation - executes with frequency defined by user (1/interval_timeout)
function simulation()
{
	//checks if simulation is started
	if(started == false)
		return;

	//if it was first generation - copying it to buffor
	if(generation == 1)
	{
		enableDisableUndoRedo(false);
        first_generation = [];
		for(i = 0; i < living_cells.length; i++)
		{
			first_generation.push([]);
			for(j = 0; j < living_cells[i].length; j++)
			{
				first_generation[i].push(living_cells[i][j]);
			}
		}
	}

	//calculating new generation
	living_neighborhood = 0;
	for(x = 0; x < cell_x_count; x++)
	{
		for(y = 0; y < cell_y_count; y++)
		{
			//calculating living neightbors for current cell {x,y}
			living_neighborhood = 0;
			for(i = x - 1; i <= x + 1; i++)
			{
					for(j = y - 1; j <= y + 1; j++)
					{
						if(!(i == x && j == y))
						{
							if(i >= 0 && i < cell_x_count && j >= 0 && j < cell_y_count )
							{
								if(living_cells[i][j] == true)
									living_neighborhood++;
							}
							else
							{
								var ii = i;
								var jj = j;
								if(i == -1)
									ii = cell_x_count-1;
								else if(i == cell_x_count)
									ii = 0;
								if(j == -1)
									jj = cell_y_count-1;
								else if(j == cell_y_count)
									jj = 0;
								if(living_cells[ii][jj] == true)
									living_neighborhood++;
							}
						}
					}
			}
			// deciding whether a cell in the next generation will be alive or dead (using the rules of Game of Life)
			if((living_cells[x][y] == false && living_neighborhood == 3 ) || ( living_cells[x][y] == true && (living_neighborhood == 2 || living_neighborhood == 3) ))
				new_generation[x][y]=true;
			else
				new_generation[x][y]=false;
		}
	}
	//copying new generation to current set of cell
	for(i = 0; i < cell_x_count; i++)
	{
		for(j = 0; j < cell_y_count; j++)
		{
			living_cells[i][j] = new_generation[i][j];
		}
	}

	//increasing iterator
	generation++;

	//update displaying generation number
	document.getElementById("p_generation").innerHTML = "Generation = " + generation;

	//drawing new generation
	drawGeneration();
}

function makeCellsLine(prev_cell,cell)
{
	var cells = [];
	if(cell.x - prev_cell.x == 0 && cell.y - prev_cell.y == 0)  //if there will be no line (just point)
	{
		return [cell];
	}
	else if(cell.y - prev_cell.y == 0)  //if there will be horizontal line
	{
		var bottom, top;
		if(prev_cell.x > cell.x)
		{
			bottom = cell.x;
			top = prev_cell.x;
		}
		else
		{
			top = cell.x;
			bottom = prev_cell.x;
		}
		for(x = bottom; x <= top; x++)
		{
			cells.push({x:x,y:cell.y});
		}
	}
	else if(cell.x - prev_cell.x == 0)  //if there will be vertical line
	{
		var left, right;
		if(prev_cell.y > cell.y)
		{
			left = cell.y;
			right = prev_cell.y;
		}
		else
		{
			right = cell.y;
			left = prev_cell.y;
		}
		for(y = left; y <= right; y++)
		{
			cells.push({x:cell.x,y:y});
		}
	}
	else if(Math.abs(cell.x - prev_cell.x) > Math.abs(cell.y - prev_cell.y)) // if angle of line will be below 45 degrees
	{
		var a = (cell.y - prev_cell.y)/(cell.x - prev_cell.x);
		var b = cell.y-(a*cell.x);
		var bottom, top;
		if(prev_cell.x > cell.x)
		{
			bottom = cell.x;
			top = prev_cell.x;
		}
		else
		{
			top = cell.x;
			bottom = prev_cell.x;
		}
		for(x = bottom; x <= top ; x++)
		{
			y = a * x + b;
			cells.push({x:parseInt(x+0),y:parseInt(y+0)});
		}
	}
	else if(Math.abs(cell.x - prev_cell.x) <= Math.abs(cell.y - prev_cell.y)) // if angle of line will be above or equal 45 degrees
	{
		var a = (cell.y - prev_cell.y)/(cell.x - prev_cell.x);
		var b = cell.y-(a*cell.x);
		var left, right;
		if(prev_cell.y > cell.y)
		{
			left = cell.y;
			right = prev_cell.y;
		}
		else
		{
			right = cell.y;
			left = prev_cell.y;
		}
		for(y = left; y <= right; y++)
		{
			x = (y - b)/a;
			cells.push({x:parseInt(x+0),y:parseInt(y+0)});
		}
	}
	else
		throw "This exception shouldn't happen: no reachable code ... for sure???";
	return cells;
}

// function createCells(cells) - creating cells (adding to array)
// cells - 1D array of cells {x,y}
function createCells(cells)
{
	for(i = 0; i < cells.length; i++)
		living_cells[cells[i].x][cells[i].y] = true;
}

// function killCells(cells) - destroying cells (removing from array)
// cells - 1D array of cells {x,y}
function killCells(cells)
{
	for(i = 0; i < cells.length; i++)
		living_cells[cells[i].x][cells[i].y] = false;
}

// function createAndDrawCells(cells) - creating and drawing cells on canvas
// cells - 1D array of cells {x,y}
function createAndDrawCells(cells)
{
	createCells(cells);
	for(i = 0; i < cells.length; i++)
		drawCell(cells[i],"white");
}

// function killAndDrawCells(cells) - destroying and drawing cells on canvas
// cells - 1D array of cells {x,y}
function killAndDrawCells(cells)
{
	killCells(cells);
	for(i = 0; i < cells.length; i++)
		drawCell(cells[i],"black");
}

// function drawCell(cell,color) - drawing cell
// cell - cell {x,y}
function drawCell(cell,color)
{
	ctx.fillStyle=color;
	ctx.fillRect(cell.x*cell_width, cell.y*cell_width, cell_width-CELL_MARGIN, cell_width-CELL_MARGIN);
}