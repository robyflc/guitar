var chroma = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

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
function getField(tone,type){
    var s = scale(tone,type);
    //Draw Scale
    drawScale(tone,s)
    s.pop()
    for (i in s)
        s[i] = s[i]+fields[type][i]
        
    return s

}

//Draw scale
function drawScale(tone,s){
    $('span.note.on').removeClass('on').removeClass('root')
    for (note in s){
        var n = s[note].toLowerCase().replace('#','s')
        var t = tone.toLowerCase().replace('#','s')
        $('span.note.note-'+n).addClass('on');
        $('span.note.note-'+t).addClass('root');
    }
}

//Draw chord
function drawChord(tone,type,v){
    var variation = v || 0
    $('span.note.on').removeClass('on').removeClass('root')
    var chord = allChords[tone][type][variation]
    var arr = chord.split(' ').reverse()
    for (a in arr){
        var string = parseInt(a)+1;
        $('span.string.string-pos-'+string).find(".pos"+arr[a]).addClass('on')
        var t = tone.toLowerCase().replace('#','s')
        $('span.note.note-'+t).addClass('root');
    }
}

//Get tone

//Init
$(function(){
    //Set fonts
    try{Typekit.load();}catch(e){}
    
    //Get chords
    $.getJSON('./modules/main/json/chords.min.json', function(data) {
        window.allChords = data
        var types = Object.keys(allChords['C'])
        for (t in types){
            $('#note-modifier optgroup[label="Chords"]').append('<option value="'+types[t]+'">'+types[t].replace(/\+/g,' ')+'</option>')
        }
        $('#note-modifier').selectpicker('refresh')
    })   
    
    //Get Scales
    $.getJSON('./modules/main/json/scales.json', function(data) {
        window.scales = data
        //Populate scales
        for (s in scales){
            $('#note-modifier optgroup[label="Scales"]').append('<option value="'+s+'">'+s+'</option>')
        }
        $('#note-modifier').selectpicker('refresh')
    })   
    
    //Get Fields
    $.getJSON('./modules/main/json/fields.json', function(data) {
        window.fields = data
    })   
        
    //Populate notes dropdown
    for (note in chroma){
        $('#select-note').append('<option value="'+chroma[note]+'">'+chroma[note]+'</option>')
    }
        
    //Set selectpickers
    $('#select-note,#note-modifier').selectpicker();
    $('.dropdown-menu.open').css({"z-index":100000, color: "#000"}) // Fix dropdown position
    
    //Metronome
    window.paper = Raphael("metronome_container", 140, 120);
    window.m = metronome({
        len: 100,
        angle: 40,
        complete: function(){ $("#startstop").html("start") },
        paper: paper,
        audio: "./modules/metronome/tick.wav"
    });

    m.make_input("#metronome_inputs");
    
    //Knob
    $("#tempo").knob({
        'min':30,
        'max':200,
        'fgColor': '#C2C2C2',
        'width': 100
    });
    
    //Note modifier on change
    $('body').on('change', '#note-modifier',function(){ 
        var selected = $(':selected', this);
        if(selected.closest('optgroup').attr('label') == "Scales"){
            $('#get-scale').prop("disabled",false)
            $('#get-chord').prop("disabled",true)
        } else if(selected.closest('optgroup').attr('label') == "Chords"){
            $('#get-scale').prop("disabled",true)
            $('#get-chord').prop("disabled",false)
        }
    })

    //Show menu
    $('body').on('mouseover',"#hover-trigger img",function(){ 
        $("#modalMenu").modal('show'); 
    })
    
    $('body').on('click','#get-scale',function(){
        var tone = $('#select-note').val()
        var type = $('#note-modifier').val()
        var s = scale(tone,type);
        $('#canvas').html(s.join(' '))
        //Draw fret
        drawScale(tone,s)
    })
    
    $('body').on('click','#get-chord',function(){
        var tone = $('#select-note').val()
        var type = $('#note-modifier').val()
        $('#canvas').html("<div id=\"choose-chord\" class=\"owl-carousel\"></div>")
        //Draw fret
        drawChord(tone,type)
        //Set variation tabs
        var variations = allChords[tone][type];
        for (vari in variations){
            $('#choose-chord').append('<chord positions="'+variations[vari]+'" variation="'+vari+'" size="2" ></chord>')
        }
        chords.replace();
        //Set first choosen
        $($('#choose-chord canvas')[0]).css({'opacity':0.2})
        //Carousel
        $('chord').remove();//to avoid unvisible items
        $("#choose-chord").owlCarousel();
    })
    
    
    $('body').on('click','#get-field',function(){
        var tone = $('#select-note').val()
        var type = $('#note-modifier').val()
        var f = getField(tone,type);
        $('#canvas').html(f.join(' '))
    })
    
    //Canvas click
    $('body').on('click',"#choose-chord canvas",function(){
        var tone = $('#select-note').val()
        var type = $('#note-modifier').val()
        //Draw fret
        drawChord(tone,type,$(this).data()['variation'])
        //Mark choosen
        $('#choose-chord canvas').css({'opacity':1})
        $(this).css({'opacity':0.2})
    })
    
    //Play notes
    $('body').on('mouseover','span.note.on',function(){
        var string = $(this).parents('.string').attr('class').split(' ')[2].replace('string-pos-','')
        var pos = $(this).attr('class').split(' ')[2].replace('pos','')
        var mySound = new buzz.sound("./modules/main/sounds/"+string+"/mp3/"+pos+".mp3").play()
    })
});    
