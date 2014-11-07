//Step 1 - Get types links

//var url = "http://jguitar.com/chorddictionary.jsp"
//
//var links = [], types = [];
//var casper = require('casper').create();
//
//function getLinks() {
//    var links = document.querySelectorAll('ul li ul li a');
//    return Array.prototype.map.call(links, function(e) {
//        return e.getAttribute('href');
//    });
//}
//
//casper.start(url, function() {
//    // aggregate results for the 'casperjs' search
//    links = this.evaluate(getLinks);
//});
//
//
//casper.run(function() {
//    // echo results in some pretty fashion
//    for (l in links){
//        var name = links[l].replace('/chordlisting?chord=','')
//        types.push(name)
//    }
//    var fs = require('fs')
//    fs.write('json/links.json', JSON.stringify(types, null, '  '), 'w');
//    this.echo(links.length + ' links found:');
//    this.echo(' - ' + links.join('\n - ')).exit();
//});



//Step 2 - Get and save chords (test)
var url = "http://jguitar.com"
//var chroma = ["C","C%23","D","D%23","E","F","F%23","G","G%23","A","A%23","B"];
var chroma = ["C"];
var forms = require('./json/links.json')
var links = [], types = [];
//var casper = require('casper').create();

function getLinks() {
    var links = document.querySelectorAll('table table')[10].querySelectorAll('img');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('alt');
    });
}

function getChords(casper,u){
    casper.open(url+u)
    casper.then(function(){
        casper.echo ('get:'+ url+u)
        links = links.concat(casper.evaluate(getLinks));
        casper.echo(' - ' + links.join('\n - '))
        if (casper.visible('.next')) {
            var u = casper.getElementAttribute('.next','href')
            casper.then(function(){getChords(casper,u)});
        }
    })
}

function doChords(casper,note,form){
    for (l in links){
        try{
            var str = links[l]
            types.push(str.substring(str.indexOf('{')+1,str.length-1))
        } catch(e){}
    }
    var fs = require('fs')
    var j = {}
    casper.echo(note)
    casper.echo(form)
    j[note] = {}
    j[note][form] = types
    fs.write('json/'+note+form+'.json', JSON.stringify(j, null, '  '), 'w');
    casper.echo(links.length + ' links found:');
}

function casperIt(note,form){
    
    c[note+form] = require('casper').create();
    casper = c[note+form]
    casper.echo (casper)
    casper.echo (note)
    casper.echo (form)
    casper.start()
    casper.then(function(){getChords(casper,'/chord?root='+note+'&chord='+form)})
    casper.run(function() {
        doChords(casper,note,form)
        this.echo('do')
        //this.echo(JSON.stringify(c, null, '  '))
        this.exit();
    });
}

//var require = patchRequire(require);

//exports = casperIt;

var c = {}
for (note in chroma){
    for (f in forms){
        var x = new casperIt(chroma[note],forms[f])
    }
}


//res
//{
//    "C" : {
//        "Major" : ['xxxxxx']
//    }
//}
