/* 
 * Modules loader
 */

var require = function(name){
    if ($.inArray(name,require.required.modules) < 0 && $.inArray(name,require.required.loading) < 0){
        require.loadPkg(name);
    } else if ($.inArray(name,require.required.loading) > 0){
        
    }else {
        console.log('Module '+name+' already loaded!');
    }
}


require.prefix = document.getElementById('irequire').getAttribute('data-path') || ''

require.loadPkg = function(name) {
    require.required.loading.push(name)
    for (module in require.required.stack){
        if (name in require.required.stack[module]){
            require.loadModule(name,require.required.stack[module][name].pkg)
            return
        }
    }
    $.getJSON(require.prefix + '/modules/'+name+'/package.json')
    .fail(function(){
        console.log('Module '+name+' not installed!');
    })
    .done(function(data){
        require.loadModule(name,data)
    })
}

require.stackModule = function(name,data){
    for (module in require.required.stack){
        if (require.required.stack[module][name])
            return
    }
    //Stop actual require and add module to stack
    var obj = {}
    obj[name] = {
        pkg:data
    }
    require.required.stack.push(obj);
}

require.loadModule = function(name,data) {
    //Deal with dependent modules
    var modules = data.dependencies;
    if (Object.size(modules) > 0){
        for (mod in modules){
            if ($.inArray(mod,require.required.modules) < 0){
                require(mod);
                require.stackModule(name,data)
                require.setUnloading(name)
                return;
            }
        }
    }
    
    //Deal with dependent files
    var data_urls = [],
    deps = data.main;
    if (typeof deps == 'string')
        data_urls.push(deps)
    else if (typeof deps == 'object')
        data_urls = deps;
    var len = data_urls.length;
    var i = 0;
    for (el in data_urls){
        var url = data_urls[el];
        if ($.inArray(url,require.required.files) < 0){
            //Get proper file
            $.get(require.prefix + '/modules/'+name+'/'+data_urls[el])
            .done(function(data) {
                url = this.url;
                var ext = url.split('.').pop();
                switch(ext){
                    case 'php':
                    case 'html':
                    case 'tpl':
                        $(data).appendTo('body');
                        break;
                    case 'css':
                        $('<link/>')
                        .attr({
                            'rel':'stylesheet',
                            'href':url
                        }).appendTo('head');
                        break;
                }
                require.required.files.push(url);
                //Check if all files are included
                i += 1;
                //console.log(i + '/' + len + ' : ' + url) //For debugging
                if (i == len) {
                    $("body").trigger(name+"ready");
                    console.log(name+" ready!");
                    require.required.modules.push(name);
                    require.setUnloading(name)
                            
                    //Since module is ready check if there were modules dependent on it
                    for ( mod in require.required.stack){
                        var obj = require.required.stack[mod]
                        for (o in obj){
                            if ($.inArray(o,require.required.modules) < 0){
                                require(o)
                                return
                            }
                        }
                    }
                }
            })
            .fail(function(name){
                var url = this.url
                console.log('File '+url+' could not be found!');
                console.log('Module '+name+' could not be loaded!');
                require.setUnloading(name)
            })
        }
    }
}

require.setUnloading = function(name){
    //Remove module from loading state
    var i = require.required.loading.indexOf(name)
    require.required.loading.splice(i,1)
}


/* 
* Object to track loaded modules and files
* to avoid duplicated download
*/
require.required = {
    'modules': ['jquery'],
    'files': [],
    'stack': [],
    'loading' : []
}

/* 
* Include JQuery and load main module
*/
var script = document.createElement("script");
script.type = "text/javascript";
script.src = require.prefix + '/modules/irequire/jquery.js';
script.onload = script.onreadystatechange = function(){
    if (!script.readyState || (script.readyState === 'complete' || script.readyState === 'loaded')) {
        script.onload = script.onreadystatechange = null
        //Load main module if any
        if($("#irequire").attr('data-module'))
            require($("#irequire").attr('data-module'))
    };
}
document.body.appendChild(script);

/* 
* Helper function for getting length of Objects
*/

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


