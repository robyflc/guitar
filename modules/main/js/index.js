var chroma = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
var scales = {
    "major" : [2,2,1,2,2,2,1],
    "minor" : [2,1,2,2,1,2,2],
    "melodicMinor" : [2,1,2,2,2,2,1],
    "harmonicMinor" : [2,1,2,2,1,3,1]
};


//Generate scales
function scale(tone,type){
    var result = [tone];
    var index = cur = chroma.indexOf(tone);   
    var type = type || "major";
    for (i in scales[type]){
        cur = parseInt(cur+scales[type][i]);
        while (cur > 11){
            cur = cur - 12;
        }
        result.push(chroma[cur]);
    }
    return result;
}

//Parse chords
function parseChord(chord){
    //A, Am, A7, A7M, A7+, A/E, Aº, 
//    switch chord{
//        
//    }
            
}

//Generate chords
function getChord(tone,type){
    var s = scale(tone,type)
    return [s[0],s[2],s[4]];
}

//Play chords
function playChord(){
    for (var string=6; string>0; string--){
        try{
            var pos = $('.string.string-pos-'+string+' .on').attr('class').split(' ')[2].replace('pos','')
            var mySound = new buzz.sound("./modules/main/sounds/"+string+"/mp3/"+pos+".mp3").play()
        } catch(e) {}
    }
}

//Generate fields

//Get tone

//Init
$(function(){
    for (note in chroma){
        $('#select-note').append('<option value="'+chroma[note]+'">'+chroma[note]+'</option>')
    }
    //Add fretmap
    require('fret-map');
    
    $('body').on('click','#get-scale',function(){
        var tone = $('#select-note').val()
        var type = $('#note-modifier').val()
        var s = scale(tone,type);
        //$('#canvas').html(s.join(' '))
        //Draw fret
        $('span.note.on').removeClass('on').removeClass('root')
        for (note in s){
            var n = s[note].toLowerCase().replace('#','s')
            var t = tone.toLowerCase().replace('#','s')
            $('span.note.note-'+n).addClass('on');
            $('span.note.note-'+t).addClass('root');
        }
    })
    
    $('body').on('click','#get-chord',function(){
        var tone = $('#select-note').val()
        var type = $('#note-modifier').val()
        var c = getChord(tone,type);
        $('#canvas').html(c.join(' '))
        //Draw fret
        $('span.note.on').removeClass('on').removeClass('root')
        $('span.string.string-pos-1').find('.pos0').toggleClass('on')
        $('span.string.string-pos-2').find('.pos1').toggleClass('on').toggleClass('root')
        $('span.string.string-pos-3').find('.pos0').toggleClass('on')
        $('span.string.string-pos-4').find('.pos2').toggleClass('on')
        $('span.string.string-pos-5').find('.pos3').toggleClass('on').toggleClass('root')
    })
    
    //Play notes
    $('body').on('click','span.note.on',function(){
        var string = $(this).parents('.string').attr('class').split(' ')[2].replace('string-pos-','')
        var pos = $(this).attr('class').split(' ')[2].replace('pos','')
        var mySound = new buzz.sound("./modules/main/sounds/"+string+"/mp3/"+pos+".mp3").play()
    })
});    
