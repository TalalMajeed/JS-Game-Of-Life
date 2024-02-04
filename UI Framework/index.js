
var canvas = document.getElementById("display");
canvas.style.backgroundColor = "black";
var rect = canvas.getBoundingClientRect();
var rectx = parseInt(rect.left);
var recty = parseInt(rect.top);

var MOUSE = 0;
var MX = 0;
var MY = 0;
var ACTIVE = -1;
var TICK = parseInt(document.getElementById("tick").value);

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  }

document.getElementById("start").addEventListener("click",(e)=>{
    ACTIVE *= -1;
    if(ACTIVE == -1) {
        document.getElementById("start").innerHTML = "Start";
    }
    else {
        document.getElementById("start").innerHTML = "Stop";
        A_STRUCTURE = U_STRUCTURE.map(function(arr) {
            return arr.slice();
        });
        TICK = parseInt(document.getElementById("tick").value);
    }
})

document.getElementById("s1").addEventListener("click",(e)=>{
    TICK -= 2;
})

document.getElementById("back").addEventListener("click",(e)=>{
    U_STRUCTURE = A_STRUCTURE.map(function(arr) {
        return arr.slice();
    });
    ACTIVE = -1;
    document.getElementById("start").innerHTML = "Start";
    N_STRUCTURE = [];
    A_STRUCTURE = [];
    for(i=0;i<WIDTH/UNIT;i++) {
        SUB = [];
        for(j=0;j<HEIGHT/UNIT;j++) {
            SUB.push(0)
        }
        U_STRUCTURE.push(SUB);
    }
    
    N_STRUCTURE = U_STRUCTURE.map(function(arr) {
        return arr.slice();
    });
})

document.getElementById("s2").addEventListener("click",(e)=>{
    TICK += 2;
})

document.getElementById("reset").addEventListener("click",(e)=>{
    ACTIVE = -1;
    document.getElementById("start").innerHTML = "Start";
    U_STRUCTURE = [];
    N_STRUCTURE = [];
    A_STRUCTURE = [];
    for(i=0;i<WIDTH/UNIT;i++) {
        SUB = [];
        for(j=0;j<HEIGHT/UNIT;j++) {
            SUB.push(0)
        }
        U_STRUCTURE.push(SUB);
    }
    
    N_STRUCTURE = U_STRUCTURE.map(function(arr) {
        return arr.slice();
    });
    A_STRUCTURE = U_STRUCTURE.map(function(arr) {
        return arr.slice();
    });
})

console.log(document.getElementById("display"));
document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);

window.addEventListener('resize', function(event) {
    rect = canvas.getBoundingClientRect();
    rectx = parseInt(rect.left);
    recty = parseInt(rect.top);
}, true);

function onMouseUpdate(e) {
    MX = e.pageX - rectx;
    MY = e.pageY - recty;
}

canvas.addEventListener('mousedown', (e)=>{
    MOUSE = e.which;
});

canvas.addEventListener('mouseup', (e)=>{
    MOUSE = 0;
});

canvas.addEventListener('contextmenu',(e)=>{
    e.preventDefault();
})

var ctx = canvas.getContext("2d");

var WIDTH = 800;
var HEIGHT = 800;
var UNIT = 10;
var H_P = [];
var V_P = [];

var i = 0;
var j = 0;

var U_STRUCTURE = [];
var N_STRUCTURE = [];
var A_STRUCTURE = [];
var SUB = [];
for(i=0;i<WIDTH/UNIT;i++) {
    SUB = [];
    for(j=0;j<HEIGHT/UNIT;j++) {
        SUB.push(0)
    }
    U_STRUCTURE.push(SUB);
}

N_STRUCTURE = U_STRUCTURE.map(function(arr) {
    return arr.slice();
});

A_STRUCTURE = U_STRUCTURE.map(function(arr) {
    return arr.slice();
});

function createGrid() {
    for(i=UNIT;i<WIDTH;i+=UNIT) {
        H_P.push(i)
    }
    for(i=UNIT;i<HEIGHT;i+=UNIT) {
        V_P.push(i)
    }
}

createGrid();

function drawGrid() {
    ctx.fillStyle = "#505050";
    for(i in H_P) {
        ctx.fillRect(H_P[i], 0, 1, HEIGHT);
    }
    for(i in V_P) {
        ctx.fillRect(0, V_P[i], WIDTH, 1);
    }
}

function drawUnits() {
    ctx.fillStyle = "#fff";
    for(i in U_STRUCTURE) {
        for(j in U_STRUCTURE[i]) {
            if(U_STRUCTURE[i][j] == 1) {
                ctx.fillRect(j*UNIT, i*UNIT, UNIT, UNIT);
            }
        }
    }
}

function addUnits() {
    if(MOUSE == 1) {
        NX = MX;
        NY = MY;
        while(NX % UNIT !=0) {
            var closest = H_P.reduce(function(prev, curr) {
                return (Math.abs(curr - NX) < Math.abs(prev - NX) ? curr : prev);
            });
            if (closest > NX) {
                NX += 1; 
            }
            else {
                NX -= 1;
            }
        }
        while(NY % UNIT !=0) {
            var closest = V_P.reduce(function(prev, curr) {
                return (Math.abs(curr - NY) < Math.abs(prev - NY) ? curr : prev);
            });
            if (closest > NY) {
                NY += 1; 
            }
            else {
                NY -= 1;
            }
        }
        try {
            U_STRUCTURE[NY/UNIT - 1][NX/UNIT - 1] = 1;
        }
        catch {

        }
    }
}

function removeUnits() {
    if(MOUSE == 3) {
        NX = MX;
        NY = MY;
        while(NX % UNIT !=0) {
            var closest = H_P.reduce(function(prev, curr) {
                return (Math.abs(curr - NX) < Math.abs(prev - NX) ? curr : prev);
            });
            if (closest > NX) {
                NX += 1; 
            }
            else {
                NX -= 1;
            }
        }
        while(NY % UNIT !=0) {
            var closest = V_P.reduce(function(prev, curr) {
                return (Math.abs(curr - NY) < Math.abs(prev - NY) ? curr : prev);
            });
            if (closest > NY) {
                NY += 1; 
            }
            else {
                NY -= 1;
            }
        }
        try {
            U_STRUCTURE[NY/UNIT - 1][NX/UNIT - 1] = 0;
        }
        catch {

        }
    }
}

function g(array,x,y) {
    try {
        if (typeof array[x][y] === 'undefined') {
            return 0;
        }
        else {
            return array[x][y];
        }
    }
    catch{
        return 0;
    }
}
function updateUnits() {
    for(i in U_STRUCTURE) {
        for(j in U_STRUCTURE[i]) {
                /*console.log(i,j);
                console.log(g(U_STRUCTURE,parseInt(i)+1,parseInt(j)-1));
                console.log(g(U_STRUCTURE,parseInt(i),parseInt(j)-1));
                console.log(g(U_STRUCTURE,parseInt(i)-1,parseInt(j)-1));
                console.log(g(U_STRUCTURE,parseInt(i)+1,parseInt(j)+1));
                console.log(g(U_STRUCTURE,parseInt(i),parseInt(j)+1));
                console.log(g(U_STRUCTURE,parseInt(i)-1,parseInt(j)+1));
                console.log(g(U_STRUCTURE,parseInt(i)+1,parseInt(j)));
                console.log(g(U_STRUCTURE,parseInt(i)-1,parseInt(j)));*/

                SUM = g(U_STRUCTURE,parseInt(i)+1,parseInt(j)-1) + g(U_STRUCTURE,parseInt(i),parseInt(j)-1) 
                + g(U_STRUCTURE,parseInt(i)-1,parseInt(j)-1) + g(U_STRUCTURE,parseInt(i)+1,parseInt(j)+1)
                + g(U_STRUCTURE,parseInt(i),parseInt(j)+1) + g(U_STRUCTURE,parseInt(i)-1,parseInt(j)+1)
                + g(U_STRUCTURE,parseInt(i)+1,parseInt(j)) + g(U_STRUCTURE,parseInt(i)-1,parseInt(j))

                if (SUM > 0) {
                    if(U_STRUCTURE[i][j] == 1) {
                        if(SUM == 2 || SUM == 3) {
                            N_STRUCTURE[i][j] = 1
                        }
                        else {
                            N_STRUCTURE[i][j] = 0
                        }
                    }
                    else if(U_STRUCTURE[i][j] == 0) {
                        if(SUM == 3) {
                            N_STRUCTURE[i][j] = 1
                        }
                    }   
                }
        }
    }
    shiftArray();
}

function Progress() {
    if(TIMER > TICK) {
        if(ACTIVE == 1) {
            updateUnits();
        }
        TIMER = 0;
    }   
}

function shiftArray() {

    U_STRUCTURE = N_STRUCTURE.map(function(arr) {
        return arr.slice();
    });
    
}

var TIMER = 0;

function main() {
    ctx.clearRect(0,0,800,800);
    drawUnits();
    drawGrid();
    addUnits();
    removeUnits();
    TIMER += 1;
    Progress();
    requestAnimationFrame(main);
}

main();