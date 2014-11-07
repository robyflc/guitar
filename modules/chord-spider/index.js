//Step 2 - Get and save chords (test)
var url = "http://jguitar.com"
var chroma = ["C","C%23","D","D%23","E","F","F%23","G","G%23","A","A%23","B"];
var forms = require('./json/links.json')
var links = [], types = [];
var casper = require('casper').create();
var result = {}
var all = []

casper.start();
casper.then(function(){
    //Prepare json obj
    for (note in chroma){
        for (f in forms){
            var item = {}
            item[chroma[note]] = forms[f];
            all.push(item);
        }
    }
    var fs = require('fs')
    fs.write('json/all.json', JSON.stringify(all, null, '  '), 'w');
})

casper.then(function(){
    getChords();
});

casper.run(function(){
    //this.echo(' - ' + links.join('\n - '))
    var fs = require('fs')
    fs.write('json/chords.json', JSON.stringify(result, null, '  '), 'w');
    this.exit();
});

function getLinks() {
    var links = document.querySelectorAll('table table')[10].querySelectorAll('img');
    return Array.prototype.map.call(links, function(e) {
        var alt = e.getAttribute('alt');
        return alt.substring(alt.indexOf('{')+1,alt.length-1)
    });
}

function getChords(u){
    if (typeof u == "undefined"){
        var item = all.shift()
        if (typeof item != "undefined"){
            for (note in item){
                var u = '/chord?root='+note+'&chord='+item[note];
            }
            console.log(u)

        } else {
            return false;
        }
    }
    
    casper.open(url+u)
    casper.then(function(){
        casper.echo ('get:'+ url+u)
        links = links.concat(casper.evaluate(getLinks));
        var parser = document.createElement('a')
        parser.href = this.getCurrentUrl();
        console.log(parser.href)
        var name = parser.href.substr(1).split('&').map(function(str){
          return str.split('=')[1];
        })
        if (typeof result[name[0]] == "undefined")
            result[name[0]] = {}
        if (typeof result[name[0]][name[1]] == "undefined")
            result[name[0]][name[1]] = []
            
        result[name[0]][name[1]] = result[name[0]][name[1]].concat(casper.evaluate(getLinks)) 
        
        //casper.echo(' - ' + links.join('\n - '))
        if (casper.visible('.next')) {
            var u = casper.getElementAttribute('.next','href')
            casper.then(function(){getChords(u)});
        } else {
            casper.then(function(){getChords()});
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

