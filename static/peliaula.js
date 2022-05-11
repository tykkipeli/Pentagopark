
console.log("HERE WE GO");

var valittu = null;
var cur_pelaajat = [];

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
        
        
        $('#testbutton').on('click', function() {
            console.log("LOL?");
        });
        
        $('#poistubutton').on('click', function() {
            console.log('poistuit');
        });
        
        $('#chatbutton').on('click', function() {
            var textbox = document.getElementById("textbox");
            if (textbox.value != "") sendMessage(textbox.value)
            textbox.value = "";
        });
        
        $('#haastabutton').on('click', function() {
            console.log("haastetaan nyt")
            haasta(valittu);
            informServer();
        });
        
        $('#playerlist').on('click', 'li', function() {
            console.log($(this).text());
            valittu = $(this).text();
            paivitaPelaajaLista(cur_pelaajat);
            informServer();
        });
        
        
        setInterval(informServer, 500);
        
});

function sendMessage(message) {
    $.post("/sendlobbymessage",
    {
        message: message
    },
    function(data, status){
        if (status != "success") return;
        informServer();
    });
}

function haasta(haastettava) {
    $.post("/challenge",
    {
        name: haastettava
    },
    function(data, status){
        if (status != "success") return;
        console.log("data :\n" + data);
        console.log("Haaste lähti JEAAAA");
        //window.location.href = "/";
    });
}

function peruHaaste() {
    console.log("Haaste perutaan");
    $.post("/cancelchallenge",
    {
        name: ""
    },
    function(data, status){
        if (status != "success") return;
        informServer();
    });
}

function hyvaksyHaaste() {
    console.log("Haaste hyväksytään");
    $.post("/acceptchallenge",
    {
        name: ""
    },
    function(data, status){
        if (status != "success") return;
        informServer();
    });
}

function hylkaaHaaste() {
    console.log("Haaste hylätään");
    $.post("/rejectchallenge",
    {
        name: ""
    },
    function(data, status){
        if (status != "success") return;
        informServer();
    });
}

function naytaTulevaHaaste(haastaja) {
    var div = document.getElementById("tulevahaaste");
    var h3 = document.createElement('h3');
    h3.innerHTML = "Pelaaja " + haastaja + " haastaa sinut";
    var acceptButton = document.createElement('button');
    acceptButton.innerHTML = "Hyväksy";
    acceptButton.setAttribute('onclick', "hyvaksyHaaste()");
    var rejectButton = document.createElement('button');
    rejectButton.innerHTML = "Hylkää";
    rejectButton.setAttribute('onclick', "hylkaaHaaste()");
    div.appendChild(h3);
    div.appendChild(acceptButton);
    div.appendChild(rejectButton);
}

function naytaLahtevaHaaste(haastettava) {
    var div = document.getElementById("tulevahaaste");
    var h3 = document.createElement('h3');
    h3.innerHTML = "Olet lähettänyt haasteen pelaajalle " + haastettava;
    var cancelButton = document.createElement('button');
    cancelButton.innerHTML = "Peru haaste";
    cancelButton.setAttribute('onclick', "peruHaaste()");
    div.appendChild(h3);
    div.appendChild(cancelButton);
}

function paivitaPelaajaLista(pelaajat) {
    var pelaaja_lista = document.getElementById("playerlist");
    pelaaja_lista.innerHTML = "";
    cur_pelaajat = [];
    for (const i in pelaajat) {
        li = document.createElement('li');
        li.innerHTML = pelaajat[i];
        if (pelaajat[i] == valittu) {
            li.classList.add("valittu");
        }
        pelaaja_lista.appendChild(li);
        cur_pelaajat.push(pelaajat[i]);
    }
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

/*
function messageAdd(message) {
	var container = document.querySelector('.content')

    container.maxScrollTop = container.scrollHeight - container.offsetHeight

    document.querySelector('.btn').addEventListener('click', function () {

    if (container.maxScrollTop - container.scrollTop <= container.offsetHeight) {
    // We can scroll to the bottom.
    // Setting scrollTop to a high number will bring us to the bottom.
    // setting its value to scrollHeight seems a good idea, because
    // scrollHeight is always higher than scrollTop.
    // However we could use any value (e.g. something like 99999 should be ok) 
    container.scrollTop = container.scrollHeight
    console.log("I just scrolled to the bottom!")
    } else {
    console.log("I won't scroll: you're way too far from the bottom!\n" +
    "You should maybe alert the user that he received a new message.\n" +
    "If he wants to scroll at this point, he must do it manually.")
    }
}
*/

function informServer() {
    $.get("/present", function(data,status) {
        if (status != "success") return;
        console.log(data, status);
        const res = JSON.parse(data);
        var div = document.getElementById("tulevahaaste");
        div.innerHTML = "";
        if (res.roomid != "") {
            window.location.href = "/startgame/" + res.roomid;
        } else if (res.haastaja != "") {
            naytaTulevaHaaste(res.haastaja);
        } else if (res.haastettava != "") {
            naytaLahtevaHaaste(res.haastettava);
        }
        if (JSON.stringify(res.pelaajat) != JSON.stringify(cur_pelaajat)) {
            paivitaPelaajaLista(res.pelaajat);
        }
        update_chat(res.viestit, res.lahettajat);
    });
}
