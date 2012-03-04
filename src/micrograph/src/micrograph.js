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

// Microdata object
Microdata = function(baseURI,source,tag) {
    this.baseURI = baseURI;

    if(source == null)
	this.doc = document;
    else
	this.doc = source;

    this.tag = tag;
};

Microdata.prototype._toArray = function(nodeList) {
    var acum = [];
    if(nodeList == null)
	return acum;
    for (var i = 0; i < nodeList.length; i++)
	acum[i] = nodeList[i];
    return acum;
};


Microdata.prototype._getElementsByAttribute = function(oElm, strTagName, strAttributeName, includeFirst)  {
    arrElements = [oElm];
    includeFirst = includeFirst || true;
    var arrReturnElements = new Array();
    var oCurrent;
    var oAttribute;

    while(arrElements.length>0) {
        oCurrent = arrElements.shift();

	if(oCurrent.nodeType === Node.ELEMENT_NODE &&
	   oCurrent.tagName.toLowerCase() !== 'link' &&
	   oCurrent.tagName.toLowerCase() !== 'iframe' &&
	   oCurrent.tagName.toLowerCase() !== 'meta') {

	    var childNodes = oCurrent.childNodes;
	    var isItemScope = (oCurrent.getAttribute && oCurrent.getAttribute("itemscope") != null)
	    var isItemProperty = (oCurrent.getAttribute && oCurrent.getAttribute("itemproperty") != null)

            oAttribute = oCurrent.getAttribute && oCurrent.getAttribute(strAttributeName);
	    if(strAttributeName === "itemscope") {
		if(oAttribute != null) {
		    if(oCurrent != oElm || includeFirst)
			arrReturnElements.push(oCurrent);					    
		} else if(childNodes) {
		    arrElements = arrElements.concat(this._toArray(childNodes));
		}
	    } else if(strAttributeName === "itemprop") {
		if(oAttribute != null && oCurrent != oElm) {
		    arrReturnElements.push(oCurrent);
		} else if(childNodes && !isItemScope || oCurrent == oElm){
		    arrElements = arrElements.concat(this._toArray(childNodes));
		}
	    }  else {
		if(oAttribute != null) {
		    arrReturnElements.push(oCurrent);
		} else if(childNodes && !isItemScope || oCurrent == oElm){
		    arrElements = arrElements.concat(this._toArray(childNodes));
		}
	    }
	}
    }
    return arrReturnElements;
};



Microdata.prototype.parse = function() {
    var scopes;
    var from = this.doc;

    if(arguments.length == 1 || this.tag)
	from = this.doc.getElementById(this.tag || arguments[0]);

    scopes = this._getElementsByAttribute(from, "*", "itemscope", true);

    var nodes = [];
    for(var i=0; i<scopes.length; i++)
	nodes.push(this._processNode(scopes[i]));

    return nodes;
};

Microdata.prototype._parseType = function(elem, acum) {
    var types = [];
    var typesFound = this._getElementsByAttribute(elem, "*", "itemtype", true);
    for(var i=0; i<typesFound.length; i++) {
	types.push(typesFound[i].getAttribute("itemtype"));
    }
    if(types.length == 1) {
	acum['$type'] = types[0];
    } else if(typesFound.length>1) {
	acum['$type'] = types;
    }
};

Microdata.prototype._parseProperties = function(elem, acum) {

    var propsFound = this._getElementsByAttribute(elem, "*", "itemprop", false);
    for(var i=0; i<propsFound.length; i++) {
	this._processProperty(acum, propsFound[i]);
    }
};

Microdata.prototype._parseId = function(elem, acum) {
    var propsFound = this._getElementsByAttribute(elem, "*", "itemid", true);
    if(propsFound.length === 1)
	acum['$id'] = propsFound[0].getAttribute("itemid");
};

Microdata.prototype._processProperty = function(acum, property) {
    // section 2.4 microdata HTML5 spec
    var name = property.getAttribute("itemprop");
    var oldValue = acum[name];
    var newValue = null;
    var tag = property.tagName.toLowerCase();
    var value;

    if(property.getAttribute("itemscope") != null) {
	// nested node
	newValue = this._processNode(property);
    } else if(tag === 'meta') {
	newValue = property.content;
    } else if(tag === 'audio' || tag === 'embed' || tag === 'iframe' || 
	      tag === 'source' || tag === 'track' || tag === 'video' || tag === 'img') {
	value = property.getAttribute("src");
	if(value.indexOf(":") != -1)
	    newValue = value;
	else
	    newValue = this.baseURI + value;
    } else if(tag === 'a' || tag === 'area' || tag === 'link') {
	value = property.getAttribute("href");
	if(value.indexOf(":") != -1)
	    newValue = value;
	else
	    newValue = this.baseURI + value;
    } else if(tag === 'object') {
	value = property.getAttribute("data");
	if(value.indexOf(":") != -1)
	    newValue = value;
	else
	    newValue = this.baseURI + value;
    } else if(property.getAttribute("datetime") != null) {
	// parse attr datetime
	newValue = new Date(property.getAttribute("datetime"));
    } else {
	newValue = property.textContent;
    }

    if(oldValue == null) 
	acum[name] = newValue;
    else if(typeof(oldValue) === 'object' && oldValue.constructor === Array)
	acum[name].push(newValue);
    else
	acum[name] = [oldValue, newValue];
};

Microdata.prototype._processNode = function(elem) {
    var acum = {};
    this._parseId(elem, acum);
    if(elem.getAttribute && elem.getAttribute("itemref") != null) {
	var ids = elem.getAttribute("itemref").split(/\s+/);
	for(var i=0; i<ids.length; i++) {
	    var id = ids[i];
	    elem = this.doc.getElementById(id);
	    this._parseType(elem, acum);
	    this._parseProperties(elem, acum);
	}
    } else {
	this._parseType(elem, acum);
	this._parseProperties(elem, acum);
    }
    return acum;
}

// Store
var Micrograph = function(options, callback) {
    if(!options['treeOrder'])
        options['treeOrder'] = 15;

    var that = this;
    this.callbackToInner = {};
    this.callbackMap = {};
    this.callbackCounter = 0;
    this.callbackToNodes = {};
    this.nodesToCallbacks = {};
    this.resources = [];
    this.lastQuery = null;
    this.lastDataToLoad = null;
    this.errorCallback = null;
    this.transformFunction = null;
    this.defaultFrom = null;
    this.defaultState = 'created';
    this.nodeDeletedCallback = null;
    this.nodeUpdatedCallback = null;
    this.blank = 0;

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

Micrograph.VERSION = "0.4.3";

Micrograph.vars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

Micrograph.prototype.onError = function(cb) {
    this.errorCallback = cb;
    return this;
};

Micrograph.prototype.onUpdate = function(cb) {
    this.nodeUpdatedCallback = cb;
    return this;
};

Micrograph.prototype.onDelete = function(cb) {
    this.nodeDeletedCallback = cb;
    return this;
};

Micrograph.create = function() {
    var callback, options;

    if(arguments.length === 0) {
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
    if(!callback) {
	if(typeof(options) === 'function') {
	    callback = options;
	    options = {};
	}  else {
	    throw "Persistent storage requires a callback functon";
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

Micrograph.prototype.resource = function(resource) {
    this.resources.push(resource);
    return this;
};

Micrograph.prototype.resourceAccepts = function(resource,obj) {
    if(resource['$type']){
	if(obj['$type'] && obj['$type'].constructor === Array) {
	    for(var i=0; i<obj['$type'].length; i++) {
		if(obj['$type'][i] === resource['$type']) {
		    if(resource['accepts']) 
			return resource['accepts'](obj);
		    else
			return true;
		}
	    }
	    return false;
	} else {
	    if(obj['$type'] === resource['$type']){
		if(resource['accepts']) 
		    return resource['accepts'](obj);
		else
		    return true;
	    }
	}
    } else
	return false;
};

Micrograph.prototype.toJSON = function(obj) {
    var json = JSON.parse(JSON.stringify(obj));
    var acum = [json];
    var current;
    while(acum.length > 0) {
	current = acum.pop();
	if(current.constructor === Array) {
	    for(var i=0; i<current.length; i++)
		acum.push(current[i]);
	} else {
	    for(var p in current) {
		if(p=='$id' || p=='$type' || p=='$from' || p.indexOf("$in") != -1 || 
		   p=='$state' || p.indexOf("__")===0 || typeof(current[p])==='function')
		    delete current[p];
		else if(current[p] && typeof(current[p]) === 'object' && current[p].constructor != Date) 
		    acum.push([p,current[p]]);
	    }
	}
    }

    return json;
};

/*
Micrograph.prototype.processResource = function(resource,obj, cb) {
    var that = this;
    if(resource['post']) {
	resource['post'](obj,cb);
    } else {
	var obj = obj;
	if(resource['template']) {
	    resource['template']['$id'] = obj['$id'];
	    that.where(resource['template']).first(function(res) {
		obj = res;
	    });
	}
	Micrograph.ajax('POST', resource['baseURL'], JSON.stringify(that.toJSON(obj)), function(result, xhr) {
	    debugger;
	    resource.transform(result);
	    // we save a mapping from the generated ID to the remote ID
	    that.indirections[result['$id']] = obj['$id'];
	    var context = MicrographQL.newContext(true);
	    context.nodes = false;
	    var quads = MicrographQL.parseBGP({'$id':obj['$id'], '$state':obj['$state'], '$remoteid':result['$id']}, context, true)[1]
	    quads = quads.concat(context.quads);
	    var deleteQuery = Micrograph._deleteDataQuery(quads);

	    that.engine.execute(deleteQuery, function(success, rs) {

		if(xhr.getResponseHeader && (xhr.getResponseHeader['Content-Location'] || xhr.getResponseHeader['content-location'])) {
		    obj['$from'] = (xhr.getResponseHeader['Content-Location'] || xhr.getResponseHeader['content-location']);
		} else {
		    obj['$from'] = resource['baseURL']+(resource['baseURL'][resource['baseURL'].length-1] === '/' ? result['$id'] : "/"+result['$id']);
		}

		obj['$state'] = 'loaded';


		context = MicrographQL.newContext(true);
		context.nodes = false;
		quads = MicrographQL.parseBGP({'$id':obj['$id'], '$state':'loaded', '$from':obj['$from']}, context, true)[1]
		quads = quads.concat(context.quads);
		var insertQuery = Micrograph._insertDataQuery(quads);

		that.engine.execute(insertQuery, function(success, rs) {
		    cb(true);
		});
	    });
	}, function(status, xhr) {
	    cb(false);
	});
    }
};


Micrograph.prototype.sync = function(cb) {
    var that = this;
    that.startGraphModification('sync');
    // create resources
    this.where({'$state':'created'})
	.all(function(objects) {
	    Utils.repeatAsync(0,objects.length, function(k,env) {
		var floop = arguments.callee;
		var foundResource = false;
		for(var i=0; i<that.resources.length; i++) {
		    if(that.resourceAccepts(that.resources[i],objects[i])) {
			foundResource = true;
			that.processResource(that.resources[i], objects[i], function() {
			    k(floop,env);
			});
		    }
		}
		if(!foundResource) {
		    k(floop,env);
		}

	    },function() {
		//todo
		console.log("done!");
		that.endGraphModification('sync');
	    })

	});
    return this;
};
*/

Micrograph.prototype.instantiate = function(object) {
    if(object['__micrograph__classes'] != null)
     	return this;
    
    MicrographClass.check(object);
    for(var p in object) {
	if(typeof(object[p]) === 'object' && object[p] !== null && object[p] !== undefined) {
	    if(object[p].constructor == Array) {
		for(var i=0; i<object[p].length; i++) {
		    if(typeof(object[p][i]) === 'object' && object[p][i].$id)
			this.instantiate(object[p][i]);
		}
	    } else {
		if(object[p].$id)
		    this.instantiate(object[p]);
	    }
	}
    }
    return this;
};

Micrograph.prototype.modificationName = null;

Micrograph.prototype.startGraphModification = function(name) {
    if(name != null && this.modificationName!=null)
	throw("Modification already being executed");
    else {
	if(this.modificationName == null) {
	    this.modificationName = name;
	    this.engine.startGraphModification();
	} 
    }
};

Micrograph.prototype.endGraphModification = function(name) {
    if(name === this.modificationName || this.modificationName == null) {
	this.modificationName = null;
	this.engine.endGraphModification();
    }
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

Micrograph.prototype.traverse = function(path) {
    
    var template = {'$id': this._('start')};
    template[path] = this._('end');
    var queryObj =  new MicrographQuery(template);
    this.lastQuery = queryObj;
    queryObj.setStore(this);
    queryObj.setKind('traverse');
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

Micrograph.normalize = function(data, oneLevel) {
    oneLevel = oneLevel || false;
    var acum = [data];
    var toReturn = [];

    if(typeof(data) == 'object' && data.constructor === Array)
	acum = data;

    var current, next, tmp;
    while(acum.length > 0) {
	current = acum.pop();
	if(current.constructor === Array && current == null) {
	    for(var i=0; i<current.length; i++) {
		acum.push(current[i]);
	    }
	} else {
	    for(var p in current) {
		if(current[p] && typeof(current[p]) === 'object' && current[p].constructor != Array && current[p].constructor != Date)  {
		    next = current[p];
		    if(next['$id']!=null)
			current[p] = {'$id':next['$id']};
		    if(!oneLevel || next['$id']==null)
			acum.push(next);
		} else if(current[p] && typeof(current[p]) === 'object' && current[p].constructor == Array) {
		    tmp = [];
		    for(i=0; i<current[p].length; i++) {
			if(!oneLevel || current[p][i]['$id']==null)
			    acum.push(current[p][i]);
			if(current[p][i].$id != null)		
			    tmp.push({'$id': current[p][i]['$id']});
			else
			    tmp.push(current[p][i]);
		    }
		    current[p] = tmp;
		}
	    }
	    if(current['$id'] != null)
		toReturn.push(current);
	}
    }

    return toReturn;
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
	if(this.lastDataToLoad.constructor === Array) {
	    data = [];
	    var acum = this.lastDataToLoad;
	    Utils.repeatAsync(0,acum.length, function(k,env) {
		var floop = arguments.callee;
		that.lastDataToLoad = acum[env._i];
		that.defaultFrom = acum[env._i]['uri'];
		that.load(function(result) {
		    if(result.constructor && result.constructor === Array) {
			data = data.concat(result);
		    } else {
			data.push([acum[env._i]['uri'],result]);
		    }
		    k(floop,env);
		});
	    }, function() {
		callback(data);
	    });
	} else {
	    var options = this.lastDataToLoad;
	    this.lastDataToLoad = null;
	    if(options['jsonp'] != null) {
		Micrograph.jsonp(options['uri'], function(data) {
		    that.load(data,callback);
		}, this.errorCallback, options['jsonp'], options);
	    } else {
		Micrograph.ajax('GET', options['uri'], options, null, function(data){
		    that.load(data,callback);
		}, this.errorCallback);
	    }
	}
	return this;
    } else if(typeof(data) === "object") {
	if(data.constructor !== Array) {
	    data = [data];
	}

	if(this.transformFunction != null) {
	    acum = [[null,data]];
	    var current;
	    while(acum.length > 0) {
		current = acum.pop();
		if(current[1].constructor === Array) {
		    for(var i=0; i<current[1].length; i++)
			acum.push([current[0], current[1][i]]);
		} else {
		    var uriFrom = null;
		    if(this.defaultFrom != null)
			uriFrom = (this.defaultFrom.indexOf("?") != -1 ? this.defaultFrom.split("?")[0] : this.defaultFrom);

		    this.transformFunction(current[0],current[1], uriFrom);
		    for(var p in current[1]) {
			if(current[1][p] && typeof(current[1][p]) === 'object' && current[1][p].constructor != Date) 
			    acum.push([p,current[1][p]]);
		    }
		}
	    }
	}
	// clean the transform function
	//this.transformFunction = null;

	var quads;

	for(i=0; i<data.length; i++) {
	    quads = MicrographQL.parseJSON(data[i],graph, this.defaultFrom, this.defaultState);

	    //console.log("LOAD");
	    //console.log(quads);
	    that.startGraphModification();
	    that.engine.batchLoad(quads,function(){ 
		that.endGraphModification();
	    });
	}

	this.defaultFrom = null;
	this.defaultState = 'created';

	if(callback)
	    callback(data);
    }

    return this;

};

Micrograph.prototype.save = function(json,cb) {
    this.transformFunction = null;
    this.load(json, function(objects){
	if(cb)
	    cb(objects[0]);
    });
    return this;
};

Micrograph.prototype.removeNode = function(node, cb) {
    if(typeof(node) === 'string') 
	node = {'$id': node};

    var query = new MicrographQuery({'$id':node.$id});
    query.setStore(this);

    query._unlinkNode(node['$id'],cb,true);
    if(this.nodeDeletedCallback)
	this.nodeDeletedCallback(node);
    return this;
};

Micrograph.prototype.updateNode = function() {
    var json, processInverse, cb;
    if(arguments.length === 1) {
	json = arguments[0];
	processInverse = false;
	cb = null;
    } else if(arguments.length === 2) {
	json = arguments[0];
	if(typeof(arguments[1]) === 'function') {
	    cb = arguments[1];
	    processInverse = false;
	} else {
	    cb = null;
	    processInverse = arguments[1];
	}
    } else if(arguments.length === 3){
	json = arguments[0];
	processInverse = arguments[1];
	cb = arguments[2];
    } else {
	if(cb)
	    cb(false,"Wrong number of arguments for update, only 1, 2 or 3 args allowd, received "+arguments.length);
	else
	    throw "Wrong number of arguments for update, only 1, 2 or 3 args allowd, received "+arguments.length;
    }
    var id = json['$id'];
    if(!id) {
	if(cb)
	    cb(false,"ID must be provided");
	else 
	    throw "ID must be provided to update";
    } else {

	// remove inverse nodes if not selected
        for(p in json) {
	    if(p.indexOf("$in") != -1 && !processInverse) {
		delete json[p];
	    }
	}

	// from a collection of nested nodes to a list of flat nodes, just one level of nesting
	normalized = Micrograph.normalize(json,true);

	var that = this, current;
	that.startGraphModification('update');	
	for(var i=0; i<normalized.length; i++) {
	    current = normalized[i];
	    if(current.$id && current.$id === id) {
		this.where({'$id': current.$id})._unlinkNode(current.$id,function(success, _){
		    if(success) {
			that.defaultState = 'dirty';
			that.save(current);

			if(that.nodeUpdatedCallback)
			    that.nodeUpdatedCallback(current);

		    } else {
			if(cb)
			    cb(false);
		    }
		}, 
		// should we remove als arcs in
                (processInverse ? false : true));
	    }
	    // No longer necessary, if no $id will be
	    // linked to the top level node and processed
	    // in the previous save call

	    //} else {
	    // 	if(!current['$id']) {
	    // 	    // only blank nodes can get here
	    // 	    this.defaultState = 'created';
	    // 	    that.save(current);
	    // 	}
	    //}
	}
	that.endGraphModification('update');
	if(cb)
	    cb(true);
    }
};

Micrograph.prototype.setState = function(nodeOrID, state) {
    var id = nodeOrID
    if(typeof(nodeOrID)==='object') {
	id = nodeOrID['$id'];
    }

    if(id != null) {
	// just calling parseModify to build the pattern
	var query = MicrographQuery.prototype._parseModify({'$id':id});
	var queryPattern = {
	    subject: {'token':'uri', 'value':MicrographQL.base_uri+id},
	    predicate: {'token':'uri', 'value':MicrographQL.base_uri+"state"},
	    object: {
                  "token": "var",
                  "value": "person"
            }
	};
	var insertPattern = {
	    subject: {'token':'uri', 'value':MicrographQL.base_uri+id},
	    predicate: {'token':'uri', 'value':MicrographQL.base_uri+"state"},
	    object: MicrographQL.parseLiteral(state)
	};
	query.query.units[0].pattern.patterns[0].triplesContext = [queryPattern];
	query.query.units[0].pattern.filters = null;
	query.query.units[0]['delete'] = [queryPattern];
	query.query.units[0]['insert'] = [insertPattern];


	this.engine.execute(query.query, function(res){});
	
    } else {
	throw "A node or node ID must be provided to setState";
    }
};

Micrograph.prototype.setId = function(nodeOrID, newID) {
    var id = nodeOrID
    if(typeof(nodeOrID)==='object') {
	id = nodeOrID['$id'];
    }
    if(MicrographQL.isUri(newID)) 
       newID = {'token':'uri', 'value':newID};
    else
       newID = {'token':'uri', 'value':MicrographQL.base_uri+newID};

    if(id != null) {
	// just calling parseModify to build the pattern
	var query = MicrographQuery.prototype._parseModify({'$id':id});
	var queryPattern = {
	    subject: {'token':'uri', 'value':MicrographQL.base_uri+id},
	    predicate: {'token':'var', 'value':'p'},
	    object: { "token": "var", "value": "o"}
	};
	var insertPattern = {
	    subject: newID,
	    predicate: {'token':'var', 'value':'p'},
	    object: {'token':'var', 'value':'o'}
	};
	query.query.units[0].pattern.patterns[0].triplesContext = [queryPattern];
	query.query.units[0].pattern.filters = null;
	query.query.units[0]['delete'] = [queryPattern];
	query.query.units[0]['insert'] = [insertPattern];


	this.engine.execute(query.query, function(res){});

	queryPattern = {
	    object: {'token':'uri', 'value':MicrographQL.base_uri+id},
	    predicate: {'token':'var', 'value':'p'},
	    subject: { "token": "var", "value": "s"}
	};
	insertPattern = {
	    object: newID,
	    predicate: {'token':'var', 'value':'p'},
	    subject: {'token':'var', 'value':'s'}
	};
	
	var query = MicrographQuery.prototype._parseModify({'$id':id});
	query.query.units[0].pattern.patterns[0].triplesContext = [queryPattern];
	query.query.units[0].pattern.filters = null;
	query.query.units[0]['delete'] = [queryPattern];
	query.query.units[0]['insert'] = [insertPattern];


	this.engine.execute(query.query, function(res){});
	
    } else {
	throw "A node or node ID must be provided to setId";
    }
};

Micrograph.prototype.bind = function(query,mg_query, callback) {
    // execution
    var queryIdentifier = 'cb'+this.callbackCounter;
    this.callbackCounter++;
    var filters = mg_query.filter;

    var that = this;
    var nodesMap = {};

    var innerCallback = function(results) {
	mg_query.filter = filters;
	filters = mg_query.filter.concat([]);
	// filters are shifted while processing, we keep a copy in a new array

	results = MicrographQuery._processQueryResults(results, query.topLevel, query.varsMap, query.inverseMap, that);
	for(var i=0; i<results.length; i++) {
	    var id = results[i]['$id'];
	    if(nodesMap[id] == null) {
		that.engine.callbacksBackend.addQueryToObserver(queryIdentifier, MicrographQL.singleNodeQuery(MicrographQL.base_uri+id,'p','o'));
		nodesMap[id] = true;
	    }
	}

	if(mg_query.filter.length>0) {
	    mg_query._applyResultFilter(results, function(res) {
		callback(res,queryIdentifier);
	    });
	} else {	
	    if(mg_query.groupPredicate != null) 
		mg_query._groupResults(results, function(res){
		    callback(res,queryIdentifier);
		});
	    else
		callback(results, queryIdentifier);
	}
    };
    this.callbackToInner[callback] = queryIdentifier;
    this.callbackMap[queryIdentifier] = innerCallback;
    this.engine.callbacksBackend.observeQuery(queryIdentifier, query.query,innerCallback,function() {});
    return this;
};

Micrograph.prototype.unbind = function(queryIdentifier) {
    if(typeof(queryIdentifier) === 'function')
	queryIdentifier = this.callbackToInner[queryIdentifier];

    if(queryIdentifier)
	this.engine.callbacksBackend.stopObservingQuery(queryIdentifier);

    return this;
};

Micrograph.prototype.from = function(uri, options, callback) {
    this.transformFunction = null;
    if(!options) {
	options = {};
    } else if(typeof(options) === 'function'){
	callback = options;
	options = {};
    }
    var baseUri = uri, acum;
    if(typeof(uri) === 'object' && uri.constructor === Array) {
	baseUri = [];
	acum = [];
	for(var i=0; i<uri.length; i++) {
	    var thisOptions = {};
	    for(var p in options)
		thisOptions[p] = options[p];

	    if(uri[i].indexOf("?") != -1) {
		baseUri.push(uri[i].split("?")[0]);
	    }
	    if(uri[i].indexOf("?") != -1 && uri[i].split("?")[1].indexOf("callback") != -1 && options['jsonp'] == null) {
		thisOptions['jsonp'] = 'callback';
	    }
	    thisOptions['uri'] = uri[i];
	    acum.push(thisOptions);
	}
	this.defaultFrom = baseUri;
	this.defaultState = 'loaded';	

	if(!callback) {
	    var that = this;
	    var data = [];
	    Utils.repeatAsync(0,acum.length, function(k,env) {
		var floop = arguments.callee;
		that.from(that.acum[env._i]['uri'], acum[env._i], function(result) {
		    data.push(result);
		    k(floop,env);
		});
	    }, function() {
		callback(data);
	    });
	} else {
	    this.lastDataToLoad = acum;
	}
    } else {
	if(baseUri.indexOf("?") != -1) {
	    baseUri = baseUri.split("?")[0];
	}
	if(uri.indexOf("?") != -1 && uri.split("?")[1].indexOf("callback") != -1 && options['jsonp'] == null) {
	    options['jsonp'] = 'callback';
	}
	options['uri'] = uri;
	this.defaultFrom = baseUri;
	this.defaultState = 'loaded';	

	if(callback != null) {
	    this.lastDataToLoad = null;
	    if(options['jsonp'] != null) {
		Micrograph.jsonp(options['uri'], callback, this.errorCallback, options['jsonp'], options);
	    } else {
		Micrograph.ajax('GET', options['uri'], options, null, callback, this.errorCallback);
	    }
	} else {
	    this.lastDataToLoad = options;
	}
    }
    return this;
};

Micrograph._parseTransformFunction = function(spec) {
    return function(prop, obj) {
	if(prop == null && spec['null'] != null)
	    prop = 'null';

	if(spec[prop]) {
	    for(var p in spec[prop]) {
		if(p === '@delete') {
		    if(spec[prop][p].constructor === Array)  {
			for(var i=0; i<spec[prop][p].length; i++)
			    delete obj[spec[prop][p][i]];
		    } else 
			delete obj[spec[prop][p]];
		} if(p === '@id'){
		    if(typeof(spec[prop][p]) === 'function') {
			obj['$id'] = spec[prop][p](obj);
		    } else {
			obj['$id'] = obj[spec[prop][p]];
		    }
		} else if(p === '@type') {
		    if(typeof(spec[prop][p]) === 'function') {
			obj['$type'] = spec[prop][p](obj);
		    } else  {
			obj['$type'] = obj[spec[prop][p]];
		    }
		} else if(p === '@from') {
		    if(typeof(spec[prop][p]) === 'function') {
			obj['$from'] = spec[prop][p](obj);
		    } else  {
			obj['$from'] = obj[spec[prop][p]];
		    }
		} else {
		    if(typeof(spec[prop][p]) === 'function') {
			obj[p] = spec[prop][p](obj);
		    } else  {
			obj[p] = obj[spec[prop][p]];
		    }
		}
	    }

	}
    };
};

Micrograph.prototype.transform = function(f) {
    if(typeof(f) === 'object') 
	f = Micrograph._parseTransformFunction(f);
    this.transformFunction = f;
    return this;
};

Micrograph.ajax = function(method, url, options, data, callback, errorCallback) {
    var dataFormat = options['media'];
    if(dataFormat == null || dataFormat === "json")
	dataFormat = "application/json";
    else if(dataFormat === "n3" ||  dataFormat === "turtle" || dataFormat === "ttl")
	dataFormat = "text/n3";
    else if(dataFormat === "microdata")
	dataFormat = "text/html";

    var handleResponse = function(responseText) {
	var resultData;
	if(dataFormat === "application/json")
	    resultData = JSON.parse(responseText);
	else if(dataFormat === "text/n3")
	    resultData = Micrograph.n3(url, responseText, options);
	else if(dataFormat === "text/html" && options['media'] === "microdata") {
	    var tempDiv = document.createElement('div');
	    tempDiv.innerHTML = responseText.replace(/<script(.|\s)*?\/script>/g, '');
	    var md = new Microdata(url, tempDiv);
	    resultData = md.parse();
	}

	callback(resultData, xhr);
    };

    var xhr = new XMLHttpRequest();

    if (typeof XDomainRequest != "undefined" && !xhr["withCredentials"]) {
	// XDomainRequest for IE.

	xhr = new XDomainRequest();
	xhr.open(method, url);
	xhr.onload = function() {
	    handleResponse(xhr.responseText);
	};

    } else {
	xhr.open(method, url, true);

	if (xhr.overrideMimeType) xhr.overrideMimeType(dataFormat);
	if (xhr.setRequestHeader) xhr.setRequestHeader("Accept", dataFormat);

	if(data != null && xhr.setRequestHeader)
	    xhr.setRequestHeader("Content-Type", dataFormat);

	xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4) {
		if(xhr.status < 300 && xhr.status !== 0) {
		    handleResponse(xhr.responseText)
		} else {
		    if(errorCallback)
			errorCallback(xhr.statusText, xhr);
		}
	    }
	};
    }


    xhr.onerror = function(e) {
	if(errorCallback)
	    errorCallback("XHR Error", e);
    };

    xhr.send(data);
};

Micrograph.jsonpCallbackCounter = 0;
Micrograph.jsonpRequestsConfirmations = {};
Micrograph.jsonpRetries = {};

Micrograph.prototype.microdata = function(from, data, options, cb) {
    var tempDiv = document.createElement('div');
    if(typeof(options) === "function")
	cb = options;
    tempDiv.innerHTML = data.replace(/<script(.|\s)*?\/script>/g, '');

    var md = new Microdata(from, tempDiv);
    var nodes = md.parse();

    this.load(nodes, cb);

    return this;
};

Micrograph.prototype.n3 = function(from, data, options, cb) {
    if(Micrograph.n3)
	this.load(Micrograph.n3(from, data, options), cb);
    else
	throw "N3 Parser not available";
    return this;
};

Micrograph.jsonp = function(fragment, callback, errorCallback, callbackParameter, options, ignore) {
    ignore = ignore || false;
    options = options || {};
    var baseURI = options['base'] || fragment;
    var maxRetries = options['retries'];
    if(maxRetries == null && maxRetries !== 0)
	maxRetries = 1;

    var timeout = options['timeout'] || 15000;

    var cbHandler = "jsonp"+Micrograph.jsonpCallbackCounter;
    Micrograph.jsonpCallbackCounter++;

    if(callbackParameter == null || typeof(callbackParameter) !== "string")
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

    if(Micrograph.jsonpRetries[fragment] == null) {
	Micrograph.jsonpRetries[fragment] = 0;
    } else {
	Micrograph.jsonpRetries[fragment] = Micrograph.jsonpRetries[fragment]+1;
    }
    window[cbHandler] = function(data) {
	try {
	    Micrograph.jsonpRequestsConfirmations[uri] = true;
	    if(options['result'])
		data = data[options['result']];
	    if(options['media'] && options['media'] === 'n3') {
		resultData = Micrograph.n3(baseURI, data, options);
	    } else if(options['media'] && options['media'] === 'microdata') {
		var tempDiv = document.createElement('div');
		tempDiv.innerHTML = data.replace(/<script(.|\s)*?\/script>/g, '');
		var md = new Microdata(baseURI, tempDiv);
		data = md.parse();
	    }
	    callback(data);
	}catch(e) {
	    if(errorCallback)
		errorCallback("Error processing JSONP results for media type  "+options['media']+": "+e);
	}
    };

    setTimeout(function() {
	if(Micrograph.jsonpRequestsConfirmations[uri] === true) {
	    delete Micrograph.jsonpRetries[uri];
	    delete Micrograph.jsonpRequestsConfirmations[uri];
	    delete window[cbHandler];
	} else {
	    if(Micrograph.jsonpRetries[fragment] < maxRetries) {
		console.log("(!!) JSONP error, retyring...");
		console.log(fragment);
		console.log(callbackParameter);
		delete window[cbHandler];
		if(ignore) {
		    callback(null);
		} else {
		    Micrograph.jsonp(fragment, callback, errorCallback, callbackParameter, options, ignore);
		}
	    } else {
		delete Micrograph.jsonpRetries[fragment];
		delete Micrograph.jsonpRequestsConfirmations[uri];
		delete window[cbHandler];
		if(errorCallback)
		    errorCallback("Error loading JSONP request "+fragment);
	    }
	}
    }, timeout);

    var script = document.createElement('script');
    script.setAttribute('type','text/javascript');
    script.setAttribute('src', uri);
    document.getElementsByTagName('head')[0].appendChild(script); 
};

Micrograph._deleteDataQuery = function(quads) {
    return {
	"token": "query",
	"kind": "update",
	"prologue": {
	    "token": "prologue",
	    "base": "",
	    "prefixes": []
	},
	"units": [
	    {
		"kind": "deletedata",
		"token": "executableunit",
		"quads": quads
	    }
	]
    };
};

Micrograph._insertDataQuery = function(quads) {
    return {
	"token": "query",
	"kind": "update",
	"prologue": {
	    "token": "prologue",
	    "base": "",
	    "prefixes": []
	},
	"units": [
	    {
		"kind": "insertdata",
		"token": "executableunit",
		"quads": quads
	    }
	]
    };
};