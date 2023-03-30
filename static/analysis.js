
var canvas = document.getElementById("myCanvas");

const board = new Board();
const state = new State(board);
state.mycolor = "white";
updateText("white", 0, []);

canvas.width = board.ulkosize;
canvas.height = board.ulkosize;


var pos_memory = new PositionMemory();
var position_list = [];
for (var i = 0; i < 37; i++) {
    var temp = [BigInt(0), BigInt(0)];
    position_list.push(temp);
}
var pos_index = 0;
var tail_index = 0;
var clickable = false;
var firstMove = true;

analysisMoveRequest2(0, 0, "firstmove");

function analysisMoveRequest() {
    console.log("Tehdään siirto " + state.movex + " " + state.movey + " " + state.movekaanto);
    bitboard = convert_to_bitboard(board.board);
    bitboard = make_whole_turn(state.movekaanto, bitboard);
    clickable = false;
    $.post("/makeanalysismove",
    {
        bitboardwhite: bitboard[0],
        bitboardblack: bitboard[1],
        movex: state.movex,
        movey: state.movey,
        movekaanto : state.movekaanto,
        gameid: 0,
    },
    function(data, status) {
        if (status != "success") return;
        const res = JSON.parse(data);
        update_positionList(res);
        state.update(res);
        updateText(res.color, res.position_count, res.positions_data);
        clickable = true;
    });
}

function analysisMoveRequest2(whitebb, blackbb, movekaanto) {
    var p = document.getElementById("gameid");
    var gameid = parseInt(p.innerHTML);
    $.post("/makeanalysismove",
    {
        bitboardwhite: whitebb,
        bitboardblack: blackbb,
        movex: state.movex,
        movey: state.movey,
        movekaanto: movekaanto,
        gameid: gameid,
    },
    function(data, status){
        if (status != "success") return;
        console.log("Täs ollaan!");
        const res = JSON.parse(data);
        console.log(res.lastkaanto);
        if (res.lastkaanto == "firstmove") {
            console.log("here we go");
            pos_memory.add_game_positions(res.game_positions);
        }
        if (!firstMove) update_positionList(res);
        firstMove = false;
        state.update(res);
        updateText(res.color, res.position_count, res.positions_data);
        clickable = true;
    });
}

function update_positionList(res) {
    if (res.lastkaanto == "noturn") {
        pos_index--;
        return;
    }
    pos_index++;
    if (position_list[pos_index][0] == BigInt(res.positionwhite) && position_list[pos_index][1] == BigInt(res.positionblack)) {
        tail_index = Math.max(tail_index, pos_index);
    } else {
        position_list[pos_index][0] = BigInt(res.positionwhite);
        position_list[pos_index][1] = BigInt(res.positionblack);
        tail_index = pos_index;
    }
}

function update_positionList2(res) {
    if (res.lastkaanto == "noturn") {
        pos_memory.prev();
        return;
    }
    pos_memory.next(res.positionwhite, res.positionblack);
}


// TODO NÄISSÄ TULISI VARMISTAA, ETTEI VAHINGOSSA LÄHETÄ KAHTA KÄSKYÄ PERÄTTÄIN PALVELIMELLE
$('#prevbutton').on('click', function() {
    if (!clickable || pos_index == 0) return;
    var ind = pos_index - 1;
    clickable = false;
    analysisMoveRequest2(position_list[ind][0], position_list[ind][1], "noturn");
});

$('#prevbutton2').on('click', function() {
    if (!clickable || !pos_memory.has_prev()) return;
    pos_memory.prev();
    clickable = false;
    analysisMoveRequest2(pos_memory.get_pos()[0], pos_memory.get_pos()[1], "noturn");
});

$('#nextbutton').on('click', function() {
    if (!clickable || tail_index < pos_index + 1) return;
    bitboard = convert_to_bitboard(board.board);
    var ind = pos_index + 1;
    clickable = false;
    analysisMoveRequest2(position_list[ind][0], position_list[ind][1], getMoveKaanto(bitboard, BigInt(position_list[ind][0]), BigInt(position_list[ind][1])));
});

$('#nextbutton2').on('click', function() {
    if (!clickable || !pos_memory.has_next()) return;
    bitboard = convert_to_bitboard(board.board);
    clickable = false;
    
    analysisMoveRequest2(position_list[ind][0], position_list[ind][1], getMoveKaanto(bitboard, BigInt(position_list[ind][0]), BigInt(position_list[ind][1])));
});

$('#movelist').on('click', 'li', function() {
    if (!clickable) return;
    console.log(this.getAttribute("white_bb"));
    var white_bb = this.getAttribute("white_bb")
    var black_bb = this.getAttribute("black_bb");
    bitboard = convert_to_bitboard(board.board);
    clickable = false;
    analysisMoveRequest2(white_bb, black_bb, getMoveKaanto(bitboard, BigInt(white_bb), BigInt(black_bb)));
});

function updateText(turn, count, positions) {
    var h3 = document.getElementById("vuoroh3");
    if (turn == "white") h3.innerHTML = "Valkoisen vuoro";
    else h3.innerHTML = "Mustan vuoro";
    var pos_count = document.getElementById("pos_count_text");
    pos_count.innerHTML = "Yhteensä " + count + " peliä";
    
    var movelist = document.getElementById("movelist");
    movelist.innerHTML = "";
    
    bitboard = convert_to_bitboard(board.board);
    console.log(pos_index + " " + tail_index);
    
    var startTime = performance.now();
    for (const i in positions) {
        position = positions[i];
        var li = document.createElement('li');
        var description = getMoveDescription(bitboard, BigInt(position[0]), BigInt(position[1]));
        li.innerHTML = description + " " + position[2] + " " + position[3] + " " + position[4];
        li.setAttribute("white_bb", position[0]);
        li.setAttribute("black_bb", position[1]);
        movelist.appendChild(li);
    }
    var endTime = performance.now();
    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
}


myCanvas.addEventListener("click", function (e) {
    if (!clickable) return;
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (state.clickAt(x,y)) {
        analysisMoveRequest();
    }
});


myCanvas.addEventListener("mousemove", function (e) {
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (state.siirtoTila == "klikkaa") board.updateHover(x,y);
});



function draw_board() {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF0000";
    board.draw(ctx, state);
}

function Update() {
    draw_board();
    requestAnimationFrame(Update);
}

Update();


