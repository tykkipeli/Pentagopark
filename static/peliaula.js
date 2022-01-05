var vastustaja;

$(document).ready(function() {
        //var socket = io.connect('http://127.0.0.1:5000');
        var socket = io.connect('http://' + document.domain + ':' + location.port);

        socket.on('connect', function() {
            //socket.send('User has connected!');
        });

        socket.on('message', function(msg) {
            $("#messages").append('<li>'+msg+'</li>');
            console.log('Received message');
        });

        $('#sendbutton').on('click', function() {
            console.log("LOL?");
            socket.send($('#myMessage').val());
            $('#myMessage').val('');
        });
        
        $('#roombutton').on('click', function() {
            console.log("MOI");
            socket.emit('joinaus', 0);
        });

        $('#myCanvas').on('click', function(e) {
            socket.emit('my_event', e.clientX, e.clientY);
        });
        
        
        console.log("Nyt mentiint")
        socket.emit('pelaaja_liittyi');
        
        $('#testbutton').on('click', function() {
            console.log("LOL?");
        });
        
        $('#poistubutton').on('click', function() {
            socket.emit("pelaaja_poistui");
        });
        
        $('#haastabutton').on('click', function() {
            console.log("here")
            if (vastustaja) {
                socket.emit("haasta_pelaaja", vastustaja);
            }
        });
        
        /*
        $('#pelilinkki').on('click', function() {
            console.log("HEI");
            socket.emit('pelaaja_liittyi');
        });
        */
        socket.on('my_response', function(players) {
            //board_event(msg.x, msg.y);
            $("#players").empty();
            players.forEach(function(player) {
                $("#players").append('<li>'+ player +'</li>');
            });
        });
        
        socket.on('haaste_event', function(msg) {
            console.log("Haaste_event vastaanotettu");
            $("#players").append('<li>'+ 'Pelaaja' + msg + 'haastoi sinut' + '</li>');
        });
});

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
