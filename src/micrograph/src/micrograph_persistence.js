var WebLocalStorageLexicon = require("./../../js-rdf-persistence/src/web_local_storage_lexicon").WebLocalStorageLexicon;
var WebLocalStorageBTree = require("./../../js-trees/src/web_local_storage_b_tree").WebLocalStorageBTree;

/**
 * Creates a new persistent Micrograph instance.
 *
 * @param {String} [name] a name identifying the persistent graph.
 * @param {bool} [overwrite] flag indicating if the data in the graph must be overwritten.
 * @param {Object} [options] a hash of options for the graph constructor. See Micrograph function.
 * @param {Function} [callback] optional callback function that will be invoked with the new graph instance.
 */
mg.open = function(name,overwrite,options,callback) {
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
    
    if(overwrite && localStorage && localStorage.clear)
	localStorage.clear()

    new mg(options, callback);
};

mg.WebLocalStorageBTree = WebLocalStorageBTree;
mg.WebLocalStorageLexicon = WebLocalStorageLexicon;