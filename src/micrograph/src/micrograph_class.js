// exports
exports.MicrographClass = {};
var MicrographClass = exports.MicrographClass;


MicrographClass.registry = {};
MicrographClass.definitionOrder = [];
MicrographClass.Clone = function(){};

MicrographClass.reset = function(classExpression, object) {
    MicrographClass.registry = {};
    MicrographClass.definitionOrder = [];
};

MicrographClass.define = function(classExpression, object) {
    classExpression = classExpression.replace(/\s*/g,"");
    MicrographClass.registry[classExpression] = object;
    MicrographClass.definitionOrder.push(classExpression);
};

MicrographClass.instance = function() {
    var classUri = arguments[0];
    var base = arguments[1] || {};

    var classPrototype = MicrographClass.registry[classUri];
    MicrographClass.Clone.prototype = classPrototype;
    var clone = new MicrographClass.Clone();

    base.init = null;

    for(var p in clone) {
        if(base[p] == null) {
	    base[p] = clone[p];
        }
    }
    if(base['init'] && typeof(base['init'])==='function') {
        base['init']();
	delete base['init'];
    }
    
    return base;    
};


MicrographClass.check = function(resource) {
    var isFirstRun = arguments[1] || true;

    resource['__micrograph__classes'] = resource['__micrograph__classes'] || {};

    var p;
    for(var i=0; i<MicrographClass.definitionOrder.length; i++) {
	p = MicrographClass.definitionOrder[i];
        if(MicrographClass.isInstance(resource, p)) {
            if(isFirstRun || resource['__micrograph__classes'][p] == null) {
                MicrographClass.instance(p,resource);
            }
            resource['__micrograph__classes'][p] = true;
        } else {
            if(resource['__micrograph__classes'][p] != null) {
                delete resource.classes[p];
                for(var m in MicrographClass.registry[p]) {
                    delete resource[m];
                }
            }
        }
    }
};


MicrographClass.isInstance = function(resource, klass) {
    if(klass.indexOf("and(") === 0) {
        var parts = klass.slice(0,klass.length-1).split("and(")[1].split(",");
            if(!MicrographClass.isInstance(resource, parts[i])) {
                return false;
            }
        return true;
    } else if(klass.indexOf("or(") === 0) {
        var parts = klass.slice(0,klass.length-1).split("or(")[1].split(",");
        for(var i=0; i<parts.length; i++) {
            if(MicrographClass.isInstance(resource, parts[i])) {
                return true;
            }
        }
        return false;
    } else if(klass.indexOf("prop(") === 0) {
        var propertyUri = klass.slice(0,klass.length-1).split("prop(")[1];
        return resource[propertyUri] != null;
    } else if(klass.indexOf("not(") === 0) {
        var expression = klass.slice(0,klass.length-1).split("not(")[1];
	return !MicrographClass.isInstance(resource,expression);
    } else {
	if(resource['$type']) {
	    if(typeof(resource['$type']) === 'object') {
		for(var i=0; i<resource['$type'].length; i++) {
		    if(resource['$type'][i] === klass)
			return true;
		}
		return false;
	    } else {
		return resource['$type'] === klass;
	    }
	} else {
	    return false;
	}        
    }
};
