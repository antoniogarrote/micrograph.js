// exports
exports.MicrographQL = {};
var MicrographQL = exports.MicrographQL;

// imports
var AbstractQueryTree = require("./../../js-sparql-parser/src/abstract_query_tree").AbstractQueryTree;
var Utils = require("./../../js-trees/src/utils").Utils;

// Redefinitions
Utils.oldNormalizeUnicodeLiterals = Utils.normalizeUnicodeLiterals;
Utils.normalizeUnicodeLiterals = function(toNormalize) {
    if(typeof(toNormalize) === "string") {
	return Utils.oldNormalizeUnicodeLiterals(toNormalize);
    } else {
	return toNormalize;
    }
};


// QL
MicrographQL.base_uri = "http://rdfstore-js.org/micrographql/graph#";
MicrographQL.prefix = "mql";
MicrographQL.NIL = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";

MicrographQL.counter = 0;

MicrographQL.filterNames = {'$eq':true, '$lt':true, '$gt':true, '$neq':true, '$lteq':true, '$gteq':true, '$not':true, '$like':true, '$and':true, '$or':true};

MicrographQL.newContext = function(isQuery) {
    return {variables: [], isQuery:isQuery, quads:[], varsMap: {},   
	    filtersMap: {}, inverseMap:{}, nodes: true, optionals: []};
};

MicrographQL.isFilter = function(val) {
    if(val===null || typeof(val) !== 'object' || val.constructor === Array) {
	return false;
    } else {
	for(var p in val) {
	    return MicrographQL.filterNames[p] || false;
	}
    }
};

MicrographQL.parseFilter = function(predicate, filterVariable, expression) {
    var operator, value;
    var variableExpression = {'token':'expression', 'expressionType':'atomic', 'primaryexpression':'var', 'value': filterVariable};
    if(typeof(expression) === 'object' && expression.constructor !== Date) {
	for(var p in expression) {
	    operator = p;
	    value = expression[p];
	    break;
	}
    }

    if(operator === '$eq') {
	return {'token': 'expression',
		'expressionType': 'relationalexpression',
		'operator': '=',
		'op1': variableExpression,
		'op2': MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$lt') {
	return {'token': 'expression',
		'expressionType': 'relationalexpression',
		'operator': '<',
		'op1': variableExpression,
		'op2': MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$gt') {
	return {'token': 'expression',
		'expressionType': 'relationalexpression',
		'operator': '>',
		'op1': variableExpression,
		'op2': MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$neq') {
	return {'token': 'expression',
		'expressionType': 'relationalexpression',
		'operator': '!=',
		'op1': variableExpression,
		'op2': MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$lteq') {
	return {'token': 'expression',
		'expressionType': 'relationalexpression',
		'operator': '<=',
		'op1': variableExpression,
		'op2': MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$gteq') {
	return {'token': 'expression',
		'expressionType': 'relationalexpression',
		'operator': '>=',
		'op1': variableExpression,
		'op2': MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$not') {
	return {'token': 'expression',
		'expressionType': 'unaryexpression',
		'unaryexpression': '!',
		'expression': MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$like') {
	return {'token': 'expression',
		'expressionType': 'regex',
		'text': variableExpression,
		'pattern': (typeof(value) === 'object' && value.constructor === RegExp) ? 
		MicrographQL.parseFilter(predicate, filterVariable, value.source) : 
		MicrographQL.parseFilter(predicate, filterVariable, value)};
    } else if(operator === '$and') {
	if(typeof(value) !== 'object' || value.constructor !== Array) {
	    value = [value];
	}
	var acum = [];
	for(var i=0; i<value.length; i++) {
	    acum.push(MicrographQL.parseFilter(predicate, filterVariable, value[i]));
	}
	return {"token": "expression",
                "expressionType": "conditionaland",
	        'operands': acum };
    } else if(operator === '$or') {
	if(typeof(value) !== 'object' || value.constructor !== Array) {
	    value = [value];
	}
	acum = [];
	for(i=0; i<value.length; i++) {
	    acum.push(MicrographQL.parseFilter(predicate, filterVariable, value[i]));
	}
	return {"token": "expression",
                "expressionType": "conditionalor",
	        'operands': acum };
    } else {
	if(typeof(expression) === "object" && expression['$id'] != null) {
	    return {
                "token": "expression",
                "expressionType": "irireforfunction",
                "iriref": MicrographQL.parseURI((MicrographQL.isUri(expression['$id']) ? expression['$id'] : MicrographQL.base_uri+expression['$id']))
	    };
	} else {
	    var literal =  MicrographQL.parseLiteral(expression);
	    if(literal.type && literal.type === "http://www.w3.org/2001/XMLSchema#float") {
		return {"token": "expression",
			"expressionType": "atomic",
			"primaryexpression": "numericliteral",
			'value': literal};
	    } else 	if(literal.type && literal.type === "http://www.w3.org/2001/XMLSchema#boolean") {
		return {"token": "expression",
			"expressionType": "atomic",
			"primaryexpression": "booleanliteral",
			'value': literal};
	    } else {
		return {"token": "expression",
			"expressionType": "atomic",
			"primaryexpression": "rdfliteral",
			'value': literal};
	    }
	}
    }
};

MicrographQL.nextVariable = function() {
    var variable = "id__mg__"+MicrographQL.counter;
    MicrographQL.counter++;
    return variable;
};

MicrographQL.isUri = function(value) {
    return value && value.match(/[a-z]+:\//);
}

MicrographQL.parseURI = function(value) {
    if(MicrographQL.isUri(value)) {
	return {'token':'uri', 'value':value, 'suffix': null, 'prefix': null};
    } else {
	if(value == null) {
	    value = MicrographQL.base_uri+"object"+MicrographQL.counter;
	    MicrographQL.counter++;
	}
	
	return {'token':'uri', 'value': value, 'suffix': null, 'prefix': null};
    }
};

MicrographQL.parsePath = function(value) {
    var pathParts = value.split("/");
    var values = [], token, modifier, pathComponent;
    for(var i=0; i<pathParts.length; i++) {
	value = pathParts[i];
	modifier = null;
	if(value.indexOf("*") === value.length-1) {
	    modifier = "*";
	    value = value.substring(0,value.length-1);
	} else if(value.indexOf("?") === value.length-1) {
	    modifier = "?";
	    value = value.substring(0,value.length-1);
	} else if(value.indexOf("+") === value.length-1) {
	    modifier = "+";
	    value = value.substring(0,value.length-1);
	}

	token = MicrographQL.parseURI(value);
	if(modifier != null)
	    token = {'token':'path', 'kind':'element', 'value':token, 'modifier': modifier};

	values.push(token);
    }

    return {"token": "path",
            "kind": "sequence",
	    "value": values};
};

MicrographQL.parseLiteral = function(value) {
    if(value === null) {
	return {'token': 'uri', 'value': MicrographQL.NIL};
    } else if(typeof(value) === 'string') {
	return {'token': 'literal', 'value': value, 'lang':null, 'type':null };
    } else if(typeof(value) === 'boolean') {
	return {'token': 'literal', 'value': ""+value, 'type':'http://www.w3.org/2001/XMLSchema#boolean', 'lang':null};
    } else if(typeof(value) === 'number') {
	return {'token': 'literal', 'value': ""+value, 'type':'http://www.w3.org/2001/XMLSchema#float', 'lang':null};
    } else if(typeof(value) === 'object' && value.constructor === Date) {
	return {'token': 'literal', 'value': Utils.iso8601(value), 'type':'http://www.w3.org/2001/XMLSchema#dateTime', 'lang':null};
    } else {
	throw "Error parsing object value: "+value;
    }
};

MicrographQL.parseJSON = function(object, graph, from, state) {
    var context = MicrographQL.newContext(false);
    var result = MicrographQL.parseBGP(object, context, true, graph, from, state);
    var quads = context.quads.concat(result[1]);
    return quads;
};


MicrographQL.parseBGP = function(expression, context, topLevel, graph, from, state) {
    var subject = null;
    var quads = [];
    var nextVariable = MicrographQL.nextVariable();
    var filterCounter = 0;
    if(expression['$id'] != null || !context.isQuery) {
	if(expression['$id'] == null) {
	    subject = MicrographQL.parseURI(null); // generates URI with next ID
	    if(expression['$id'] == null) 
		expression['$id'] = "object"+(MicrographQL.counter-1); // the previous ID
	} else {
	    if(expression['$id']['token'] ==='var') {
		// this node might be an inverse relationship
		// or can be set to a var by a tuple or path query
		subject = expression['$id'];
		if(!context.nodes && subject.value.indexOf("id__mg__") == -1) // this is a dirty fix, how to tell if the var is generated or provided?
		    context.variables.push(subject);
	    } else {
		if(MicrographQL.isUri(expression['$id']))
		    subject = MicrographQL.parseURI(expression['$id']);
  	        else
		    subject = MicrographQL.parseURI(MicrographQL.base_uri+expression['$id']);
	    }

	    if(context.isQuery && subject.token !== 'var') {
		var filterVariable = nextVariable;
		var variableToken = {'token':'var', 'value': filterVariable};
		var filterString = MicrographQL.parseFilter(predicate,variableToken, {$eq: {'$id': expression['$id']}});
		context.variables.push(variableToken);
		context.varsMap[filterVariable] = nextVariable;
		context.filtersMap[filterVariable] = filterString;
		subject = variableToken;
	    }
	}

	if(expression['$from'] == null && from != null)
	    expression['$from'] = from;

	if(expression['$state'] == null && (state === 'created' || state === 'loaded')) 
	    expression['$state'] = state;
	else if(expression['$state'] == null && state === 'dirty') 
	    expression['$state'] = 'created';
	else if(expression['$state'] === 'loaded' && state === 'dirty') 
	    expression['$state'] = 'dirty';

	context.varsMap[nextVariable] = subject.value;
    } else {
	subject = {'token':'var', 'value':nextVariable};
	if(context.nodes)
	    context.variables.push(subject);
	context.varsMap[nextVariable] = nextVariable;
    }


    if(topLevel)
	context.topLevel = nextVariable;

    
    var predicate, object, result, linked, linkedId, inverseLinks, linkedProp, detectEmpty = true;
    for(var p in expression) {
	if(expression[p] !== undefined) {
	    if(p!=='$id') {
		detectEmpty = false;
		if(p.indexOf("$in") == (p.length-3) && p.indexOf("$in") !== -1) {
				 
		    // rewrite inverse properties
		    linked = expression[p];
		    linkedProp = p.split("$in")[0];
				 
		    // this could also be $this eventually
		    if(typeof(expression[p]) === "string")
			linked = {'$id': expression[p]};
		    expression[p] = linked;
				 
		    var idInverseMap, invLinkedId;
		    if(subject.token === 'uri') {
			invLinkedId = expression['$id'];
			idInverseMap = invLinkedId;
		    } else {
			// unknown ID for this node, it is a variable
			invLinkedId = subject;			
			idInverseMap = invLinkedId.value;
		    }

		    var linkedArray;
		    if(linked.constructor !== Array) {
			linkedArray = [linked];
		    } else {
			linkedArray = linked;
		    }

		    for(var i=0; i<linkedArray.length; i++) {
			linked = linkedArray[i];
			linked[linkedProp] = {'$id':invLinkedId};

			result = MicrographQL.parseBGP(linked, context, false, graph, from, state);

			inverseLinks = context.inverseMap[idInverseMap] || {};
			context.inverseMap[idInverseMap] = inverseLinks;
			
			linked = inverseLinks[linkedProp] || [];
			inverseLinks[linkedProp] = linked;
			if(result[0].token === 'uri') {
			    linked.push(result[0].value.split(MicrographQL.base_uri)[1]);
			} else {
			    linked.push(result[0].value);
			}

			context.quads = context.quads.concat(result[1]);
		    }
		} else {
		    
		    var predicateUri = p;
		    var isOptional = false;

		    if(p.indexOf("$opt") ===  p.length-4) {
			isOptional = true;
			p = p.split("$opt")[0];
		    }

		    if(p === '$type')
			predicateUri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

		    if(p === '$from')
			predicateUri = MicrographQL.base_uri+"from";

		    if(p === '$state')
			predicateUri = MicrographQL.base_uri+"state";

		    if(p.indexOf(":") === -1 &&
		       p.indexOf("/")!== -1 || 
		       p.indexOf("*") === p.length-1 || 
		       p.indexOf("?") === p.length-1 ||
		       p.indexOf("+") === p.length-1) {
			predicate = MicrographQL.parsePath(predicateUri);				
		    } else if(p.indexOf("$path") != -1) {
			predicate = MicrographQL.parsePath(predicateUri.split("$path")[0]);				
		    } else {
			predicate = MicrographQL.parseURI(predicateUri);	
		    }

		    // check if the object is a filter
		    var isFilter = MicrographQL.isFilter(expression[p]);


		    // process the object
		    if(isFilter) {
			var filterVariable = nextVariable+'f'+filterCounter;
			filterCounter++;
			var variableToken = {'token':'var', 'value': filterVariable};
			var filterString = MicrographQL.parseFilter(predicate,variableToken, expression[p]);
			//context.variables.push(variableToken);
			context.varsMap[filterVariable] = nextVariable;
			context.filtersMap[filterVariable] = filterString;
			var quad = {'subject':subject, 'predicate':predicate, 'object':variableToken};
			if(graph != null)
			    quad['graph'] = graph;
			quads.push(quad);
		    } else if(expression[p] !== null && typeof(expression[p]) === 'object' && expression[p]['token'] === 'var') {
			object = expression[p];
			if(context.varsMap[expression] == null && context.nodes) {
			    context.varsMap[expression] = true;
			    context.variables.push(object);
			} else if(context.varsMap[object.value] == null && !context.nodes) {
			    context.varsMap[expression] = true;
			    context.varsMap[object.value] = true;
			    context.variables.push(object);
			}
			var quad = {'subject':subject, 'predicate':predicate, 'object':object};
			if(graph != null)
			    quad['graph'] = graph;
			quads.push(quad);

		    } else if(typeof(expression[p]) === 'string' || 
			      expression[p] === null ||
			      (typeof(expression[p]) === 'object' && expression[p].constructor === Date) || 
			      typeof(expression[p]) === 'number' ||
			      typeof(expression[p]) === 'boolean') {
			object = MicrographQL.parseLiteral(expression[p]);
			var quad = {'subject':subject, 'predicate':predicate, 'object':object};
			if(graph != null)
			    quad['graph'] = graph;
			quads.push(quad);
		    } else {
			if(expression[p].constructor == Array) {
			    for(var i=0; i<expression[p].length; i++) {
				if(expression[p][i] === null) {
				    object = {'token': 'uri', 'value': MicrographQL.NIL};
				    var quad = {'subject':subject, 'predicate':predicate, 'object':object};
				    if(graph != null)
					quad['graph'] = graph;
				    quads.push(quad);
				} else if(typeof(expression[p][i]) === 'object' && expression[p][i].constructor !== Date) {
				    result = MicrographQL.parseBGP(expression[p][i], context, false, graph, from, state);
				    object = result[0];
				    context.quads = context.quads.concat(result[1]);
				    var quad = {'subject':subject, 'predicate':predicate, 'object':object};
				    if(graph != null)
					quad['graph'] = graph;
				    quads.push(quad);
				} else {
				    object = MicrographQL.parseLiteral(expression[p][i]);
				    var quad = {'subject':subject, 'predicate':predicate, 'object':object};
				    if(graph != null)
					quad['graph'] = graph;
				    quads.push(quad);
				}
			    }
			} else {
			    if(expression[p]['token'] === 'var') {
				var quad = {'subject':subject, 'predicate':predicate, 'object':expression[p]};
				if(graph != null)
				    quad['graph'] = graph;
				quads.push(quad);
			    } else {
				result = MicrographQL.parseBGP(expression[p], context, false, graph, from, state);
				object = result[0];
				context.quads = context.quads.concat(result[1]);
				var quad = {'subject':subject, 'predicate':predicate, 'object':object};
				if(graph != null)
				    quad['graph'] = graph;
				quads.push(quad);
			    }
			}
		    }
		}
	    }
	}
    }

    if(detectEmpty) {
	if(topLevel)  {
	    var quad = {'subject':subject, 
			'predicate':{'token':'var', 'value':nextVariable+"p"}, 
			'object':{'token':'var', 'value':nextVariable+"o"}};
	    quads.push(quad);
	}
    }
    return [subject, quads];
};


MicrographQL.singleNodeQuery = function(id, predVar, objVar) {
    return { units: 
	     [ { modifier: '',
		 group: '',
		 pattern: 
		 { filters: [],
		   token: 'groupgraphpattern',
		   patterns: 
		   [ { triplesContext: 
		       [ { subject: {token: 'uri', value: id},
			   predicate: {token:'var', value:predVar},
			   object: {token:'var', value:objVar}}],
		       token: 'basicgraphpattern' }] },
		 kind: 'select',
		 projection: 
		 [ { value: { value: predVar, token: 'var' },
		     kind: 'var',
		     token: 'variable' },
		   { value: { value: objVar, token: 'var' },
		     kind: 'var',
		     token: 'variable' } ],
		 dataset: 
		 { implicit: 
		   [ { value: 'https://github.com/antoniogarrote/rdfstore-js#default_graph',
		       prefix: null,
		       token: 'uri',
		       suffix: null } ],
		   named: [] },
		 token: 'executableunit' }],
	     prologue: { token: 'prologue', prefixes: [], base: '' },
	     kind: 'query',
	     token: 'query' };
};

MicrographQL.literalToJS = function(object) {
    if(object.type === "http://www.w3.org/2001/XMLSchema#float") {
	object = parseFloat(object.value);
    } else if(object.type === "http://www.w3.org/2001/XMLSchema#boolean") {
	object = (object.value === "true") ? true : false;
    } else if(object.type === "http://www.w3.org/2001/XMLSchema#dateTime") {
	object = Utils.parseISO8601(object.value);
    } else {
	object = object.value;
    }
    return object;
};

MicrographQL.uriToJS = function(object) {
    if(object.value === MicrographQL.NIL) {
	return null;
    } if(object.value.indexOf(MicrographQL.base_uri) != -1) {
	return {'$id': object.value.split(MicrographQL.base_uri)[1] }
    } else {
	return {'$id': object.value }
    }
};