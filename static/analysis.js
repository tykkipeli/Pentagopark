
var canvas = document.getElementById("myCanvas");

const board = new Board();
const state = new State(board);
state.mycolor = "white";
updateText("white", 0);

canvas.width = board.ulkosize;
canvas.height = board.ulkosize;

function analysisMoveRequest() {
    console.log("Tehdään siirto " + state.movex + " " + state.movey + " " + state.movekaanto);
    bitboard = convert_to_bitboard(board.board);
    $.post("/makeanalysismove",
    {
        bitboardwhite: bitboard[0],
        bitboardblack: bitboard[1],
        movex: state.movex,
        movey: state.movey,
        movekaanto : state.movekaanto,
    },
    function(data, status){
        if (status != "success") return;
        const res = JSON.parse(data);
        console.log(res);
        updateText(res.color, res.position_count);
        state.update(res);
    });
}

function updateText(turn, count) {
    var h3 = document.getElementById("vuoroh3");
    if (turn == "white") h3.innerHTML = "Valkoisen vuoro";
    else h3.innerHTML = "Mustan vuoro";
    var pos_count = document.getElementById("pos_count_text");
    pos_count.innerHTML = "Yhteensä " + count + " peliä";
}


myCanvas.addEventListener("click", function (e) {
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


