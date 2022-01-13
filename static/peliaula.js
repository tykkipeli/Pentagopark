
console.log("HERE WE GO");

var valittu = null;

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
        
        $('#haastabutton').on('click', function() {
            console.log("haastetaan nyt")
            haasta(valittu);
            informServer();
        });
        
        $('#playerlist').on('click', 'li', function() {
            console.log($(this).text());
            valittu = $(this).text();
            //update_classes();
            informServer();
        });
        
        
        setInterval(informServer, 500);
        
});

/*
function update_classes() {
    var pelaaja_lista = document.getElementById("playerlist");
    var children = pelaaja_lista.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].innerHTML == valittu) {
            children[i].classList.add("valittu");
        } else {
            children[i].className = "";
        }
    }
}
*/

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
    });
    informServer();
}

function hyvaksyHaaste() {
    console.log("Haaste hyväksytään");
    $.post("/acceptchallenge",
    {
        name: ""
    },
    function(data, status){
        if (status != "success") return;
    });
    informServer();
}

function hylkaaHaaste() {
    console.log("Haaste hylätään");
    $.post("/rejectchallenge",
    {
        name: ""
    },
    function(data, status){
        if (status != "success") return;
    });
    informServer();
}

function informServer() {
    $.get("/present", function(data,status) {
        if (status != "success") return;
        console.log(data, status);
        const res = JSON.parse(data);
        //console.log(res);
        /*for (const i in res) {
            console.log(res[i]);
        }
        */
        var div = document.getElementById("tulevahaaste");
        div.innerHTML = "";
        if (res.roomid != "") {
            window.location.href = "/startgame";
        } else if (res.haastaja != "") {
            var h3 = document.createElement('h3');
            h3.innerHTML = "Pelaaja " + res.haastaja + " haastaa sinut";
            var acceptButton = document.createElement('button');
            acceptButton.innerHTML = "Hyväksy";
            acceptButton.setAttribute('onclick', "hyvaksyHaaste()");
            var rejectButton = document.createElement('button');
            rejectButton.innerHTML = "Hylkää";
            rejectButton.setAttribute('onclick', "hylkaaHaaste()");
            div.appendChild(h3);
            div.appendChild(acceptButton);
            div.appendChild(rejectButton);
        } else if (res.haastettava != "") {
            var h3 = document.createElement('h3');
            h3.innerHTML = "Olet lähettänyt haasteen pelaajalle " + res.haastettava;
            var cancelButton = document.createElement('button');
            cancelButton.innerHTML = "Peru haaste";
            cancelButton.setAttribute('onclick', "peruHaaste()");
            div.appendChild(h3);
            div.appendChild(cancelButton);
        }
        
        var pelaaja_lista = document.getElementById("playerlist");
        pelaaja_lista.innerHTML = "";
        for (const i in res.pelaajat) {
            li = document.createElement('li');
            li.innerHTML = res.pelaajat[i];
            if (res.pelaajat[i] == valittu) {
                li.classList.add("valittu");
            }
            pelaaja_lista.appendChild(li);
        }
        
    });
    /*
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //document.getElementById("demo").innerHTML = this.responseText;
            const res = JSON.parse(this.responseText);
            console.log(res);
            for (const i in res) {
                console.log(res[i]);
            }
            var pelaaja_lista = document.getElementById("players");
            pelaaja_lista.innerHTML = "";
            for (const i in res) {
                li = document.createElement('li');
                li.innerHTML = res[i];
                pelaaja_lista.appendChild(li);
            }
       }
    };
    xhttp.open("GET", "/present", true);
    xhttp.send();
    */
}

document.querySelector('#players').addEventListener('click', function(e) {   
    var selected;
  console.log("clicked")
  if(e.target.tagName === 'LI') {                                      
    selected= document.querySelector('li.selected');                   
    if(selected) {selected.className= '';    
        console.log(selected.innerHTML);
        vastustaja = selected.innerHTML;
    }
    e.target.className= 'selected';                                    
  }
});
