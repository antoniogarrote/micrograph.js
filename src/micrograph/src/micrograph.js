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

Micrograph.prototype.execute = function(query, callback) {
    this.engine.execute(query,callback);
};

Micrograph.prototype.startGraphModification = function() {
    this.engine.startGraphModification();
};

Micrograph.prototype.endGraphModification = function() {
    this.engine.endGraphModification();
};

Micrograph.prototype.where = function(query) {
    var queryObj =  new MicrographQuery(query);
    queryObj.setStore(this);
    return queryObj;
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

    if(arguments.length == 1)
	callback = function(){};

    if(arguments.length < 3) {
	if(MicrographQL.isUri(typeof(arguments[0]) === "string" && arguments[0])) {
	    mediaType = "remote";
	} else {
	    mediaType = "application/json";
	}

        graph = {'token':'uri', 'value': this.engine.lexicon.defaultGraphUri};

	data = arguments[0];
	callback = arguments[1];
    } else {
	throw "Data to be loaded and an optional callback function must be specified";
    }

    if(typeof(data) === "object") {
	if(data.constructor !== Array) {
	    data = [data];
	}
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
    } else {

        var parser = this.engine.rdfLoader.parsers[mediaType];

        var that = this;

        this.engine.rdfLoader.tryToParse(parser, {'token':'uri', 'value':graph.valueOf()}, data, function(success, quads) {
	    if(success) {
                that.engine.batchLoad(quads,callback);
	    } else {
                callback(success, quads);
	    }
        });
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
}

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
}