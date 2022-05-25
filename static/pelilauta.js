
var canvas = document.getElementById("myCanvas");

const board = new Board();
const state = new State(board);

canvas.width = board.ulkosize;
canvas.height = board.ulkosize;

function makeMoveRequest() {
    console.log("Tehdään siirto " + state.movex + " " + state.movey + " " + state.movekaanto);
    $.post("/makemove",
    {
        movex: state.movex,
        movey: state.movey,
        movekaanto : state.movekaanto
    },
    function(data, status){
        if (status != "success") return;
        serverRequest();
    });
}

function sendMessage(message) {
    $.post("/sendgamemessage",
    {
        message: message
    },
    function(data, status){
        if (status != "success") return;
        serverRequest();
    });
}

$('#chatbutton').on('click', function() {
    var textbox = document.getElementById("textbox");
    if (textbox.value != "") sendMessage(textbox.value)
    textbox.value = "";
});

$('#textbox').on('keypress', function(event) {
    if (event.key === "Enter") {
        document.getElementById("chatbutton").click();
    }
});

$('#palaabutton').on('click', function() {
    //Lähetä luovutusilmoitus
    console.log("NYT LÄHTIII")
    $.post("/resignrequest",
    {
        name: ""
    },
    function(data, status){
        if (status != "success") return;
        window.location.href = "/play";
    });
});

myCanvas.addEventListener("click", function (e) {
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (state.myTurn && state.clickAt(x,y)) {
        //tässä vaiheessa tulisi suoraan päivittää board eikä vasta palvelimen vastauksen jälkeen
        makeMoveRequest();
    }
});


myCanvas.addEventListener("mousemove", function (e) {
    if (!state.myTurn) return;
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


function updateTeksti(res) {
    var h3 = document.getElementById("vuoroh3");
    var ratingsh3 = document.getElementById("newratings");
    console.log(res.color + "                " + res.gamestate);
    if (res.gamestate != "kesken") {
        if (res.gamestate == "valkoisen voitto") {
            if (res.color == "white") h3.innerHTML = "Voitit pelin!";
            else h3.innerHTML = "Hävisit pelin!";
        } else if (res.gamestate == "mustan voitto"){
            if (res.color == "black") h3.innerHTML = "Voitit pelin!";
            else h3.innerHTML = "Hävisit pelin!";
        } else {
            h3.innerHTML = res.gamestate;
        }
        ratingsh3.innerHTML = "Uudet ratingit: " + res.white + " " + res.white_new_rating + " , " + res.black + " " + res.black_new_rating;
    } else {
        if (state.myTurn) h3.innerHTML = "Sinun vuoro";
        else h3.innerHTML = "Vastustajan vuoro";
    }
}

function time_formatter(time) {
    var osa1 = Math.floor(time/60) + "";
    if (osa1.length == 1) osa1 = "0" + osa1;
    var osa2 = time%60 + "";
    if (osa2.length == 1) osa2 = "0" + osa2;
    return osa1 + ":" + osa2;
}

function updateAika(res) {
    var h3 = document.getElementById("peliaikah3");
    var teksti = "";
    teksti += time_formatter(res.whitetime);
    teksti += " ";
    teksti += time_formatter(res.blacktime);
    h3.innerHTML = teksti;
}

function is_empty(obj) {
    var count = 0;
    for (const i in obj) {
        count += 1;
        break;
    }
    return count == 0;
}

function update_chat(viestit, lahettajat) {
    if (is_empty(viestit)) return;
    var container = document.getElementById("chatcontent");
    for (const i in viestit) {
        viesti_element = document.createElement('p');
        viesti_element.innerHTML = lahettajat[i] + ":\t" + viestit[i];
        container.appendChild(viesti_element);
    }
    container.maxScrollTop = container.scrollHeight - container.offsetHeight;
    if (container.maxScrollTop - container.scrollTop <= container.offsetHeight) {
        container.scrollTop = container.scrollHeight;
    } else {
        
    }
}


function serverRequest() {
    $.get("/gamerequest", function(data,status) {
        if (status != "success") return;
        console.log(data, status);
        const res = JSON.parse(data);
        // TODO Tässä vielä bugi: jos  tyhjä ruutu on valittu, niin valinta perutaan
        state.update(res);
        updateTeksti(res);
        updateAika(res);
        update_chat(res.viestit, res.lahettajat)
        console.log("pendingMove: " + state.pendingMove);
        console.log("My color: " + state.mycolor);
    });
}

function Update() {
    draw_board();
    requestAnimationFrame(Update);
}

Update();
setInterval(serverRequest, 500);
serverRequest();


