// imports
var QueryEngine = require("./../../js-query-engine/src/query_engine").QueryEngine;
var QuadBackend = require("./../../js-rdf-persistence/src/quad_backend").QuadBackend;
var Lexicon = require("./../../js-rdf-persistence/src/lexicon").Lexicon;
var WebLocalStorageLexicon = require("./../../js-rdf-persistence/src/web_local_storage_lexicon").WebLocalStorageLexicon;
var Utils = require("./../../js-trees/src/utils").Utils;
var InMemoryBTree = require("./../../js-trees/src/in_memory_b_tree").InMemoryBTree;
var WebLocalStorageBTree = require("./../../js-trees/src/web_local_storage_b_tree").WebLocalStorageBTree;

var MicrographQuery = require('./micrograph_query').MicrographQuery;
var MicrographQL = require('./micrograph_ql').MicrographQL;
var MicrographClass = require('./micrograph_class').MicrographClass;

/*
var sys = null;
try {
    sys = require("util");
} catch(e) {
    sys = require("sys");
}
*/

// Store
var Micrograph = function(options, callback) {
    if(options['treeOrder'] == null) {
        options['treeOrder'] = 15;
    }

    var that = this;
    this.callbackToInner = {};
    this.callbackMap = {};
    this.callbackCounter = 0;
    this.callbackToNodes = {};
    this.nodesToCallbacks = {};
    this.lastQuery = null;
    this.lastDataToLoad = null;
    this.errorCallback = null;
    this.transformFunction = null;

    for(var i=0; i<Micrograph.vars.length; i++) {
	this['_'+Micrograph.vars[i]] = this._(Micrograph.vars[i]);
    }

    this.callbacksMap = {}; 

    var isPersistent = options['persistent'];
    var LexiconModule = Lexicon;
    if(isPersistent) 
	LexiconModule = WebLocalStorageLexicon;

    new LexiconModule.Lexicon(function(lexicon){
        if(options['overwrite'] === true) {
            // delete lexicon values
            lexicon.clear();
        }

	var baseTree = InMemoryBTree;
	if(isPersistent)
	    baseTree = WebLocalStorageBTree;
	    
        new QuadBackend.QuadBackend(options, baseTree, function(backend){
            if(options['overwrite'] === true) {
                // delete index values
                backend.clear();
            }
            options.backend = backend;
            options.lexicon =lexicon;
            that.engine = new QueryEngine.QueryEngine(options);      
	    that.engine.eventsOnBatchLoad = true;
	    that.engine.abstractQueryTree.oldParseQueryString = that.engine.abstractQueryTree.parseQueryString;
	    that.engine.abstractQueryTree.parseQueryString = function(toParse) {

		if(typeof(toParse) === 'string') {
		    return this.oldParseQueryString(toParse);
		} else {
		    return toParse;
		}
	    };

	    if(isPersistent) {
		// not sure about this,
		// moving all persistent data to the cache
		that.where({}).all(function(){
		    if(callback)
			callback(that);
		});
	    } else {
		if(callback)
                    callback(that);
	    }
        });
    },options['name']);
};
exports.Micrograph = Micrograph;

Micrograph.VERSION = "0.2.0";

Micrograph.vars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

Micrograph.prototype.onError = function(cb) {
    this.errorCallback = cb;
    return this;
};

Micrograph.create = function() {
    var callback, options;

    if(arguments.length == 0) {
	throw "A callback function and an optional options map must be provided";
    } else if(arguments.length == 1) {
	options = {'treeOrder': 15, 'name': 'micrograph_instance', 'overwrite':false};
	callback = arguments[0];
    } else {
	options = arguments[0];
	callback = arguments[1];
    }
    
    new Micrograph(options, callback);
};

Micrograph.open = function(name,overwrite,options,callback) {
    if(callback == null) {
	if(typeof(options) === 'function') {
	    callback = options;
	    options = {};
	}  else {
	    throw "Persistent storage requires a callback functon"
	}
    }
    options['persistent'] = true;
    options['name'] = name;
    options['overwrite'] = overwrite;
    
    new Micrograph(options, callback);
};

Micrograph.prototype.define = function(classExpression, object) {
    MicrographClass.define(classExpression, object);
    return this;
};

Micrograph.prototype.instantiate = function(object) {
    if(object['__micrograph__classes'] != null) {
	return this;
    }
    
    MicrographClass.check(object);
    for(var p in object) {
	if(typeof(object[p]) === 'object' && object[p]!=null) {
	    if(object[p].constructor == Array) {
		for(var i=0; i<object[p].length; i++)
		    if(typeof(object[p][i]) === 'object' && object[p][i].$id)
			this.instantiate(object[p][i]);
	    } else {
		if(object[p].$id)
		    this.instantiate(object[p]);
	    }
	}
    }
    return this;
};

Micrograph.prototype.startGraphModification = function() {
    this.engine.startGraphModification();
};

Micrograph.prototype.endGraphModification = function() {
    this.engine.endGraphModification();
};

Micrograph.prototype.execute = function(query, callback) {
    this.startGraphModification();
    this.engine.execute(query,callback);
    this.endGraphModification();
    return this;
};

Micrograph.prototype.where = function(query) {
    var queryObj =  new MicrographQuery(query);
    this.lastQuery = queryObj;
    queryObj.setStore(this);
    return queryObj;
};

Micrograph.prototype.instances = function(callback) {
    if(this.lastQuery.lastResult && this.lastQuery.lastResult.constructor === Array) {
	for(var i=0; i<this.lastQuery.lastResult.length; i++)
	    this.instantiate(this.lastQuery.lastResult[i]);
	callback(this.lastQuery.lastResult);
    } else if(this.lastQuery.lastResult) {
	this.instantiate(this.lastQuery.lastResult);
	callback(this.lastQuery.lastResult);
    } else {
	callback(null);
    }
    return this;
};


Micrograph.prototype._ = function(varName) {
    return {'token': 'var', 'value':varName };
};

Micrograph.prototype.load = function() {
    var mediaType;
    var data;
    var graph;
    var callback;
    var that = this;


    if(arguments.length == 1) {
	if(typeof(arguments[0]) === 'function') {
	    callback = arguments[0];
	} else {
	    data  = arguments[0];
	    callback = function(){};
	}
    } else if(arguments.length == 2) {
	data = arguments[0];
	callback = arguments[1];
    } else {
	throw "Data to be loaded and an optional callback function must be specified";
    }
    
    mediaType = "application/json";
    graph = {'token':'uri', 'value': this.engine.lexicon.defaultGraphUri};

    if(this.lastDataToLoad != null) {
	var options = this.lastDataToLoad;
	this.lastDataToLoad = null;
	if(options['jsonp'] != null) {
	    Micrograph.jsonp(options['uri'], function(data) {
		that.load(data,callback);
	    }, this.errorCallback, options['jsonp']);
	} else {
	    Micrograph.ajax('GET', options['uri'], null, function(data){
		that.load(data,callback);
	    }, this.errorCallback);
	}
	return this;
    }

    if(typeof(data) === "object") {
	if(data.constructor !== Array) {
	    data = [data];
	}

	if(this.transformFunction != null) {
	    var acum = [[null,data]];
	    var current;
	    while(acum.length > 0) {
		current = acum.pop();
		if(current[1].constructor === Array) {
		    for(var i=0; i<current[1].length; i++)
			acum.push([current[0], current[1][i]]);
		} else {
		    this.transformFunction(current[0],current[1]);
		    for(var p in current[1]) {
			if(current[1][p] && typeof(current[1][p]) === 'object' && current[1][p].constructor != Date) 
			    acum.push([p,current[1][p]]);
		    }
		}
	    }
	}
	// clean the transform function
	this.transformFunction = null;

	var quads;
	var that = this;

	for(var i=0; i<data.length; i++) {
	    quads = MicrographQL.parseJSON(data[i],graph);

	    //console.log("LOAD");
	    //console.log(quads);
	    that.engine.startGraphModification();
	    that.engine.batchLoad(quads,function(){ 
		that.engine.endGraphModification();
	    });
	}
	if(callback)
	    callback(data);
    }

    return this;

};

Micrograph.prototype.save = function(json,cb) {
    this.load(json, function(objects){
	if(cb)
	    cb(objects[0]);
    });
    return this;
};

Micrograph.prototype.update = function(json, cb) {
    var id = json['$id'];
    if(id == null) {
	cb(false,"ID must be provided");
    } else {

	var that = this;
	that.engine.startGraphModification();	
	this.where({'$id': id})._unlinkNode(id,function(success, _){
	    if(success) {
		that.save(json,cb);
	    } else {
		cb(false);
	    }
	})
	that.engine.endGraphModification();
    }
};

Micrograph.prototype.bind = function(query, callback) {
    // execution
    var queryIdentifier = 'cb'+this.callbackCounter;
    this.callbackCounter++;

    var that = this;
    var nodesMap = {};

    var innerCallback = function(results) {
	results = MicrographQuery._processQueryResults(results, query.topLevel, query.varsMap, query.inverseMap, that);
	for(var i=0; i<results.length; i++) {
	    var id = results[i]['$id'];
	    if(nodesMap[id] == null) {
		that.engine.callbacksBackend.addQueryToObserver(queryIdentifier, MicrographQL.singleNodeQuery(MicrographQL.base_uri+id,'p','o'));
		nodesMap[id] = true;
	    }
	}
	callback(results);
    };
    this.callbackToInner[callback] = innerCallback;
    this.callbackMap[queryIdentifier] = innerCallback;

    this.engine.callbacksBackend.observeQuery(queryIdentifier, query.query,innerCallback,function() {});
};

Micrograph.prototype.from = function(uri, options, callback) {
    if(options == null) {
	options = {};
    } else if(typeof(options) === 'function'){
	callback = options
	options = {};
    }

    if(uri.indexOf("?") != -1 && 
       uri.split("?")[1].indexOf("callback") != -1 &&
       options['jsonp'] == null) {
	options['jsonp'] = 'callback';
    }

    options['uri'] = uri;
    if(callback != null) {
	this.lastDataToLoad = null;
	if(options['jsonp'] != null) {
	    Micrograph.jsonp(options['uri'], callback, this.errorCallback, this.options['jsonp'])
	} else {
	    Micrograph.ajax('GET', options['uri'], null, callback, this.errorCallback)
	}
    } else {
	this.lastDataToLoad = options;
    }

    return this;
};

Micrograph.prototype.transform = function(f) {
    this.transformFunction = f;
    return this;
};

Micrograph.ajax = function(method, url, data, callback, errorCallback) {

    var xhr = new XMLHttpRequest();

    if (typeof XDomainRequest != "undefined") {
	// XDomainRequest for IE.
	xhr = new XDomainRequest();
	xhr.open(method, url);
    } else {
	xhr.open(method, url, true);
    }

    if (xhr.overrideMimeType) xhr.overrideMimeType("application/json");
    if (xhr.setRequestHeader) xhr.setRequestHeader("Accept", "application/json");

    xhr.onreadystatechange = function() {
	if (xhr.readyState === 4) {
	    if(xhr.status < 300 && xhr.status !== 0)
		callback(JSON.parse(xhr.responseText));
	    else
		errorCallback(xhr.statusText);
	}
    };

    xhr.send(data);
};

Micrograph.jsonpCallbackCounter = 0;
Micrograph.jsonpRequestsConfirmations = {};
Micrograph.jsonpRetries = {};

Micrograph.jsonp = function(fragment, callback, errorCallback, callbackParameter, ignore) {
    ignore = ignore || false;
    var cbHandler = "jsonp"+Micrograph.jsonpallbackCounter;
    Micrograph.jsonpCallbackCounter++;

    if(callbackParameter == null)
	callbackParameter = "callback";

    var uri = fragment;
	
    
    if(uri.indexOf("?") === -1) {
	uri = uri + "?"+callbackParameter+"="+cbHandler;
    } else {
	if(uri.split("?")[1].indexOf(callbackParameter+"=") == -1) {
	    uri = uri + "&"+callbackParameter+"="+cbHandler;
	} else {
	    cbHandler = uri.split("?")[1].split(callbackParameter+"=")[1].split("&")[0];
	}
    }

    if(Micrograph.jsonpRetries[uri] == null) {
	Micrograph.jsonpRetries[uri] = 0;
    } else {
	Micrograph.jsonpRetries[uri] = Micrograph.jsonpRetries[uri]+1;
    }
    window[cbHandler] = function(data) {
	Micrograph.jsonpRequestsConfirmations[uri] = true;
	callback(data);
    };

    setTimeout(function() {
	if(Micrograph.jsonpRequestsConfirmations[uri] === true) {
	    delete Micrograph.jsonpRetries[uri];
	    delete Micrograph.jsonpRequestsConfirmations[uri];
	    delete window[cbHandler];
	} else {
	    if(Micrograph.jsonpRetries[uri] < 1) {
		console.log("(!!) JSONP error, retyring...");
		console.log(fragment);
		console.log(callbackParameter);
		delete window[cbHandler];
		if(ignore) {
		    callback(null);
		} else {
		    Micrograph.jsonp(fragment, callback, errorCallback, callbackParameter, ignore);
		}
	    } else {
		delete Micrograph.jsonpRetries[uri];
		delete Micrograph.jsonpRequestsConfirmations[uri];
		delete window[cbHandler];
		if(errorCallback)
		    errorCallback();
	    }
	}
    }, 15000);

    var script = document.createElement('script');
    script.setAttribute('type','text/javascript');
    script.setAttribute('src', uri);
    document.getElementsByTagName('head')[0].appendChild(script); 
};