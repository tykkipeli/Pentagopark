var vastustaja;

console.log("HERE WE GO");

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
            console.log("here")
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
