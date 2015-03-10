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

    $('#cohesion-slide, #cohesion-box').val(world.params.cohesion_str)
    $('#alignment-slide, #alignment-box').val(world.params.alignment_str)
    $('#separation-slide, #separation-box').val(world.params.separation_str)

    $('.slider-box .range').on('input', function() {
        $(this).siblings('.number').val($(this).val())
        world.params[$(this).attr('id').replace('-slide','_str')] = $(this).val()
    });
    $('.slider-box .number').keyup(function() {
        $(this).siblings('.range').val($(this).val())
        world.params[$(this).attr('id').replace('-box','_str')] = $(this).val()
        console.log(world.params.alignment_str)
    });

    $('#play').click(function() {
        world.params.play = true;
        window.requestAnimationFrame(world.draw);
    });
    $('#pause').click(function() {
        world.params.play = false;
    });
});
