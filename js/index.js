var flock = require('js/flock.js');
$(function() {
    $('#addrem .fa').click(function() {
        if ($(this).attr('id') !== 'selected')
            $(this).parent().append($('#selected').remove());
    });
    var world = new flock.World($('#draw')[0]);
    for (var i = 100; i <=500; i += 100)
        for (var j = 100; j <=500; j+= 100)
            world.addBird(i,j);
    window.requestAnimationFrame(world.draw);
});
