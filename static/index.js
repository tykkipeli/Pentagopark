
var c = document.getElementById("myCanvas");

//c.width = window.innerWidth;
//c.height = window.innerHeight;

var ctx = c.getContext("2d");
ctx.fillStyle = "#FF0000";

var board = new Array(6);
var board_pos = new Array(6);
var offset = 100;
var vali = 100;
var kuula_paikan_koko = 20;
var kuula_koko = 30;
var tunnistus_sade = 20;
c.width = 2*offset + 5*vali;
c.height = 2*offset + 5*vali;

for (var i = 0; i < 6; i++) {
    board[i] = new Array(6);
    board_pos[i] = new Array(6);
    for (var j = 0; j < 6; j++) {
        board[i][j] = "Tyhja";
        board_pos[i][j] = {x: offset+ i*vali, y: offset+ j*vali};
        console.log(board_pos[i][j].x + " " + board_pos[i][j].y);
    }
}

myCanvas.addEventListener("click", function (e) {
    console.log(e.clientX + " " + e.clientY);
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            if (Math.abs(board_pos[i][j].x - x) < tunnistus_sade && Math.abs(board_pos[i][j].y - y) < tunnistus_sade) {
                board[i][j] = "Pelaaja";
            }
        }
    }
});


myCanvas.addEventListener("mousemove", function (e) {
    console.log(e.clientX + " " + e.clientY);
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            if (board[i][j] == "Pelaaja") continue;
            if (Math.abs(board_pos[i][j].x - x) < tunnistus_sade && Math.abs(board_pos[i][j].y - y) < tunnistus_sade) {
                board[i][j] = "TyhjaValittu";
            } else {
                board[i][j] = "Tyhja";
            }
        }
    }
});



function draw_board() {
    //console.log("Drawing the board");
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, c.width, c.height);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            ctx.beginPath();
            //console.log(board[i][j]);
            if (board[i][j] === "Tyhja") {
                ctx.fillStyle = 'grey';
                ctx.arc(offset+ i*vali, offset+ j*vali, kuula_paikan_koko, 0, Math.PI*2);
            } else if (board[i][j] === "TyhjaValittu") {
                ctx.fillStyle = 'grey';
                ctx.arc(offset+ i*vali, offset+ j*vali, kuula_paikan_koko + 5, 0, Math.PI*2);
            } else {
                ctx.fillStyle = 'white';
                ctx.arc(offset+ i*vali, offset+ j*vali, kuula_koko, 0, Math.PI*2);
            }
            ctx.fill();
        }
    }

    ctx.beginPath();
    ctx.moveTo(offset - 0.5*vali, offset + vali*2.5);
    ctx.lineWidth = 10;
    ctx.lineTo(offset + 5.5*vali, offset + vali*2.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offset + vali*2.5, offset - 0.5*vali);
    ctx.lineWidth = 10;
    ctx.lineTo(offset + vali*2.5, offset + 5.5*vali);
    ctx.stroke();
}

function Update() {
    //ctx.clearRect(0,0, myCanvas.width, myCanvas.height);
    draw_board();
    requestAnimationFrame(Update);
}

Update();

function board_event(xx, yy) {
    const rect = c.getBoundingClientRect();
    const x = xx - rect.left;
    const y = yy - rect.top;
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            if (Math.abs(board_pos[i][j].x - x) < tunnistus_sade && Math.abs(board_pos[i][j].y - y) < tunnistus_sade) {
                board[i][j] = "Pelaaja";
            }
        }
    }
}

$(document).ready(function() {
        $('#sendbutton').on('click', function() {
            console.log("LOL?");
            $('#myMessage').val('');
        });
        
        $('#roombutton').on('click', function() {
            console.log("MOI");
        });

        $('#myCanvas').on('click', function(e) {
            console.log('klikkasit kohtaa ' + e.clientX + ' ' + e.clientY);
        });
        
        $('#pelilinkki').on('click', function() {
            console.log("HEI");
        });

});

