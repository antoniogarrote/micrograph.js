// imports
var MicrographQL = require('./micrograph_ql.js').MicrographQL;
var Utils = require("./../../js-trees/src/utils").Utils;

/*
var sys = null;
try {
    sys = require("util");
} catch(e) {
    sys = require("sys");
}
*/

// Query object
exports.MicrographQuery = function(template) {
    this.template = template;
    this.lastResult = null;
    this.filter = [];
    this.groupPredicate = null;
    this.startNodePath = null;
    this.endNodePath = null;
};
var MicrographQuery = exports.MicrographQuery;

MicrographQuery.prototype.setKind = function(kind) {
    this.kind = kind;
    return this;
};

MicrographQuery.prototype.setStore = function(store) {
    this.store = store;
    return this;
};

MicrographQuery.prototype.setCallback = function(callback) {
    this.callback = callback;
    return this;
};

MicrographQuery.prototype.each = function(callback) {
    this.filter.push(['each',callback]);
    return this;
};

MicrographQuery.prototype.map = function(callback) {
    this.filter.push(['map',callback]);
    return this;
};

MicrographQuery.prototype.reduce = function(acum,callback) {
    this.filter.push(['reduce',acum, callback]);
    return this;
};

MicrographQuery.prototype.select = function(callback) {
    this.filter.push(['select',callback]);
    return this;
};

MicrographQuery.prototype.onError = function(callback) {
    this.onErrorCallback =  callback;
    return this;
};

MicrographQuery.prototype.limit = function(limit) {
    this.limitValue = limit;
    return this;
};

MicrographQuery.prototype.offset = function(offset) {
    this.offsetValue = offset;
    return this;
};

MicrographQuery.prototype.groupBy = function(groupPredicate) {
    this.groupPredicate = (typeof(groupPredicate) === 'string' ? function(obj){ return obj[groupPredicate]; } : groupPredicate );
    return this;
};

MicrographQuery.prototype.order = function(order) {
    this.sortValue = order;
    return this;
}

MicrographQuery.prototype.startNode = function(node) {
    this.template['$id'] = node['$id'];
    this.startNodePath = MicrographQL.parseURI((MicrographQL.isUri(node['$id']) ? node['$id'] : MicrographQL.base_uri+node['$id']))
    return this;
};

MicrographQuery.prototype.endNode = function(node) {
    this.endNodePath = MicrographQL.parseURI((MicrographQL.isUri(node['$id']) ? node['$id'] : MicrographQL.base_uri+node['$id']))
    for(var p in this.template) {
	if(p != '$id') {
	    this.template[p] = {'$id':node['$id']};
	    break;
	}
    }
    return this;
};


MicrographQuery.prototype.all = function(callback) {
    if(this.kind === 'traverse')
	this.kind = 'traverseAll';
    else
	this.kind = 'all';
    var that = this;
    this._executeQuery(function(result){
	that.lastResult = result;
	if(callback)
	    callback(that.lastResult);
    });
    return this.store;
};

MicrographQuery.prototype.first = function(callback) {
    var that = this;
    this.all(function(res){
	if(res.length > 0) {
	    that.lastResult = res[0];
	    if(callback)
		callback(that.lastResult);
	} else {
	    that.lastResult = null;
	    if(callback)
		callback(null);
	}
    });

    return this.store;
};

MicrographQuery.prototype.tuples = function(callback) {
    this.kind = 'tuples';
    var that = this;
    this._executeQuery(function(results){
	if(results) {
	    for(var i=0; i<results.length; i++) {
		var result = results[i];
		for(var p in result) {
		    if(result[p].token === 'literal') {
			result[p] = MicrographQL.literalToJS(result[p]);
		    } else {
			result[p] = MicrographQL.uriToJS(result[p]);
		    }
		}
	    }
	    
	    if(that.filter.length > 0) {
		that._applyResultFilter(results, callback);
	    } else {	
		if(that.groupPredicate != null) 
		    that._groupResults(results, callback);
		else
		    callback(results);
	    }
	} else {
	    callback(results);
	}
    });
    return this.store;
};

MicrographQuery.prototype.remove = function(callback) {
    this.kind = 'remove';
    this.store.startGraphModification();
    this._executeUpdate(callback);
    this.store.endGraphModification();
    return this.store;
};


MicrographQuery.prototype.removeNodes = function(callback) {
    this.kind = 'removeNodes';
    this.store.startGraphModification();
    this._parseModifyNodes(this.template, callback);
    this.store.endGraphModification();
    return this.store;
};


MicrographQuery.prototype.bind = function(callback) {
    var pattern = this._parseQuery(this.template);
    this.store.bind(pattern,callback);

    return this.store;
}

// protected inner methods

MicrographQuery.prototype._executeUpdate = function(callback) {
    var pattern;
    pattern = this._parseModify(this.template);
    this.query = pattern.query;
    this.varsMap = pattern.varsMap;
    this.topLevel = pattern.topLevel;
    this.subject = pattern.subject;
    this.inverseMap = pattern.inverseMap;
    this.store.execute(this.query,function(success, results){
	if(callback)
	    callback(success);
    });
};

MicrographQuery.prototype._executeQuery = function(callback) {
    var pattern = this._parseQuery(this.template);
    var that = this;

    this.query = pattern.query;
    this.varsMap = pattern.varsMap;
    this.topLevel = pattern.topLevel;
    this.subject = pattern.subject;
    this.inverseMap = pattern.inverseMap;

    // Final processing of query
    var quads = this.query.units[0].pattern.patterns[0].triplesContext;
    var unit = this.query.units[0];

    // sort by
    var  sortAcum = [];
    if(this.sortValue) {
	var sortCounter = 0;
	var nextVariable = MicrographQL.nextVariable();
	for(var i=0; i<this.sortValue.length; i++) {
	    var sortPredicate;
	    var direction = 1;

	    if(typeof(this.sortValue[i]) === 'object') {
		for(var p in sortValue[i]) {
		    sortPredicate = p;
		    direction == sortValue[i][p];
		    break;
		}
	    } else {
		sortPredicate = this.sortValue[i];
	    }
	    
	    var predicate, object;
	    if(sortPredicate === '$type')
		predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
	    if(sortPredicate === '$from')
		predicate = MicrographQL.base_uri+"from";
	    if(sortPredicate === '$state')
		predicate = MicrographQL.base_uri+"state";

	    predicate = MicrographQL.parseURI(sortPredicate);
	    var sortVariable = nextVariable+'s'+sortCounter;
	    sortCounter++;
	    var variableToken = {'token':'var', 'value': sortVariable};
	    quads.push({'subject':this.subject, 'predicate':predicate, 'object':variableToken});
	    sortAcum.push({
		"direction": (direction === 1) ? "ASC" : "DESC",
		"expression": {
		    "token": "expression",
		    "expressionType": "atomic",
		    "primaryexpression": "var",
		    "value": variableToken
		}
	    });
	}
    }

    if(sortAcum.length > 0)
	unit.order = sortAcum;

    if(callback != null )
	this.callback = callback;

    var toReturn = [];

    if(this.kind === "all") {
	//console.log(sys.inspect(this.query, true, 20));

	this.store.execute(this.query, function(success, results) {
	    //console.log("results : "+results.length);
	    //console.log(results);
	    //console.log("=======================");
	    if(MicrographQL.isUri(that.varsMap[that.topLevel]) && results.length>0) {
		// if the top level is a URI, not retrieved in the results,
		// and there are results, we add the node to one result
		// bindings to force retrieval of data
		results[0][that.topLevel] = that.varsMap[that.topLevel];
	    }

	    if(success) {

		toReturn = MicrographQuery._processQueryResults(results, that.topLevel, that.varsMap, that.inverseMap, that.store, that.offsetValue, that.limitValue);
		that.offsetValue = null;
		that.limitValue = null;

		if(that.filter.length>0) {
		    that._applyResultFilter(toReturn, callback);
		} else {	
		    if(that.groupPredicate != null) 
			that._groupResults(toReturn, callback);
		    else
			callback(toReturn);
		}
	    } else {
		if(that.onErrorCallback) {
		    that.onError(results);
		}
		that.callback(null);
	    }
	});
    } else if(this.kind === 'tuples') {
	//console.log(sys.inspect(this.query, true, 20));
	this.store.execute(this.query, function(success, results) {
	    if(success) {
		callback(results);
	    } else {
		if(that.onErrorCallback) {
		    that.onError(results);
		}
		that.callback(null);
	    }
	});
    } else if(this.kind === 'traverseAll') {
	//console.log(sys.inspect(this.query, true, 20));
	this.store.execute(this.query, function(success, results) {
	    if(success) {
		var toReturn = [];
		var nodes = {};
		var disambiguations = {};
		var toIgnore = {};
		for(var i=0; i<results.length; i++) {
		    var result = results[i];
		    if(that.startNodePath != null)
			result['start'] = that.startNodePath;
		    if(that.endNodePath != null)
			result['end'] = that.endNodePath;
		    if(result['start'].token === 'uri') {
			var id = result['start'].value;
			if(nodes[id] == null) {
			    that.store.execute(MicrographQL.singleNodeQuery(id, 'p', 'o'), function(success, resultsNode){
				var node = nodes[id] || {'$id':(id.indexOf(MicrographQL.base_uri) != -1 ? id.split(MicrographQL.base_uri)[1] : id)};
				nodes[id] = node;

				MicrographQuery._processSingleNodeResults(id, resultsNode, node, disambiguations, nodes, {});
				result['start'] = node;
			    });
			} else {
			    result['start'] = nodes[id];
			}
		    } else {
			result['start'] = MicrographQL.literalToJS(result['start']);
		    }
		    if(result['end'].token === 'uri') {
			var id = result['end'].value;
			if(nodes[id] == null) {
			    that.store.execute(MicrographQL.singleNodeQuery(id, 'p', 'o'), function(success, resultsNode){
				var node = nodes[id] || {};
				nodes[id] = node;

				MicrographQuery._processSingleNodeResults(id, resultsNode, node, disambiguations, nodes, {});
				result['end'] = node;
			    });
			} else {
				result['end'] = nodes[id];
			}
		    } else {
			result['end'] = MicrographQL.literalToJS(result['end']);
		    }
		}

		if(that.filter.length>0) {
		    that._applyResultFilter(results, callback);
		} else {
		    if(that.groupPredicate != null) 
			that._groupResults(results, callback);
		    else
			that.callback(results);
		}
	    } else {
		if(that.onErrorCallback) {
		    that.onError(results);
		}
		that.callback(null);
	    }
	});
    }
}

MicrographQuery.prototype._parseQuery = function(object) {
    var context = MicrographQL.newContext(true);
    if(this.kind === 'tuples' || this.kind === 'traverseAll')
	context.nodes = false;
    var result = MicrographQL.parseBGP(object, context, true);
    var subject = result[0];

    var filters = [{'token': 'filter',
		    'value':{'token':'expression',
			     'expressionType': 'conditionaland',
			     'operands':[]}}];

    for(var v in context.filtersMap)
	filters[0].value.operands.push(context.filtersMap[v]);


    var quads = context.quads.concat(result[1]);


    var unit =  {'kind':'select',
		 'modifier':'',
		 'group': '',
		 'token':'executableunit',
		 'pattern':{'filters':[],
			    'token':'groupgraphpattern',
			    'patterns':
			    [{'token':'basicgraphpattern',
			      'triplesContext': quads}]}};

    if(filters[0].value.operands.length > 0)
	unit.pattern.filters = filters;
   
    var prologue =  { base: '', prefixes: [], token: 'prologue' };

    var projection = [];
    for(var i=0; i<context.variables.length; i++)
	projection.push({'kind':'var', 'token':'variable', 'value':context.variables[i]});

    var dataset = {'named':[], 'implicit':[{suffix: null, prefix: null, 'token':'uri', 'value':'https://github.com/antoniogarrote/rdfstore-js#default_graph'}]};
    
    unit['projection'] = projection;
    unit['dataset'] = dataset;


    return {'query':{ 'prologue': prologue,
		      'kind': 'query',
		      'token': 'query',
		      'units':[unit]},
	    'varsMap': context.varsMap,
	    'topLevel': context.topLevel,
	    'subject': subject,
	    'inverseMap': context.inverseMap};
		 
};


MicrographQuery.prototype._parseModify = function(object) {
    var context = MicrographQL.newContext(true);
    var result = MicrographQL.parseBGP(object, context, true);
    var subject = result[0];

    var filters = [{'token': 'filter',
		    'value':{'token':'expression',
			     'expressionType': 'conditionaland',
			     'operands':[]}}];

    for(var v in context.filtersMap)
	filters[0].value.operands.push(context.filtersMap[v]);


    var quads = context.quads.concat(result[1]);	

    var unit =  {'kind':'modify',
		 'with': null,
		 'using': null,
		 'pattern':{'filters':[],
			    'token':'groupgraphpattern',
			    'patterns':
			    [{'token':'basicgraphpattern',
			      'triplesContext': quads}]},
		 'delete': quads};

    if(filters[0].value.operands.length > 0)
	unit.pattern.filters = filters;
   
    var prologue =  { base: '', prefixes: [], token: 'prologue' };

    var projection = [];
    for(var i=0; i<context.variables.length; i++)
	projection.push({'kind':'var', 'token':'variable', 'value':context.variables[i]});

    //var dataset = {'named':[], 'implicit':[{suffix: null, prefix: null, 'token':'uri', 'value':'https://github.com/antoniogarrote/rdfstore-js#default_graph'}]};
    //unit['dataset'] = dataset;


    return {'query':{ 'prologue': prologue,
		      'kind': 'update',
		      'token': 'query',
		      'units':[unit]},
	    'varsMap': context.varsMap,
	    'topLevel': context.topLevel,
	    'subject': subject,
	    'inverseMap': context.inverseMap};		 
};

MicrographQuery.prototype._parseModifyNodes = function(object, callback) {
    this.kind = 'all';
    var that = this;
    var counter = 0;
    this._executeQuery(function(result) {
	var nextVariable = MicrographQL.nextVariable();
	for(var i=0; i<result.length; i++) {

	    that.template = {'$id': result[i].$id};
	    that.kind = 'removeNode';
	    that._executeUpdate(function(result){
		if(result===true)
		    counter++;
		that._unlinkNode(that.template['$id'])
	    });
	};
    });

    if(callback)
	callback(counter);
};

MicrographQuery.prototype._unlinkNode = function(id,cb,excludeIncoming){
    if(cb == null)
	cb = function(){};

    var subject = {'token':'uri', 'value':MicrographQL.base_uri+id};
    var nextVariable = MicrographQL.nextVariable();

    var that = this;

    var pattern = that._modifyQuery([{'subject': subject,
				      'predicate': {'token':'var', 'value':nextVariable+'pout'},
				      'object': {'token':'var', 'value':nextVariable+'oout'}}]);

    that.store.execute(pattern.query, function(success,res) {
	if(!(excludeIncoming === true)) {
	    pattern = that._modifyQuery([{'subject': {'token':'var', 'value':nextVariable+'sin'},
					  'predicate': {'token':'var', 'value':nextVariable+'pin'},
					  'object': subject}]);
	
	    that.store.execute(pattern.query, cb);
	} else {
	    cb(true);
	}
    });
}

MicrographQuery.prototype._modifyQuery = function(quads) {

    var filters = [{'token': 'filter',
		    'value':{'token':'expression',
			     'expressionType': 'conditionaland',
			     'operands':[]}}];

    var unit =  {'kind':'modify',
		 'with': null,
		 'using': null,
		 'pattern':{'filters':[],
			    'token':'groupgraphpattern',
			    'patterns':
			    [{'token':'basicgraphpattern',
			      'triplesContext': quads}]},
		 'delete': quads};

    var prologue =  { base: '', prefixes: [], token: 'prologue' };

    return {'query':{ 'prologue': prologue,
		      'kind': 'update',
		      'token': 'query',
		      'units':[unit]}};		 
};

MicrographQuery._processQueryResults = function(results, topLevel, varsMap, inverseMap, store, offsetValue, limitValue) {
    var pushed = {};
    var processed = {};
    var ignore = {};
    var nodes = {};
    var disambiguations = {};
    var result, isTopLevel, nodeDisambiguations;
    var counter = 0;
    var toReturn = [];
    var that = this;

    if(offsetValue != null || limitValue != null) {
	offsetValue = offsetValue || 0;
	limitValue = limitValue || (results.length - offsetValue);
	limitValue = offsetValue+limitValue;
	var resultsAcum = [], resultsAcumMap = {}, idVal, goodResults = {};
	var nodesFound = 0;

	for(var i=0; i<results.length; i++) {
	    idVal = results[i][topLevel].value;

	    if(resultsAcumMap[idVal] == null) {
		resultsAcumMap[idVal] = true;
		if(nodesFound>=offsetValue && nodesFound<limitValue) {
		    goodResults[idVal] = true;
		    resultsAcum.push(results[i]);
		}
		nodesFound++;
	    } else {
		if(goodResults[idVal]) {
		    resultsAcum.push(results[i]);
		}
	    }
	}

	results = resultsAcum;
    }

    for(var i=0; i<results.length; i++) {
	result = results[i];
	for(var p in result) {
	    isTopLevel = false;
	    var idp = varsMap[p];

	    if(idp == p)
		idp = results[i][p].value;


	    if(p === topLevel)
		isTopLevel = true;

	    var id = (idp.indexOf(MicrographQL.base_uri) != -1 ? idp.split(MicrographQL.base_uri)[1] : idp);

	    var node = nodes[id];
	    node = node || {'$id': id};
	    nodes[id] = node;

	    var invLinks = inverseMap[id] || inverseMap[p];
	    if(invLinks) {
		for(var linkedProp in invLinks) {
		    if(invLinks[linkedProp].length === 1) {
			var linkedObjId = results[i][varsMap[invLinks[linkedProp][0]]];
			if(linkedObjId != null) {
			    // this is a variable resolved to a URI in the bindings results
			    linkedObjId = linkedObjId.value;
			    if(linkedObjId.indexOf(MicrographQL.base_uri) != -1)
			       linkedObjId = linkedObjId.split(MicrographQL.base_uri)[1];
			} else {
			    linkedObjId = invLinks[linkedProp][0];
			}

			var linkedNode = nodes[linkedObjId] || {'$id': linkedObjId};
			var toIgnore = ignore[linkedObjId] || {};
			ignore[linkedObjId] = toIgnore;
			toIgnore[linkedProp] = true;
			delete linkedNode[linkedProp];

			nodes[linkedObjId] = linkedNode;
			if(node[linkedProp+"$in"] == null) {
			    node[linkedProp+"$in"] = linkedNode;
			} else if(node[linkedProp+"$in"].constructor === Array) {
			    node[linkedProp+"$in"].push(linkedNode);
			} else {
			    node[linkedProp+"$in"] = [node[linkedProp+"$in"], linkedNode];
			}
		    } else {
			node[linkedProp+"$in"] = [];
			for(var i=0; i< invLinks[linkedProp].length; i++) {

			    var linkedNode = nodes[linkedObjId] || {'$id': linkedObjId};
			    var toIgnore = ignore[linkedObjId] || {};					  
			    ignore[linkedObjId] = toIgnore;
			    toIgnore[linkedProp] = true;
			    delete linkedNode[linkedProp];

			    var linkedObjId = varsMap[invLinks[linkedProp][0]] || invLinks[linkedProp][0];
			    var linkedNode = nodes[linkedObjId] || {'$id': linkedObjId};
			    nodes[linkedObjId].push(linkedNode);
			}
		    }
		}
	    }

	    if(processed[id] == null) {		
		toIgnore = ignore[id] || {};
		ignore[id] = toIgnore;


		if(MicrographQL.isUri(idp)) {
		    store.execute(MicrographQL.singleNodeQuery(idp, 'p', 'o'), function(success, resultsNode){
			processed[id] = true;
			counter++;
			that._processSingleNodeResults(id, resultsNode, node, disambiguations, nodes, toIgnore);

			if(isTopLevel && pushed[node['$id']] == null) {
			    toReturn.push(node);
			    pushed[node['$id']] = true;
			}
		    });
		}
	    }  else {
		if(isTopLevel) {
		    var node = nodes[id];
		    if(node && pushed[node['$id']] == null) {
			pushed[node['$id']] = node;
			toReturn.push(node);
		    }
		}
	    }
	}
    }

    return toReturn;
}


MicrographQuery._processSingleNodeResults = function(id, resultsNode, node, disambiguations, nodes, toIgnore) {
    nodeDisambiguations = disambiguations[id] || {};
    disambiguations[id] = nodeDisambiguations;

    var obj = null;
    for(var i=0; i<resultsNode.length; i++) {
	var obj = resultsNode[i]['o'];
	if(obj.token === 'uri') {
	    if(obj.value === MicrographQL.NIL) {
		obj = null;
	    } else {
		var oid = (obj.value.indexOf(MicrographQL.base_uri) != -1 ? obj.value.split(MicrographQL.base_uri)[1] : obj.value);
		var linked  = nodes[oid] || {};
		linked['$id'] = oid;
		nodes[oid] = linked;
		obj = linked;
	    }
	} else {
	    obj = MicrographQL.literalToJS(obj);
	}

	var pred = resultsNode[i]['p'].value;

	if(pred === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
	    pred = '$type';
	if(pred === MicrographQL.base_uri+"from")
	    pred = '$from';
	if(pred === MicrographQL.base_uri+'state')
	    pred = '$state';

	if(toIgnore[pred])
	    continue;

	if(node[pred] && node[pred].constructor === Array && obj !== null) {
	    if(typeof(obj) === 'object' && obj['$id'] && nodeDisambiguations[pred][obj['$id']] == null) {
		nodeDisambiguations[pred][obj['$id']] = true;
		node[pred].push(obj);
	    } else if(typeof(obj) !== 'object' && obj.constructor === Date && nodeDisambiguations[pred]['date:'+obj.getTime()] == null) {
		nodeDisambiguations[pred]['date:'+obj.getTime()] = true;
		node[pred].push(obj);
	    } else if(nodeDisambiguations[pred][obj] == null) {
		nodeDisambiguations[pred][obj] = true;
		node[pred].push(obj);
	    }
	} else if(node[pred] && obj !== null) {
	    if(typeof(node[pred]) === 'object' && node[pred]['$id'] != null) {
		if(typeof(obj) === 'object' && obj['$id'] != null) {
		    if(node[pred]['$id'] != obj['$id']) {
			node[pred] = [node[pred],obj];
			nodeDisambiguations[pred] = {};
			nodeDisambiguations[pred][node[pred][0]['$id']] = true;
			nodeDisambiguations[pred][node[pred][1]['$id']] = true;
		    }
		} else {
		    nodeDisambiguations[pred] = {};
		    nodeDisambiguations[pred][node[pred]['$id']] = true;
		    if(typeof(obj) === 'object') {
			nodeDisambiguations[pred]['date:'+obj.getTime()] = true;
		    } else {
			nodeDisambiguations[pred][obj] = true;
		    }
		    node[pred] = [node[pred],obj];
		}
	    } else if(typeof(node[pred]) === 'object') {
		if(typeof(obj) === 'object' && obj['$id'] == null) {
		    if(node[pred].getTime() !== obj.getTime()) {
			node[pred] = [node[pred],obj];
			nodeDisambiguations[pred] = {};
			nodeDisambiguations[pred]['date:'+node[pred][0].getTime()] = true;
			nodeDisambiguations[pred]['date:'+node[pred][1].getTime()] = true;
		    }
		} else {
		    nodeDisambiguations[pred] = {};
		    nodeDisambiguations[pred]['date:'+node[pred].getTime()] = true;
		    if(typeof(obj) === 'object') {
			nodeDisambiguations[pred][obj['$id']] = true;
		    } else {
			nodeDisambiguations[pred][obj] = true;
		    }
		    node[pred] = [node[pred],obj];
		}
	    } else {
		if(typeof(obj) !== 'object') {
		    if(obj != node[pred]) {
			nodeDisambiguations[pred] = {};
			nodeDisambiguations[pred][obj] = true;
			nodeDisambiguations[pred][node[pred]] = true;
			node[pred] = [node[pred],obj];
		    }
		} else {
		    nodeDisambiguations[pred] = {};
		    nodeDisambiguations[pred][node[pred]] = true;

		    if(obj['$id'] == null) {
			nodeDisambiguations[pred][obj['$id']] = true;						    
		    } else {
			nodeDisambiguations[pred]['date:'+obj.getTime()] = true;						    
		    }
		    node[pred] = [node[pred],obj];
		}
	    }
	} else {
	    node[pred] = obj;
	}
    }

};

MicrographQuery.prototype._applyResultFilter = function(toReturn, callback) {
    var nextFilter = this.filter.shift();
    var filterType = nextFilter[0];
    var reduceAcum = null;
    var filtered = [];
    var filteredResult;
    var that = this;
    Utils.repeat(0,toReturn.length, function(k,env) {
	var floop = arguments.callee;
	var result = toReturn[env._i];
	if(filterType === 'reduce') {
	    reduceAcum = nextFilter[1];
	    filteredResult = nextFilter[2](reduceAcum, result);
	} else
	    filteredResult = nextFilter[1](result);
	if(filterType === 'select') {
	    if(filteredResult !== false)
		filtered.push(result);
	} else {
	    if(filterType === 'map')
		filtered.push(filteredResult);
	    else if(filterType === 'each')
		filtered.push(result);
	    else if(filterType === 'reduce')
		reduceAcum = filteredResult;
	}
	k(floop,env);
    }, function(env) {
	if(filterType === 'reduce')
	    filtered = reduceAcum;

	if(that.filter.length === 0) {
	    if(that.groupPredicate != null) 
		that._groupResults(filtered, callback);
	    else
		callback(filtered); 
	} else
	    that._applyResultFilter(filtered, callback);
    });

};


MicrographQuery.prototype._groupResults = function(results, callback) {
    if(results) {
	var acum = {};
	for(var i=0; i<results.length; i++) {
	    var value = this.groupPredicate(results[i]);
	    var group = acum[value] || [];
	    group.push(results[i]);
	    acum[value] = group;
	}
	callback(acum);
    } else {
	callback(null);
    }
};