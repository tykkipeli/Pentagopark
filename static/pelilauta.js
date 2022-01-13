
var c = document.getElementById("myCanvas");

//c.width = window.innerWidth;
//c.height = window.innerHeight;

var ctx = c.getContext("2d");
ctx.fillStyle = "#FF0000";

var board = new Array(6);
var board_pos = new Array(6);
var koko = 50;
var offset = koko;
var vali = koko;
var kuula_paikan_koko = koko/5;
var kuula_koko = koko*3/10;
var tunnistus_sade = koko/5;
var kaanto_tunnistus_sade = koko/3
var sisasize = 2*offset + 5*vali;
var ulkosize = 2*offset + 5*vali + 2*offset;
var kaanto_pos = {}
kaanto_pos["ylavasen-vasen"] = {x: offset/2 , y: 3*offset };
kaanto_pos["ylavasen-oikea"] = {x: 3*offset , y: offset/2 };
kaanto_pos["ylaoikea-vasen"] = {x: 6*offset , y: offset/2 };
kaanto_pos["ylaoikea-oikea"] = {x: sisasize + 1.5*offset , y: 3*offset };
kaanto_pos["alavasen-vasen"] = {x: 3*offset , y: sisasize + 1.5*offset };
kaanto_pos["alavasen-oikea"] = {x: offset/2 , y: 6*offset };
kaanto_pos["alaoikea-vasen"] = {x: sisasize + 1.5*offset , y: 6*offset };
kaanto_pos["alaoikea-oikea"] = {x: 6*offset , y: sisasize + 1.5*offset};
var kaanto_napit = ["ylavasen-vasen","ylavasen-oikea","ylaoikea-vasen","ylaoikea-oikea","alavasen-vasen","alavasen-oikea","alaoikea-vasen","alaoikea-oikea"];
c.width = ulkosize;
c.height = ulkosize;

var movex = 0;
var movey = 0;
var movekaanto = "";
var mycolor = "";
var myTurn = false;
var siirtoTila = "klikkaa";
var pendingMove = null;

for (var i = 0; i < 6; i++) {
    board[i] = new Array(6);
    board_pos[i] = new Array(6);
    for (var j = 0; j < 6; j++) {
        board[i][j] = "tyhja";
        board_pos[i][j] = {x: 2*offset+ j*vali, y: 2*offset+ i*vali};
        console.log(board_pos[i][j].x + " " + board_pos[i][j].y);
    }
}

myCanvas.addEventListener("click", function (e) {
    //console.log(e.clientX + " " + e.clientY);
    if (!myTurn) return;
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            if (Math.abs(board_pos[i][j].x - x) < tunnistus_sade && Math.abs(board_pos[i][j].y - y) < tunnistus_sade) {
                if (siirtoTila == "klikkaa") {
                    board[i][j] = mycolor;
                    pendingMove = [i,j];
                    movex = i+1;
                    movey = j+1;
                    siirtoTila = "kaanna";
                }
                //myTurn = false;
                //makeMoveRequest();
            }
        }
    }
    for (const i in kaanto_napit) {
        kaanto = kaanto_napit[i];
        if (Math.abs(kaanto_pos[kaanto].x - x) < kaanto_tunnistus_sade && Math.abs(kaanto_pos[kaanto].y - y) < kaanto_tunnistus_sade) {
            if (siirtoTila == "kaanna") {
                movekaanto = kaanto;
                pendingMove = null;
                siirtoTila = "klikkaa";
                myTurn = false;
                makeMoveRequest();
            }
        }
    }
});

function laske_mask(x,y) {
    return (BigInt(1) << ((x - BigInt(1)) * BigInt(7) + y - BigInt(1)));
}

function symboliKohdassa(x,y, bitboard){
    mask = laske_mask(x,y);
    if ((mask & bitboard[0]) != 0) return "white";
    if ((mask & bitboard[1]) != 0) return "black";
    return "tyhja";
}

function update_board(bitboard) {
    console.log(bitboard);
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            board[i][j] = symboliKohdassa(BigInt(i+1),BigInt(j+1),bitboard);
        }
    }
}

function makeMoveRequest() {
    console.log("Tehdään siirto " + movex + " " + movey + " " + movekaanto);
    $.post("/makemove",
    {
        movex: movex,
        movey: movey,
        movekaanto : movekaanto
    },
    function(data, status){
        if (status != "success") return;
        serverRequest();
    });
}


myCanvas.addEventListener("mousemove", function (e) {
    //console.log(e.clientX + " " + e.clientY);
    if (!myTurn) return;
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            if (board[i][j] == "white" || board[i][j] == "black") continue;
            if (Math.abs(board_pos[i][j].x - x) < tunnistus_sade && Math.abs(board_pos[i][j].y - y) < tunnistus_sade) {
                board[i][j] = "tyhjavalittu";
            } else {
                board[i][j] = "tyhja";
            }
        }
    }
});



function draw_board() {
    //console.log("Drawing the board");
    ctx.fillStyle = '#9bc777';
    ctx.fillRect(0, 0, ulkosize, ulkosize);
    ctx.fillStyle = 'red';
    ctx.fillRect(offset, offset, sisasize, sisasize);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            ctx.beginPath();
            //console.log(board[i][j]);
            if (pendingMove != null && pendingMove[0] === i && pendingMove[1] === j) {
                ctx.fillStyle = mycolor;
                ctx.arc(2*offset+ j*vali, 2*offset+ i*vali, kuula_koko, 0, Math.PI*2);
            } else if (board[i][j] === "tyhja") {
                ctx.fillStyle = 'grey';
                ctx.arc(2*offset+ j*vali, 2*offset+ i*vali, kuula_paikan_koko, 0, Math.PI*2);
            } else if (board[i][j] === "tyhjavalittu") {
                ctx.fillStyle = 'grey';
                ctx.arc(2*offset+ j*vali, 2*offset+ i*vali, kuula_paikan_koko + 5, 0, Math.PI*2);
            } else if (board[i][j] === "white") {
                ctx.fillStyle = 'white';
                ctx.arc(2*offset+ j*vali, 2*offset+ i*vali, kuula_koko, 0, Math.PI*2);
            } else {
                ctx.fillStyle = 'black';
                ctx.arc(2*offset+ j*vali, 2*offset+ i*vali, kuula_koko, 0, Math.PI*2);
            }
            ctx.fill();
        }
    }
    
    // Kääntönapit:
    for (const i in kaanto_napit) {
        kaanto = kaanto_napit[i];
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.arc(kaanto_pos[kaanto].x, kaanto_pos[kaanto].y, kaanto_tunnistus_sade, 0, Math.PI*2);
        ctx.fill();
    }
    
    
    // Piirrä "rasti" keskelle
    ctx.beginPath();
    ctx.moveTo(2*offset - 0.5*vali, 2*offset + vali*2.5);
    ctx.lineWidth = 10;
    ctx.lineTo(2*offset + 5.5*vali, 2*offset + vali*2.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(2*offset + vali*2.5, 2*offset - 0.5*vali);
    ctx.lineWidth = 10;
    ctx.lineTo(2*offset + vali*2.5, 2*offset + 5.5*vali);
    ctx.stroke();
}

function Update() {
    //ctx.clearRect(0,0, myCanvas.width, myCanvas.height);
    draw_board();
    requestAnimationFrame(Update);
}

Update();

setInterval(serverRequest, 500);
serverRequest();


function serverRequest() {
    $.get("/gamerequest", function(data,status) {
        if (status != "success") return;
        console.log(data, status);
        const res = JSON.parse(data);
        //TODO tee ehto turvallisemmaksi:
        if (res.positionwhite == "0" && res.positionblack == "0") {
            if (res.yourturn == "yes") mycolor = "white";
            else mycolor = "black";
        }
        // TODO Tässä vielä bugi: jos  tyhjä ruutu on valittu, niin valinta perutaan
        update_board([BigInt(res.positionwhite), BigInt(res.positionblack)]);
        if (res.yourturn == "yes") myTurn = true;
        else myTurn = false;
        var h3 = document.getElementById("vuoroh3");
        if (myTurn) h3.innerHTML = "Sinun vuoro";
        else h3.innerHTML = "Vastustajan vuoro";
        
        for (var i = 0; i < 6; i++) {
            var rivi = ""
            for (var j = 0; j < 6; j++) {
                if (board[i][j] != "tyhja") rivi += "X";
                else rivi += " ";
            }
            console.log(rivi);
        }
        console.log("pendingMove: " + pendingMove);
        console.log("My color: " + mycolor);
    });

}


