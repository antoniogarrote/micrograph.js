(function() {


  if(typeof(console)=='undefined') {
     console = {};
     console.log = function(e){};
  }

var Utils = {};



Utils['extends'] = function(supertype, descendant) {
    descendant.prototype = new supertype();
};


Utils.stackCounterLimit = 1000;
Utils.stackCounter = 0;

Utils.recur = function(c){
    if(Utils.stackCounter === Utils.stackCounterLimit) {
        Utils.stackCounter = 0;
        setTimeout(c, 0);
    } else {
        Utils.stackCounter++;
        c();
    } 
};

Utils.clone = function(o) {
    return JSON.parse(JSON.stringify(o));
};

Utils.shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){};
    return o;
};

Utils.include = function(a,v) {
    var cmp = arguments[2];

    for(var i=(a.length-1); i>=0; i--) {
        var res = false;
        if(cmp == null) {
            res = (a[i] === v);
        } else {
            res = (cmp(a[i],v) === 0);
        }

        if(res === true) {
            return true;
        }
    }

    return false;
};

Utils.remove = function(a,v) {
    var acum = [];
    for(var i=0; i<a.length; i++) {
        if(a[i] !== v) {
            acum.push(a[i]);
        }
    }

    return acum;
};

Utils.repeat = function(c,max,floop,fend,env) {
    if(arguments.length===4) { env = {}; }
    if(c<max) {
        env._i = c;
        floop(function(floop,env){
            // avoid stack overflow
            // deadly hack
            Utils.recur(function(){ Utils.repeat(c+1, max, floop, fend, env); });
        },env);
    } else {
        fend(env);
    }
};


Utils.meanwhile = function(c,floop,fend,env) {
    if(arguments.length===3) { env = {}; }

    if(env['_stack_counter'] == null) {
        env['_stack_counter'] = 0;
    }

    if(c===true) {
        floop(function(c,floop,env){
            if(env['_stack_counter'] % 40 == 39) {
                env['_stack_counter'] = env['_stack_counter'] + 1;
                setTimeout(function(){ Utils.neanwhile(c, floop, fend, env); }, 0);
            } else {
                env['_stack_counter'] = env['_stack_counter'] + 1;
                Utils.meanwhile(c, floop, fend, env);
            }
        },env);
    } else {
        fend(env);
    }
};

Utils.seq = function() {
    var fs = arguments;
    return function(callback) {
        Utils.repeat(0, fs.length, function(k,env){
            var floop = arguments.callee;
            fs[env._i](function(){
                k(floop, env);
            });
        }, function(){
            callback();
        });
    };
};


Utils.partition = function(c, n) {
    var rem = c.length % n;
    var currentGroup = [];
    for(var i=0; i<rem; i++) {
        currentGroup.push(null);
    }
    
    var groups = [];
    for(var i=0; i<c.length; i++) {
        currentGroup.push(c[i]);
        if(currentGroup.length % n == 0) {
            groups.push(currentGroup);
            currentGroup = [];
        }
    }
    return groups;
};

Utils.keys = function(obj) {
    var variables = [];
    for(var variable in obj) {
        variables.push(variable);
    }

    return variables;
};

Utils.iso8601 = function(date) {
    function pad(n){
        return n<10 ? '0'+n : n;
    }    
    return date.getUTCFullYear()+'-'
        + pad(date.getUTCMonth()+1)+'-'
        + pad(date.getUTCDate())+'T'
        + pad(date.getUTCHours())+':'
        + pad(date.getUTCMinutes())+':'
        + pad(date.getUTCSeconds())+'Z';
};


Utils.parseStrictISO8601 = function (str) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = str.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) {
        date.setMonth(d[3] - 1);
    } else {
        throw "missing ISO8061 component"
    }
    if (d[5]) {
        date.setDate(d[5]);
    } else {
        throw "missing ISO8061 component"
    }
    if (d[7]) {
        date.setHours(d[7]);
    } else {
        throw "missing ISO8061 component"
    }
    if (d[8]) {
        date.setMinutes(d[8]);
    } else {
        throw "missing ISO8061 component"
    }
    if (d[10]) {
        date.setSeconds(d[10]);
    } else {
        throw "missing ISO8061 component"
    }
    if (d[12]) {
        date.setMilliseconds(Number("0." + d[12]) * 1000);
    }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    var time = (Number(date) + (offset * 60 * 1000));
    var toReturn = new Date();
    toReturn.setTime(Number(time));
    return toReturn;
};


Utils.parseISO8601 = function (str) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = str.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]);  }
    if (d[7]) { date.setHours(d[7]);  }
    if (d[8]) { date.setMinutes(d[8]);  }
    if (d[10]) { date.setSeconds(d[10]);  }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    var time = (Number(date) + (offset * 60 * 1000));
    var toReturn = new Date();
    toReturn.setTime(Number(time));
    return toReturn;
};

Utils.parseISO8601Components = function (str) {
    var regexp = "([0-9]{4})(-([0-9]{2}))(-([0-9]{2}))(T([0-9]{2}):([0-9]{2})(:([0-9]{2}))?(\.([0-9]+))?)?(Z|([-+])([0-9]{2})(:([0-9]{2}))?)?";
    var d = str.match(new RegExp(regexp));
    var year, month, date, hours, minutes, seconds, millisecs, timezone;
    year = Number(d[1]);
    month = d[3] - 1;
    date  = Number(d[5]);
    hours = Number(d[7]);
    minutes = Number(d[8]);
    seconds = Number(d[10]);

    if(d[12]) { millisecs = Number("0." + d[12]) * 1000; }

    if(d[13]==="Z") {
        timezone = 0;
    } else if (d[14]) {
        timezone = 0;
        if(d[17]) {
            timezone = Number(d[17]);
        }
        timezone = timezone+(Number(d[15]) * 60);
        timezone *= ((d[14] == '-') ? -1 : +1);
    } else if(d[14]==null && d[11]) {
        timezone = Number(d[12])*60;
    }    

    return {'year': isNaN(year) ? null : year,
            'month': isNaN(month) ? null : month,
            'date': isNaN(date) ? null : date,
            'hours': isNaN(hours) ? null : hours,
            'minutes': isNaN(minutes) ? null : minutes,
            'seconds': isNaN(seconds) ? null : seconds,
            'millisecs':isNaN(millisecs) ? null : millisecs,
            'timezone': isNaN(timezone) ? null : timezone};
};

Utils.compareDateComponents = function(stra,strb) {
    var a = Utils.parseISO8601Components(stra);
    var b = Utils.parseISO8601Components(strb);

    if((a.timezone == null && b.timezone == null) ||
       (a.timezone != null && b.timezone != null)) {        
        var da = Utils.parseISO8601(stra);
        var db = Utils.parseISO8601(strb);
        
        if(da.getTime() == db.getTime()) {
            return 0;
        } else if(da.getTime() < db.getTime()){
            return -1;
        } else {
            return 1;
        }
    } else if (a.timezone != null && b.timezone == null){
        da = Utils.parseISO8601(stra);
        db = Utils.parseISO8601(strb);
        var ta = da.getTime();
        var tb = db.getTime();

        var offset = 14*60*60;

        if(ta < tb && ta < (tb + offset)) {
            return -1;
        } else if(ta > tb && ta > (tb - offset)) {
            return 1;
        } else {
        return null;
        }
    } else {
        da = Utils.parseISO8601(stra);
        db = Utils.parseISO8601(strb);
        ta = da.getTime();
        tb = db.getTime();

        var offset = 14*60*60;
        if(ta < tb && (ta + offset)  < tb) {
            return -1;
        } else if(ta > tb && (ta + offset) > tb) {
            return 1;
        } else {
        return null;
        }
    }
};

// RDF utils
Utils.lexicalFormLiteral = function(term, env) {
    var value = term.value;
    var lang = term.lang;
    var type = term.type;

    var indexedValue = null;
    if(value != null && type != null && typeof(type) != 'string') {
        var typeValue = type.value;

        if(typeValue == null) {
            var typePrefix = type.prefix;
            var typeSuffix = type.suffix;

            var resolvedPrefix = env.namespaces[typePrefix];
            term.type = resolvedPrefix+typeSuffix;
	    typeValue = resolvedPrefix+typeSuffix;
        }
	// normalization
	if(typeValue.indexOf('hexBinary') != -1) {
            indexedValue = '"' + term.value.toLowerCase() + '"^^<' + typeValue + '>';
	} else {
            indexedValue = '"' + term.value + '"^^<' + typeValue + '>';
	}
    } else {
        if(lang == null && type == null) {
            indexedValue = '"' + value + '"';
        } else if(type == null) {
            indexedValue = '"' + value + '"' + "@" + lang;        
        } else {
	    // normalization
	    if(type.indexOf('hexBinary') != -1) {
		indexedValue = '"' + term.value.toLowerCase() + '"^^<'+type+'>';
	    } else {
		indexedValue = '"' + term.value + '"^^<'+type+'>';
	    }
        }
    }
    return indexedValue;
};

Utils.lexicalFormBaseUri = function(term, env) {
    var uri = null;
    //console.log("*** normalizing URI token:");
    //console.log(term);
    if(term.value == null) {
        //console.log(" - URI has prefix and suffix");
        //console.log(" - prefix:"+term.prefix);
        //console.log(" - suffixx:"+term.suffix);
        var prefix = term.prefix;
        var suffix = term.suffix;
        var resolvedPrefix = env.namespaces[prefix];
        if(resolvedPrefix != null) {            
            uri = resolvedPrefix+suffix;
        } else {
            uri = prefix+":"+suffix;
        }
    } else {
        //console.log(" - URI is not prefixed");
        uri = term.value;
    }

    if(uri===null) {
        return null;
    } else {
        //console.log(" - resolved URI is "+uri);
        if(uri.indexOf(":") == -1) {
            //console.log(" - URI is partial");
            uri = (env.base||"") + uri; // applyBaseUri
        } else {
            //console.log(" - URI is complete");
        }
        //console.log(" -> FINAL URI: "+uri);
    }

    return uri;
};


Utils.lexicalFormTerm = function(term, ns) {
    if(term.token === 'uri') {
        return {'uri': Utils.lexicalFormBaseUri(term, ns)};
    } else if(term.token === 'literal') {
        return {'literal': Utils.lexicalFormLiteral(term, ns)};
    } else if(term.token === 'blank') {
        var label = '_:'+term.value;
        return {'blank': label};
    } else {
	throw "Error, cannot get lexical form of unknown token: "+term.token;
    }
};

Utils.normalizeUnicodeLiterals = function (string) {
    var escapedUnicode = string.match(/\\u[0-9abcdefABCDEF]{4,4}/g) || [];
    var dups = {};
    for (var i = 0; i < escapedUnicode.length; i++) {
        if (dups[escapedUnicode[i]] == null) {
            dups[escapedUnicode[i]] = true;
            string = string.replace(new RegExp("\\" + escapedUnicode[i], "g"), eval("'" + escapedUnicode[i] + "'"));
        }
    }

    return string;
};

Utils.hashTerm = function(term) {
    try {
      if(term == null) {
          return "";
      } if(term.token==='uri') {
          return "u"+term.value;
      } else if(term.token === 'blank') {
          return "b"+term.value;
      } else if(term.token === 'literal') {
          var l = "l"+term.value;
          l = l + (term.type || "");
          l = l + (term.lang || "");        
   
          return l;
      }
    } catch(e) {
        if(typeof(term) === 'object') {
            var key = "";
            for(p in term) {
                key = key + p + term[p];
            }

            return key;
        }
        return term;
    }
};

// end of ./src/js-trees/src/utils.js 
// exports
var InMemoryBTree = {};

var left = -1;
var right = 1;


/**
 * @doc
 * Implementation based on <http://www.gossamer-threads.com/lists/linux/kernel/667935>
 *
 */

/**
 * Tree
 *
 * Implements the interface of BinarySearchTree.Tree
 *
 * An implementation of an in memory B-Tree.
 */

InMemoryBTree.Tree = function(order) {
    if(arguments.length != 0) {
        this.order = order;
        this.root = this._allocateNode();
        this.root.isLeaf = true;
        this.root.level = 0;
        this._diskWrite(this.root);
        this._updateRootNode(this.root);

        this.comparator = function(a,b) {
            if(a < b) {
                return -1;
            } else if(a > b){
                return 1;
            } else {
                return 0;
            }
        };
        this.merger = null;
    }
};

/**
 * Creates the new node.
 *
 * This class can be overwritten by different versions of
 * the tree t select the right kind of node to be used
 *
 * @returns the new alloacted node
 */
InMemoryBTree.Tree.prototype._allocateNode = function () {
    return new InMemoryBTree.Node();
};

/**
 * _diskWrite
 *
 * Persists the node to secondary memory.
 */
InMemoryBTree.Tree.prototype._diskWrite= function(node) {
    // dummy implementation;
    // no-op
};


/**
 * _diskRead
 *
 * Retrieves a node from secondary memory using the provided
 * pointer
 */
InMemoryBTree.Tree.prototype._diskRead = function(pointer) {
    // dummy implementation;
    // no-op
    return pointer;
};


InMemoryBTree.Tree.prototype._diskDelete= function(node) {
    // dummy implmentation
    // no-op
};

/**
 * _updateRootNode
 *
 * Updates the pointer to the root node stored in disk.
 */
InMemoryBTree.Tree.prototype._updateRootNode = function(node) {
    // dummy implementation;
    // no-op
    return node;
};

InMemoryBTree.Tree.prototype.clear = function() {
        this.root = this._allocateNode();
        this.root.isLeaf = true;
        this.root.level = 0;
        this._updateRootNode(this.root);
};

/**
 * search
 *
 * Retrieves the node matching the given value.
 * If no node is found, null is returned.
 */
InMemoryBTree.Tree.prototype.search = function(key, checkExists) {
    var searching = true;
    var node = this.root;

    while(searching) {
        var idx = 0;
        while(idx < node.numberActives && this.comparator(key, node.keys[idx].key) === 1) {
            idx++;
        }

        if(idx < node.numberActives && this.comparator(node.keys[idx].key,key) === 0) {
            if(checkExists != null && checkExists == true) {
                return true;
            } else {
                return node.keys[idx].data;
            }
        } else {
            if(node.isLeaf === true) {
                searching = false;
            } else {
                node = this._diskRead(node.children[idx]);
            }
        }
    }

    return null;
};


/**
 * walk
 * Applies a function to all the nodes key and data in the the
 * tree in key order.
 */
InMemoryBTree.Tree.prototype.walk = function(f) {
    this._walk(f,this.root);
};

InMemoryBTree.Tree.prototype._walk = function(f,node) {
    if(node.isLeaf) {
        for(var i=0; i<node.numberActives; i++) {
            f(node.keys[i]);
        }
    } else {
        for(var i=0; i<node.numberActives; i++) {
            this._walk(f,this._diskRead(node.children[i]));
            f(node.keys[i]);
        }
        this._walk(f,this._diskRead(node.children[node.numberActives]));
    }
};

/**
 * walkNodes
 * Applies a function to all the nodes in the the
 * tree in key order.
 */
InMemoryBTree.Tree.prototype.walkNodes = function(f) {
    this._walkNodes(f,this.root);
};

InMemoryBTree.Tree.prototype._walkNodes = function(f,node) {
    if(node.isLeaf) {
        f(node);
    } else {
        f(node);
        for(var i=0; i<node.numberActives; i++) {
            this._walkNodes(f,this._diskRead(node.children[i]));
        }
        this._walkNodes(f,this._diskRead(node.children[node.numberActives]));
    }
};

/**
 * _splitChild
 *
 * Split the child node and adjusts the parent.
 */
InMemoryBTree.Tree.prototype._splitChild = function(parent, index, child) {
    var newChild = this._allocateNode();
    newChild.isLeaf = child.isLeaf;
    newChild.level = child.level;
    newChild.numberActives = this.order - 1;

    // Copy the higher order keys to the new child
    var newParentChild = child.keys[this.order-1];
    child.keys[this.order-1] = null;

    for(var i=0; i< this.order-1; i++) {
	newChild.keys[i]=child.keys[i+this.order];
	child.keys[i+this.order] = null;
	if(!child.isLeaf) {
	    newChild.children[i] = child.children[i+this.order];
            child.children[i+this.order] = null;
	}
    }

    // Copy the last child pointer
    if(!child.isLeaf) {
	newChild.children[i] = child.children[i+this.order];
        child.children[i+this.order] = null;
    }

    child.numberActives = this.order - 1;


    for(i = parent.numberActives + 1; i>index+1; i--) {
	parent.children[i] = parent.children[i-1];
    }

    parent.children[index+1] = newChild;

    for(i = parent.numberActives; i>index; i--) {
	parent.keys[i] = parent.keys[i-1];
    }

    parent.keys[index] = newParentChild;
    parent.numberActives++;

    this._diskWrite(newChild);
    this._diskWrite(parent);
    this._diskWrite(child);
};

/**
 * insert
 *
 * Creates a new node with value key and data and inserts it
 * into the tree.
 */
InMemoryBTree.Tree.prototype.insert = function(key,data) {
    if(this.root.numberActives === (2 * this.order - 1)) {
        var newRoot = this._allocateNode();
        newRoot.isLeaf = false;
        newRoot.level = this.root.level + 1;
        newRoot.numberActives = 0;
        newRoot.children[0] = this.root;

        this._splitChild(newRoot, 0, this.root);
        this.root = newRoot;
        this._updateRootNode(this.root);
        this._insertNonFull(newRoot, key, data);
    } else {
        this._insertNonFull(this.root, key, data);
    }
};

/**
 * _insertNonFull
 *
 * Recursive function that tries to insert the new key in
 * in the prvided node, or splits it and go deeper
 * in the BTree hierarchy.
 */
InMemoryBTree.Tree.prototype._insertNonFull = function(node,key,data) {
    var idx = node.numberActives - 1;

    while(!node.isLeaf) {
        while(idx>=0 && this.comparator(key,node.keys[idx].key) === -1) {
            idx--;
        }
        idx++;
        var child = this._diskRead(node.children[idx]);

        if(child.numberActives === 2*this.order -1) {
            this._splitChild(node,idx,child);
            if(this.comparator(key, node.keys[idx].key)===1) {
                idx++;
            }
        }
        node = this._diskRead(node.children[idx]);
        idx = node.numberActives -1;
    }

    while(idx>=0 && this.comparator(key,node.keys[idx].key) === -1) {
        node.keys[idx+1] = node.keys[idx];
        idx--;
    }

    node.keys[idx + 1] = {key:key, data:data};
    node.numberActives++;
    this._diskWrite(node);
};

/**
 * delete
 *
 * Deletes the key from the BTree.
 * If the key is not found, an exception is thrown.
 *
 * @param key the key to be deleted
 * @returns true if the key is deleted false otherwise
 */
InMemoryBTree.Tree.prototype['delete'] = function(key) {
    var node = this.root;
    var parent = null;
    var searching = true;
    var idx = null;
    var lsibling = null;
    var rsibling = null;
    var shouldContinue = true;

    while(shouldContinue === true) {
        shouldContinue = false;

        while(searching === true) {
            i = 0;

            if(node.numberActives === 0) {
                return false;
            }

            while(i<node.numberActives && this.comparator(key, node.keys[i].key) === 1) {
                i++;
            }

            idx = i;

            if(i<node.numberActives && this.comparator(key, node.keys[i].key) === 0) {
                searching = false;
            }

            if(searching === true) {

                if(node.isLeaf === true) {
                    return false;
                }

                parent = node;
                node = this._diskRead(node.children[i]);

                if(node===null) {
                    return false;
                }

                if(idx === parent.numberActives) {
                    lsibling = this._diskRead(parent.children[idx-1]);
                    rsibling = null;
                } else if(idx === 0) {
                    lsibling = null;
                    rsibling = this._diskRead(parent.children[1]);
                } else {
                    lsibling = this._diskRead(parent.children[idx-1]);
                    rsibling = this._diskRead(parent.children[idx+1]);
                }


                if(node.numberActives === (this.order-1) && parent != null) {
                    if(rsibling != null && rsibling.numberActives > (this.order-1)) {
                        // The current node has (t - 1) keys but the right sibling has > (t - 1) keys
                        this._moveKey(parent,i,left);
                    } else if(lsibling != null && lsibling.numberActives > (this.order-1)) {
                        // The current node has (t - 1) keys but the left sibling has > (t - 1) keys
                        this._moveKey(parent,i,right);
                    } else if(lsibling != null && lsibling.numberActives === (this.order-1)) {
                        // The current node has (t - 1) keys but the left sibling has (t - 1) keys
                        node = this._mergeSiblings(parent,i,left);
                    } else if(rsibling != null && rsibling.numberActives === (this.order-1)){
                        // The current node has (t - 1) keys but the left sibling has (t - 1) keys
                        node = this._mergeSiblings(parent,i,right);
                    }
                }
            }
        }


        //Case 1 : The node containing the key is found and is the leaf node.
        //Also the leaf node has keys greater than the minimum required.
        //Simply remove the key
        if(node.isLeaf && (node.numberActives > (this.order-1))) {
            this._deleteKeyFromNode(node,idx);
            return true;
        }


        //If the leaf node is the root permit deletion even if the number of keys is
        //less than (t - 1)
        if(node.isLeaf && (node === this.root)) {
            this._deleteKeyFromNode(node,idx);
            return true;
        }


        //Case 2: The node containing the key is found and is an internal node
        if(node.isLeaf === false) {
            var tmpNode = null;
            var tmpNode2 = null;
            if((tmpNode=this._diskRead(node.children[idx])).numberActives > (this.order-1)) {
                var subNodeIdx = this._getMaxKeyPos(tmpNode);
                key = subNodeIdx.node.keys[subNodeIdx.index];

                node.keys[idx] = key;

                //this._delete(node.children[idx],key.key);
                this._diskWrite(node);
                node = tmpNode;
                key = key.key;
                shouldContinue = true;
                searching = true;
            } else if ((tmpNode = this._diskRead(node.children[idx+1])).numberActives >(this.order-1)) {
                var subNodeIdx = this._getMinKeyPos(tmpNode);
                key = subNodeIdx.node.keys[subNodeIdx.index];

                node.keys[idx] = key;

                //this._delete(node.children[idx+1],key.key);
                this._diskWrite(node);
                node = tmpNode;
                key = key.key;
                shouldContinue = true;
                searching = true;
            } else if((tmpNode = this._diskRead(node.children[idx])).numberActives === (this.order-1) &&
                      (tmpNode2 = this._diskRead(node.children[idx+1])).numberActives === (this.order-1)) {

                var combNode = this._mergeNodes(tmpNode, node.keys[idx], tmpNode2);
                node.children[idx] = combNode;

                idx++;
                for(var i=idx; i<node.numberActives; i++) {
          	    node.children[i] = node.children[i+1];
          	    node.keys[i-1] = node.keys[i];
                }
                // freeing unused references
                node.children[i] = null;
                node.keys[i-1] = null;

                node.numberActives--;
                if (node.numberActives === 0 && this.root === node) {
                    this.root = combNode;
                }

                this._diskWrite(node);

                node = combNode;
                shouldContinue = true;
                searching = true;
            }
        }


        // Case 3:
	// In this case start from the top of the tree and continue
	// moving to the leaf node making sure that each node that
	// we encounter on the way has atleast 't' (order of the tree)
	// keys
	if(node.isLeaf && (node.numberActives > this.order - 1) && searching===false) {
            this._deleteKeyFromNode(node,idx);
	}

        if(shouldContinue === false) {
            return true;
        }
    }
};

/**
 * _moveKey
 *
 * Move key situated at position i of the parent node
 * to the left or right child at positions i-1 and i+1
 * according to the provided position
 *
 * @param parent the node whose is going to be moved to a child
 * @param i Index of the key in the parent
 * @param position left, or right
 */
InMemoryBTree.Tree.prototype._moveKey = function (parent, i, position) {

    if (position === right) {
        i--;
    }

    //var lchild = parent.children[i-1];
    var lchild = this._diskRead(parent.children[i]);
    var rchild = this._diskRead(parent.children[i + 1]);


    if (position == left) {
        lchild.keys[lchild.numberActives] = parent.keys[i];
        lchild.children[lchild.numberActives + 1] = rchild.children[0];
        rchild.children[0] = null;
        lchild.numberActives++;

        parent.keys[i] = rchild.keys[0];

        for (var _i = 1; _i < rchild.numberActives; _i++) {
            rchild.keys[_i - 1] = rchild.keys[_i];
            rchild.children[_i - 1] = rchild.children[_i];
        }
        rchild.children[rchild.numberActives - 1] = rchild.children[rchild.numberActives];
        rchild.numberActives--;
    } else {
        rchild.children[rchild.numberActives + 1] = rchild.children[rchild.numberActives];
        for (var _i = rchild.numberActives; _i > 0; _i--) {
            rchild.children[_i] = rchild.children[_i - 1];
            rchild.keys[_i] = rchild.keys[_i - 1];
        }
        rchild.keys[0] = null;
        rchild.children[0] = null;

        rchild.children[0] = lchild.children[lchild.numberActives];
        rchild.keys[0] = parent.keys[i];
        rchild.numberActives++;

        lchild.children[lchild.numberActives] = null;
        parent.keys[i] = lchild.keys[lchild.numberActives - 1];
        lchild.keys[lchild.numberActives - 1] = null;
        lchild.numberActives--;
    }

    this._diskWrite(lchild);
    this._diskWrite(rchild);
    this._diskWrite(parent);
};

/**
 * _mergeSiblings
 *
 * Merges two nodes at the left and right of the provided
 * index in the parent node.
 *
 * @param parent the node whose children will be merged
 * @param i Index of the key in the parent pointing to the nodes to merge
 */
InMemoryBTree.Tree.prototype._mergeSiblings = function (parent, index, pos) {
    var i, j;
    var n1, n2;

    if (index === (parent.numberActives)) {
        index--;
        n1 = this._diskRead(parent.children[parent.numberActives - 1]);
        n2 = this._diskRead(parent.children[parent.numberActives]);
    } else {
        n1 = this._diskRead(parent.children[index]);
        n2 = this._diskRead(parent.children[index + 1]);
    }

    //Merge the current node with the left node
    var newNode = this._allocateNode();
    newNode.isLeaf = n1.isLeaf;
    newNode.level = n1.level;

    for (j = 0; j < this.order - 1; j++) {
        newNode.keys[j] = n1.keys[j];
        newNode.children[j] = n1.children[j];
    }

    newNode.keys[this.order - 1] = parent.keys[index];
    newNode.children[this.order - 1] = n1.children[this.order - 1];

    for (j = 0; j < this.order - 1; j++) {
        newNode.keys[j + this.order] = n2.keys[j];
        newNode.children[j + this.order] = n2.children[j];
    }
    newNode.children[2 * this.order - 1] = n2.children[this.order - 1];

    parent.children[index] = newNode;

    for (j = index; j < parent.numberActives; j++) {
        parent.keys[j] = parent.keys[j + 1];
        parent.children[j + 1] = parent.children[j + 2];
    }

    newNode.numberActives = n1.numberActives + n2.numberActives + 1;
    parent.numberActives--;

    for (i = parent.numberActives; i < 2 * this.order - 1; i++) {
        parent.keys[i] = null;
    }

    if (parent.numberActives === 0 && this.root === parent) {
        this.root = newNode;
        if (newNode.level) {
            newNode.isLeaf = false;
        } else {
            newNode.isLeaf = true;
        }
    }

    this._diskWrite(newNode);
    if (this.root === newNode) {
        this._updateRootNode(this.root);
    }
    this._diskWrite(parent);
    this._diskDelete(n1);
    this._diskDelete(n2);

    return newNode;
};

/**
 * _deleteKeyFromNode
 *
 * Deletes the key at position index from the provided node.
 *
 * @param node The node where the key will be deleted.
 * @param index The index of the key that will be deletd.
 * @return true if the key can be deleted, false otherwise
 */
InMemoryBTree.Tree.prototype._deleteKeyFromNode = function (node, index) {
    var keysMax = (2 * this.order) - 1;
    if (node.numberActives < keysMax) {
        keysMax = node.numberActives;
    }
    ;

    var i;

    if (node.isLeaf === false) {
        return false;
    }

    var key = node.keys[index];

    for (i = index; i < keysMax - 1; i++) {
        node.keys[i] = node.keys[i + 1];
    }

    // cleaning invalid reference
    node.keys.pop();

    node.numberActives--;

    this._diskWrite(node);

    return true;
};

InMemoryBTree.Tree.prototype._mergeNodes = function (n1, key, n2) {
    var newNode;
    var i;

    newNode = this._allocateNode();
    newNode.isLeaf = true;

    for (i = 0; i < n1.numberActives; i++) {
        newNode.keys[i] = n1.keys[i];
        newNode.children[i] = n1.children[i];
    }
    newNode.children[n1.numberActives] = n1.children[n1.numberActives];
    newNode.keys[n1.numberActives] = key;

    for (i = 0; i < n2.numberActives; i++) {
        newNode.keys[i + n1.numberActives + 1] = n2.keys[i];
        newNode.children[i + n1.numberActives + 1] = n2.children[i];
    }
    newNode.children[(2 * this.order) - 1] = n2.children[n2.numberActives];

    newNode.numberActives = n1.numberActives + n2.numberActives + 1;
    newNode.isLeaf = n1.isLeaf;
    newNode.level = n1.level;


    this._diskWrite(newNode);
    // @todo
    // delte old nodes from disk
    return newNode;
};

/**
 * audit
 *
 * Checks that the tree data structure is
 * valid.
 */
InMemoryBTree.Tree.prototype.audit = function (showOutput) {
    var errors = [];
    var alreadySeen = [];
    var that = this;

    var foundInArray = function (data) {
        for (var i = 0; i < alreadySeen.length; i++) {
            if (that.comparator(alreadySeen[i], data) === 0) {
                var error = " !!! duplicated key " + data;
                if (showOutput === true) {
                    console.log(error);
                }
                errors.push(error);
            }
        }
    };

    var length = null;
    var that = this;
    this.walkNodes(function (n) {
        if (showOutput === true) {
            console.log("--- Node at " + n.level + " level");
            console.log(" - leaf? " + n.isLeaf);
            console.log(" - num actives? " + n.numberActives);
            console.log(" - keys: ");
        }
        for (var i = n.numberActives; i < n.keys.length; i++) {
            if (n.keys[i] != null) {
                if (showOutput === true) {
                    console.log(" * warning : redundant key data");
                    errors.push(" * warning : redundant key data");
                }
            }
        }

        for (var i = n.numberActives + 1; i < n.children.length; i++) {
            if (n.children[i] != null) {
                if (showOutput === true) {
                    console.log(" * warning : redundant children data");
                    errors.push(" * warning : redundant key data");
                }
            }
        }


        if (n.isLeaf === false) {
            for (var i = 0; i < n.numberActives; i++) {
                var maxLeft = that._diskRead(n.children[i]).keys[that._diskRead(n.children[i]).numberActives - 1 ].key;
                var minRight = that._diskRead(n.children[i + 1]).keys[0].key;
                if (showOutput === true) {
                    console.log("   " + n.keys[i].key + "(" + maxLeft + "," + minRight + ")");
                }
                if (that.comparator(n.keys[i].key, maxLeft) === -1) {
                    var error = " !!! value max left " + maxLeft + " > key " + n.keys[i].key;
                    if (showOutput === true) {
                        console.log(error);
                    }
                    errors.push(error);
                }
                if (that.comparator(n.keys[i].key, minRight) === 1) {
                    var error = " !!! value min right " + minRight + " < key " + n.keys[i].key;
                    if (showOutput === true) {
                        console.log(error);
                    }
                    errors.push(error);
                }

                foundInArray(n.keys[i].key);
                alreadySeen.push(n.keys[i].key);
            }
        } else {
            if (length === null) {
                length = n.level;
            } else {
                if (length != n.level) {
                    var error = " !!! Leaf node with wrong level value";
                    if (showOutput === true) {
                        console.log(error);
                    }
                    errors.push(error);
                }
            }
            for (var i = 0; i < n.numberActives; i++) {
                if (showOutput === true) {
                    console.log(" " + n.keys[i].key);
                }
                foundInArray(n.keys[i].key);
                alreadySeen.push(n.keys[i].key);

            }
        }

        if (n != that.root) {
            if (n.numberActives > ((2 * that.order) - 1)) {
                if (showOutput === true) {
                    var error = " !!!! MAX num keys restriction violated ";
                }
                console.log(error);
                errors.push(error);
            }
            if (n.numberActives < (that.order - 1)) {
                if (showOutput === true) {
                    var error = " !!!! MIN num keys restriction violated ";
                }
                console.log(error);
                errors.push(error);
            }

        }
    });

    return errors;
};

/**
 *  _getMaxKeyPos
 *
 *  Used to get the position of the MAX key within the subtree
 *  @return An object containing the key and position of the key
 */
InMemoryBTree.Tree.prototype._getMaxKeyPos = function (node) {
    var node_pos = {};

    while (true) {
        if (node === null) {
            break;
        }

        if (node.isLeaf === true) {
            node_pos.node = node;
            node_pos.index = node.numberActives - 1;
            return node_pos;
        } else {
            node_pos.node = node;
            node_pos.index = node.numberActives - 1;
            node = this._diskRead(node.children[node.numberActives]);
        }
    }

    return node_pos;
};

/**
 *  _getMinKeyPos
 *
 *  Used to get the position of the MAX key within the subtree
 *  @return An object containing the key and position of the key
 */
InMemoryBTree.Tree.prototype._getMinKeyPos = function (node) {
    var node_pos = {};

    while (true) {
        if (node === null) {
            break;
        }

        if (node.isLeaf === true) {
            node_pos.node = node;
            node_pos.index = 0;
            return node_pos;
        } else {
            node_pos.node = node;
            node_pos.index = 0;
            node = this._diskRead(node.children[0]);
        }
    }

    return node_pos;
};


/**
 * Node
 *
 * Implements the interface of BinarySearchTree.Node
 *
 * A Tree node augmented with BTree
 * node structures
 */
InMemoryBTree.Node = function() {
    this.numberActives = 0;
    this.isLeaf = null;
    this.keys = [];
    this.children = [];
    this.level = 0;
};

// end of ./src/js-trees/src/in_memory_b_tree.js 
// exports
var QuadIndexCommon = {};

/**
 * NodeKey
 *
 * Implements the interface of BinarySearchTree.Node
 *
 * A Tree node augmented with BPlusTree
 * node structures
 */
QuadIndexCommon.NodeKey = function(components, order) {
    this.subject = components.subject;
    this.predicate = components.predicate;
    this.object = components.object;
    this.graph = components.graph;
    this.order = order;
};

QuadIndexCommon.NodeKey.prototype.comparator = function(keyPattern) {
    for(var i=0; i<this.order.length; i++) {
        var component = this.order[i];
        if(keyPattern[component] == null) {
            return 0;
        } else {
            if(this[component] < keyPattern[component] ) {
                return -1
            } else if(this[component] > keyPattern[component]) {
                return 1
            }
        }
    }

    return 0;
};

/**
 * Pattern
 *
 * A pattern with some variable components
 */
QuadIndexCommon.Pattern = function (components) {
    this.subject = components.subject;
    this.predicate = components.predicate;
    this.object = components.object;
    this.graph = components.graph;
    this.indexKey = [];

    this.keyComponents = {};

    var order = [];
    var indif = [];
    var components = ['subject', 'predicate', 'object', 'graph'];

    // components must have been already normalized and
    // inserted in the lexicon.
    // OIDs retrieved from the lexicon *are* numbers so
    // they can be told apart from variables (strings)
    for (var i = 0; i < components.length; i++) {
        if (typeof(this[components[i]]) === 'string') {
            indif.push(components[i]);
            this.keyComponents[components[i]] = null;
        } else {
            order.push(components[i]);
            this.keyComponents[components[i]] = this[components[i]];
            this.indexKey.push(components[i]);
        }
    }

    this.order = order.concat(indif);
    this.key = new QuadIndexCommon.NodeKey(this.keyComponents, this.order);
};

// end of ./src/js-rdf-persistence/src/quad_index_common.js 
// exports
var QuadIndex = {};

// imports
var BaseTree = InMemoryBTree;

QuadIndex.Tree = function(params,callback) {
    if(arguments != 0) {
        this.componentOrder = params.componentOrder;


        // @todo change this if using the file backed implementation
        BaseTree.Tree.call(this, params.order, params['name'], params['persistent'], params['cacheMaxSize']);

        this.comparator = function (a, b) {
            for (var i = 0; i < this.componentOrder.length; i++) {
                var component = this.componentOrder[i];
                var vala = a[component];
                var valb = b[component];
                if (vala < valb) {
                    return -1;
                } else if (vala > valb) {
                    return 1;
                }
            }
            return 0;
        };

        this.rangeComparator = function (a, b) {
            for (var i = 0; i < this.componentOrder.length; i++) {
                var component = this.componentOrder[i];
                if (b[component] == null || a[component] == null) {
                    return 0;
                } else {
                    if (a[component] < b[component]) {
                        return -1
                    } else if (a[component] > b[component]) {
                        return 1
                    }
                }
            }

            return 0;
        };

        if(callback!=null) {
            callback(this);
        }
    }
};

Utils['extends'](BaseTree.Tree, QuadIndex.Tree);

QuadIndex.Tree.prototype.insert = function(quad, callback) {
    BaseTree.Tree.prototype.insert.call(this, quad, null);
    if(callback)
        callback(true);

    return true
};

QuadIndex.Tree.prototype.search = function(quad, callback) {
    var result = BaseTree.Tree.prototype.search.call(this, quad, true); // true -> check exists : not present in all the b-tree implementations, check first.
    if(callback)
        callback(result);

    return result;
};

QuadIndex.Tree.prototype.range = function (pattern, callback) {
    var result = null;
    if (typeof(this.root) === 'string') {
        result = this._rangeTraverse(this, this._diskRead(this.root), pattern);
    } else {
        result = this._rangeTraverse(this, this.root, pattern);
    }

    if (callback)
        callback(result);

    return result;
};

QuadIndex.Tree.prototype._rangeTraverse = function(tree,node, pattern) {
    var patternKey  = pattern.key;
    var acum = [];
    var pendingNodes = [node];
    var node, idxMin, idxMax;
    while(pendingNodes.length > 0) {
        node = pendingNodes.shift();
        idxMin = 0;

        while(idxMin < node.numberActives && tree.rangeComparator(node.keys[idxMin].key,patternKey) === -1) {
            idxMin++;
        }
        if(node.isLeaf === true) {
            idxMax = idxMin;

            while(idxMax < node.numberActives && tree.rangeComparator(node.keys[idxMax].key,patternKey) === 0) {
                acum.push(node.keys[idxMax].key);
                idxMax++;
            }

        } else {
            var pointer = node.children[idxMin];
            var childNode = tree._diskRead(pointer);
            pendingNodes.push(childNode);

            var idxMax = idxMin;
            while(true) {
                if(idxMax < node.numberActives && tree.rangeComparator(node.keys[idxMax].key,patternKey) === 0) {
                    acum.push(node.keys[idxMax].key);
                    idxMax++;
                    childNode = tree._diskRead(node.children[idxMax]);
                    pendingNodes.push(childNode);
                } else {
                    break;
                }
            }
        }
    }
    return acum;
};

// end of ./src/js-rdf-persistence/src/quad_index.js 
// exports
var QuadBackend = {};


// imports


/*
 * "perfect" indices for RDF indexing
 *
 * SPOG (?, ?, ?, ?), (s, ?, ?, ?), (s, p, ?, ?), (s, p, o, ?), (s, p, o, g)
 * GP   (?, ?, ?, g), (?, p, ?, g)
 * OGS  (?, ?, o, ?), (?, ?, o, g), (s, ?, o, g)
 * POG  (?, p, ?, ?), (?, p, o, ?), (?, p, o, g)
 * GSP  (s, ?, ?, g), (s, p, ?, g)
 * OS   (s, ?, o, ?)
 */
QuadBackend.QuadBackend = function (configuration, callback) {
    if (arguments != 0) {
        this.indexMap = {};
        this.treeOrder = configuration['treeOrder'];
        this.indices = ['SPOG', 'GP', 'OGS', 'POG', 'GSP', 'OS'];
        this.componentOrders = {
            SPOG:['subject', 'predicate', 'object', 'graph'],
            GP:['graph', 'predicate', 'subject', 'object'],
            OGS:['object', 'graph', 'subject', 'predicate'],
            POG:['predicate', 'object', 'graph', 'subject'],
            GSP:['graph', 'subject', 'predicate', 'object'],
            OS:['object', 'subject', 'predicate', 'graph']
        };

        for (var i = 0; i < this.indices.length; i++) {
            var indexKey = this.indices[i];
            this.indexMap[indexKey] = new QuadIndex.Tree({order:this.treeOrder,
                componentOrder:this.componentOrders[indexKey],
                persistent:configuration['persistent'],
                name:(configuration['name'] || "") + indexKey,
                cacheMaxSize:configuration['cacheMaxSize']});
        }

        if (callback)
            callback(this);
    }
};

QuadBackend.QuadBackend.prototype.clear = function() {
        for(var i=0; i<this.indices.length; i++) {
            var indexKey = this.indices[i];
            this.indexMap[indexKey].clear();
        }
};

QuadBackend.QuadBackend.prototype._indexForPattern = function (pattern) {
    var indexKey = pattern.indexKey;
    var matchingIndices = this.indices;

    for (var i = 0; i < matchingIndices.length; i++) {
        var index = matchingIndices[i];
        var indexComponents = this.componentOrders[index];
        for (var j = 0; j < indexComponents.length; j++) {
            if (Utils.include(indexKey, indexComponents[j]) === false) {
                break;
            }
            if (j == indexKey.length - 1) {
                return index;
            }
        }
    }

    return 'SPOG'; // If no other match, we erturn the more generic index
};


QuadBackend.QuadBackend.prototype.index = function (quad, callback) {
    for (var i = 0; i < this.indices.length; i++) {
        var indexKey = this.indices[i];
        var index = this.indexMap[indexKey];

        index.insert(quad);
    }

    if (callback)
        callback(true);

    return true;
};

QuadBackend.QuadBackend.prototype.range = function (pattern, callback) {
    var indexKey = this._indexForPattern(pattern);
    var index = this.indexMap[indexKey];
    var quads = index.range(pattern);
    if (callback)
        callback(quads);

    return quads;
};

QuadBackend.QuadBackend.prototype.search = function (quad, callback) {
    var indexKey = this.indices[0];
    var index = this.indexMap[indexKey];
    var result = index.search(quad);

    if (callback)
        callback(result != null);

    return (result != null)
};


QuadBackend.QuadBackend.prototype['delete'] = function (quad, callback) {
    var indexKey, index;
    for (var i = 0; i < this.indices.length; i++) {
        indexKey = this.indices[i];
        index = this.indexMap[indexKey];

        index['delete'](quad);
    }

    if (callback)
        callback(true);

    return true;
};

// end of ./src/js-rdf-persistence/src/quad_backend.js 
// exports
var Lexicon = {};

// imports

/**
 * Temporal implementation of the lexicon
 */


Lexicon.Lexicon = function(callback){
    this.uriToOID = {};
    this.OIDToUri = {};

    this.literalToOID = {};
    this.OIDToLiteral = {};

    this.blankToOID = {};
    this.OIDToBlank = {};

    this.defaultGraphOid = 0;

    this.defaultGraphUri = "https://github.com/antoniogarrote/rdfstore-js#default_graph";
    this.defaultGraphUriTerm = {"token": "uri", "prefix": null, "suffix": null, "value": this.defaultGraphUri, "oid": this.defaultGraphOid};
    this.oidCounter = 1;

    this.knownGraphs = {};
    
    if(callback != null) {
        callback(this);
    }
};

Lexicon.Lexicon.prototype.registerGraph = function(oid){
    if(oid != this.defaultGraphOid) {
        this.knownGraphs[oid] = true;
    }
    return true
};

Lexicon.Lexicon.prototype.registeredGraphs = function(shouldReturnUris) {
    var acum = [];

    for(var g in this.knownGraphs) {
        if(shouldReturnUris === true) {
            acum.push(this.OIDToUri['u'+g]);
        } else {
            acum.push(g);
        }
    }
    return acum;
};

Lexicon.Lexicon.prototype.registerUri = function(uri) {
    if(uri === this.defaultGraphUri) {
        return(this.defaultGraphOid);
    } else if(this.uriToOID[uri] == null){
        var oid = this.oidCounter;
        var oidStr = 'u'+oid;
        this.oidCounter++;

        this.uriToOID[uri] =[oid, 0];
        this.OIDToUri[oidStr] = uri;

        return(oid);
    } else {
        var oidCounter = this.uriToOID[uri];
        var oid = oidCounter[0];
        var counter = oidCounter[1] + 1;
        this.uriToOID[uri] = [oid, counter];
        return(oid);
    }
};

Lexicon.Lexicon.prototype.resolveUri = function(uri) {
    if(uri === this.defaultGraphUri) {
        return(this.defaultGraphOid);
    } else {
        var oidCounter = this.uriToOID[uri];
        if(oidCounter != null) {
            return(oidCounter[0]);
        } else {
            return(-1);
        }
    }
};

Lexicon.Lexicon.prototype.resolveUriCost = function(uri) {
    if(uri === this.defaultGraphUri) {
        return(this.defaultGraphOid);
    } else {
        var oidCounter = this.uriToOID[uri];
        if(oidCounter != null) {
            return(oidCounter[1]);
        } else {
            return(-1);
        }
    }
};

Lexicon.Lexicon.prototype.registerBlank = function(label) {
    var oid = this.oidCounter;
    this.oidCounter++;
    var oidStr = ""+oid;
    this.OIDToBlank[oidStr] = true;
    return(oidStr);
};

Lexicon.Lexicon.prototype.resolveBlank = function(label) {
//    @todo
//    this is failing with unicode tests... e.g. kanji2

//    var id = label.split(":")[1];
//    callback(id);

    var oid = this.oidCounter;
    this.oidCounter++;
    return(""+oid);
};

Lexicon.Lexicon.prototype.resolveBlankCost = function(label) {
    return 0;
};

Lexicon.Lexicon.prototype.registerLiteral = function(literal) {
    if(this.literalToOID[literal] == null){
        var oid = this.oidCounter;
        var oidStr =  'l'+ oid;
        this.oidCounter++;

        this.literalToOID[literal] = [oid, 0];
        this.OIDToLiteral[oidStr] = literal;

        return(oid);
    } else {
        var oidCounter = this.literalToOID[literal];
        var oid = oidCounter[0];
        var counter = oidCounter[1] + 1;
        this.literalToOID[literal] = [oid, counter];
        return(oid);
    }
};

Lexicon.Lexicon.prototype.resolveLiteral = function (literal) {
    var oidCounter = this.literalToOID[literal];
    if (oidCounter != null) {
        return(oidCounter[0]);
    } else {
        return(-1);
    }
};

Lexicon.Lexicon.prototype.resolveLiteralCost = function (literal) {
    var oidCounter = this.literalToOID[literal];
    if (oidCounter != null) {
        return(oidCounter[1]);
    } else {
        return(0);
    }
};


Lexicon.Lexicon.prototype.parseLiteral = function(literalString) {
    var parts = literalString.lastIndexOf("@");
    if(parts!=-1 && literalString[parts-1]==='"' && literalString.substring(parts, literalString.length).match(/^@[a-zA-Z\-]+$/g)!=null) {
        var value = literalString.substring(1,parts-1);
        var lang = literalString.substring(parts+1, literalString.length);
        return {token: "literal", value:value, lang:lang};
    }

    parts = literalString.lastIndexOf("^^");
    if(parts!=-1 && literalString[parts-1]==='"' && literalString[parts+2] === '<' && literalString[literalString.length-1] === '>') {
        var value = literalString.substring(1,parts-1);
        var type = literalString.substring(parts+3, literalString.length-1);

        return {token: "literal", value:value, type:type};
    }

    var value = literalString;
    if(literalString[0]==="\"" && literalString[literalString.length-1] === "\"") {
	value = literalString.substring(1,literalString.length-1);	
    }

    return {token:"literal", value:value};
};

Lexicon.Lexicon.prototype.parseUri = function(uriString) {
    return {token: "uri", value:uriString};
};

Lexicon.Lexicon.prototype.retrieve = function(oid) {
    try {
        if(oid === this.defaultGraphOid) {
            return({ token: "uri", 
                       value:this.defaultGraphUri,
                       prefix: null,
                       suffix: null,
                       defaultGraph: true });
        } else {
          var maybeUri = this.OIDToUri['u'+oid];
          if(maybeUri != null) {
              return(this.parseUri(maybeUri));
          } else {
              var maybeLiteral = this.OIDToLiteral['l'+oid];
              if(maybeLiteral != null) {
                  return(this.parseLiteral(maybeLiteral));
              } else {
                  var maybeBlank = this.OIDToBlank[""+oid];
                  if(maybeBlank != null) {
                      return({token:"blank", value:"_:"+oid});
                  } else {
                      throw("Null value for OID");
                  }
              }
          }
        }
    } catch(e) {
        console.log("error in lexicon retrieving OID:");
        console.log(oid);
        if(e.message || e.stack) {
            if(e.message) {
                console.log(e.message); 
            }
            if(e.stack) {
                console.log(e.stack);
            }
        } else {
            console.log(e);
        }
        throw new Error("Unknown retrieving OID in lexicon:"+oid);

    }
};

Lexicon.Lexicon.prototype.clear = function() {
    this.uriToOID = {};
    this.OIDToUri = {};

    this.literalToOID = {};
    this.OIDToLiteral = {};

    this.blankToOID = {};
    this.OIDToBlank = {};
};

Lexicon.Lexicon.prototype.unregister = function (quad, key) {
    try {
        this.unregisterTerm(quad.subject.token, key.subject);
        this.unregisterTerm(quad.predicate.token, key.predicate);
        this.unregisterTerm(quad.object.token, key.object);
        if (quad.graph != null) {
            this.unregisterTerm(quad.graph.token, key.graph);
        }
        return(true);
    } catch (e) {
        console.log("Error unregistering quad");
        console.log(e.message);
        return(false);
    }
};

Lexicon.Lexicon.prototype.unregisterTerm = function (kind, oid) {
    if (kind === 'uri') {
        if (oid != this.defaultGraphOid) {
            var oidStr = 'u' + oid;
            var uri = this.OIDToUri[oidStr];     // = uri;
            var oidCounter = this.uriToOID[uri]; // =[oid, 0];

            var counter = oidCounter[1];
            if ("" + oidCounter[0] === "" + oid) {
                if (counter === 0) {
                    delete this.OIDToUri[oidStr];
                    delete this.uriToOID[uri];
                    // delete the graph oid from known graphs
                    // in case this URI is a graph identifier
                    delete this.knownGraphs[oid];
                } else {
                    this.uriToOID[uri] = [oid, counter - 1];
                }
            } else {
                throw("Not matching OID : " + oid + " vs " + oidCounter[0]);
            }
        }
    } else if (kind === 'literal') {
        this.oidCounter++;
        var oidStr = 'l' + oid;
        var literal = this.OIDToLiteral[oidStr];  // = literal;
        var oidCounter = this.literalToOID[literal]; // = [oid, 0];

        var counter = oidCounter[1];
        if ("" + oidCounter[0] === "" + oid) {
            if (counter === 0) {
                delete this.OIDToLiteral[oidStr];
                delete this.literalToOID[literal];
            } else {
                this.literalToOID[literal] = [oid, counter - 1];
            }
        } else {
            throw("Not matching OID : " + oid + " vs " + oidCounter[0]);
        }

    } else if (kind === 'blank') {
        delete this.OIDToBlank["" + oid];
    }
};

// end of ./src/js-rdf-persistence/src/lexicon.js 
// exports
var NetworkTransport = {};

NetworkTransport.load = function (uri, accept, callback, redirect) {
    var transport = jQuery;

    transport.ajax({
        url:uri,
        headers:{"Accept":accept},

        success:function (data, status, xhr) {
            if (("" + xhr.status)[0] == '2') {
                var headers = xhr.getAllResponseHeaders().split("\n");
                var acum = {};
                for (var i = 0; i < headers.length; i++) {
                    var header = headers[i].split(":");
                    acum[header[0]] = header[1];
                }

                callback(true, {headers:acum,
                    data:data});
            }
        },

        error:function (xhr, textStatus, ex) {
            if (("" + xhr.status)[0] == '3') {
                if (redirection == 0) {
                    callback(false, 500);
                } else {
                    var location = (xhr.getAllResponseHeaders()["Location"] || xhr.getAllResponseHeaders()["location"]);
                    if (location != null) {
                        NetworkTransport.load(location, accept, callback, (redirection - 1));
                    } else {
                        callback(false, 500);
                    }
                }
            } else {
                callback(false, xhr.statusCode());
            }
        }
    });
};

// end of ./src/js-communication/src/ajax_transport.js 
// exports
var AbstractQueryTree = {};

// imports

/**
 * @doc
 *
 * Based on <http://www.w3.org/2001/sw/DataAccess/rq23/rq24-algebra.html>
 * W3C's note
 */
AbstractQueryTree.AbstractQueryTree = function() {
};

AbstractQueryTree.AbstractQueryTree.prototype.parseQueryString = function(query_string) {
    //noinspection UnnecessaryLocalVariableJS,UnnecessaryLocalVariableJS
    return SparqlParser.parser.parse(query_string);
};

AbstractQueryTree.AbstractQueryTree.prototype.parseExecutableUnit = function(executableUnit) {
    if(executableUnit.kind === 'select') {
        return this.parseSelect(executableUnit);
    } else if(executableUnit.kind === 'ask') {
        return this.parseSelect(executableUnit);        
    } else if(executableUnit.kind === 'modify') {
        return this.parseSelect(executableUnit);
    } else if(executableUnit.kind === 'construct') {
        return this.parseSelect(executableUnit);        
    } else if(executableUnit.kind === 'insertdata') {
        return this.parseInsertData(executableUnit);        
    } else if(executableUnit.kind === 'deletedata') {
        return this.parseInsertData(executableUnit);        
    } else if(executableUnit.kind === 'load') {
        return executableUnit;
    } else if(executableUnit.kind === 'clear') {
        return executableUnit;
    } else if(executableUnit.kind === 'drop') {
        return executableUnit;
    } else if(executableUnit.kind === 'create') {
        return executableUnit;
    } else {
        throw new Error('unknown executable unit: ' + executableUnit.kind);
    }
};

AbstractQueryTree.AbstractQueryTree.prototype.parseSelect = function(syntaxTree){

    if(syntaxTree == null) {
        console.log("error parsing query");
        return null;
    } else {
        var env = { freshCounter: 0 };
        syntaxTree.pattern = this.build(syntaxTree.pattern, env);
        return syntaxTree;
    }
};

AbstractQueryTree.AbstractQueryTree.prototype.parseInsertData = function(syntaxTree){
    if(syntaxTree == null) {
        console.log("error parsing query");
        return null;
    } else {
        return syntaxTree;
    }
};

AbstractQueryTree.AbstractQueryTree.prototype.build = function(node, env) {
    if(node.token === 'groupgraphpattern') {
        return this._buildGroupGraphPattern(node, env);
    } else if (node.token === 'basicgraphpattern') {
        var bgp = { kind: 'BGP',
                    value: node.triplesContext };
	//console.log("pre1");
	bgp = AbstractQueryTree.translatePathExpressionsInBGP(bgp, env);
	//console.log("translation");
	//console.log(sys.inspect(bgp,true,20));	
	return bgp;
    } else if (node.token === 'graphunionpattern') {
        var a = this.build(node.value[0],env);
        var b = this.build(node.value[1],env);

        return { kind: 'UNION',
                 value: [a,b] };
    } else if(node.token === 'graphgraphpattern') {
        var c = this.build(node.value, env);
        return { kind: 'GRAPH',
                 value: c,
                 graph: node.graph };
    } else {
        throw new Error("not supported token in query:"+node.token);
    }
};

AbstractQueryTree.translatePathExpressionsInBGP = function(bgp, env) {
    var pathExpression;
    var before = [], rest, bottomJoin;
    for(var i=0; i<bgp.value.length; i++) {
	if(bgp.value[i].predicate && bgp.value[i].predicate.token === 'path') {
	    //console.log("FOUND A PATH");
	    pathExpression = bgp.value[i];
	    rest = bgp.value.slice(i+1);
	    var bgpTransformed = AbstractQueryTree.translatePathExpression(pathExpression, env);
	    var optionalPattern = null;
	    //console.log("BACK FROM TRANSFORMED");
	    if(bgpTransformed.kind === 'BGP') {
		before = before.concat(bgpTransformed.value);
	    } else if(bgpTransformed.kind === 'ZERO_OR_MORE_PATH' || bgpTransformed.kind === 'ONE_OR_MORE_PATH'){
		//console.log("BEFORE");
		//console.log(bgpTransformed);
		    

		if(before.length > 0) {
		    bottomJoin =  {kind: 'JOIN',
				   lvalue: {kind: 'BGP', value:before},
				   rvalue: bgpTransformed};
		} else {
		    bottomJoin = bgpTransformed;
		}

		
		if(bgpTransformed.kind === 'ZERO_OR_MORE_PATH') {
		    if(bgpTransformed.y.token === 'var' && bgpTransformed.y.value.indexOf("fresh:")===0 &&
		       bgpTransformed.x.token === 'var' && bgpTransformed.x.value.indexOf("fresh:")===0) {
			//console.log("ADDING EXTRA PATTERN 1)");
			for(var j=0; j<bgp.value.length; j++) {
		   	    //console.log(bgp.value[j]);
		   	    if(bgp.value[j].object && bgp.value[j].object.token === 'var' && bgp.value[j].object.value === bgpTransformed.x.value) {
		   		//console.log(" YES 1)");
		   		optionalPattern = Utils.clone(bgp.value[j]);
		   		optionalPattern.object = bgpTransformed.y;
		   	    }
			}
		    } else if(bgpTransformed.y.token === 'var' && bgpTransformed.y.value.indexOf("fresh:")===0) {
			//console.log("ADDING EXTRA PATTERN 2)");
			for(var j=0; j<bgp.value.length; j++) {
		   	    //console.log(bgp.value[j]);
		   	    if(bgp.value[j].subject && bgp.value[j].subject.token === 'var' && bgp.value[j].subject.value === bgpTransformed.y.value) {
		   		//console.log(" YES 2)");
		   		optionalPattern = Utils.clone(bgp.value[j]);
		   		optionalPattern.subject = bgpTransformed.x;
		   	    }
			}
		    }
		}

		if(rest.length >0) {
		    //console.log("(2a)")
		    var rvalueJoin = AbstractQueryTree.translatePathExpressionsInBGP({kind: 'BGP', value: rest}, env);
		    //console.log("got rvalue");
		    if(optionalPattern != null) {
			var optionals = before.concat([optionalPattern]).concat(rest);
			return { kind: 'UNION',
				 value: [{ kind: 'JOIN',
					   lvalue: bottomJoin,
					   rvalue: rvalueJoin },
					 {kind: 'BGP',
					  value: optionals}] };
		    } else {
			return { kind: 'JOIN',
				 lvalue: bottomJoin,
				 rvalue: rvalueJoin };
		    }
		} else {
		    //console.log("(2b)")
		    return bottomJoin;
		}

	    } else {
		// @todo ????
		return bgpTransformed;
	    }
	} else {
	    before.push(bgp.value[i]);
	}
    }

    //console.log("returning");
    bgp.value = before;
    return bgp;
};


AbstractQueryTree.translatePathExpression  = function(pathExpression, env) {
    // add support for different path patterns
    if(pathExpression.predicate.kind === 'element') {
	// simple paths, maybe modified
	if(pathExpression.predicate.modifier === '+') {
	    pathExpression.predicate.modifier = null;
	    var expandedPath = AbstractQueryTree.translatePathExpression(pathExpression, env);
	    return {kind: 'ONE_OR_MORE_PATH',
		    path: expandedPath,
		    x: pathExpression.subject,
		    y: pathExpression.object};
	} else if(pathExpression.predicate.modifier === '*') {
	    pathExpression.predicate.modifier = null;
	    var expandedPath = AbstractQueryTree.translatePathExpression(pathExpression, env);
	    return {kind: 'ZERO_OR_MORE_PATH',
	     	    path: expandedPath,
                    x: pathExpression.subject,
		    y: pathExpression.object};
	} else {
	    pathExpression.predicate = pathExpression.predicate.value;
	    return {kind: 'BGP', value: [pathExpression]};
	}
    } else if(pathExpression.predicate.kind === 'sequence') {
	var currentSubject = pathExpression.subject;
	var lastObject = pathExpression.object;
	var currentGraph = pathExpression.graph;
	var nextObject, chain;
	var restTriples = [];
	for(var i=0; i< pathExpression.predicate.value.length; i++) {
	    if(i!=pathExpression.predicate.value.length-1) {
		nextObject = {
		    token: "var",
		    value: "fresh:"+env.freshCounter
		};
		env.freshCounter++;
	    } else {
		nextObject = lastObject;
	    }

	    // @todo
	    // what if the predicate is a path with
	    // '*'? same fresh va in subject and object??
	    chain = {
		subject: currentSubject,
		predicate: pathExpression.predicate.value[i],
		object: nextObject
	    };
	
	    if(currentGraph != null)
		chain.graph = Utils.clone(currentGraph);
	    
	    restTriples.push(chain);

	    if(i!=pathExpression.predicate.value.length-1)
		currentSubject = Utils.clone(nextObject);;
	}
	var bgp = {kind: 'BGP', value: restTriples};
	//console.log("BEFORE (1):");
	//console.log(bgp);
	//console.log("--------------");
	return AbstractQueryTree.translatePathExpressionsInBGP(bgp, env);
    }
};

AbstractQueryTree.AbstractQueryTree.prototype._buildGroupGraphPattern = function(node, env) {
    var f = (node.filters || []);
    var g = {kind: "EMPTY_PATTERN"};

    for(var i=0; i<node.patterns.length; i++) {
        var pattern = node.patterns[i];
        if(pattern.token === 'optionalgraphpattern') {
            var parsedPattern = this.build(pattern.value,env);
            if(parsedPattern.kind === 'FILTER') {
                g =  { kind:'LEFT_JOIN',
                       lvalue: g,
                       rvalue: parsedPattern.value,
                       filter: parsedPattern.filter };
            } else {
                g = { kind:'LEFT_JOIN',
                      lvalue: g,
                      rvalue: parsedPattern,
                      filter: true };
            }
        } else {
            var parsedPattern = this.build(pattern,env);
            if(g.kind == "EMPTY_PATTERN") {
                g = parsedPattern;
            } else {
                g = { kind: 'JOIN',
                      lvalue: g,
                      rvalue: parsedPattern };
            }
        }
    }

    if(f.length != 0) {
        if(g.kind === 'EMPTY_PATTERN') {
            return { kind: 'FILTER',
                     filter: f,
                     value: g};
        } else if(g.kind === 'LEFT_JOIN' && g.filter === true) {
            return { kind: 'FILTER',
                     filter: f,
                     value: g};

//            g.filter = f;
//            return g;
        } else if(g.kind === 'LEFT_JOIN') {
            return { kind: 'FILTER',
                     filter: f,
                     value: g};
        } else if(g.kind === 'JOIN') {
            return { kind: 'FILTER',
                     filter: f,
                     value: g};
        } else if(g.kind === 'UNION') {
            return { kind: 'FILTER',
                     filter: f,
                     value: g};
        } else if(g.kind === 'GRAPH') {
            return { kind: 'FILTER',
                     filter: f,
                     value: g};
        } else if(g.kind === 'BGP') {
            return { kind: 'FILTER',
                     filter: f,
                     value: g};
        } else {
            throw new Error("Unknow kind of algebra expression: "+ g.kind);
        }
    } else {
        return g;
    }
};

/**
 * Collects basic triple pattern in a complex SPARQL AQT
 */
AbstractQueryTree.AbstractQueryTree.prototype.collectBasicTriples = function(aqt, acum) {
    if(acum == null) {
        acum = [];
    }

    if(aqt.kind === 'select') {
        acum = this.collectBasicTriples(aqt.pattern,acum);
    } else if(aqt.kind === 'BGP') {
        acum = acum.concat(aqt.value);
    } else if(aqt.kind === 'ZERO_OR_MORE_PATH') {
	acum = this.collectBasicTriples(aqt.path);
    } else if(aqt.kind === 'UNION') {
        acum = this.collectBasicTriples(aqt.value[0],acum);
        acum = this.collectBasicTriples(aqt.value[1],acum);
    } else if(aqt.kind === 'GRAPH') {
        acum = this.collectBasicTriples(aqt.value,acum);
    } else if(aqt.kind === 'LEFT_JOIN' || aqt.kind === 'JOIN') {
        acum = this.collectBasicTriples(aqt.lvalue, acum);
        acum = this.collectBasicTriples(aqt.rvalue, acum);
    } else if(aqt.kind === 'FILTER') {
        acum = this.collectBasicTriples(aqt.value, acum);
    } else if(aqt.kind === 'construct') {
        acum = this.collectBasicTriples(aqt.pattern,acum);
    } else if(aqt.kind === 'EMPTY_PATTERN') {
        // nothing
    } else {
        throw "Unknown pattern: "+aqt.kind;
    }

    return acum;
};

/**
 * Replaces bindings in an AQT
 */
AbstractQueryTree.AbstractQueryTree.prototype.bind = function(aqt, bindings) {
    if(aqt.graph != null && aqt.graph.token && aqt.graph.token === 'var' &&
       bindings[aqt.graph.value] != null) {
        aqt.graph = bindings[aqt.graph.value];
    }
    if(aqt.filter != null) {
        var acum = [];
        for(var i=0; i< aqt.filter.length; i++) {
            aqt.filter[i].value = this._bindFilter(aqt.filter[i].value, bindings);
            acum.push(aqt.filter[i]);
        }
        aqt.filter = acum;
    }
    if(aqt.kind === 'select') {
        aqt.pattern = this.bind(aqt.pattern, bindings);
        //acum = this.collectBasicTriples(aqt.pattern,acum);
    } else if(aqt.kind === 'BGP') {
        aqt.value = this._bindTripleContext(aqt.value, bindings);
        //acum = acum.concat(aqt.value);
    } else if(aqt.kind === 'ZERO_OR_MORE_PATH') {
        aqt.path = this._bindTripleContext(aqt.path, bindings);
	if(aqt.x && aqt.x.token === 'var' && bindings[aqt.x.value] != null) {
	    aqt.x = bindings[aqt.x.value];
	}
	if(aqt.y && aqt.y.token === 'var' && bindings[aqt.y.value] != null) {
	    aqt.y = bindings[aqt.y.value];
	}
    } else if(aqt.kind === 'UNION') {
        aqt.value[0] = this.bind(aqt.value[0],bindings);
        aqt.value[1] = this.bind(aqt.value[1],bindings);
    } else if(aqt.kind === 'GRAPH') {
        aqt.value = this.bind(aqt.value,bindings);
    } else if(aqt.kind === 'LEFT_JOIN' || aqt.kind === 'JOIN') {
        aqt.lvalue = this.bind(aqt.lvalue, bindings);
        aqt.rvalue = this.bind(aqt.rvalue, bindings);
    } else if(aqt.kind === 'FILTER') {
	aqt.filter = this._bindFilter(aqt.filter[i].value, bindings);
    } else if(aqt.kind === 'EMPTY_PATTERN') {
        // nothing
    } else {
        throw "Unknown pattern: "+aqt.kind;
    }

    return aqt;
};

AbstractQueryTree.AbstractQueryTree.prototype._bindTripleContext = function(triples, bindings) {
    for(var i=0; i<triples.length; i++) {
        delete triples[i]['graph'];
        delete triples[i]['variables'];
        for(var p in triples[i]) {
            var comp = triples[i][p];
            if(comp.token === 'var' && bindings[comp.value] != null) {
                triples[i][p] = bindings[comp.value];
            }
        }
    }

    return triples;
};


AbstractQueryTree.AbstractQueryTree.prototype._bindFilter = function(filterExpr, bindings) {
    if(filterExpr.expressionType != null) {
        var expressionType = filterExpr.expressionType;
        if(expressionType == 'relationalexpression') {
            filterExpr.op1 = this._bindFilter(filterExpr.op1, bindings);
            filterExpr.op2 = this._bindFilter(filterExpr.op2, bindings);
        } else if(expressionType == 'conditionalor' || expressionType == 'conditionaland') {
            for(var i=0; i< filterExpr.operands.length; i++) {
                filterExpr.operands[i] = this._bindFilter(filterExpr.operands[i], bindings);
            }
        } else if(expressionType == 'additiveexpression') {
            filterExpr.summand = this._bindFilter(filterExpr.summand, bindings);
            for(var i=0; i<filterExpr.summands.length; i++) {
                filterExpr.summands[i].expression = this._bindFilter(filterExpr.summands[i].expression, bindings);            
            }
        } else if(expressionType == 'builtincall') {
            for(var i=0; i<filterExpr.args.length; i++) {
                filterExpr.args[i] = this._bindFilter(filterExpr.args[i], bindings);
            }
        } else if(expressionType == 'multiplicativeexpression') {
            filterExpr.factor = this._bindFilter(filterExpr.factor, bindings);
            for(var i=0; i<filterExpr.factors.length; i++) {
                filterExpr.factors[i].expression = this._bindFilter(filterExpr.factors[i].expression, bindings);            
            }
        } else if(expressionType == 'unaryexpression') {
            filterExpr.expression = this._bindFilter(filterExpr.expression, bindings);
        } else if(expressionType == 'irireforfunction') {
            for(var i=0; i<filterExpr.factors.args; i++) {
                filterExpr.args[i] = this._bindFilter(filterExpr.args[i], bindings);            
            }
        } else if(expressionType == 'atomic') {        
            if(filterExpr.primaryexpression == 'var') {
                // lookup the var in the bindings
                if(bindings[filterExpr.value.value] != null) {
                    var val = bindings[filterExpr.value.value];
                    if(val.token === 'uri') {
                        filterExpr.primaryexpression = 'iri';
                    } else {
                        filterExpr.primaryexpression = 'literal';
                    }
                    filterExpr.value = val;
                }
            }
        }
    }

    return filterExpr;
};

/**
 * Replaces terms in an AQT
 */
AbstractQueryTree.AbstractQueryTree.prototype.replace = function(aqt, from, to, ns) {
    if(aqt.graph != null && aqt.graph.token && aqt.graph.token === from.token && 
       aqt.graph.value == from.value) {
        aqt.graph = Utils.clone(to);
    }
    if(aqt.filter != null) {
        var acum = [];
        for(var i=0; i< aqt.filter.length; i++) {
            aqt.filter[i].value = this._replaceFilter(aqt.filter[i].value, from, to, ns);
            acum.push(aqt.filter[i]);
        }
        aqt.filter = acum;
    }
    if(aqt.kind === 'select') {
        aqt.pattern = this.replace(aqt.pattern, from, to, ns);
    } else if(aqt.kind === 'BGP') {
        aqt.value = this._replaceTripleContext(aqt.value, from, to, ns);
    } else if(aqt.kind === 'ZERO_OR_MORE_PATH') {
        aqt.path = this._replaceTripleContext(aqt.path, from,to, ns);
	if(aqt.x && aqt.x.token === from.token && aqt.value === from.value) {
	    aqt.x = Utils.clone(to);
	}
	if(aqt.y && aqt.y.token === from.token && aqt.value === from.value) {
	    aqt.y = Utils.clone(to);
	}
    } else if(aqt.kind === 'UNION') {
        aqt.value[0] = this.replace(aqt.value[0],from,to, ns);
        aqt.value[1] = this.replace(aqt.value[1],from,to, ns);
    } else if(aqt.kind === 'GRAPH') {
        aqt.value = this.replace(aqt.value,from,to);
    } else if(aqt.kind === 'LEFT_JOIN' || aqt.kind === 'JOIN') {
        aqt.lvalue = this.replace(aqt.lvalue, from, to, ns);
        aqt.rvalue = this.replace(aqt.rvalue, from, to, ns);
    } else if(aqt.kind === 'FILTER') {
        aqt.value = this._replaceFilter(aqt.value, from,to, ns);
    } else if(aqt.kind === 'EMPTY_PATTERN') {
        // nothing
    } else {
        throw "Unknown pattern: "+aqt.kind;
    }

    return aqt;
};

AbstractQueryTree.AbstractQueryTree.prototype._replaceTripleContext = function(triples, from, to, ns) {
    for(var i=0; i<triples.length; i++) {
        for(var p in triples[i]) {
            var comp = triples[i][p];
	    if(comp.token === 'var' && from.token === 'var' && comp.value === from.value) {
		triples[i][p] = to;
	    } else if(comp.token === 'blank' && from.token === 'blank' && comp.value === from.value) {
		triples[i][p] = to;
	    } else {
		if((comp.token === 'literal' || comp.token ==='uri') && 
		   (from.token === 'literal' || from.token ==='uri') && 
		   comp.token === from.token && Utils.lexicalFormTerm(comp,ns)[comp.token] === Utils.lexicalFormTerm(from,ns)[comp.token]) {
                    triples[i][p] = to;
		}
	    }
        }
    }

    return triples;
};


AbstractQueryTree.AbstractQueryTree.prototype._replaceFilter = function(filterExpr, from, to, ns) {
    if(filterExpr.expressionType != null) {
        var expressionType = filterExpr.expressionType;
        if(expressionType == 'relationalexpression') {
            filterExpr.op1 = this._replaceFilter(filterExpr.op1, from, to, ns);
            filterExpr.op2 = this._replaceFilter(filterExpr.op2, from, to, ns);
        } else if(expressionType == 'conditionalor' || expressionType == 'conditionaland') {
            for(var i=0; i< filterExpr.operands.length; i++) {
                filterExpr.operands[i] = this._replaceFilter(filterExpr.operands[i], from, to, ns);
            }
        } else if(expressionType == 'additiveexpression') {
            filterExpr.summand = this._replaceFilter(filterExpr.summand, from, to, ns);
            for(var i=0; i<filterExpr.summands.length; i++) {
                filterExpr.summands[i].expression = this._replaceFilter(filterExpr.summands[i].expression, from, to, ns);            
            }
        } else if(expressionType == 'builtincall') {
            for(var i=0; i<filterExpr.args.length; i++) {
                filterExpr.args[i] = this._replaceFilter(filterExpr.args[i], from, to, ns);
            }
        } else if(expressionType == 'multiplicativeexpression') {
            filterExpr.factor = this._replaceFilter(filterExpr.factor, from, to, ns);
            for(var i=0; i<filterExpr.factors.length; i++) {
                filterExpr.factors[i].expression = this._replaceFilter(filterExpr.factors[i].expression, from, to, ns);
            }
        } else if(expressionType == 'unaryexpression') {
            filterExpr.expression = this._replaceFilter(filterExpr.expression, from, to, ns);
        } else if(expressionType == 'irireforfunction') {
            for(var i=0; i<filterExpr.factors.args; i++) {
                filterExpr.args[i] = this._replaceFilter(filterExpr.args[i], from, to, ns);
            }
        } else if(expressionType == 'atomic') {        
	    var val = null;
            if(filterExpr.primaryexpression == from.token && filterExpr.value == from.value) {
                    val = to.value;                
            } else if(filterExpr.primaryexpression == 'iri' && from.token == 'uri' && filterExpr.value == from.value) {
                val = to.value;                
	    }

	
	    if(val != null) {
                if(to.token === 'uri') {
                    filterExpr.primaryexpression = 'iri';
                } else {
                    filterExpr.primaryexpression = to.token;
                }
                filterExpr.value = val;
	    }
        }
    }

    return filterExpr;
};

AbstractQueryTree.AbstractQueryTree.prototype.treeWithUnion = function(aqt) {
    if(aqt == null)
	return false;
    if(aqt.kind == null)
	return false;
    if(aqt.kind === 'select') {
        return this.treeWithUnion(aqt.pattern);
    } else if(aqt.kind === 'BGP') {
        return this.treeWithUnion(aqt.value);
    } else if(aqt.kind === 'ZERO_OR_MORE_PATH') {
	return false;
    } else if(aqt.kind === 'UNION') {
	console.log("UNION!!");
	if(aqt.value[0].value != null && aqt.value[0].value.variables != null &&
	   aqt.value[1].value != null && aqt.value[1].value.variables != null) {
	    console.log("COMPARING:"+aqt.value[0].variables.join("/"));
	    console.log("VS "+aqt.values[1].variables.join("/"));
	    if(aqt.value[0].variables.join("/") === aqt.values[1].variables.join("/")) {
		if(this.treeWithUnion(aqt.value[0]))
		    return true;
		else
		    return this.treeWithUnion(aqt.value[1]);
	    }
	} else {
	    return true;	    
	}
    } else if(aqt.kind === 'GRAPH') {
	return false;
    } else if(aqt.kind === 'LEFT_JOIN' || aqt.kind === 'JOIN') {
        var leftUnion  = this.treeWithUnion(aqt.lvalue);
	if(leftUnion)
	    return true;
	else
            this.treeWithUnion(aqt.rvalue);
    } else if(aqt.kind === 'FILTER') {
	return false;
    } else if(aqt.kind === 'EMPTY_PATTERN') {
	return false;
    } else {
	return false;
    }
};

// end of ./src/js-sparql-parser/src/abstract_query_tree.js 
// exports
var QueryFilters = {};

// imports

QueryFilters.checkFilters = function(pattern, bindings, nullifyErrors, dataset, queryEnv, queryEngine) {

    var filters = pattern.filter;
    var nullified = [];
    if(filters==null || pattern.length != null) {
        return bindings;
    }

    for(var i=0; i<filters.length; i++) {
        var filter = filters[i];

        var filteredBindings = QueryFilters.run(filter.value, bindings, nullifyErrors, dataset, queryEnv, queryEngine);
        var acum = [];
        for(var j=0; j<filteredBindings.length; j++) {
            if(filteredBindings[j]["__nullify__"]!=null) {
                nullified.push(filteredBindings[j]);
            } else {
                acum.push(filteredBindings[j]);
            }
        }

        bindings = acum;
    }

    return bindings.concat(nullified);
};

QueryFilters.boundVars = function(filterExpr) {
    if(filterExpr.expressionType != null) {
        var expressionType = filterExpr.expressionType;
        if(expressionType == 'relationalexpression') {
            var op1 = filterExpr.op1;
            var op2 = filterExpr.op2;
            return QueryFilters.boundVars(op1)+QueryFilters.boundVars(op2);
        } else if(expressionType == 'conditionalor' || expressionType == 'conditionaland') {
            var vars = [];
            for(var i=0; i< filterExpr.operands; i++) {
                vars = vars.concat(QueryFilters.boundVars(filterExpr.operands[i]));
            }
            return vars;
        } else if(expressionType == 'builtincall') {
            if(filterExpr.args == null) {
                return [];
            } else {
                var acum = [];
                for(var i=0; i< filterExpr.args.length; i++) {
                    acum = acum.concat(QueryFilters.boundVars(filterExpr.args[i]));
                }
                return acum;
            }
        } else if(expressionType == 'multiplicativeexpression') {
            var acum = QueryFilters.boundVars(filterExpr.factor);
            for(var i=0; i<filterExpr.factors.length; i++) {
                acum = acum.concat(QueryFilters.boundVars(filterExpr.factors[i].expression))
            }
            return acum;
        } else if(expressionType == 'additiveexpression') {
            var acum = QueryFilters.boundVars(filterExpr.summand);
            for(var i=0; i<filterExpr.summands.length; i++) {
                acum = acum.concat(QueryFilters.boundVars(filterExpr.summands[i].expression));
            }

            return acum;
        } else if(expressionType == 'regex') {
            var acum = QueryFilters.boundVars(filterExpr.expression1);
            return acum.concat(QueryFilters.boundVars(filterExpr.expression2));
        } else if(expressionType == 'unaryexpression') {
            return QueryFilters.boundVars(filterExpr.expression);
        } else if(expressionType == 'atomic') {           
            if(filterExpr.primaryexpression == 'var') {
                return [filterExpr.value];
            } else {
                // numeric, literal, etc...
                return [];
            }
        }
    } else {
        console.log("ERROR");
        console.log(filterExpr);
        throw("Cannot find bound expressions in a no expression token");
    }
};

QueryFilters.run = function(filterExpr, bindings, nullifyFilters, dataset, env, queryEngine) {    
    var denormBindings = queryEngine.copyDenormalizedBindings(bindings, env.outCache);
    var filteredBindings = [];
    for(var i=0; i<bindings.length; i++) {
        var thisDenormBindings = denormBindings[i];
        var ebv = QueryFilters.runFilter(filterExpr, thisDenormBindings, queryEngine, dataset, env);
        // ebv can be directly a RDFTerm (e.g. atomic expression in filter)
        // this additional call to ebv will return -> true/false/error
        var ebv = QueryFilters.ebv(ebv);
        //console.log("EBV:")
        //console.log(ebv)
        //console.log("FOR:")
        //console.log(thisDenormBindings)
        if(QueryFilters.isEbvError(ebv)) {
            // error
            if(nullifyFilters) {
                var thisBindings = {"__nullify__": true, "bindings": bindings[i]};
                filteredBindings.push(thisBindings);
            }
        } else if(ebv === true) {
            // true
            filteredBindings.push(bindings[i]);
        } else {
            // false
            if(nullifyFilters) {
                var thisBindings = {"__nullify__": true, "bindings": bindings[i]};
                filteredBindings.push(thisBindings);
            }
        }
    }
    return filteredBindings;
};

QueryFilters.collect = function(filterExpr, bindings, dataset, env, queryEngine, callback) {
    var denormBindings = queryEngine.copyDenormalizedBindings(bindings, env.outCache);
    var filteredBindings = [];
    for(var i=0; i<denormBindings.length; i++) {
        var thisDenormBindings = denormBindings[i];
        var ebv = QueryFilters.runFilter(filterExpr, thisDenormBindings, queryEngine, dataset, env);
        filteredBindings.push({binding:bindings[i], value:ebv});
    }
    return(filteredBindings);
};

QueryFilters.runDistinct = function(projectedBindings, projectionVariables) {
};

// @todo add more aggregation functions here
QueryFilters.runAggregator = function(aggregator, bindingsGroup, queryEngine, dataset, env) {
    if(bindingsGroup == null || bindingsGroup.length === 0) {
        return QueryFilters.ebvError();
    } else if(aggregator.token === 'variable' && aggregator.kind == 'var') {
        return bindingsGroup[0][aggregator.value.value];
    } else if(aggregator.token === 'variable' && aggregator.kind === 'aliased') {
        if(aggregator.expression.expressionType === 'atomic' && aggregator.expression.primaryexpression === 'var') {
            return bindingsGroup[0][aggregator.expression.value.value];
        } else if(aggregator.expression.expressionType === 'aggregate') {
            if(aggregator.expression.aggregateType === 'max') {
                var max = null;
                for(var i=0; i< bindingsGroup.length; i++) {
                    var bindings = bindingsGroup[i];
                    var ebv = QueryFilters.runFilter(aggregator.expression.expression, bindings, queryEngine, dataset, env);                    
                    if(!QueryFilters.isEbvError(ebv)) {
                        if(max === null) {
                            max = ebv;
                        } else {
                            if(QueryFilters.runLtFunction(max, ebv).value === true) {
                                max = ebv;
                            }
                        }
                    }
                }

                if(max===null) {
                    return QueryFilters.ebvError();
                } else {
                    return max;
                }
            } else if(aggregator.expression.aggregateType === 'min') {
                var min = null;
                for(var i=0; i< bindingsGroup.length; i++) {
                    var bindings = bindingsGroup[i];
                    var ebv = QueryFilters.runFilter(aggregator.expression.expression, bindings, queryEngine, dataset, env);                    
                    if(!QueryFilters.isEbvError(ebv)) {
                        if(min === null) {
                            min = ebv;
                        } else {
                            if(QueryFilters.runGtFunction(min, ebv).value === true) {
                                min = ebv;
                            }
                        }
                    }
                }

                if(min===null) {
                    return QueryFilters.ebvError();
                } else {
                    return min;
                }
            } else if(aggregator.expression.aggregateType === 'count') {
                var distinct = {};
                var count = 0;
                if(aggregator.expression.expression === '*') {
                    if(aggregator.expression.distinct != null && aggregator.expression.distinct != '') {
                        for(var i=0; i< bindingsGroup.length; i++) {
                            var bindings = bindingsGroup[i];
                            var key = Utils.hashTerm(bindings);
                            if(distinct[key] == null) {
                                distinct[key] = true;
                                count++;
                            }
                        } 
                    } else {
                        count = bindingsGroup.length;
                    }                   
                } else {
                  for(var i=0; i< bindingsGroup.length; i++) {
                      var bindings = bindingsGroup[i];
                      var ebv = QueryFilters.runFilter(aggregator.expression.expression, bindings, queryEngine, dataset, env);                    
                      if(!QueryFilters.isEbvError(ebv)) {
                          if(aggregator.expression.distinct != null && aggregator.expression.distinct != '') {
                              var key = Utils.hashTerm(ebv);
                              if(distinct[key] == null) {
                                  distinct[key] = true;
                                  count++;
                              }
                          } else {
                              count++;
                          }
                      }
                  }
                }

                return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:''+count};
            } else if(aggregator.expression.aggregateType === 'avg') {
                var distinct = {};
                var aggregated = {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:'0'};
                var count = 0;
                for(var i=0; i< bindingsGroup.length; i++) {
                    var bindings = bindingsGroup[i];
                    var ebv = QueryFilters.runFilter(aggregator.expression.expression, bindings, queryEngine, dataset, env);                    
                    if(!QueryFilters.isEbvError(ebv)) {
                        if(aggregator.expression.distinct != null && aggregator.expression.distinct != '') {
                            var key = Utils.hashTerm(ebv);
                            if(distinct[key] == null) {
                                distinct[key] = true;
                                if(QueryFilters.isNumeric(ebv)) {
                                    aggregated = QueryFilters.runSumFunction(aggregated, ebv);
                                    count++;
                                }
                            }
                        } else {
                            if(QueryFilters.isNumeric(ebv)) {
                                aggregated = QueryFilters.runSumFunction(aggregated, ebv);
                                count++;
                            }
                        }
                    }
                }

                var result = QueryFilters.runDivFunction(aggregated, {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:''+count});
                result.value = ''+result.value;
                return result;
            } else if(aggregator.expression.aggregateType === 'sum') {
                var distinct = {};
                var aggregated = {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:'0'};
                for(var i=0; i< bindingsGroup.length; i++) {
                    var bindings = bindingsGroup[i];
                    var ebv = QueryFilters.runFilter(aggregator.expression.expression, bindings, queryEngine, dataset, env);                    
                    if(!QueryFilters.isEbvError(ebv)) {
                        if(aggregator.expression.distinct != null && aggregator.expression.distinct != '') {
                            var key = Utils.hashTerm(ebv);
                            if(distinct[key] == null) {
                                distinct[key] = true;
                                if(QueryFilters.isNumeric(ebv)) {
                                    aggregated = QueryFilters.runSumFunction(aggregated, ebv);
                                }
                            }
                        } else {
                            if(QueryFilters.isNumeric(ebv)) {
                                aggregated = QueryFilters.runSumFunction(aggregated, ebv);
                            }
                        }
                    }
                }
                
                aggregated.value =''+aggregated.value;
                return aggregated;
            } else {
                var ebv = QueryFilters.runFilter(aggregate.expression, bindingsGroup[0], dataset, {blanks:{}, outCache:{}});
                return ebv;
            }
        }
    }
};

QueryFilters.runFilter = function(filterExpr, bindings, queryEngine, dataset, env) {
    if(filterExpr.expressionType != null) {
        var expressionType = filterExpr.expressionType;
        if(expressionType == 'relationalexpression') {
            var op1 = QueryFilters.runFilter(filterExpr.op1, bindings,queryEngine, dataset, env);
            var op2 = QueryFilters.runFilter(filterExpr.op2, bindings,queryEngine, dataset, env);
            return QueryFilters.runRelationalFilter(filterExpr, op1, op2, bindings, queryEngine, dataset, env);
        } else if(expressionType == 'conditionalor') {
            return QueryFilters.runOrFunction(filterExpr, bindings, queryEngine, dataset, env);
        } else if (expressionType == 'conditionaland') {
            return QueryFilters.runAndFunction(filterExpr, bindings, queryEngine, dataset, env);
        } else if(expressionType == 'additiveexpression') {
            return QueryFilters.runAddition(filterExpr.summand, filterExpr.summands, bindings, queryEngine, dataset, env);
        } else if(expressionType == 'builtincall') {
            return QueryFilters.runBuiltInCall(filterExpr.builtincall, filterExpr.args, bindings, queryEngine, dataset, env);
        } else if(expressionType == 'multiplicativeexpression') {
            return QueryFilters.runMultiplication(filterExpr.factor, filterExpr.factors, bindings, queryEngine, dataset, env);
        } else if(expressionType == 'unaryexpression') {
            return QueryFilters.runUnaryExpression(filterExpr.unaryexpression, filterExpr.expression, bindings, queryEngine, dataset, env);
        } else if(expressionType == 'irireforfunction') {
            return QueryFilters.runIriRefOrFunction(filterExpr.iriref, filterExpr.args, bindings, queryEngine, dataset, env);
        } else if(expressionType == 'regex') {
            return QueryFilters.runRegex(filterExpr.text, filterExpr.pattern, filterExpr.flags, bindings, queryEngine, dataset, env)
        } else if(expressionType == 'atomic') {        
            if(filterExpr.primaryexpression == 'var') {
                // lookup the var in the bindings
                var val = bindings[filterExpr.value.value];
                return val;
            } else {
                // numeric, literal, etc...
                //return queryEngine.filterExpr.value;
                if(typeof(filterExpr.value) != 'object') {
                    return filterExpr.value
                } else {
                    if(filterExpr.value.type == null || typeof(filterExpr.value.type) != 'object') {
                        return filterExpr.value
                    } else {
                        // type can be parsed as a hash using namespaces

                        filterExpr.value.type =  Utils.lexicalFormBaseUri(filterExpr.value.type, env);
                        return filterExpr.value
                    }
                }
            }
        } else {
            throw("Unknown filter expression type");
        }
    } else {
        throw("Cannot find bound expressions in a no expression token");
    }
};

QueryFilters.isRDFTerm = function(val) {
    if(val==null) {
        return false;
    } if((val.token && val.token == 'literal') ||
       (val.token && val.token == 'uri') ||
       (val.token && val.token == 'blank')) {
        return true;
    } else {
        return false;
    }
};


/*
17.4.1.7 RDFterm-equal

 xsd:boolean   RDF term term1 = RDF term term2

Returns TRUE if term1 and term2 are the same RDF term as defined in Resource Description Framework (RDF): 
Concepts and Abstract Syntax [CONCEPTS]; produces a type error if the arguments are both literal but are not 
the same RDF term *; returns FALSE otherwise. term1 and term2 are the same if any of the following is true:

    term1 and term2 are equivalent IRIs as defined in 6.4 RDF URI References of [CONCEPTS].
    term1 and term2 are equivalent literals as defined in 6.5.1 Literal Equality of [CONCEPTS].
    term1 and term2 are the same blank node as described in 6.6 Blank Nodes of [CONCEPTS].
*/
QueryFilters.RDFTermEquality = function(v1, v2, queryEngine, env) {
    if(v1.token === 'literal' && v2.token === 'literal') {
        if(v1.lang == v2.lang && v1.type == v2.type && v1.value == v2.value) {

            return true;
        } else {


            if(v1.type != null && v2.type != null) {
                return  QueryFilters.ebvError();
            } else if(QueryFilters.isSimpleLiteral(v1) && v2.type!=null){
                return QueryFilters.ebvError();
            } else if(QueryFilters.isSimpleLiteral(v2) && v1.type!=null){
                return QueryFilters.ebvError();
            } else {
                return false;
            }

//            if(v1.value != v2.value) {
//                return QueryFilters.ebvError();                                
//            } else if(v1.type && v2.type && v1.type!=v2.type) {
//                return QueryFilters.ebvError();                
//            } else if(QueryFilters.isSimpleLiteral(v1) && v2.type!=null){
//                return QueryFilters.ebvError();
//            } else if(QueryFilters.isSimpleLiteral(v2) && v1.type!=null){
//                return QueryFilters.ebvError();
//            } else {
//                return false;
//            }

        }
    } else if(v1.token === 'uri' && v2.token === 'uri') {
        return Utils.lexicalFormBaseUri(v1, env) == Utils.lexicalFormBaseUri(v2, env);
    } else if(v1.token === 'blank' && v2.token === 'blank') {
        return v1.value == v2.value;
    } else {
        return false;
    }
};


QueryFilters.isInteger = function(val) {
    if(val == null) {
        return false;
    }
    if(val.token === 'literal') {
        if(val.type == "http://www.w3.org/2001/XMLSchema#integer" ||
           val.type == "http://www.w3.org/2001/XMLSchema#decimal" ||
           val.type == "http://www.w3.org/2001/XMLSchema#double" ||
           val.type == "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" ||
           val.type == "http://www.w3.org/2001/XMLSchema#negativeInteger" ||
           val.type == "http://www.w3.org/2001/XMLSchema#long" ||
           val.type == "http://www.w3.org/2001/XMLSchema#int" ||
           val.type == "http://www.w3.org/2001/XMLSchema#short" ||
           val.type == "http://www.w3.org/2001/XMLSchema#byte" ||
           val.type == "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedLong" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedInt" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedShort" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedByte" ||
           val.type == "http://www.w3.org/2001/XMLSchema#positiveInteger" ) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

QueryFilters.isFloat = function(val) {
    if(val == null) {
        return false;
    }
    if(val.token === 'literal') {
        if(val.type == "http://www.w3.org/2001/XMLSchema#float") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

QueryFilters.isDecimal = function(val) {
    if(val == null) {
        return false;
    }
    if(val.token === 'literal') {
        if(val.type == "http://www.w3.org/2001/XMLSchema#decimal") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

QueryFilters.isDouble = function(val) {
    if(val == null) {
        return false;
    }
    if(val.token === 'literal') {
        if(val.type == "http://www.w3.org/2001/XMLSchema#double") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};


QueryFilters.isNumeric = function(val) {
    if(val == null) {
        return false;
    }    
    if(val.token === 'literal') {
        if(val.type == "http://www.w3.org/2001/XMLSchema#integer" ||
           val.type == "http://www.w3.org/2001/XMLSchema#decimal" ||
           val.type == "http://www.w3.org/2001/XMLSchema#float" ||
           val.type == "http://www.w3.org/2001/XMLSchema#double" ||
           val.type == "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" ||
           val.type == "http://www.w3.org/2001/XMLSchema#negativeInteger" ||
           val.type == "http://www.w3.org/2001/XMLSchema#long" ||
           val.type == "http://www.w3.org/2001/XMLSchema#int" ||
           val.type == "http://www.w3.org/2001/XMLSchema#short" ||
           val.type == "http://www.w3.org/2001/XMLSchema#byte" ||
           val.type == "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedLong" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedInt" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedShort" ||
           val.type == "http://www.w3.org/2001/XMLSchema#unsignedByte" ||
           val.type == "http://www.w3.org/2001/XMLSchema#positiveInteger" ) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

QueryFilters.isSimpleLiteral = function(val) {
    if(val && val.token == 'literal') {
        if(val.type == null && val.lang == null) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

QueryFilters.isXsdType = function(type, val) {
    if(val && val.token == 'literal') {
        return val.type == "http://www.w3.org/2001/XMLSchema#"+type;
    } else {
        return false;
    }
};

QueryFilters.ebv = function (term) {
    if (term == null || QueryFilters.isEbvError(term)) {
        return QueryFilters.ebvError();
    } else {
        if (term.token && term.token === 'literal') {
            if (term.type == "http://www.w3.org/2001/XMLSchema#integer" ||
                term.type == "http://www.w3.org/2001/XMLSchema#decimal" ||
                term.type == "http://www.w3.org/2001/XMLSchema#double" ||
                term.type == "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" ||
                term.type == "http://www.w3.org/2001/XMLSchema#negativeInteger" ||
                term.type == "http://www.w3.org/2001/XMLSchema#long" ||
                term.type == "http://www.w3.org/2001/XMLSchema#int" ||
                term.type == "http://www.w3.org/2001/XMLSchema#short" ||
                term.type == "http://www.w3.org/2001/XMLSchema#byte" ||
                term.type == "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" ||
                term.type == "http://www.w3.org/2001/XMLSchema#unsignedLong" ||
                term.type == "http://www.w3.org/2001/XMLSchema#unsignedInt" ||
                term.type == "http://www.w3.org/2001/XMLSchema#unsignedShort" ||
                term.type == "http://www.w3.org/2001/XMLSchema#unsignedByte" ||
                term.type == "http://www.w3.org/2001/XMLSchema#positiveInteger") {
                var tmp = parseFloat(term.value);
                if (isNaN(tmp)) {
                    return false;
                } else {
                    return parseFloat(term.value) != 0;
                }
            } else if (term.type === "http://www.w3.org/2001/XMLSchema#boolean") {
                return (term.value === 'true' || term.value === true || term.value === 'True');
            } else if (term.type === "http://www.w3.org/2001/XMLSchema#string") {
                return term.value != "";
            } else if (term.type === "http://www.w3.org/2001/XMLSchema#dateTime") {
                return (new Date(term.value)) != null;
            } else if (QueryFilters.isEbvError(term)) {
                return term;
            } else if (term.type == null) {
                if (term.value != "") {
                    return true;
                } else {
                    return false;
                }
            } else {
                return QueryFilters.ebvError();
            }
        } else {
            return term.value === true;
        }
    }
};


QueryFilters.ebvTrue = function() {
    var val = {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#boolean", value:true};
    return val;
};

QueryFilters.ebvFalse = function() {
    var val = {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#boolean", value:false};
    return val;
};

QueryFilters.ebvError = function() {
    var val = {token: 'literal', type:"https://github.com/antoniogarrote/js-tools/types#error", value:null};
    return val;
};

QueryFilters.isEbvError = function(term) {
    if(typeof(term) == 'object' && term != null) {
        return term.type === "https://github.com/antoniogarrote/js-tools/types#error";
//    } else if(term == null) {
//        return true;
    } else {
        return false;
    }
};

QueryFilters.ebvBoolean = function (bool) {
    if (QueryFilters.isEbvError(bool)) {
        return bool;
    } else {
        if (bool === true) {
            return QueryFilters.ebvTrue();
        } else {
            return QueryFilters.ebvFalse();
        }
    }
};


QueryFilters.runRelationalFilter = function(filterExpr, op1, op2, bindings, queryEngine, dataset, env) {
    var operator = filterExpr.operator;
    if(operator === '=') {
        return QueryFilters.runEqualityFunction(op1, op2, bindings, queryEngine, dataset, env);
    } else if(operator === '!=') {
        var res = QueryFilters.runEqualityFunction(op1, op2, bindings, queryEngine, dataset, env);
        if(QueryFilters.isEbvError(res)) {
            return res;
        } else {
            res.value = !res.value;
            return res;
        }
    } else if(operator === '<') {
        return QueryFilters.runLtFunction(op1, op2, bindings);
    } else if(operator === '>') {
        return QueryFilters.runGtFunction(op1, op2, bindings);
    } else if(operator === '<=') {
        return QueryFilters.runLtEqFunction(op1, op2, bindings);
    } else if(operator === '>=') {
        return QueryFilters.runGtEqFunction(op1, op2, bindings);
    } else {
        throw("Error applying relational filter, unknown operator");
    }
};

/**
 * Transforms a JS object representing a [typed] literal in a javascript
 * value that can be used in javascript operations and functions
 */
QueryFilters.effectiveTypeValue = function(val){
    if(val.token == 'literal') {
        if(val.type == "http://www.w3.org/2001/XMLSchema#integer") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
              return tmp;
            //}
        } else if(val.type == "http://www.w3.org/2001/XMLSchema#decimal") {
            var tmp = parseFloat(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#float") {
            var tmp = parseFloat(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#double") {
            var tmp = parseFloat(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#nonPositiveInteger") {
            var tmp = parseFloat(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#negativeInteger") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#long") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#int") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#short") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#byte") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#nonNegativeInteger") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#unsignedLong") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#unsignedInt") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#unsignedShort") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#unsignedByte") {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#positiveInteger" ) {
            var tmp = parseInt(val.value);
            //if(isNaN(tmp)) {
            //    return false;
            //} else {
                return tmp;
            //}
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#date" || 
                   val.type == "http://www.w3.org/2001/XMLSchema#dateTime" ) {
            try {
                var d = Utils.parseISO8601(val.value);            
                return(d);
            } catch(e) {
                return null;
            }
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#boolean" ) {
            return val.value === true || val.value === 'true' || val.value === '1' || val.value === 1 || val.value === true ? true :
                val.value === false || val.value === 'false' || val.value === '0' || val.value === 0 || val.value === false ? false :
                undefined;
        } else if (val.type == "http://www.w3.org/2001/XMLSchema#string" ) {
            return val.value === null || val.value === undefined ? undefined : ''+val.value;
        } else if (val.type == null) {
            // plain literal -> just manipulate the string
            return val.value;
        } else {
            return val.value
        }
    } else {
        // @todo
        console.log("not implemented yet");
        throw("value not supported in operations yet");
    }
};

/*
  A logical-or that encounters an error on only one branch will return TRUE if the other branch is TRUE and an error if the other branch is FALSE.
  A logical-or or logical-and that encounters errors on both branches will produce either of the errors.
*/
QueryFilters.runOrFunction = function(filterExpr, bindings, queryEngine, dataset, env) {

    var acum = null;

    for(var i=0; i< filterExpr.operands.length; i++) {
        var ebv = QueryFilters.runFilter(filterExpr.operands[i], bindings, queryEngine, dataset, env);
        if(QueryFilters.isEbvError(ebv) == false) {
            ebv = QueryFilters.ebv(ebv);
        }

        if(acum == null) {
            acum = ebv;
        } else if(QueryFilters.isEbvError(ebv)) {
            if(QueryFilters.isEbvError(acum)) {
                acum = QueryFilters.ebvError();
            } else if(acum === true) {
                acum = true;
            } else {
                acum = QueryFilters.ebvError();
            }
        } else if(ebv === true) {
            acum = true;
        } else {
            if(QueryFilters.isEbvError(acum)) {
                acum = QueryFilters.ebvError();
            }
        }
    }

    return QueryFilters.ebvBoolean(acum);
};

/*
  A logical-and that encounters an error on only one branch will return an error if the other branch is TRUE and FALSE if the other branch is FALSE.
  A logical-or or logical-and that encounters errors on both branches will produce either of the errors.
*/
QueryFilters.runAndFunction = function(filterExpr, bindings, queryEngine, dataset, env) {

    var acum = null;

    for(var i=0; i< filterExpr.operands.length; i++) {

        var ebv = QueryFilters.runFilter(filterExpr.operands[i], bindings, queryEngine, dataset, env);

        if(QueryFilters.isEbvError(ebv) == false) {
            ebv = QueryFilters.ebv(ebv);
        }

        if(acum == null) {
            acum = ebv;
        } else if(QueryFilters.isEbvError(ebv)) {
            if(QueryFilters.isEbvError(acum)) {
                acum = QueryFilters.ebvError();
            } else if(acum === true) {
                acum = QueryFilters.ebvError();
            } else {
                acum = false;
            }
        } else if(ebv === true) {
            if(QueryFilters.isEbvError(acum)) {
                acum = QueryFilters.ebvError();
            }
        } else {
            acum = false;
        }
    }

    return QueryFilters.ebvBoolean(acum);
};


QueryFilters.runEqualityFunction = function(op1, op2, bindings, queryEngine, dataset, env) {
    if(QueryFilters.isEbvError(op1) || QueryFilters.isEbvError(op2)) {
        return QueryFilters.ebvError();
    }
    if(QueryFilters.isNumeric(op1) && QueryFilters.isNumeric(op2)) {
        var eop1 = QueryFilters.effectiveTypeValue(op1);
        var eop2 = QueryFilters.effectiveTypeValue(op2);
        if(isNaN(eop1) || isNaN(eop2)) {
            return QueryFilters.ebvBoolean(QueryFilters.RDFTermEquality(op1, op2, queryEngine, env));
        } else {
            return QueryFilters.ebvBoolean(eop1 == eop2);
        }
    } else if((QueryFilters.isSimpleLiteral(op1) || QueryFilters.isXsdType("string", op1)) && 
              (QueryFilters.isSimpleLiteral(op2) || QueryFilters.isXsdType("string", op2))) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) == QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("boolean", op1) && QueryFilters.isXsdType("boolean", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) == QueryFilters.effectiveTypeValue(op2));
    } else if((QueryFilters.isXsdType("dateTime", op1)||QueryFilters.isXsdType("date", op1)) && (QueryFilters.isXsdType("dateTime", op2)||QueryFilters.isXsdType("date", op2))) {
        if(QueryFilters.isXsdType("dateTime", op1) && QueryFilters.isXsdType("date", op2)) {
            return QueryFilters.ebvFalse();
        }
        if(QueryFilters.isXsdType("date", op1) && QueryFilters.isXsdType("dateTime", op2)) {
            return QueryFilters.ebvFalse();
        }

        var comp = Utils.compareDateComponents(op1.value, op2.value);
        if(comp != null) {
            if(comp == 0) {
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }
        } else {
                return QueryFilters.ebvError();
        }
    } else if(QueryFilters.isRDFTerm(op1) && QueryFilters.isRDFTerm(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.RDFTermEquality(op1, op2, queryEngine, env));
    } else {
        return QueryFilters.ebvFalse();
    }
};

QueryFilters.runGtFunction = function(op1, op2, bindings) {
    if(QueryFilters.isEbvError(op1) || QueryFilters.isEbvError(op2)) {
        return QueryFilters.ebvError();
    }

    if(QueryFilters.isNumeric(op1) && QueryFilters.isNumeric(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) > QueryFilters.effectiveTypeValue(op2));
    } else if(QueryFilters.isSimpleLiteral(op1) && QueryFilters.isSimpleLiteral(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) > QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("string", op1) && QueryFilters.isXsdType("string", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) > QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("boolean", op1) && QueryFilters.isXsdType("boolean", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) > QueryFilters.effectiveTypeValue(op2));
    } else if((QueryFilters.isXsdType("dateTime", op1) || QueryFilters.isXsdType("date", op1)) && 
              (QueryFilters.isXsdType("dateTime", op2) || QueryFilters.isXsdType("date", op2))) {
        if(QueryFilters.isXsdType("dateTime", op1) && QueryFilters.isXsdType("date", op2)) {
            return QueryFilters.ebvFalse();
        }
        if(QueryFilters.isXsdType("date", op1) && QueryFilters.isXsdType("dateTime", op2)) {
            return QueryFilters.ebvFalse();
        }

        var comp = Utils.compareDateComponents(op1.value, op2.value);
        if(comp != null) {
            if(comp == 1) {
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }
        } else {
                return QueryFilters.ebvError();
        }
    } else {
        return QueryFilters.ebvFalse();
    }
};

/**
 * Total gt function used when sorting bindings in the SORT BY clause.
 *
 * @todo
 * Some criteria are not clear
 */
QueryFilters.runTotalGtFunction = function(op1,op2) {
    if(QueryFilters.isEbvError(op1) || QueryFilters.isEbvError(op2)) {
        return QueryFilters.ebvError();
    }

    if((QueryFilters.isNumeric(op1) && QueryFilters.isNumeric(op2)) ||
       (QueryFilters.isSimpleLiteral(op1) && QueryFilters.isSimpleLiteral(op2)) ||
       (QueryFilters.isXsdType("string",op1) && QueryFilters.isSimpleLiteral("string",op2)) ||
       (QueryFilters.isXsdType("boolean",op1) && QueryFilters.isSimpleLiteral("boolean",op2)) ||
       (QueryFilters.isXsdType("dateTime",op1) && QueryFilters.isSimpleLiteral("dateTime",op2))) {
        return QueryFilters.runGtFunction(op1, op2, []);
    } else if(op1.token && op1.token === 'uri' && op2.token && op2.token === 'uri') {
        return QueryFilters.ebvBoolean(op1.value > op2.value);
    } else if(op1.token && op1.token === 'literal' && op2.token && op2.token === 'literal') {
        // one of the literals must have type/lang and the othe may not have them
        return QueryFilters.ebvBoolean(""+op1.value+op1.type+op1.lang > ""+op2.value+op2.type+op2.lang);
    } else if(op1.token && op1.token === 'blank' && op2.token && op2.token === 'blank') {    
        return QueryFilters.ebvBoolean(op1.value > op2.value);
    } else if(op1.value && op2.value) {
        return QueryFilters.ebvBoolean(op1.value > op2.value);
    } else {
        return QueryFilters.ebvTrue();
    }
};


QueryFilters.runLtFunction = function(op1, op2, bindings) {
    if(QueryFilters.isEbvError(op1) || QueryFilters.isEbvError(op2)) {
        return QueryFilters.ebvError();
    }

    if(QueryFilters.isNumeric(op1) && QueryFilters.isNumeric(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) < QueryFilters.effectiveTypeValue(op2));
    } else if(QueryFilters.isSimpleLiteral(op1) && QueryFilters.isSimpleLiteral(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) < QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("string", op1) && QueryFilters.isXsdType("string", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) < QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("boolean", op1) && QueryFilters.isXsdType("boolean", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) < QueryFilters.effectiveTypeValue(op2));
    } else if((QueryFilters.isXsdType("dateTime", op1) || QueryFilters.isXsdType("date", op1)) && 
              (QueryFilters.isXsdType("dateTime", op2) || QueryFilters.isXsdType("date", op2))) {
        if(QueryFilters.isXsdType("dateTime", op1) && QueryFilters.isXsdType("date", op2)) {
            return QueryFilters.ebvFalse();
        }
        if(QueryFilters.isXsdType("date", op1) && QueryFilters.isXsdType("dateTime", op2)) {
            return QueryFilters.ebvFalse();
        }

        var comp = Utils.compareDateComponents(op1.value, op2.value);
        if(comp != null) {
            if(comp == -1) {
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }
        } else {
                return QueryFilters.ebvError();
        }
    } else {
        return QueryFilters.ebvFalse();
    }
};


QueryFilters.runGtEqFunction = function(op1, op2, bindings) {
    if(QueryFilters.isEbvError(op1) || QueryFilters.isEbvError(op2)) {
        return QueryFilters.ebvError();
    }

    if(QueryFilters.isNumeric(op1) && QueryFilters.isNumeric(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) >= QueryFilters.effectiveTypeValue(op2));
    } else if(QueryFilters.isSimpleLiteral(op1) && QueryFilters.isSimpleLiteral(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) >= QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("string", op1) && QueryFilters.isXsdType("string", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) >= QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("boolean", op1) && QueryFilters.isXsdType("boolean", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) >= QueryFilters.effectiveTypeValue(op2));
    } else if((QueryFilters.isXsdType("dateTime", op1) || QueryFilters.isXsdType("date", op1)) && 
              (QueryFilters.isXsdType("dateTime", op2) || QueryFilters.isXsdType("date", op2))) {
        if(QueryFilters.isXsdType("dateTime", op1) && QueryFilters.isXsdType("date", op2)) {
            return QueryFilters.ebvFalse();
        }
        if(QueryFilters.isXsdType("date", op1) && QueryFilters.isXsdType("dateTime", op2)) {
            return QueryFilters.ebvFalse();
        }

        var comp = Utils.compareDateComponents(op1.value, op2.value);
        if(comp != null) {
            if(comp != -1) {
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }
        } else {
                return QueryFilters.ebvError();
        }

    } else {
        return QueryFilters.ebvFalse();
    }
};


QueryFilters.runLtEqFunction = function(op1, op2, bindings) {
    if(QueryFilters.isEbvError(op1) || QueryFilters.isEbvError(op2)) {
        return QueryFilters.ebvError();
    }

    if(QueryFilters.isNumeric(op1) && QueryFilters.isNumeric(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) <= QueryFilters.effectiveTypeValue(op2));
    } else if(QueryFilters.isSimpleLiteral(op1) && QueryFilters.isSimpleLiteral(op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) <= QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("string", op1) && QueryFilters.isXsdType("string", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) <= QueryFilters.effectiveTypeValue(op2));       
    } else if(QueryFilters.isXsdType("boolean", op1) && QueryFilters.isXsdType("boolean", op2)) {
        return QueryFilters.ebvBoolean(QueryFilters.effectiveTypeValue(op1) <= QueryFilters.effectiveTypeValue(op2));
    } else if((QueryFilters.isXsdType("dateTime", op1) || QueryFilters.isXsdType("date", op1)) && 
              (QueryFilters.isXsdType("dateTime", op2) || QueryFilters.isXsdType("date", op2))) {
        if(QueryFilters.isXsdType("dateTime", op1) && QueryFilters.isXsdType("date", op2)) {
            return QueryFilters.ebvFalse();
        }
        if(QueryFilters.isXsdType("date", op1) && QueryFilters.isXsdType("dateTime", op2)) {
            return QueryFilters.ebvFalse();
        }

        var comp = Utils.compareDateComponents(op1.value, op2.value);
        if(comp != null) {
            if(comp != 1) {
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }
        } else {
                return QueryFilters.ebvError();
        }
    } else {
        return QueryFilters.ebvFalse();
    }
};

QueryFilters.runAddition = function(summand, summands, bindings, queryEngine, dataset, env) {
    var summandOp = QueryFilters.runFilter(summand,bindings,queryEngine, dataset, env);
    if(QueryFilters.isEbvError(summandOp)) {
        return QueryFilters.ebvError();
    }

    var acum = summandOp;
    if(QueryFilters.isNumeric(summandOp)) {
        for(var i=0; i<summands.length; i++) {
            var nextSummandOp = QueryFilters.runFilter(summands[i].expression, bindings,queryEngine, dataset, env);
            if(QueryFilters.isNumeric(nextSummandOp)) {
                if(summands[i].operator === '+') {
                    acum = QueryFilters.runSumFunction(acum, nextSummandOp);
                } else if(summands[i].operator === '-') {
                    acum = QueryFilters.runSubFunction(acum, nextSummandOp);
                }
            } else {
                return QueryFilters.ebvFalse();
            }
        }
        return acum;
    } else {
        return QueryFilters.ebvFalse();
    }
};

QueryFilters.runSumFunction = function(suma, sumb) {
    if(QueryFilters.isEbvError(suma) || QueryFilters.isEbvError(sumb)) {
        return QueryFilters.ebvError();
    }
    var val = QueryFilters.effectiveTypeValue(suma) + QueryFilters.effectiveTypeValue(sumb);
    
    if(QueryFilters.isDouble(suma) || QueryFilters.isDouble(sumb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#double", value:val};        
    } else if(QueryFilters.isFloat(suma) || QueryFilters.isFloat(sumb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#float", value:val};        
    } else if(QueryFilters.isDecimal(suma) || QueryFilters.isDecimal(sumb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#decimal", value:val};        
    } else {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:val};        
    }
};

QueryFilters.runSubFunction = function(suma, sumb) {
    if(QueryFilters.isEbvError(suma) || QueryFilters.isEbvError(sumb)) {
        return QueryFilters.ebvError();
    }
    var val = QueryFilters.effectiveTypeValue(suma) - QueryFilters.effectiveTypeValue(sumb);

    if(QueryFilters.isDouble(suma) || QueryFilters.isDouble(sumb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#double", value:val};        
    } else if(QueryFilters.isFloat(suma) || QueryFilters.isFloat(sumb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#float", value:val};        
    } else if(QueryFilters.isDecimal(suma) || QueryFilters.isDecimal(sumb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#decimal", value:val};        
    } else {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:val};        
    }
};

QueryFilters.runMultiplication = function(factor, factors, bindings, queryEngine, dataset, env) {
    var factorOp = QueryFilters.runFilter(factor,bindings,queryEngine, dataset, env);
    if(QueryFilters.isEbvError(factorOp)) {
        return factorOp;
    }

    var acum = factorOp;
    if(QueryFilters.isNumeric(factorOp)) {
        for(var i=0; i<factors.length; i++) {
            var nextFactorOp = QueryFilters.runFilter(factors[i].expression, bindings,queryEngine, dataset, env);
            if(QueryFilters.isEbvError(nextFactorOp)) {
                return factorOp;
            }
            if(QueryFilters.isNumeric(nextFactorOp)) {
                if(factors[i].operator === '*') {
                    acum = QueryFilters.runMulFunction(acum, nextFactorOp);
                } else if(factors[i].operator === '/') {
                    acum = QueryFilters.runDivFunction(acum, nextFactorOp);
                }
            } else {
                return QueryFilters.ebvFalse();
            }
        }
        return acum;
    } else {
        return QueryFilters.ebvFalse();
    }
};

QueryFilters.runMulFunction = function(faca, facb) {
    if(QueryFilters.isEbvError(faca) || QueryFilters.isEbvError(facb)) {
        return QueryFilters.ebvError();
    }
    var val = QueryFilters.effectiveTypeValue(faca) * QueryFilters.effectiveTypeValue(facb);

    if(QueryFilters.isDouble(faca) || QueryFilters.isDouble(facb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#double", value:val};        
    } else if(QueryFilters.isFloat(faca) || QueryFilters.isFloat(facb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#float", value:val};        
    } else if(QueryFilters.isDecimal(faca) || QueryFilters.isDecimal(facb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#decimal", value:val};        
    } else {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:val};        
    }
};

QueryFilters.runDivFunction = function(faca, facb) {
    if(QueryFilters.isEbvError(faca) || QueryFilters.isEbvError(facb)) {
        return QueryFilters.ebvError();
    }
    var val = QueryFilters.effectiveTypeValue(faca) / QueryFilters.effectiveTypeValue(facb);

    if(QueryFilters.isDouble(faca) || QueryFilters.isDouble(facb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#double", value:val};        
    } else if(QueryFilters.isFloat(faca) || QueryFilters.isFloat(facb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#float", value:val};        
    } else if(QueryFilters.isDecimal(faca) || QueryFilters.isDecimal(facb)) {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#decimal", value:val};        
    } else {
        return {token: 'literal', type:"http://www.w3.org/2001/XMLSchema#integer", value:val};        
    }
};

QueryFilters.runBuiltInCall = function(builtincall, args, bindings, queryEngine, dataset, env) {
    if(builtincall === 'notexists' || builtincall === 'exists') {
        // Run the query in the filter applying bindings

        var cloned = JSON.parse(JSON.stringify(args[0])); // @todo CHANGE THIS!!
        var ast = queryEngine.abstractQueryTree.parseSelect({pattern:cloned}, bindings);
        ast = queryEngine.abstractQueryTree.bind(ast.pattern, bindings);

        var result = queryEngine.executeSelectUnit([ {kind:'*'} ], 
                                                   dataset,
                                                   ast,
                                                   env);

        if(builtincall === 'exists') {
            return QueryFilters.ebvBoolean(result.length!==0);            
        } else {
            return QueryFilters.ebvBoolean(result.length===0);            
        }

    }  else {

        var ops = [];
        for(var i=0; i<args.length; i++) {
            if(args[i].token === 'var') {
                ops.push(args[i]);
            } else {
                var op = QueryFilters.runFilter(args[i], bindings, queryEngine, dataset, env);
                if(QueryFilters.isEbvError(op)) {
                    return op;
                }
                ops.push(op);
            }
        }

        if(builtincall === 'str') {
            if(ops[0].token === 'literal') {
                // lexical form literals
                return {token: 'literal', type:null, value:""+ops[0].value}; // type null? or "http://www.w3.org/2001/XMLSchema#string"
            } else if(ops[0].token === 'uri'){
                // codepoint URIs
                return {token: 'literal', type:null, value:ops[0].value}; // idem
            } else {
                return QueryFilters.ebvFalse();
            }
        } else if(builtincall === 'lang') {
            if(ops[0].token === 'literal'){
                if(ops[0].lang != null) {
                    return {token: 'literal', value:""+ops[0].lang};
                } else {
                    return {token: 'literal', value:""};
                }
            } else {
                return QueryFilters.ebvError();
            }
        } else if(builtincall === 'datatype') {
            if(ops[0].token === 'literal'){
                var lit = ops[0];
                if(lit.type != null) {
                    if(typeof(lit.type) === 'string') {
                        return {token: 'uri', value:lit.type, prefix:null, suffix:null};
                    } else {
                        return lit.type;
                    }
                } else if(lit.lang == null) {
                    return {token: 'uri', value:'http://www.w3.org/2001/XMLSchema#string', prefix:null, suffix:null};
                } else {
                    return QueryFilters.ebvError();
                }
            } else {
                return QueryFilters.ebvError();
            }
        } else if(builtincall === 'isliteral') {
            if(ops[0].token === 'literal'){
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }        
        } else if(builtincall === 'isblank') {
            if(ops[0].token === 'blank'){
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }        
        } else if(builtincall === 'isuri' || builtincall === 'isiri') {
            if(ops[0].token === 'uri'){
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }        
        } else if(builtincall === 'sameterm') {
            var op1 = ops[0];
            var op2 = ops[1];
            var res = QueryFilters.RDFTermEquality(op1, op2, queryEngine, env);
            if(QueryFilters.isEbvError(res)) {
                res = false;
            }
            return QueryFilters.ebvBoolean(res);
        } else if(builtincall === 'langmatches') {
            var lang = ops[0];
            var langRange = ops[1];

            if(lang.token === 'literal' && langRange.token === 'literal'){
                if(langRange.value === '*' && lang.value != '') {
                    return QueryFilters.ebvTrue();
                } else {
                    return QueryFilters.ebvBoolean(lang.value.toLowerCase().indexOf(langRange.value.toLowerCase()) === 0)
                }
            } else {
                return QueryFilters.ebvError();
            }        
        } else if(builtincall === 'bound') {
            var boundVar = ops[0].value;
            var acum = [];
            if(boundVar == null) {
                return QueryFilters.ebvError();
            } else  if(bindings[boundVar] != null) {
                return QueryFilters.ebvTrue();
            } else {
                return QueryFilters.ebvFalse();
            }
        } else {
            throw ("Builtin call "+builtincall+" not implemented yet");
        }
    }
};

QueryFilters.runUnaryExpression = function(unaryexpression, expression, bindings, queryEngine, dataset, env) {
    var op = QueryFilters.runFilter(expression, bindings,queryEngine, dataset, env);
    if(QueryFilters.isEbvError(op)) {
        return op;
    }

    if(unaryexpression === '!') {
        var res = QueryFilters.ebv(op);
        //console.log("** Unary ! ");
        //console.log(op)
        if(QueryFilters.isEbvError(res)) {
            //console.log("--- ERROR")
            //console.log(QueryFilters.ebvFalse())
            //console.log("\r\n")

            // ??
            return QueryFilters.ebvFalse();
        } else {
            res = !res;
            //console.log("--- BOOL")
            //console.log(QueryFilters.ebvBoolean(res))
            //console.log("\r\n")

            return QueryFilters.ebvBoolean(res);
        }
    } else if(unaryexpression === '+') {
        if(QueryFilters.isNumeric(op)) {
            return op;
        } else {
            return QueryFilters.ebvError();
        }
    } else if(unaryexpression === '-') {
        if(QueryFilters.isNumeric(op)) {
            var clone = {};
            for(var p in op) {
                clone[p] = op[p];
            }
            clone.value = -clone.value;
            return clone;
        } else {
            return QueryFilters.ebvError();
        }
    }
};

QueryFilters.runRegex = function(text, pattern, flags, bindings, queryEngine, dataset, env) {

    if(text != null) {
        text = QueryFilters.runFilter(text, bindings, queryEngine, dataset, env);
    } else {
        return QueryFilters.ebvError();
    }

    if(pattern != null) {
        pattern = QueryFilters.runFilter(pattern, bindings, queryEngine, dataset, env);
    } else {
        return QueryFilters.ebvError();
    }

    if(flags != null) {
        flags = QueryFilters.runFilter(flags, bindings, queryEngine, dataset, env);
    }


    if(pattern != null && pattern.token === 'literal' && (flags == null || flags.token === 'literal')) {
        pattern = pattern.value;
        flags = (flags == null) ? null : flags.value;
    } else {
        return QueryFilters.ebvError();
    }

    if(text!= null && text.token == 'var') {
        if(bindings[text.value] != null) {
            text = bindings[text.value];
        } else {
            return QueryFilters.ebvError();
        }
    } else if(text!=null && text.token === 'literal') {
        if(text.type == null || QueryFilters.isXsdType("string",text)) {
            text = text.value
        } else {
            return QueryFilters.ebvError();
        }
    } else {
        return QueryFilters.ebvError();
    }

    var regex;
    if(flags == null) {
        regex = new RegExp(pattern);                    
    } else {
        regex = new RegExp(pattern,flags.toLowerCase());
    }
    if(regex.exec(text)) {
        return QueryFilters.ebvTrue();
    } else {
        return QueryFilters.ebvFalse();
    }    
};

QueryFilters.normalizeLiteralDatatype = function(literal, queryEngine, env) {
    if(literal.value.type == null || typeof(literal.value.type) != 'object') {
        return literal;
    } else {
        // type can be parsed as a hash using namespaces
        literal.value.type =  Utils.lexicalFormBaseUri(literal.value.type, env);
        return literal;
    }
};

QueryFilters.runIriRefOrFunction = function(iriref, args, bindings,queryEngine, dataset, env) {
    if(args == null) {
        return iriref;
    } else {
        var ops = [];
        for(var i=0; i<args.length; i++) {
            ops.push(QueryFilters.runFilter(args[i], bindings, queryEngine, dataset, env))
        }

        var fun = Utils.lexicalFormBaseUri(iriref, env);

        if(fun == "http://www.w3.org/2001/XMLSchema#integer" ||
           fun == "http://www.w3.org/2001/XMLSchema#decimal" ||
           fun == "http://www.w3.org/2001/XMLSchema#double" ||
           fun == "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" ||
           fun == "http://www.w3.org/2001/XMLSchema#negativeInteger" ||
           fun == "http://www.w3.org/2001/XMLSchema#long" ||
           fun == "http://www.w3.org/2001/XMLSchema#int" ||
           fun == "http://www.w3.org/2001/XMLSchema#short" ||
           fun == "http://www.w3.org/2001/XMLSchema#byte" ||
           fun == "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" ||
           fun == "http://www.w3.org/2001/XMLSchema#unsignedLong" ||
           fun == "http://www.w3.org/2001/XMLSchema#unsignedInt" ||
           fun == "http://www.w3.org/2001/XMLSchema#unsignedShort" ||
           fun == "http://www.w3.org/2001/XMLSchema#unsignedByte" ||
           fun == "http://www.w3.org/2001/XMLSchema#positiveInteger") {
            var from = ops[0];
            if(from.token === 'literal') {
                from = QueryFilters.normalizeLiteralDatatype(from, queryEngine, env);
                if(from.type == "http://www.w3.org/2001/XMLSchema#integer" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#decimal" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#double" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#negativeInteger" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#long" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#int" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#short" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#byte" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedLong" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedInt" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedShort" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedByte" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#positiveInteger") {
                    from.type = fun;
                    return from;
                } else if(from.type == 'http://www.w3.org/2001/XMLSchema#boolean') {
                    if(QueryFilters.ebv(from) == true) {
                        from.type = fun;
                        from.value = 1;
                    } else {
                        from.type = fun;
                        from.value = 0;
                    }
                    return from;
                } else if(from.type == 'http://www.w3.org/2001/XMLSchema#float' || 
                          from.type == 'http://www.w3.org/2001/XMLSchema#double') {
                    from.type = fun;
                    from.value = parseInt(from.value);
                    return from;
                } else if(from.type == 'http://www.w3.org/2001/XMLSchema#string' || from.type == null) {
                    if(from.value.split(".").length > 2) {
                        return QueryFilters.ebvError();
                    } else if (from.value.split("-").length > 2) {
                        return QueryFilters.ebvError();                            
                    } else if (from.value.split("/").length > 2) {
                        return QueryFilters.ebvError();                            
                    } else if (from.value.split("+").length > 2) {
                        return QueryFilters.ebvError();                            
                    }

                    // @todo improve this with regular expressions for each lexical representation
                    if(fun == "http://www.w3.org/2001/XMLSchema#decimal") {
                        if(from.value.indexOf("e") != -1 || from.value.indexOf("E") != -1) {
                            return QueryFilters.ebvError();
                        }
                    }

                    // @todo improve this with regular expressions for each lexical representation
                    if(fun == "http://www.w3.org/2001/XMLSchema#int" || fun == "http://www.w3.org/2001/XMLSchema#integer") {
                        if(from.value.indexOf("e") != -1 || from.value.indexOf("E") != -1 || from.value.indexOf(".") != -1) {
                            return QueryFilters.ebvError();
                        }
                    }

                    try {
                        from.value = parseInt(parseFloat(from.value));
                        if(isNaN(from.value)) {
                            return QueryFilters.ebvError();
                        } else {
                            from.type = fun;
                            return from;
                        }
                    } catch(e) {
                        return QueryFilters.ebvError();                        
                    }
                } else {
                    return QueryFilters.ebvError();
                }
            } else {
                return QueryFilters.ebvError();
            }
        } else if(fun == "http://www.w3.org/2001/XMLSchema#boolean") { 
            var from = ops[0];
            if(from.token === "literal" && from.type == null) {
                if(from.value === "true" || from.value === "1") {
                    return QueryFilters.ebvTrue();
                } else if(from.value === "false" || from.value === "0" ) {
                    return QueryFilters.ebvFalse();
                } else {
                    return QueryFilters.ebvError();
                }
            } else if(from.token === "literal") {
              if(QueryFilters.isEbvError(from)) {
                  return from;
              } else {
                  return QueryFilters.ebvBoolean(from);
              }
            } else {
                return QueryFilters.ebvError();
            }
        } else if(fun == "http://www.w3.org/2001/XMLSchema#string") { 
            var from = ops[0];
            if(from.token === 'literal') {
                from = QueryFilters.normalizeLiteralDatatype(from, queryEngine, env);
                if(from.type == "http://www.w3.org/2001/XMLSchema#integer" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#decimal" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#double" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#negativeInteger" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#long" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#int" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#short" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#byte" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedLong" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedInt" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedShort" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#unsignedByte" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#positiveInteger" ||
                   from.type == "http://www.w3.org/2001/XMLSchema#float") {
                    from.type = fun;
                    from.value = ""+from.value;
                    return from;
                } else if(from.type == "http://www.w3.org/2001/XMLSchema#string") {
                    return from;
                } else if(from.type == "http://www.w3.org/2001/XMLSchema#boolean") {
                    if(QueryFilters.ebv(from)) {
                        from.type = fun;
                        from.value = 'true';
                    } else {
                        from.type = fun;
                        from.value = 'false';
                    }
                    return from;
                } else if(from.type == "http://www.w3.org/2001/XMLSchema#dateTime" ||
                          from.type == "http://www.w3.org/2001/XMLSchema#date") {
                    from.type = fun;
                    if(typeof(from.value) != 'string') {
                        from.value = Utils.iso8601(from.value);
                    }
                    return from;
                } else if(from.type == null) {
                    from.value = ""+from.value;
                    from.type = fun;
                    return from;
                } else {
                    return QueryFilters.ebvError();
                }
            } else if(from.token === 'uri') {
                return {token: 'literal',
                        value: Utils.lexicalFormBaseUri(from, env),
                        type: fun,
                        lang: null};
            } else {
                return QueryFilters.ebvError();
            }            
        } else if(fun == "http://www.w3.org/2001/XMLSchema#dateTime" || fun == "http://www.w3.org/2001/XMLSchema#date") { 
            from = ops[0];
            if(from.type == "http://www.w3.org/2001/XMLSchema#dateTime" || from.type == "http://www.w3.org/2001/XMLSchema#date") {
                return from;
            } else if(from.type == "http://www.w3.org/2001/XMLSchema#string" || from.type == null) {
                try {
                    from.value = Utils.iso8601(Utils.parseStrictISO8601(from.value));
                    from.type = fun;
                    return from;
                } catch(e) {
                    return QueryFilters.ebvError();
                }
            } else {
                return QueryFilters.ebvError();
            }
        } else if(fun == "http://www.w3.org/2001/XMLSchema#float") { 
            var from = ops[0];
            if(from.token === 'literal') {
                from = QueryFilters.normalizeLiteralDatatype(from, queryEngine, env);
                if(from.type == 'http://www.w3.org/2001/XMLSchema#decimal' || 
                   from.type == 'http://www.w3.org/2001/XMLSchema#int') {
                    from.type = fun;
                    from.value = parseFloat(from.value);
                    return from;
                } else if(from.type == 'http://www.w3.org/2001/XMLSchema#boolean') {
                    if(QueryFilters.ebv(from) == true) {
                        from.type = fun;
                        from.value = 1.0;
                    } else {
                        from.type = fun;
                        from.value = 0.0;
                    }
                    return from;
                } else if(from.type == 'http://www.w3.org/2001/XMLSchema#float' || 
                          from.type == 'http://www.w3.org/2001/XMLSchema#double') {
                    from.type = fun;
                    from.value = parseFloat(from.value);
                    return from;
                } else if(from.type == 'http://www.w3.org/2001/XMLSchema#string') {
                    try {
                        from.value = parseFloat(from.value);
                        if(isNaN(from.value)) {
                            return QueryFilters.ebvError();
                        } else {
                            from.type = fun;
                            return from;
                        }
                    } catch(e) {
                        return QueryFilters.ebvError();                        
                    }
                } else if(from.type == null) {
                    // checking some exceptions that are parsed as Floats by JS
                    if(from.value.split(".").length > 2) {
                        return QueryFilters.ebvError();
                    } else if (from.value.split("-").length > 2) {
                        return QueryFilters.ebvError();                            
                    } else if (from.value.split("/").length > 2) {
                        return QueryFilters.ebvError();                            
                    } else if (from.value.split("+").length > 2) {
                        return QueryFilters.ebvError();                            
                    }

                    try {
                        from.value = parseFloat(from.value);
                        if(isNaN(from.value)) {
                            return QueryFilters.ebvError();
                        } else {
                            from.type = fun;
                            return from;
                        }
                    } catch(e) {
                        return QueryFilters.ebvError();                        
                    }
                } else {
                    return QueryFilters.ebvError();
                }
            } else {
                return QueryFilters.ebvError();
            }
        } else {
            // unknown function
            return QueryFilters.ebvError();
        }
    }
};

// end of ./src/js-query-engine/src/query_filters.js 
// exports
var QueryPlanDPSize = {};

QueryPlanDPSize.variablesInBGP = function(bgp) {
    // may be cached in the pattern
    var variables = bgp.variables;
    if(variables) {
        return variables;
    }

    var components =  bgp.value || bgp;
    variables  = [];
    for(var comp in components) {
        if(components[comp] && components[comp].token === "var") {
            variables.push(components[comp].value);
        } else if(components[comp] && components[comp].token === "blank") {
            variables.push("blank:"+components[comp].value);
        }
    }
    bgp.variables = variables;

    return variables;
};

QueryPlanDPSize.connected = function(leftPlan, rightPlan) {
    var varsLeft ="/"+leftPlan.vars.join("/")+"/";
    for(var i=0; i<rightPlan.vars.length; i++) {
        if(varsLeft.indexOf("/"+rightPlan.vars[i]+"/") != -1) {
            return true;
        }
    }

    return false;
};

QueryPlanDPSize.variablesIntersectionBGP = function(bgpa, bgpb) {
    var varsa = QueryPlanDPSize.variablesInBGP(bgpa).sort();
    var varsb = QueryPlanDPSize.variablesInBGP(bgpb).sort();
    var ia = 0;
    var ib = 0;

    var intersection = [];

    while(ia<varsa.length && ib<varsb.length) {
        if(varsa[ia] === varsb[ib]) {
            intersection.push(varsa[ia]);
            ia++;
            ib++;
        } else if(varsa[ia] < varsb[ib]) {
            ia++;
        } else {
            ib++;
        }
    }

    return intersection;
};

/**
 * All BGPs sharing variables are grouped together.
 */
QueryPlanDPSize.executeAndBGPsGroups = function(bgps) {
    var groups = {};
    var groupVars = {};
    var groupId = 0;

    for(var i=0; i<bgps.length; i++) {
        var bgp = bgps[i];
	var newGroups = {};
	var newGroupVars = {};

        var vars = [];
        for(var comp in bgp) {
            if(comp != '_cost') {
                if(bgp[comp].token === 'var') {
                    vars.push(bgp[comp].value);
                } else if(bgp[comp].token === 'blank') {
                    vars.push(bgp[comp].value);
                }
            }
        }

	
        var foundGroup = false;
	var currentGroupId = null;
	var toDelete = [];
	var toJoin = {};

        for(var nextGroupId in groupVars) {
            var groupVar = groupVars[nextGroupId];
	    foundGroup = false;
            for(var j=0; j<vars.length; j++) {
                var thisVar = "/"+vars[j]+"/";
                if(groupVar.indexOf(thisVar) != -1) {
		    foundGroup = true;
		    break;
                }
            }

	    if(foundGroup) {
		toJoin[nextGroupId] = true;
	    } else {
		newGroups[nextGroupId] = groups[nextGroupId];

		newGroupVars[nextGroupId] = groupVars[nextGroupId];
	    }
        }

        if(!foundGroup) {
            newGroups[groupId] = [bgp];
            newGroupVars[groupId] = "/"+(vars.join("/"))+"/";
            groupId++;
        } else {
	    var acumGroups = [];
	    var acumId = "";
	    var acumVars = "";

	    for(var gid in toJoin) {
		acumId = acumId+gid;
		acumGroups = acumGroups.concat(groups[gid]);
		acumVars = groupVars[gid];
	    }

	    acumVars = acumVars + vars.join("/") + "/";
	    acumGroups.push(bgp);

	    newGroups[acumId] = acumGroups;
	    newGroupVars[acumId] = acumVars;
	}

	groups = newGroups;
	groupVars = newGroupVars;
    }

    var acum = [];
    for(var groupId in groups) {
        acum.push(groups[groupId]);
    }

    return acum;
};

QueryPlanDPSize.intersectionSize = function(leftPlan, rightPlan) {
    var idsRight = rightPlan.i.split("_");
    for(var i=0; i<idsRight.length; i++) {
        if(idsRight[i]=="")
            continue;
        if(leftPlan.i.indexOf('_'+idsRight[i]+'_') != -1) {
            return 1; // we just need to know if this value is >0
        }
    }
    return 0;
};

QueryPlanDPSize.createJoinTree = function(leftPlan, rightPlan) {
    var varsLeft ="/"+leftPlan.vars.join("/")+"/";
    var acumVars = leftPlan.vars.concat([]);
    var join = [];

    for(var i=0; i<rightPlan.vars.length; i++) {
        if(varsLeft.indexOf("/"+rightPlan.vars[i]+"/") != -1) {
            if(rightPlan.vars[i].indexOf("_:") == 0) {
                join.push("blank:"+rightPlan.vars[i]);
            } else {
                join.push(rightPlan.vars[i]);
            }
        } else {
            acumVars.push(rightPlan.vars[i]);
        }
    }

    var rightIds = rightPlan.i.split("_");
    var leftIds = leftPlan.i.split("_");
    var distinct = {};
    for(var i=0; i<rightIds.length; i++) {
        if(rightIds[i] != "") {
            distinct[rightIds[i]] = true;
        }
    }
    for(var i=0; i<leftIds.length; i++) {
        if(leftIds[i] != "") {
            distinct[leftIds[i]] = true;
        }
    }
    var ids = [];
    for(var id in distinct) {
        ids.push(id);
    }

    // new join tree
    return {
        left: leftPlan,
        right: rightPlan,
        cost: leftPlan.cost+rightPlan.cost,
        i: "_"+(ids.sort().join("_"))+"_",
        vars: acumVars,
        join: join
    };
};

QueryPlanDPSize.executeBushyTree = function(treeNode, dataset, queryEngine, env) {
    if(treeNode.left == null ) {
        return QueryPlanDPSize.executeEmptyJoinBGP(treeNode.right, dataset, queryEngine, env);
    } else if(treeNode.right == null) {
        return QueryPlanDPSize.executeEmptyJoinBGP(treeNode.left, dataset, queryEngine, env);
    } else {
        var resultsLeft = QueryPlanDPSize.executeBushyTree(treeNode.left, dataset, queryEngine, env);

        if(resultsLeft!=null) {
            var resultsRight = QueryPlanDPSize.executeBushyTree(treeNode.right, dataset, queryEngine, env);
            if(resultsRight!=null) {
                return QueryPlanDPSize.joinBindings2(treeNode.join, resultsLeft, resultsRight);
            } else {
                return null;
            }
        }
    }
};


QueryPlanDPSize.executeAndBGPsDPSize = function(allBgps, dataset, queryEngine, env) {
    var groups = QueryPlanDPSize.executeAndBGPsGroups(allBgps);
    var groupResults = [];
    for(var g=0; g<groups.length; g++) {

        // Build bushy tree for this group
        var bgps = groups[g];
        var costFactor = 1;

	var bgpas = queryEngine.computeCosts(bgps,env);

        var bestPlans = {};
        var plans = {};
        var sizes = {};

        var maxSize = 1;
        var maxPlan = null;

        var cache = {};
        
        sizes['1'] = [];

        // Building plans of size 1
        for(var i=0; i<bgps.length; i++) {
            var vars = [];
            for(var comp in bgps[i]) {
                if(comp != '_cost') {
                    if(bgps[i][comp].token === 'var') {
                        vars.push(bgps[i][comp].value);
                    } else if(bgps[i][comp].token === 'blank') {
                        vars.push(bgps[i][comp].value);
                    }
                }
            }

            plans["_"+i+"_"] = {left: bgps[i], right:null, cost:bgps[i]._cost, i:('_'+i+'_'), vars:vars};
            var plan = {left: bgps[i], right:null, cost:bgps[i]._cost, i:('_'+i+'_'), vars:vars};
            bestPlans["_"+i+"_"] = plan;
            delete bgps[i]['_cost'];
            cache["_"+i+"_"] = true;
            sizes['1'].push("_"+i+"_");
            if(maxPlan == null || maxPlan.cost>plan.cost) {
                maxPlan = plan;
            }
        }

        // dynamic programming -> build plans of increasing size
        for(var s=2; s<=bgps.length; s++) { // size
            for(var sl=1; sl<s; sl++) { // size left plan
                var sr = s - sl; // size right plan
                var leftPlans = sizes[''+sl] || [];
                var rightPlans = sizes[''+sr] || [];

                for(var i=0; i<leftPlans.length; i++) {
                    for(var j=0; j<rightPlans.length; j++) {
                        if(leftPlans[i]===rightPlans[j])
                            continue;
                        var leftPlan = plans[leftPlans[i]];
                        var rightPlan = plans[rightPlans[j]];

                        // condition (1)
                        if(QueryPlanDPSize.intersectionSize(leftPlan, rightPlan) == 0) {
                            // condition (2)

                            if(QueryPlanDPSize.connected(leftPlan,rightPlan)) {
                                maxSize = s;
                                var p1 = bestPlans[leftPlan.i];  //QueryPlanDPSize.bestPlan(leftPlan, bestPlans);
                                var p2 = bestPlans[rightPlan.i]; //QueryPlanDPSize.bestPlan(rightPlan, bestPlans);

                                var currPlan = QueryPlanDPSize.createJoinTree(p1,p2);

                                if(!cache[currPlan.i]) {
                                    cache[currPlan.i] = true;

                                    var costUnion = currPlan.cost+1;
                                    if(bestPlans[currPlan.i] != null) {
                                        costUnion = bestPlans[currPlan.i].cost;
                                    }
                                    
                                    var acum = sizes[s] || [];
                                    acum.push(currPlan.i);
                                    plans[currPlan.i] = currPlan;
                                    sizes[s] = acum;
                                    
                                    if(costUnion > currPlan.cost) {
                                        if(maxSize === s) {
                                            maxPlan = currPlan;
                                        }
                                        bestPlans[currPlan.i] = currPlan;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        groupResults.push(maxPlan);
    }


    // now execute the Bushy trees and perform
    // cross products between groups
    var acum = null;

    for(var g=0; g<groupResults.length; g++) {
        var tree = groupResults[g];
        var result = QueryPlanDPSize.executeBushyTree(tree, dataset, queryEngine, env);
        if(acum == null) {
            acum = result;
        } else {
	    //console.log("\n\n\nJOINING");
	    //console.log(acum);
	    //console.log(result);
            acum = QueryPlanDPSize.crossProductBindings(acum, result);
        }
    };

    //console.log("ACUM");
    //console.log(acum);

    return acum;
};

QueryPlanDPSize.executeEmptyJoinBGP = function(bgp, dataset, queryEngine, queryEnv) {
    return QueryPlanDPSize.executeBGPDatasets(bgp, dataset, queryEngine, queryEnv);
};


QueryPlanDPSize.executeBGPDatasets = function(bgp, dataset, queryEngine, queryEnv) {
    // avoid duplicate queries in the same graph
    // merge of graphs is not guaranted here.
    var duplicates = {};

    if(bgp.graph == null) {
        //union through all default graph(s)
        var acum = [];
        for(var i=0; i<dataset.implicit.length; i++) {
            if(duplicates[dataset.implicit[i].oid] == null) {
                duplicates[dataset.implicit[i].oid] = true;
                bgp.graph = dataset.implicit[i];//.oid
                var results = queryEngine.rangeQuery(bgp, queryEnv);
                results = QueryPlanDPSize.buildBindingsFromRange(results, bgp);
                acum.push(results);
            }
        }
        var acumBindings = QueryPlanDPSize.unionManyBindings(acum);

        return acumBindings;
    } else if(bgp.graph.token === 'var') {
        // union through all named datasets
        var graphVar = bgp.graph.value;        
        var acum = [];

        for(var i=0; i<dataset.named.length; i++) {
            if(duplicates[dataset.named[i].oid] == null) {
                duplicates[dataset.named[i].oid] = true;
                bgp.graph = dataset.named[i];//.oid
                
                var results = queryEngine.rangeQuery(bgp, queryEnv);
                if(results != null) {
                    results = QueryPlanDPSize.buildBindingsFromRange(results, bgp);
                    // add the graph bound variable to the result 
                    for(var j=0; j< results.length; j++) {
                        results[j][graphVar] = dataset.named[i].oid;
                    }
                    acum.push(results);
                } else {
                    return null;
                }
            }
        }
        
        var acumBindings = QueryPlanDPSize.unionManyBindings(acum||[]);
        return acumBindings;

    } else {
        // graph already has an active value, just match.
        // Filtering the results will still be necessary
        var results = queryEngine.rangeQuery(bgp, queryEnv);
        if(results!=null) {
            results = QueryPlanDPSize.buildBindingsFromRange(results, bgp);
            return results;
        } else {
            return null;
        }
    }
};

QueryPlanDPSize.buildBindingsFromRange = function(results, bgp) {
    var variables = QueryPlanDPSize.variablesInBGP(bgp);
    var bindings = {};

    var components =  bgp.value||bgp;
    var bindings = {};
    for(comp in components) {
        if(components[comp] && components[comp].token === "var") {
            bindings[comp] = components[comp].value;
        } else if(components[comp] && components[comp].token === "blank") {
            bindings[comp] = "blank:"+components[comp].value;
        }
    }

    var resultsBindings =[];

    if(results!=null) {
      for(var i=0; i<results.length; i++) {
          var binding = {};
          var result  = results[i];
          for(var comp in bindings) {
              var value = result[comp];
              binding[bindings[comp]] = value;
          }
          resultsBindings.push(binding);
      }
    }

    return resultsBindings;
};


// @used
QueryPlanDPSize.areCompatibleBindings = function(bindingsa, bindingsb) {
    for(var variable in bindingsa) {
        if(bindingsb[variable]!=null && (bindingsb[variable] != bindingsa[variable])) {
            return false;
        }
    }

    return true;
};

//QueryPlanDPSize.areCompatibleBindingsStrict = function(bindingsa, bindingsb) {
//    var foundSome = false;
//    for(var variable in bindingsa) {
// 	if(bindingsb[variable]!=null && (bindingsb[variable] != bindingsa[variable])) {
// 	    return false;
// 	} else if(bindingsb[variable] == bindingsa[variable]){
// 	    foundSome = true;
// 	}
//    }
//     
//    return foundSome;
//};



QueryPlanDPSize.mergeBindings = function(bindingsa, bindingsb) {
    var merged = {};
    for(var variable in bindingsa) {
        merged[variable] = bindingsa[variable];
    }

    for(var variable in bindingsb) {
        merged[variable] = bindingsb[variable];
    }

    return merged;
};

QueryPlanDPSize.joinBindings2 = function(bindingVars, bindingsa, bindingsb) {
    var acum = {};
    var bindings, variable, variableValue, values, tmp;
    var joined = [];

    for(var i=0; i<bindingsa.length; i++) {
        bindings = bindingsa[i];
        tmp = acum;
        for(var j=0; j<bindingVars.length; j++) {
            variable = bindingVars[j];
            variableValue = bindings[variable];
            if(j == bindingVars.length-1) {
                values = tmp[variableValue] || [];
                values.push(bindings);
                tmp[variableValue] = values;
            } else {
                values = tmp[variableValue] || {};
                tmp[variableValue] = values;
                tmp = values;
            }
        }
    }

    for(var i=0; i<bindingsb.length; i++) {
        bindings = bindingsb[i];
        tmp = acum;
        for(var j=0; j<bindingVars.length; j++) {
            variable = bindingVars[j];
            variableValue = bindings[variable];

            if(tmp[variableValue] != null) {
                if(j == bindingVars.length-1) {
                    for(var k=0; k<tmp[variableValue].length; k++) {
                        joined.push(QueryPlanDPSize.mergeBindings(tmp[variableValue][k],bindings));
                    }
                } else {
                    tmp = tmp[variableValue];
                }
            }
        }
    }

    return joined;
};

QueryPlanDPSize.joinBindings = function(bindingsa, bindingsb) {
    var result = [];

    for(var i=0; i< bindingsa.length; i++) {
        var bindinga = bindingsa[i];
        for(var j=0; j<bindingsb.length; j++) {
            var bindingb = bindingsb[j];
            if(QueryPlanDPSize.areCompatibleBindings(bindinga, bindingb)){
                result.push(QueryPlanDPSize.mergeBindings(bindinga, bindingb));
            }
        }
    }
    return result;
};

QueryPlanDPSize.augmentMissingBindings = function(bindinga, bindingb) {
    for(var pb in bindingb) {
        if(bindinga[pb] == null) {
            bindinga[pb] = null;
        }
    }
    return bindinga;
};

/*
  QueryPlanDPSize.diff = function(bindingsa, biundingsb) {
  var result = [];

  for(var i=0; i< bindingsa.length; i++) {
  var bindinga = bindingsa[i];
  var matched = false;
  for(var j=0; j<bindingsb.length; j++) {
  var bindingb = bindingsb[j];
  if(QueryPlanDPSize.areCompatibleBindings(bindinga, bindingb)){
  matched = true;
  result.push(QueryPlanDPSize.mergeBindings(bindinga, bindingb));
  }
  }
  if(matched === false) {
  // missing bindings must be present for further processing
  // e.g. filtering by not present value (see DAWG tests
  // bev-6)
  QueryPlanDPSize.augmentMissingBindings(bindinga, bindingb);
  result.push(bindinga);
  }
  }

  return result;    
  };
*/

QueryPlanDPSize.leftOuterJoinBindings = function(bindingsa, bindingsb) {
    var result = [];
    // strict was being passes ad an argument
    //var compatibleFunction = QueryPlanDPSize.areCompatibleBindings;
    //if(strict === true)
    // 	compatibleFunction = QueryPlanDPSize.areCompatibleBindingsStrict;

    for(var i=0; i< bindingsa.length; i++) {
        var bindinga = bindingsa[i];
        var matched = false;
        for(var j=0; j<bindingsb.length; j++) {
            var bindingb = bindingsb[j];
            if(QueryPlanDPSize.areCompatibleBindings(bindinga, bindingb)){
                matched = true;
                result.push(QueryPlanDPSize.mergeBindings(bindinga, bindingb));
            }
        }
        if(matched === false) {
            // missing bindings must be present for further processing
            // e.g. filtering by not present value (see DAWG tests
            // bev-6)
            // augmentMissingBindings set their value to null.
            QueryPlanDPSize.augmentMissingBindings(bindinga, bindingb);
            result.push(bindinga);
        }
    }
    return result;
};

QueryPlanDPSize.crossProductBindings = function(bindingsa, bindingsb) {
    var result = [];

    for(var i=0; i< bindingsa.length; i++) {
        var bindinga = bindingsa[i];
        for(var j=0; j<bindingsb.length; j++) {
            var bindingb = bindingsb[j];
            result.push(QueryPlanDPSize.mergeBindings(bindinga, bindingb));
        }
    }

    return result;
};

QueryPlanDPSize.unionBindings = function(bindingsa, bindingsb) {
    return bindingsa.concat(bindingsb);
};

QueryPlanDPSize.unionManyBindings = function(bindingLists) {
    var acum = [];
    for(var i=0; i<bindingLists.length; i++) {
        var bindings = bindingLists[i];
        acum = QueryPlanDPSize.unionBindings(acum, bindings);
    }

    return acum;
};

// end of ./src/js-query-engine/src/query_plan_sync_dpsize.js 
// exports
var QueryEngine = {};

//imports
var QueryPlan = QueryPlanDPSize;
QueryEngine.QueryEngine = function(params) {
    if(arguments.length != 0) {
        this.backend = params.backend;
        this.lexicon = params.lexicon;
        // batch loads should generate events?
        this.eventsOnBatchLoad = (params.eventsOnBatchLoad || false);
        // list of namespaces that will be automatically added to every query
        this.defaultPrefixes = {};
        this.abstractQueryTree = new AbstractQueryTree.AbstractQueryTree();
        this.callbacksBackend = new Callbacks.CallbacksBackend(this);
    }
};

// Utils
QueryEngine.QueryEngine.prototype.registerNsInEnvironment = function(prologue, env) {
    var prefixes = [];
    if(prologue != null && prologue.prefixes != null) {
	prefixes =prologue.prefixes;
    }
    var toSave = {};

    // adding default prefixes;
    for(var p in this.defaultPrefixes) {
        toSave[p] = this.defaultPrefixes[p];
    }

    for(var i=0; i<prefixes.length; i++) {
        var prefix = prefixes[i];
        if(prefix.token === "prefix") {
            toSave[prefix.prefix] = prefix.local;
        }
    }

    env.namespaces = toSave;
    if(prologue!=null && prologue.base && typeof(prologue.base) === 'object') {
        env.base = prologue.base.value;
    } else {
        env.base = null;
    }
};

QueryEngine.QueryEngine.prototype.applyModifier = function(modifier, projectedBindings) {
    if(modifier == "DISTINCT") {
        var map = {};
        var result = [];
        for(var i=0; i<projectedBindings.length; i++) {
            var bindings = projectedBindings[i];
            var key = "";
         
            // if no projection variables hash is passed, all the bound
            // variable in the current bindings will be used.
            for(var p in (bindings)) {
                // hashing the object
                var obj = bindings[p];
                if(obj == null) {
                    key = key+p+'null';
                } else if(obj.token == 'literal') {
                    if(obj.value != null) {
                        key = key + obj.value;
                    }
                    if(obj.lang != null) {
                        key = key + obj.lang;
                    }
                    if(obj.type != null) {
                        key = key + obj.type;
                    }
                } else if(obj.value) {
                    key  = key + p + obj.value;
                } else {
                    key = key + p + obj;
                }
            }
         
            if(map[key] == null) {
                // this will preserve the order in projectedBindings
                result.push(bindings);
                map[key] = true;
            }
        }
        return result; 
    } else {
        return projectedBindings;
    }
};

QueryEngine.QueryEngine.prototype.applyLimitOffset = function(offset, limit, bindings) {
    if(limit == null && offset == null) {
        return bindings;
    }

    if (offset == null) {
        offset = 0;
    }

    if(limit == null) {
        limit = bindings.length;
    } else {
        limit = offset + limit;
    }

    return bindings.slice(offset, limit);
};


QueryEngine.QueryEngine.prototype.applySingleOrderBy = function(orderFilters, modifiedBindings, dataset, outEnv) {
    var acum = [];
    for(var i=0; i<orderFilters.length; i++) {
        var orderFilter = orderFilters[i];
        var results = QueryFilters.collect(orderFilter.expression, [modifiedBindings], dataset, outEnv, this);
        acum.push(results[0].value);
    }
    return {binding:modifiedBindings, value:acum};
};

QueryEngine.QueryEngine.prototype.applyOrderBy = function(order, modifiedBindings, dataset, outEnv) {
    var that = this;
    var acum = [];
    if(order != null && order.length > 0) {
        for(var i=0; i<modifiedBindings.length; i++) {
            var bindings = modifiedBindings[i];
            var results = that.applySingleOrderBy(order, bindings, dataset, outEnv);
            acum.push(results);
        }

        acum.sort(function(a,b){
            return that.compareFilteredBindings(a, b, order, outEnv);
        });

        var toReturn = [];
        for(var i=0; i<acum.length; i++) {
            toReturn.push(acum[i].binding);
        }

        return toReturn;
    } else {
        return modifiedBindings;
    }
};

QueryEngine.QueryEngine.prototype.compareFilteredBindings = function(a, b, order, env) {
    var found = false;
    var i = 0;
    while(!found) {
        if(i==a.value.length) {
            return 0;
        }
        var direction = order[i].direction;
        var filterResult;

        // unbound first
        if(a.value[i] == null && b.value[i] == null) {
            i++;
            continue;
        }else if(a.value[i] == null) {
            filterResult = {value: false};
        } else if(b.value[i] == null) {
            filterResult = {value: true};
        } else 

        // blanks
        if(a.value[i].token === 'blank' && b.value[i].token === 'blank') {
            i++;
            continue;
        } else if(a.value[i].token === 'blank') { 
            filterResult = {value: false};            
        } else if(b.value[i].token === 'blank') {
            filterResult = {value: true};        
        } else 

        // uris
        if(a.value[i].token === 'uri' && b.value[i].token === 'uri') {
            if(QueryFilters.runEqualityFunction(a.value[i], b.value[i], [], this, env).value == true) {
                i++;
                continue;
            } else {
                filterResult = QueryFilters.runTotalGtFunction(a.value[i], b.value[i], []);
            }
        } else if(a.value[i].token === 'uri') { 
            filterResult = {value: false};            
        } else if(b.value[i].token === 'uri') {
            filterResult = {value: true};        
        } else 

        // simple literals
        if(a.value[i].token === 'literal' && b.value[i].token === 'literal' && a.value[i].type == null && b.value[i].type == null) {
            if(QueryFilters.runEqualityFunction(a.value[i], b.value[i], [], this, env).value == true) {
                i++;
                continue;
            } else {
                filterResult = QueryFilters.runTotalGtFunction(a.value[i], b.value[i], []);
            }
        } else if(a.value[i].token === 'literal' && a.value[i].type == null) { 
            filterResult = {value: false};            
        } else if(b.value[i].token === 'literal' && b.value[i].type == null) {
            filterResult = {value: true};        
        } else 

        // literals
        if(QueryFilters.runEqualityFunction(a.value[i], b.value[i], [], this, env).value == true) {
            i++;
            continue;
        } else {
            filterResult = QueryFilters.runTotalGtFunction(a.value[i], b.value[i], []);
        }     


        // choose value for comparison based on the direction
        if(filterResult.value == true) {
            if(direction === "ASC") {
                return 1;
            } else {
                return -1;
            }
        } else {
            if(direction === "ASC") {
                return -1;
            } else {
                return 1;
            }
        }       
    }
};

QueryEngine.QueryEngine.prototype.removeDefaultGraphBindings = function(bindingsList, dataset) {
    var onlyDefaultDatasets = [];
    var namedDatasetsMap = {};
    for(var i=0; i<dataset.named.length; i++) {
        namedDatasetsMap[dataset.named[i].oid] = true;
    }
    for(i=0; i<dataset.implicit.length; i++) {
        if(namedDatasetsMap[dataset.implicit[i].oid] == null) {
            onlyDefaultDatasets.push(dataset.implicit[i].oid);
        }
    }
    var acum = [];
    for(i=0; i<bindingsList.length; i++) {
        var bindings = bindingsList[i];
        var foundDefaultGraph = false;
        for(var p in bindings) {
            for(var j=0; j<namedDatasetsMap.length; j++) {
                if(bindings[p] === namedDatasetsMap[j]) {
                    foundDefaultGraph = true;
                    break;
                }
            }
            if(foundDefaultGraph) {
                break;
            }
        }
        if(!foundDefaultGraph) {
            acum.push(bindings);
        }
    }

    return acum;
};


QueryEngine.QueryEngine.prototype.aggregateBindings = function(projection, bindingsGroup, dataset, env) {
    var denormBindings = this.copyDenormalizedBindings(bindingsGroup, env.outCache);
    var aggregatedBindings = {};
    for(var i=0; i<projection.length; i++) {
        var aggregatedValue = QueryFilters.runAggregator(projection[i], denormBindings, this, dataset, env);
        if(projection[i].alias) {
            aggregatedBindings[projection[i].alias.value] = aggregatedValue; 
        } else {
            aggregatedBindings[projection[i].value.value] = aggregatedValue; 
        }
    }
    return(aggregatedBindings);
};


QueryEngine.QueryEngine.prototype.projectBindings = function(projection, results, dataset) {
    if(projection[0].kind === '*') {
        return results;
    } else {
        var projectedResults = [];

        for(var i=0; i<results.length; i++) {
            var currentResult = results[i];
            var currentProjected = {};
            var shouldAdd = true;

            for(var j=0; j< projection.length; j++) {
                if(projection[j].token == 'variable' && projection[j].kind != 'aliased') {
                    currentProjected[projection[j].value.value] = currentResult[projection[j].value.value];
                } else if(projection[j].token == 'variable' && projection[j].kind == 'aliased') {
                    var ebv = QueryFilters.runFilter(projection[j].expression, currentResult, this, dataset, {blanks:{}, outCache:{}});
                    if(QueryFilters.isEbvError(ebv)) {
                        shouldAdd = false;
                        break;
                    } else {
                        currentProjected[projection[j].alias.value] = ebv;
                    }
                }
            }

            if(shouldAdd === true) {
                projectedResults.push(currentProjected);
            }
            
        }

        return projectedResults;
    }
};

QueryEngine.QueryEngine.prototype.resolveNsInEnvironment = function(prefix, env) {
    var namespaces = env.namespaces;
    return namespaces[prefix];
};

QueryEngine.QueryEngine.prototype.termCost = function(term, env) {
    if(term.token === 'uri') {
        var uri = Utils.lexicalFormBaseUri(term, env);
        if(uri == null) {
            return(0);
        } else {
            return(this.lexicon.resolveUriCost(uri));
        }

    } else if(term.token === 'literal') {
        var lexicalFormLiteral = Utils.lexicalFormLiteral(term, env);
        return(this.lexicon.resolveLiteralCost(lexicalFormLiteral));
    } else if(term.token === 'blank') {
        var label = term.value;
        return this.lexicon.resolveBlankCost(label);
    } else if(term.token === 'var') {
        return (this.lexicon.oidCounter/3)
    } else {
          return(null);
    }
    
};

QueryEngine.QueryEngine.prototype.normalizeTerm = function(term, env, shouldIndex) {
    if(term.token === 'uri') {
        var uri = Utils.lexicalFormBaseUri(term, env);
        if(uri == null) {
            return(null);
        } else {
            if(shouldIndex) {
                return(this.lexicon.registerUri(uri));
            } else {
                return(this.lexicon.resolveUri(uri));
            }
        }

    } else if(term.token === 'literal') {
        var lexicalFormLiteral = Utils.lexicalFormLiteral(term, env);
        if(shouldIndex) {
           var oid = this.lexicon.registerLiteral(lexicalFormLiteral);
            return(oid);
        } else {
            var oid = this.lexicon.resolveLiteral(lexicalFormLiteral);
            return(oid);
        }
    } else if(term.token === 'blank') {
        var label = term.value;
        var oid = env.blanks[label];
        if( oid != null) {
            return(oid);
        } else {
            if(shouldIndex) {
                var oid = this.lexicon.registerBlank(label);
                env.blanks[label] = oid;
                return(oid);
            } else {
                var oid = this.lexicon.resolveBlank(label);
                env.blanks[label] = oid;
                return(oid);
            }
        }
    } else if(term.token === 'var') {
        return(term.value);
    } else {
          return(null);
    }
};

QueryEngine.QueryEngine.prototype.normalizeDatasets = function(datasets, outerEnv, callback) {
    var that = this;
    for(var i=0; i<datasets.length; i++) {
        var dataset = datasets[i];
        if(dataset.value === that.lexicon.defaultGraphUri) {
            dataset.oid = that.lexicon.defaultGraphOid;
        } else {
            var oid = that.normalizeTerm(dataset, outerEnv, false);      
            if(oid != null) {
                dataset.oid = oid;
            } else {
                return(null);
            }
        }  
    }

    return true
};

QueryEngine.QueryEngine.prototype.normalizeQuad = function(quad, queryEnv, shouldIndex) {
    var subject    = null;
    var predicate  = null;
    var object     = null;
    var graph      = null;
    var oid;

    if(quad.graph == null) {
        graph = 0; // default graph
    } else {
        oid = this.normalizeTerm(quad.graph, queryEnv, shouldIndex);
        if(oid!=null) {
            graph = oid;
            if(shouldIndex === true && quad.graph.token!='var')
                this.lexicon.registerGraph(oid);
        } else {
            return null;
        }
    }

    oid = this.normalizeTerm(quad.subject, queryEnv, shouldIndex);
    if(oid!=null) {
        subject = oid;
    } else {
        return null
    }

    oid = this.normalizeTerm(quad.predicate, queryEnv, shouldIndex);
    if(oid!=null) {
        predicate = oid;
    } else {
        return null
    }

    oid = this.normalizeTerm(quad.object, queryEnv, shouldIndex);
    if(oid!=null) {
        object = oid;
    } else {
        return null
    }

    return({subject:subject, 
            predicate:predicate, 
            object:object, 
            graph:graph});
};

QueryEngine.QueryEngine.prototype.quadCost = function(quad, queryEnv, shouldIndex) {
    var subject    = null;
    var predicate  = null;
    var object     = null;
    var graph      = null;

    if(quad.graph == null) {
        graph = (this.lexicon.oidCounter/4)
    } else {
        graph = this.termCost(quad.graph, queryEnv)
    }

    subject = this.termCost(quad.subject, queryEnv);
    predicate = this.termCost(quad.predicate, queryEnv);
    object = this.termCost(quad.object, queryEnv);

    return(graph+subject+predicate+object);
};

QueryEngine.QueryEngine.prototype.denormalizeBindingsList = function(bindingsList, env) {
    var results = [];

    for(var i=0; i<bindingsList.length; i++) {
        var result = this.denormalizeBindings(bindingsList[i], env);
        results.push(result);
    }
    return(results);
};

/**
 * Receives a bindings map (var -> oid) and an out cache (oid -> value)
 * returns a bindings map (var -> value) storing in cache all the missing values for oids
 *
 * This is required just to save lookups when final results are generated.
 */
QueryEngine.QueryEngine.prototype.copyDenormalizedBindings = function(bindingsList, out, callback) {
    var denormList = [];
    for(var i=0; i<bindingsList.length; i++) {
        var denorm = {};
        var bindings = bindingsList[i];
        var variables = Utils.keys(bindings);
        for(var j=0; j<variables.length; j++) {
            var oid = bindings[variables[j]];
            if(oid == null) {
                // this can be null, e.g. union different variables (check SPARQL recommendation examples UNION)
                denorm[variables[j]] = null;
            } else if(typeof(oid) === 'object') {
                // the binding is already denormalized, this can happen for example because the value of the
                // binding is the result of the aggregation of other bindings in a GROUP clause
                denorm[variables[j]] = oid;
            } else {
                var inOut = out[oid];
                if(inOut!= null) {
                    denorm[variables[j]] = inOut;
                } else {                    
                    var val = this.lexicon.retrieve(oid);
                    out[oid] = val;
                    denorm[variables[j]] = val;
                }
            }
        }
        denormList.push(denorm);
    }
    return denormList;
};

QueryEngine.QueryEngine.prototype.denormalizeBindings = function(bindings, env, callback) {
    var variables = Utils.keys(bindings);
    var envOut = env.outCache;
    for(var i=0; i<variables.length; i++) {
        var oid = bindings[variables[i]];
        if(oid == null) {
            // this can be null, e.g. union different variables (check SPARQL recommendation examples UNION)
            bindings[variables[i]] = null;
        } else {
            if(envOut[oid] != null) {
                bindings[variables[i]] = envOut[oid];
            } else {
                var val = this.lexicon.retrieve(oid);
                bindings[variables[i]] = val;
		if(val.token === 'blank') {
		    env.blanks[val.value] = oid;
		}
            }
        }
    }
    return bindings;
};

// Queries execution

QueryEngine.QueryEngine.prototype.execute = function(queryString, callback, defaultDataset, namedDataset){
    //try{
        queryString = Utils.normalizeUnicodeLiterals(queryString);

        var syntaxTree = this.abstractQueryTree.parseQueryString(queryString);
        if(syntaxTree == null) {
            callback(false,"Error parsing query string");
        } else {
            if(syntaxTree.token === 'query' && syntaxTree.kind == 'update')  {
                this.callbacksBackend.startGraphModification();
                var that = this;
                this.executeUpdate(syntaxTree, function(success, result){
		    if(that.lexicon.updateAfterWrite)
			that.lexicon.updateAfterWrite();

                    if(success) {
                        that.callbacksBackend.endGraphModification(function(){
                            callback(success, result);
                        });
                    } else {
                        that.callbacksBackend.cancelGraphModification();
                        callback(success, result);
                    }
                });
            } else if(syntaxTree.token === 'query' && syntaxTree.kind == 'query') {
                this.executeQuery(syntaxTree, callback, defaultDataset, namedDataset);
            }
        }
    //} catch(e) {
    //    if(e.name && e.name==='SyntaxError') {
    //        callback(false, "Syntax error: \nmessage:"+e.message+"\nline "+e.line+", column:"+e.column);
    //    } else {
    //        callback(false, "Query execution error");
    //    }
    //}
};

// Retrieval queries

QueryEngine.QueryEngine.prototype.executeQuery = function(syntaxTree, callback, defaultDataset, namedDataset) {
    var prologue = syntaxTree.prologue;
    var units = syntaxTree.units;
    var that = this;

    // environment for the operation -> base ns, declared ns, etc.
    var queryEnv = {blanks:{}, outCache:{}};
    this.registerNsInEnvironment(prologue, queryEnv);

    // retrieval queries can only have 1 executable unit
    var aqt = that.abstractQueryTree.parseExecutableUnit(units[0]);


    // can be anything else but a select???
    if(aqt.kind === 'select') {
      this.executeSelect(aqt, queryEnv, defaultDataset, namedDataset, function(success, result){
          if(success) {
              if(typeof(result) === 'object' && result.denorm === true) {
                  callback(true, result['bindings']);
              } else {
                  var result = that.denormalizeBindingsList(result, queryEnv);
                  if(result != null) {                        
                      callback(true, result);
                  } else {
                      callback(false, result);
                  }
              }
          } else {
              callback(false, result);
          }
      });
    } else if(aqt.kind === 'ask') {
        aqt.projection = [{"token": "variable", "kind": "*"}];
        this.executeSelect(aqt, queryEnv, defaultDataset, namedDataset, function(success, result){
            if(success) {
                if(success) {              
                    if(result.length>0) {
                        callback(true, true);
                    } else {
                        callback(true, false);
                    }
                } else {
                    callback(false, result);
                }
            } else {
                callback(false, result);
            }
        });
    }
};


// Select queries

QueryEngine.QueryEngine.prototype.executeSelect = function(unit, env, defaultDataset, namedDataset, callback) {
    if(unit.kind === "select" || unit.kind === "ask" || unit.kind === "construct" || unit.kind === "modify") {
        var projection = unit.projection;
        var dataset    = unit.dataset;
        var modifier   = unit.modifier;
        var limit      = unit.limit;
        var offset     = unit.offset;
        var order      = unit.order;
        var that = this;

        if(defaultDataset != null || namedDataset != null) {
            dataset.implicit = defaultDataset || [];
            dataset.named   = namedDataset || [];
        } 

        if(dataset.implicit != null && dataset.implicit.length === 0 && dataset.named !=null && dataset.named.length === 0) {
            // We add the default graph to the default merged graph
            dataset.implicit.push(this.lexicon.defaultGraphUriTerm);
        }

        if (that.normalizeDatasets(dataset.implicit.concat(dataset.named), env) != null) {
            var result = that.executeSelectUnit(projection, dataset, unit.pattern, env);
            if(result != null) {
                // detect single group
                if(unit.group!=null && unit.group === "") {
                    var foundUniqueGroup = false;
                    for(var i=0; i<unit.projection.length; i++) {
                        if(unit.projection[i].expression!=null && unit.projection[i].expression.expressionType === 'aggregate') {
                            foundUniqueGroup = true;
                            break;
                        }
                    }
                    if(foundUniqueGroup === true) {
                        unit.group = 'singleGroup';
                    }
                }
                if(unit.group && unit.group != "") {
                    if(that.checkGroupSemantics(unit.group,projection)) {
                        var groupedBindings = that.groupSolution(result, unit.group, dataset, env);
                             
                        var aggregatedBindings = [];
                        var foundError = false;
                            
                        for(var i=0; i<groupedBindings.length; i++) {
                            var resultingBindings = that.aggregateBindings(projection, groupedBindings[i], dataset, env);
                            aggregatedBindings.push(resultingBindings);
                        }
                        callback(true, {'bindings': aggregatedBindings, 'denorm':true});
                    } else {
                        callback(false, "Incompatible Group and Projection variables");
                    }
                } else {
                    var orderedBindings = that.applyOrderBy(order, result, dataset, env);
                    var projectedBindings = that.projectBindings(projection, orderedBindings, dataset);
                    var modifiedBindings = that.applyModifier(modifier, projectedBindings);
                    var limitedBindings  = that.applyLimitOffset(offset, limit, modifiedBindings);
                    var filteredBindings = that.removeDefaultGraphBindings(limitedBindings, dataset);
                    
                    callback(true, filteredBindings);
                }
                
            } else { // fail selectUnit
                callback(false, result);
            }
        } else { // fail  normalizaing datasets
            callback(false,"Error normalizing datasets");
        }
    } else {
        callback(false,"Cannot execute " + unit.kind + " query as a select query");
    }
};


QueryEngine.QueryEngine.prototype.groupSolution = function(bindings, group, dataset, queryEnv){
    var order = [];
    var filteredBindings = [];
    var initialized = false;
    var that = this;
    if(group === 'singleGroup') {
        return [bindings];
    } else {
        for(var i=0; i<bindings.length; i++) {
            var outFloop = arguments.callee;
            var currentBindings = bindings[i];
            var mustAddBindings = true;

            /**
             * In this loop, we iterate through all the group clauses and tranform the current bindings
             * according to the group by clauses.
             * If it is the first iteration we also save in a different array the order for the 
             * grouped variables that will be used later to build the final groups
             */
            for(var j=0; j<group.length; j++) {
                var floop = arguments.callee;
                var currentOrderClause = group[j];
                var orderVariable = null;

                if(currentOrderClause.token === 'var') {
                    orderVariable = currentOrderClause.value;

                    if(initialized == false) {
                        order.push(orderVariable);
                    }

                } else if(currentOrderClause.token === 'aliased_expression') {
                    orderVariable = currentOrderClause.alias.value;
                    if(initialized == false) {
                        order.push(orderVariable);
                    }

                    if(currentOrderClause.expression.primaryexpression === 'var') {
                        currentBindings[currentOrderClause.alias.value] = currentBindings[currentOrderClause.expression.value.value];
                    } else {
                        var denormBindings = this.copyDenormalizedBindings([currentBindings], queryEnv.outCache);
                        var filterResultEbv = QueryFilters.runFilter(currentOrderClause.expression, denormBindings[0], that, dataset, queryEnv);
                        if(!QueryFilters.isEbvError(filterResultEbv)) {
                            if(filterResultEbv.value != null) {
                                filterResultEbv.value = ""+filterResultEbv.value;
                            }
                            currentBindings[currentOrderClause.alias.value]= filterResultEbv;
                        } else {
                            mustAddBindings = false;
                        }
                    }
                } else {
                    // In this case, we create an additional variable in the binding to hold the group variable value
                    var denormBindings = that.copyDenormalizedBindings([currentBindings], queryEnv.outCache);
                    var filterResultEbv = QueryFilters.runFilter(currentOrderClause, denormBindings[0], that, queryEnv);
                    if(!QueryFilters.isEbvError(filterResultEbv)) {
                        currentBindings["groupCondition"+env._i] = filterResultEbv;
                        orderVariable = "groupCondition"+env._i;
                        if(initialized == false) {
                            order.push(orderVariable);
                        }
                        
                    } else {
                        mustAddBindings = false;
                    }
                         
                }
                
            }
            if(initialized == false) {
                initialized = true;
            } 
            if(mustAddBindings === true) {
                filteredBindings.push(currentBindings);
            }
        }
        /**
         * After processing all the bindings, we build the group using the
         * information stored about the order of the group variables.
         */
        var dups = {};
        var groupMap = {};
        var groupCounter = 0;
        for(var i=0; i<filteredBindings.length; i++) {
            var currentTransformedBinding = filteredBindings[i];
            var key = "";
            for(var j=0; j<order.length; j++) {
                var maybeObject = currentTransformedBinding[order[j]];
                if(typeof(maybeObject) === 'object') {
                    key = key + maybeObject.value;
                } else {
                    key = key + maybeObject;
                }
            }

            if(dups[key] == null) {
                //currentTransformedBinding["__group__"] = groupCounter; 
                groupMap[key] = groupCounter;
                dups[key] = [currentTransformedBinding];
                //groupCounter++
            } else {
                //currentTransformedBinding["__group__"] = dups[key][0]["__group__"]; 
                dups[key].push(currentTransformedBinding);
            }
        }

        // The final result is an array of arrays with all the groups
        var groups = [];
            
        for(var k in dups) {
            groups.push(dups[k]);
        }

        return groups;
    };
};


/**
 * Here, all the constructions of the SPARQL algebra are handled
 */
QueryEngine.QueryEngine.prototype.executeSelectUnit = function(projection, dataset, pattern, env) {
    if(pattern.kind === "BGP") {
        return this.executeAndBGP(projection, dataset, pattern, env);
    } else if(pattern.kind === "UNION") {
        return this.executeUNION(projection, dataset, pattern.value, env);            
    } else if(pattern.kind === "JOIN") {
        return this.executeJOIN(projection, dataset, pattern, env);            
    } else if(pattern.kind === "LEFT_JOIN") {
        return this.executeLEFT_JOIN(projection, dataset, pattern, env);            
    } else if(pattern.kind === "FILTER") {
        // Some components may have the filter inside the unit
        var results = this.executeSelectUnit(projection, dataset, pattern.value, env);
        if(results != null) {
            results = QueryFilters.checkFilters(pattern, results, false, dataset, env, this);
            return results;
        } else {
            return [];
        }
    } else if(pattern.kind === "EMPTY_PATTERN") {
        // as an example of this case  check DAWG test case: algebra/filter-nested-2
        return [];
    } else if(pattern.kind === "ZERO_OR_MORE_PATH" || pattern.kind === 'ONE_OR_MORE_PATH') {
	return this.executeZeroOrMorePath(pattern, dataset, env);
    } else {
        console.log("Cannot execute query pattern " + pattern.kind + ". Not implemented yet.");
        return null;
    }
};

QueryEngine.QueryEngine.prototype.executeZeroOrMorePath = function(pattern, dataset, env) {
    //console.log("EXECUTING ZERO OR MORE PATH");
    //console.log("X");
    //console.log(pattern.x);
    //console.log("Y");
    //console.log(pattern.y);
    var projection = [];
    var starProjection = false;
    if(pattern.x.token === 'var') {
	projection.push({token: 'variable',
			 kind: 'var',
			 value: pattern.x.value});
    }
    if(pattern.y.token === 'var') {
	projection.push({token: 'variable',
			 kind: 'var',
			 value: pattern.y.value});
    }

    if(projection.length === 0) {
	projection.push({"token": "variable", "kind": "*"});
	starProjection = true;
    }

    //console.log("COMPUTED PROJECTION");
    //console.log(projection);


    if(pattern.x.token === 'var' && pattern.y.token === 'var') {
	var bindings = this.executeAndBGP(projection, dataset, pattern.path, env);
	//console.log("BINDINGS "+bindings.length);
	//console.log(bindings);
	var acum = {};
	var results = [];
	var vx, intermediate, nextBinding, vxDenorm;
	var origVXName = pattern.x.value;
	var last = pattern.x;
	var nextPath = pattern.path;
	//console.log("VAR - VAR PATTERN");
	//console.log(nextPath.value);
	for(var i=0; i<bindings.length; i++) {
	    vx = bindings[i][origVXName];
	    if(acum[vx] == null) {
		vxDenorm = this.lexicon.retrieve(vx);
		pattern.x = vxDenorm;
		//console.log("REPLACING");
		//console.log(last);
		//console.log("BY");
		//console.log(vxDenorm);
		//console.log(nextPath.value);
		pattern.path = this.abstractQueryTree.replace(nextPath, last, vxDenorm, env);
		nextPath = Utils.clone(pattern.path);
		intermediate = this.executeZeroOrMorePath(pattern, dataset, env);
		for(var j=0; j<intermediate.length; j++) {
		    nextBinding = intermediate[j];
		    nextBinding[origVXName] = vx;
		    results.push(nextBinding)
		}
		last = vxDenorm;
	    }
	}

	//console.log("RETURNING VAR - VAR");
	return results;
    } else if(pattern.x.token !== 'var' && pattern.y.token === 'var') {
	var finished;
	var acum = {};
	var initial = true;
	var pending = [];
	var bindings,nextBinding;
	var collected = [];
	var origVx = pattern.x;
	var last;

	while(initial == true || pending.length !== 0) {
	    //console.log("-- Iteration");
	    //console.log(pattern.path.value[0]);
	    if(initial === true) {
		bindings = this.executeAndBGP(projection, dataset, pattern.path, env);
		//console.log("SAVING LAST");
		//console.log(pattern.x);
		last = pattern.x;
		initial = false;
	    } else {
		var nextOid = pending.pop();
		//console.log("POPPING:"+nextOid);
		var value = this.lexicon.retrieve(nextOid);
		var path = pattern.path; //Utils.clone(pattern.path);
		//console.log(path.value[0]);
		//console.log("REPLACING");
		//console.log(last);
		//console.log("BY");
		//console.log(value);
		path = this.abstractQueryTree.replace(path, last, value, env);
		//console.log(path.value[0]);
		bindings = this.executeAndBGP(projection, dataset, path, env);
		last = value;
	    }


	    //console.log("BINDINGS!");
	    //console.log(bindings);

	    for(var i=0; i<bindings.length; i++) {
		//console.log(bindings[i][pattern.y.value])
		var value = bindings[i][pattern.y.value];
		//console.log("VALUE:"+value);
		if(acum[value] !== true) {
		    nextBinding = {};
		    nextBinding[pattern.y.value] = value;
		    collected.push(nextBinding);
		    acum[value] = true;
		    pending.push(value);
		}
	    }
	}
	//console.log("RETURNING TERM - VAR");
	//console.log(collected);
	return collected;
    } else {
	throw "Kind of path not supported!";
    }
};

QueryEngine.QueryEngine.prototype.executeUNION = function(projection, dataset, patterns, env) {
    var setQuery1 = patterns[0];
    var setQuery2 = patterns[1];
    var set1 = null;
    var set2 = null;

    if(patterns.length != 2) {
        throw("SPARQL algebra UNION with more than two components");
    }

    var that = this;
    var sets = [];

    set1 = that.executeSelectUnit(projection, dataset, setQuery1, env);
    if(set1==null) {
        return null;
    }

    set2 = that.executeSelectUnit(projection, dataset, setQuery2, env);
    if(set2==null) {
        return null;
    }

    var result = QueryPlan.unionBindings(set1, set2);
    result = QueryFilters.checkFilters(patterns, result, false, dataset, env, that);
    return result;
};

QueryEngine.QueryEngine.prototype.executeAndBGP = function(projection, dataset, patterns, env) {
    var that = this;
    var result = QueryPlan.executeAndBGPsDPSize(patterns.value, dataset, this, env);
    if(result!=null) {
        return QueryFilters.checkFilters(patterns, result, false, dataset, env, that);
    } else {
        return null;
    }
};

QueryEngine.QueryEngine.prototype.executeLEFT_JOIN = function(projection, dataset, patterns, env) {
    var setQuery1 = patterns.lvalue;
    var setQuery2 = patterns.rvalue;

    var set1 = null;
    var set2 = null;

    var that = this;
    var sets = [];
    var acum, duplicates;

    //console.log("SET QUERY 1");
    //console.log(setQuery1.value);
    set1 = that.executeSelectUnit(projection, dataset, setQuery1, env);
    if(set1==null) {
        return null;
    }
     
    //console.log("SET QUERY 2");
    //console.log(setQuery2);
    set2 = that.executeSelectUnit(projection, dataset, setQuery2, env);
    if(set2==null) {
        return null;
    }


    //console.log("\nLEFT JOIN SETS:")
    //console.log(set1)
    //console.log(set2)
    var result = QueryPlan.leftOuterJoinBindings(set1, set2);
    //console.log("---")
    //console.log(result);

    var bindings = QueryFilters.checkFilters(patterns, result, true, dataset, env, that);
    //console.log("---")
    //console.log(bindings)
    //console.log("\r\n")
    
    if(set1.length>1 && set2.length>1) {
            var vars = [];
            var vars1 = {};
            for(var p in set1[0]) {
                vars1[p] = true;
            }
            for(p in set2[0]) {
                if(vars1[p] != true) {
                    vars.push(p);
                }
            }
            acum = [];
            duplicates = {};
            for(var i=0; i<bindings.length; i++) {
                if(bindings[i]["__nullify__"] === true) {
                    for(var j=0; j<vars.length; j++) {
                        bindings[i]["bindings"][vars[j]] = null;
                    }                            
                    var idx = [];
                    var idxColl = [];
                    for(var p in bindings[i]["bindings"]) {
                        if(bindings[i]["bindings"][p] != null) {
                            idx.push(p+bindings[i]["bindings"][p]);
                            idx.sort();
                            idxColl.push(idx.join(""));
                        }
                    }
                    // reject duplicates -> (set union)
                    if(duplicates[idx.join("")]==null) {
                        for(j=0; j<idxColl.length; j++) {
                            //console.log(" - "+idxColl[j])
                            duplicates[idxColl[j]] = true;
                        }
                        ////duplicates[idx.join("")]= true
                        acum.push(bindings[i]["bindings"]);
                    }
                } else {
                    acum.push(bindings[i]);
                    var idx = [];
                    var idxColl = [];
                    for(var p in bindings[i]) {
                        idx.push(p+bindings[i][p]);
                        idx.sort();
                        //console.log(idx.join("") + " -> ok");
                        duplicates[idx.join("")] = true;
                    }

                }
            }

        return acum;
    } else {
        return bindings;
    }
};

QueryEngine.QueryEngine.prototype.executeJOIN = function(projection, dataset, patterns, env) {
    var setQuery1 = patterns.lvalue;
    var setQuery2 = patterns.rvalue;
    var set1 = null;
    var set2 = null;

    var that = this;
    var sets = [];

    set1 = that.executeSelectUnit(projection, dataset, setQuery1, env);
    if(set1 == null) {
        return null;
    }

    set2 = that.executeSelectUnit(projection, dataset, setQuery2, env);
    if(set2 == null) {
        return null;
    }
    
    
    var result = null;
    if(set1.length ===0 || set2.length===0) {
	result = [];
    } else {
	var commonVarsTmp = {};
	var commonVars = [];

	for(var p in set1[0])
	    commonVarsTmp[p] = false;
	for(var p  in set2[0]) {
	    if(commonVarsTmp[p] === false)
		commonVars.push(p);
	}

	if(commonVars.length == 0) {
	    result = QueryPlan.joinBindings(set1,set2);	    
	} else if(this.abstractQueryTree.treeWithUnion(setQuery1) || 
		  this.abstractQueryTree.treeWithUnion(setQuery2)) {
	    result = QueryPlan.joinBindings(set1,set2);	    	    
	} else {
	    result = QueryPlan.joinBindings2(commonVars, set1, set2);
	}
    }
    result = QueryFilters.checkFilters(patterns, result, false, dataset, env, that);
    return result;
};


QueryEngine.QueryEngine.prototype.rangeQuery = function(quad, queryEnv) {
    var that = this;
    var key = that.normalizeQuad(quad, queryEnv, false);
    if(key != null) {
	//console.log(new QuadIndexCommon.Pattern(key));
        var quads = that.backend.range(new QuadIndexCommon.Pattern(key));
        if(quads == null || quads.length == 0) {
            return [];
        } else {
            return quads;
        }
    } else {
        console.log("ERROR normalizing quad");
        return null;
    }
};

// Update queries

QueryEngine.QueryEngine.prototype.executeUpdate = function(syntaxTree, callback) {
    var prologue = syntaxTree.prologue;
    var units = syntaxTree.units;
    var that = this;

    // environment for the operation -> base ns, declared ns, etc.
    var queryEnv = {blanks:{}, outCache:{}};
    this.registerNsInEnvironment(prologue, queryEnv);
    for(var i=0; i<units.length; i++) {

        var aqt = that.abstractQueryTree.parseExecutableUnit(units[i]);
        if(aqt.kind === 'insertdata') {
            for(var j=0; j<aqt.quads.length; j++) {
                var quad = aqt.quads[j];
                var result = that._executeQuadInsert(quad, queryEnv);
                if(result !== true) {
                    return callback(false, error);
                }
            }
            callback(true);
        } else if(aqt.kind === 'deletedata') {
            for(var j=0; j<aqt.quads.length; j++) {
                var quad = aqt.quads[j];
                this._executeQuadDelete(quad, queryEnv);
            }
            callback(true);
        } else if(aqt.kind === 'modify') {
            this._executeModifyQuery(aqt, queryEnv, callback);
        } else if(aqt.kind === 'create') {
            callback(true);
        } else {
            throw new Error("not supported execution unit");
        }
    }
};

QueryEngine.QueryEngine.prototype.batchLoad = function(quads, callback) {
    var subject    = null;
    var predicate  = null;
    var object     = null;
    var graph      = null;
    var oldLimit = Utils.stackCounterLimit;
    var counter = 0;
    var success = true;
    var blanks = {};
    var maybeBlankOid, oid, quad, key, originalQuad;

    if(this.eventsOnBatchLoad)
        this.callbacksBackend.startGraphModification();

    for(var i=0; i<quads.length; i++) {
        quad = quads[i];
	
        // subject
        if(quad.subject['uri'] || quad.subject.token === 'uri') {
            oid = this.lexicon.registerUri(quad.subject.uri || quad.subject.value);
	    if(quad.subject.uri != null) {
		quad.subject = {'token': 'uri', 'value': quad.subject.uri};
		delete quad.subject['uri'];
	    }
            subject = oid;
        } else if(quad.subject['literal'] || quad.subject.token === 'literal') {
            oid = this.lexicon.registerLiteral(quad.subject.literal || quad.subject.value);
	    if(quad.subject.literal != null) {
		quad.subject = this.lexicon.parseLiteral(quad.subject.literal);
		delete quad.subject['literal'];
	    }
            subject = oid;                    
        } else {
            maybeBlankOid = blanks[quad.subject.blank || quad.subject.value];
            if(maybeBlankOid == null) {
                maybeBlankOid = this.lexicon.registerBlank(quad.subject.blank || quad.subject.value);
                blanks[(quad.subject.blank || quad.subject.value)] = maybeBlankOid;
            }
	    if(quad.subject.token == null) {
		quad.subject.token = 'blank';
		quad.subject.value = quad.subject.blank;
		delete quad.subject['blank'];
	    }
            subject = maybeBlankOid;
        }

        // predicate
        if(quad.predicate['uri'] || quad.predicate.token === 'uri') {
            oid = this.lexicon.registerUri(quad.predicate.uri || quad.predicate.value);
	    if(quad.predicate.uri != null) {
		quad.predicate = {'token': 'uri', 'value': quad.predicate.uri};
		delete quad.subject['uri'];
	    }
            predicate = oid;
        } else if(quad.predicate['literal'] || quad.predicate.token === 'literal') {
            oid = this.lexicon.registerLiteral(quad.predicate.literal || quad.predicate.value);
	    if(quad.predicate.literal != null) {
		quad.predicate = this.lexicon.parseLiteral(quad.predicate.literal);
		delete quad.predicate['literal'];
	    }
            predicate = oid;                    
        } else {
            maybeBlankOid = blanks[quad.predicate.blank || quad.predicate.value];
            if(maybeBlankOid == null) {
                maybeBlankOid = this.lexicon.registerBlank(quad.predicate.blank || quad.predicate.value);
                blanks[(quad.predicate.blank || quad.predicate.value)] = maybeBlankOid;
            }
	    if(quad.predicate.token == null) {
		quad.predicate.token = 'blank';
		quad.predicate.value = quad.predicate.blank;
		delete quad.predicate['blank'];
	    }
            predicate = maybeBlankOid;
        }

        // object
        if(quad.object['uri'] || quad.object.token === 'uri') {
            oid = this.lexicon.registerUri(quad.object.uri || quad.object.value);
	    if(quad.object.uri != null) {
		quad.object = {'token': 'uri', 'value': quad.object.uri};
		delete quad.subject['uri'];
	    }
            object = oid;
        } else if(quad.object['literal'] || quad.object.token === 'literal') {
	    if(quad.object.token === 'literal') {
		if(quad.object.type != null) {
		    quad.object.value = '"'+quad.object.value+'"^^<'+quad.object.type+'>';
		} else if(quad.object.lang != null) {
		    quad.object.value = '"'+quad.object.value+'"@'+quad.object.lang;		    
		} else {
		    quad.object.value = '"'+quad.object.value+'"';
		}
	    }
            oid = this.lexicon.registerLiteral(quad.object.literal || quad.object.value);
	    if(quad.object.literal != null) {
		quad.object = this.lexicon.parseLiteral(quad.object.literal);
		delete quad.object['literal'];
	    }
            object = oid;                    
        } else {
            maybeBlankOid = blanks[quad.object.blank || quad.object.value];
            if(maybeBlankOid == null) {
                maybeBlankOid = this.lexicon.registerBlank(quad.object.blank || quad.object.value);
                blanks[(quad.object.blank || quad.object.value)] = maybeBlankOid;
            }
	    if(quad.object.token == null) {
		quad.object.token = 'blank';
		quad.object.value = quad.object.blank;
		delete quad.object['blank'];
	    }

            object = maybeBlankOid;
        }

        // graph
        if(quad.graph['uri'] || quad.graph.token === 'uri') {
            oid = this.lexicon.registerUri(quad.graph.uri || quad.graph.value);
	    if(quad.graph.uri != null) {
		quad.graph = {'token': 'uri', 'value': quad.graph.uri};
		delete quad.subject['uri'];
	    }
            this.lexicon.registerGraph(oid);
            graph = oid;

        } else if(quad.graph['literal'] || quad.graph.token === 'literal') {
            oid = this.lexicon.registerLiteral(quad.graph.literal || quad.graph.value);
	    if(quad.predicate.literal != null) {
		quad.predicate = this.lexicon.parseLiteral(quad.predicate.literal);
		delete quad.predicate['literal'];
	    }
            graph = oid;                    
        } else {
            maybeBlankOid = blanks[quad.graph.blank || quad.graph.value];
            if(maybeBlankOid == null) {
                maybeBlankOid = this.lexicon.registerBlank(quad.graph.blank || quad.graph.value);
                blanks[(quad.graph.blank || quad.graph.value)] = maybeBlankOid;
            }
	    if(quad.graph.token == null) {
		quad.graph.token = 'blank';
		quad.graph.value = quad.graph.blank;
		delete quad.graph['blank'];
	    }
            graph = maybeBlankOid;
        }



        originalQuad = quad;
        quad = {subject: subject, predicate:predicate, object:object, graph: graph};
        key = new QuadIndexCommon.NodeKey(quad);

        var result = this.backend.search(key);
        if(!result) {
            result = this.backend.index(key);
            if(result == true){
                if(this.eventsOnBatchLoad)
                    this.callbacksBackend.nextGraphModification(Callbacks.added, [originalQuad,quad]);
                counter = counter + 1;
            } else {
                success = false;
                break;
            }
        }

    }

    if(this.lexicon.updateAfterWrite != null)
	this.lexicon.updateAfterWrite();

    var exitFn = function(){
        if(success) {
            if(callback)
                callback(true, counter);
        } else {
            if(callback)
                callback(false, null);
        }
    };

    if(this.eventsOnBatchLoad) {
        this.callbacksBackend.endGraphModification(function(){
            exitFn();
        });
    } else {
        exitFn();
    }
        
    if(success) {
        return counter;
    } else {
        return null;
    }
};

// @modified dp
QueryEngine.QueryEngine.prototype.computeCosts = function (quads, env) {
    for (var i = 0; i < quads.length; i++) {
        quads[i]['_cost'] = this.quadCost(quads[i], env);
    }

    return quads;
};

// Low level operations for update queries

QueryEngine.QueryEngine.prototype._executeModifyQuery = function(aqt, queryEnv, callback) {
    var that = this;
    var querySuccess = true;
    var error = null;
    var bindings = null;
    var components = ['subject', 'predicate', 'object', 'graph'];

    aqt.insert = aqt.insert == null ? [] : aqt.insert;
    aqt['delete'] = aqt['delete'] == null ? [] : aqt['delete'];

    Utils.seq(
        function(k) {
            // select query

            var defaultGraph = [];
            var namedGraph = [];

            if(aqt['with'] != null) {
                defaultGraph.push(aqt['with']);
            }

            if(aqt['using'] != null) {
                namedGraph = [];
                for(var i=0; i<aqt['using'].length; i++) {
                    var usingGraph = aqt['using'][i];
                    if(usingGraph.kind === 'named') {
                        namedGraph.push(usingGraph.uri);
                    } else {
                        defaultGraph.push(usingGraph.uri);
                    }
                }
            }

            aqt.dataset = {};
            aqt.projection = [{"token": "variable", "kind": "*"}];

            that.executeSelect(aqt, queryEnv, defaultGraph, namedGraph, function(success, result) {                
                if(success) {                    
                    var result = that.denormalizeBindingsList(result, queryEnv);
                    if(result!=null) {
                        bindings = result;
                    } else {
                        querySuccess = false;
                    }
                    return k();
                } else {
                    querySuccess = false;
                    return k();
                }
            });
        },function(k) {
            // delete query

            var defaultGraph = aqt['with'];
            if(querySuccess) {
                var quads = [];
                for(var i=0; i<aqt['delete'].length; i++) {
                    var src = aqt['delete'][i];

                    for(var j=0; j<bindings.length; j++) {
                        var quad = {};
                        var binding = bindings[j];

                        for(var c=0; c<components.length; c++) {
                            var component = components[c];
                            if(component == 'graph' && src[component] == null) {
                                quad['graph'] = defaultGraph;
                            } else if(src[component].token === 'var') {
                                quad[component] = binding[src[component].value];
                            } else {
                                quad[component] = src[component];
                            }
                        }

                        quads.push(quad);
                    }
                }

                var quad;
                for(var j=0; j<quads.length; j++) {
                    quad = quads[j];
                    that._executeQuadDelete(quad, queryEnv);
                }
                k();
            } else {
                k();
            }
        },function(k) {
            // insert query
            var defaultGraph = aqt['with'];

            if(querySuccess) {
                var quads = [];
                for(var i=0; i<aqt.insert.length; i++) {
                    var src = aqt.insert[i];

                    for(var j=0; j<bindings.length; j++) {
                        var quad = {};
                        var binding = bindings[j];

                        for(var c=0; c<components.length; c++) {
                            var component = components[c];
                            if(component == 'graph' && src[component] == null) {
                                quad['graph'] = defaultGraph;
                            } else if(src[component].token === 'var') {
                                quad[component] = binding[src[component].value];
                            } else {
                                quad[component] = src[component];
                            }
                        }

                        quads.push(quad);
                    }
                }

                for(var i=0; i<quads.length; i++) {
                    var quad = quads[i];
                    that._executeQuadInsert(quad, queryEnv);
                }

                k();
            } else {
                k();
            }
        }
    )(function(){
        callback(querySuccess);
    });
};

QueryEngine.QueryEngine.prototype._executeQuadInsert = function(quad, queryEnv) {
    var that = this;
    var normalized = this.normalizeQuad(quad, queryEnv, true);
    if(normalized != null) {
        var key = new QuadIndexCommon.NodeKey(normalized);
        var result = that.backend.search(key);
        if(result){
            return(result);
        } else {
            var result = that.backend.index(key);
            if(result == true){
                that.callbacksBackend.nextGraphModification(Callbacks.added, [quad, normalized]);
                return true;
            } else {
                console.log("ERROR inserting quad");
                return false;
            }
        }
    } else {
        console.log("ERROR normalizing quad");
        return false;
    }
};

QueryEngine.QueryEngine.prototype._executeQuadDelete = function(quad, queryEnv) {
    var that = this;
    var normalized = this.normalizeQuad(quad, queryEnv, false);
    if(normalized != null) {
        var key = new QuadIndexCommon.NodeKey(normalized);
        that.backend['delete'](key);
        var result = that.lexicon.unregister(quad, key);
        if(result == true){
            that.callbacksBackend.nextGraphModification(Callbacks['deleted'], [quad, normalized]);
            return true;
        } else {
            console.log("ERROR unregistering quad");
            return false;
        }
    } else {
        console.log("ERROR normalizing quad");
        return false;
    }
};


QueryEngine.QueryEngine.prototype.checkGroupSemantics = function(groupVars, projectionVars) {
    if(groupVars === 'singleGroup') {
        return true;        
    }

    var projection = {};

    for(var i=0; i<groupVars.length; i++) {
        var groupVar = groupVars[i];
        if(groupVar.token === 'var') {
            projection[groupVar.value] = true;
        } else if(groupVar.token === 'aliased_expression') {
            projection[groupVar.alias.value] = true;
        }
    }

    for(i=0; i<projectionVars.length; i++) {
        var projectionVar = projectionVars[i];
        if(projectionVar.kind === 'var') {
            if(projection[projectionVar.value.value] == null) {
                return false;
            }
        } else if(projectionVar.kind === 'aliased' && 
                  projectionVar.expression &&
                  projectionVar.expression.primaryexpression === 'var') {
            if(projection[projectionVar.expression.value.value] == null) {
                return false;
            }
        }
    }

    return true;
};

QueryEngine.QueryEngine.prototype.registerDefaultNamespace = function(ns, prefix) {
    this.defaultPrefixes[ns] = prefix;
};

// end of ./src/js-query-engine/src/query_engine.js 
// exports
var Callbacks = {};

//imports


Callbacks.ANYTHING = {'token': 'var', 
                      'value': '_'};

Callbacks.added = 'added';
Callbacks.deleted = 'deleted';
Callbacks.eventsFlushed = 'eventsFlushed';

Callbacks.CallbacksBackend = function() {
    this.aqt = new AbstractQueryTree.AbstractQueryTree();
    this.engine = arguments[0];
    this.indexMap = {};
    this.observersMap = {};
    this.queriesIndexMap = {};
    this.emptyNotificationsMap = {};
    this.queriesList = [];
    this.pendingQueries = [];
    this.matchedQueries = [];
    this.updateInProgress = null;
    this.indices = ['SPOG', 'GP', 'OGS', 'POG', 'GSP', 'OS'];
    this.componentOrders = {
        SPOG: ['subject', 'predicate', 'object', 'graph'],
        GP: ['graph', 'predicate', 'subject', 'object'],
        OGS: ['object', 'graph', 'subject', 'predicate'],
        POG: ['predicate', 'object', 'graph', 'subject'],
        GSP: ['graph', 'subject', 'predicate', 'object'],
        OS: ['object', 'subject', 'predicate', 'graph']
    };

    this.callbackCounter = 0;
    this.callbacksMap = {};
    this.callbacksInverseMap = {};

    this.queryCounter = 0;
    this.queriesMap = {};
    this.queriesCallbacksMap = {};
    this.queriesInverseMap = {};

    for(var i=0; i<this.indices.length; i++) {
        var indexKey = this.indices[i];
        this.indexMap[indexKey] = {};
        this.queriesIndexMap[indexKey] = {};
    };
};

Callbacks.CallbacksBackend.prototype.startGraphModification = function() {
    this.pendingQueries = [].concat(this.queriesList);
    this.matchedQueries = [];

    var added = Callbacks['added'];
    var deleted = Callbacks['deleted'];
    if(this.updateInProgress == null) {
        this.updateInProgress = {added: [], deleted: []};
    }
};

Callbacks.CallbacksBackend.prototype.nextGraphModification = function(event, quad) {
    this.updateInProgress[event].push(quad);
};

Callbacks.CallbacksBackend.prototype.endGraphModification = function(callback) {
    var that = this;
    if(this.updateInProgress != null) {
        var tmp = that.updateInProgress;
        that.updateInProgress = null;
        this.sendNotification(Callbacks['deleted'], tmp[Callbacks['deleted']],function(){
            that.sendNotification(Callbacks['added'], tmp[Callbacks['added']], function(){
                that.sendEmptyNotification(Callbacks['eventsFlushed'], null, function(){
                    that.dispatchQueries(function(){
                        callback(true);
                    });
                });
            });
        });
    } else {
        callback(true);
    }
};

Callbacks.CallbacksBackend.prototype.cancelGraphModification = function() {
    this.updateInProgress = null;
};

Callbacks.CallbacksBackend.prototype.sendNotification = function(event, quadsPairs, doneCallback) {
    var notificationsMap = {};
    for(var i=0; i<quadsPairs.length; i++) {
        var quadPair = quadsPairs[i];
        for(var indexKey in this.indexMap) {
            var index = this.indexMap[indexKey];
            var order = this.componentOrders[indexKey];
            this._searchCallbacksInIndex(index, order, event, quadPair, notificationsMap);
            if(this.pendingQueries.length != 0) {
                index = this.queriesIndexMap[indexKey];
                this._searchQueriesInIndex(index, order, quadPair);
            }
        }
    }

    this.dispatchNotifications(notificationsMap);

    if(doneCallback != null)
        doneCallback(true);
};

Callbacks.CallbacksBackend.prototype.sendEmptyNotification = function(event, value, doneCallback) {
    var callbacks = this.emptyNotificationsMap[event] || [];
    for(var i=0; i<callbacks.length; i++) {
        callbacks[i](event, value);
    }
    doneCallback();
};

Callbacks.CallbacksBackend.prototype.dispatchNotifications = function(notificationsMap) {
    for(var callbackId in notificationsMap) {
        var callback = this.callbacksMap[callbackId];
        var deleted = notificationsMap[callbackId][Callbacks['deleted']];
        if(deleted!=null) {
            try {
                callback(Callbacks['deleted'],deleted);
            }catch(e){}
        }
        for(var event in notificationsMap[callbackId]) {
            if(event!=Callbacks['deleted']) {
                try{
                    callback(event, notificationsMap[callbackId][event]);
                }catch(e){}

            }
        }
    }
};

Callbacks.CallbacksBackend.prototype._searchCallbacksInIndex = function(index, order, event, quadPair, notificationsMap) {
    var quadPairNomalized = quadPair[1];
    var quadPair = quadPair[0];

    for(var i=0; i<(order.length+1); i++) {
        var matched = index['_'] || [];
        
        var filteredIds = [];
        for(var j=0; j<matched.length; j++) {
            var callbackId = matched[j];
            if(this.callbacksMap[callbackId] != null) {
                notificationsMap[callbackId] = notificationsMap[callbackId] || {};
                notificationsMap[callbackId][event] = notificationsMap[callbackId][event] || [];
                notificationsMap[callbackId][event].push(quadPair);
                filteredIds.push(callbackId);
            }
        }
        index['_'] = filteredIds;
        var component = order[i];
        if(index[''+quadPairNomalized[component]] != null) {
            index = index[''+quadPairNomalized[component]];
        } else {
            break;
        }
    }
};

Callbacks.CallbacksBackend.prototype.subscribeEmpty = function(event, callback) {
    var callbacks = this.emptyNotificationsMap[event] || [];
    callbacks.push(callback);
    this.emptyNotificationsMap[event] = callbacks;
};

Callbacks.CallbacksBackend.prototype.unsubscribeEmpty = function(event, callback) {
    var callbacks = this.emptyNotificationsMap[event];
    if(callbacks != null) {
        callbacks = Utils.remove(callbacks, callback);
    }
    this.emptyNotificationsMap[event] = callbacks;
};

Callbacks.CallbacksBackend.prototype.subscribe = function(s,p,o,g,callback, doneCallback) {
    var quad = this._tokenizeComponents(s,p,o,g);
    var queryEnv = {blanks:{}, outCache:{}};
    this.engine.registerNsInEnvironment(null, queryEnv);
    var that = this;
    var normalized = this.engine.normalizeQuad(quad, queryEnv, true);
    var pattern =  new QuadIndexCommon.Pattern(normalized);        
    var indexKey = that._indexForPattern(pattern);
    var indexOrder = that.componentOrders[indexKey];
    var index = that.indexMap[indexKey];
    for(var i=0; i<indexOrder.length; i++) {
        var component = indexOrder[i];
        var quadValue = normalized[component];
        if(quadValue === '_') {
            if(index['_'] == null) {
                index['_'] = [];
            }
            that.callbackCounter++;
            index['_'].push(that.callbackCounter);
            that.callbacksMap[that.callbackCounter] = callback;
            that.callbacksInverseMap[callback] = that.callbackCounter;
            break;
        } else {
            if(i===indexOrder.length-1) {
                index[quadValue] = index[quadValue] || {'_':[]};
                that.callbackCounter++;
                index[quadValue]['_'].push(that.callbackCounter);
                that.callbacksMap[that.callbackCounter] = callback;
                that.callbacksInverseMap[callback] = that.callbackCounter;
            } else {
                index[quadValue] = index[quadValue] || {};
                index = index[quadValue];
            }
        }
    }
    if(doneCallback != null)
        doneCallback(true);
};

Callbacks.CallbacksBackend.prototype.unsubscribe = function(callback) {
    var id = this.callbacksInverseMap[callback];
    if(id != null) {
        delete this.callbacksInverseMap[callback];
        delete this.callbacksMap[id];
    }
};

Callbacks.CallbacksBackend.prototype._tokenizeComponents = function(s, p, o, g) {
    var pattern = {};

    if(s == null) {
        pattern['subject'] = Callbacks.ANYTHING;
    } else {
        if(s.indexOf("_:") == 0) {
            pattern['subject'] = {'token': 'blank', 'value':s};
        } else {
            pattern['subject'] = {'token': 'uri', 'value':s};
        }
    }

    if(p == null) {
        pattern['predicate'] = Callbacks.ANYTHING;
    } else {
        pattern['predicate'] = {'token': 'uri', 'value':p};
    }

    if(o == null) {
        pattern['object'] = Callbacks.ANYTHING;
    } else {
        pattern['object'] = {'token': 'uri', 'value':o};
    }

    if(g == null) {
        pattern['graph'] = Callbacks.ANYTHING;
    } else {
        pattern['graph'] = {'token': 'uri', 'value':g};
    }

    return pattern;
};

Callbacks.CallbacksBackend.prototype._indexForPattern = function(pattern) {
    var indexKey = pattern.indexKey;
    var matchingIndices = this.indices;

    for(var i=0; i<matchingIndices.length; i++) {
        var index = matchingIndices[i];
        var indexComponents = this.componentOrders[index];
        for(var j=0; j<indexComponents.length; j++) {
            if(Utils.include(indexKey, indexComponents[j])===false) {
                break;
            }
            if(j==indexKey.length-1) {
                return index;
            }
        }
    }
    
    return 'SPOG'; // If no other match, we return the most generic index
};

Callbacks.CallbacksBackend.prototype.observeNode = function() {
    var uri,graphUri,callback,doneCallback;

    if(arguments.length === 4) {
        uri = arguments[0];
        graphUri = arguments[1];
        callback = arguments[2];
        doneCallback = arguments[3];
    } else {
        uri = arguments[0];
        graphUri = this.engine.lexicon.defaultGraphUri;
        callback = arguments[1];
        doneCallback = arguments[2];
    }
    var query = "CONSTRUCT { <" + uri + "> ?p ?o } WHERE { GRAPH <" + graphUri + "> { <" + uri + "> ?p ?o } }";
    var that = this;
    var queryEnv = {blanks:{}, outCache:{}};
    this.engine.registerNsInEnvironment(null, queryEnv);
    var bindings = [];
    this.engine.execute(query,  function(success, graph){
        if(success) {
            var node = graph;
            var mustFlush = false;
            var observer = function(event, triples){
                if(event === 'eventsFlushed' && mustFlush ) {
                    mustFlush = false;
                    try {
                        callback(node);
                    }catch(e){}
                } else if(event !== 'eventsFlushed') {
                    mustFlush = true;
                    for(var i = 0; i<triples.length; i++) {
                        var triple = triples[i];
                        var s = RDFJSInterface.buildRDFResource(triple.subject,bindings,that.engine,queryEnv);
                        var p = RDFJSInterface.buildRDFResource(triple.predicate,bindings,that.engine,queryEnv);
                        var o = RDFJSInterface.buildRDFResource(triple.object,bindings,that.engine,queryEnv);
                        if(s!=null && p!=null && o!=null) {
                            triple = new RDFJSInterface.Triple(s,p,o);
                            if(event === Callbacks['added']) {
                                node.add(triple);
                            } else if(event === Callbacks['deleted']) {
                                node.remove(triple);
                            }
                        }
                    }
                }
            };
            that.observersMap[callback] = observer;
            that.subscribeEmpty(Callbacks['eventsFlushed'], observer);
            that.subscribe(uri,null,null,null,observer,function(){
                try {
                    callback(node);
                }catch(e){}

                if(doneCallback)
                    doneCallback(true)
            });
        } else {
            if(doneCallback)
                doneCallback(false);
        }
    });
};

Callbacks.CallbacksBackend.prototype.stopObservingNode = function(callback) {
    var observer = this.observersMap[callback];
    if(observer) {
        this.unsubscribe(observer);
        this.unsubscribeEmpty(Callbacks['eventsFlushed'],observer);
        return true;
    } else {
        return false;
    }
};

// Queries

Callbacks.CallbacksBackend.prototype.observeQuery = function(query, callback, endCallback) {
    var queryParsed = this.aqt.parseQueryString(query);
    var parsedTree = this.aqt.parseSelect(queryParsed.units[0]);
    var patterns = this.aqt.collectBasicTriples(parsedTree);
    var that = this;
    var queryEnv = {blanks:{}, outCache:{}};
    this.engine.registerNsInEnvironment(null, queryEnv);
    var floop, pattern, quad, indexKey, indexOrder, index;

    var counter = this.queryCounter;
    this.queryCounter++;
    this.queriesMap[counter] = query;
    this.queriesInverseMap[query] = counter;
    this.queriesList.push(counter);
    this.queriesCallbacksMap[counter] = callback;

    for(var i=0; i<patterns.length; i++) {
        quad = patterns[i];
        if(quad.graph == null) {
            quad.graph = that.engine.lexicon.defaultGraphUriTerm;
        }

        var normalized = that.engine.normalizeQuad(quad, queryEnv, true);
        pattern =  new QuadIndexCommon.Pattern(normalized);        
        indexKey = that._indexForPattern(pattern);
        indexOrder = that.componentOrders[indexKey];
        index = that.queriesIndexMap[indexKey];

        for(var j=0; j<indexOrder.length; j++) {
            var component = indexOrder[j];
            var quadValue = normalized[component];
            if(typeof(quadValue) === 'string') {
                if(index['_'] == null) {
                    index['_'] = [];
                }
                index['_'].push(counter);
                break;
            } else {
                if(j===indexOrder.length-1) {
                    index[quadValue] = index[quadValue] || {'_':[]};
                    index[quadValue]['_'].push(counter);
                } else {
                    index[quadValue] = index[quadValue] || {};
                    index = index[quadValue];
                }
            }
        }

    }

    this.engine.execute(query, function(success, results){
        if(success){
            callback(results);
        } else {
            console.log("ERROR in query callback "+results);
        }                                             
    });

    if(endCallback != null)
        endCallback();
};

Callbacks.CallbacksBackend.prototype.stopObservingQuery = function(query) {
    var id = this.queriesInverseMap[query];
    if(id != null) {
        delete this.queriesInverseMap[query];
        delete this.queriesMap[id];
        this.queriesList = Utils.remove(this.queriesList, id);
    }
};

Callbacks.CallbacksBackend.prototype._searchQueriesInIndex = function(index, order, quadPair) {
    var quadPairNomalized = quadPair[1];
    var quadPair = quadPair[0];

    for(var i=0; i<(order.length+1); i++) {
        var matched = index['_'] || [];
        
        var filteredIds = [];
        for(var j=0; j<matched.length; j++) {
            var queryId = matched[j];
            if(Utils.include(this.pendingQueries,queryId)) {
                Utils.remove(this.pendingQueries,queryId);
                this.matchedQueries.push(queryId);
            }
            // removing IDs for queries no longer being observed
            if(this.queriesMap[queryId] != null) {
                filteredIds.push(queryId);
            }
        }
        index['_'] = filteredIds;

        var component = order[i];
        if(index[''+quadPairNomalized[component]] != null) {
            index = index[''+quadPairNomalized[component]];
        } else {
            break;
        }
    }
};

Callbacks.CallbacksBackend.prototype.dispatchQueries = function(callback) {
    var that = this;
    var floop, query, queryId, queryCallback;
    var toDispatchMap = {};

    Utils.repeat(0, this.matchedQueries.length,
        function(k, env){
            floop = arguments.callee;
            queryId = that.matchedQueries[env._i];
            // avoid duplicate notifications
            if(toDispatchMap[queryId] == null) {
                toDispatchMap[queryId] = true;
                query = that.queriesMap[queryId];
                queryCallback = that.queriesCallbacksMap[queryId];
                Utils.recur(function(){
                    that.engine.execute(query,
                        function(success, results){
                            if(success) {
                                try{
                                    queryCallback(results);
                                }catch(e){}
                            }
                            k(floop,env);
                        });
                });
            } else {
                k(floop,env);
            }
        },
        function(env) {
            callback();
        });
};

// end of ./src/js-query-engine/src/callbacks.js 
//imports

// exports
var RDFStoreClient = {};


try {
    if(typeof(Worker)=='undefined') {
        Worker = null;
    };
} catch(e) {
    Worker = null;
}

// Checks if this is a webworker
if(!!Worker) {

    RDFStoreClient.RDFStoreClient = function(path_to_store_script, args, cb) {
        console.log("trying to load "+path_to_store_script);
        if(Worker.Worker) {
            this.connection = new Worker.Worker(path_to_store_script);
        } else {
            this.connection = new Worker(path_to_store_script);
        }
        this.callbacksCounter = 1;
        var that = this;
        var creationCallback = function(success, result) {
            if(success === true) {
                cb(true, that);
            } else {
                cb(false, result);
            }
        };

        this.rdf = RDFJSInterface.rdf;

        console.log("The worker");
        console.log(this.connection);
        var that = this;
        this.connection.onmessage = function(event){
            that.receive(event);
        };
        this.observingCallbacks = {};
        this.callbacks = {'0': {'cb':creationCallback, 'fn':'create'}};
        this.connection.postMessage({'fn':'create', 'args':args, 'callback':'0'});
    };

    RDFStoreClient.RDFStoreClient.prototype.receive = function(packet) {
        var event = packet.data || packet;
        //console.log("RECEIVED SOMETHING");
        if(event.fn === 'workerRequest:NetworkTransport:load') {
            var that = this;
            var workerCallback = event['callback'];
            var args = event['arguments'].concat(function(success, results){
                that.connection.postMessage({'fn':'workerRequestResponse', 'results':[success, results], 'callback':workerCallback});
            });
            NetworkTransport.load.apply(NetworkTransport,args);
        } else {
            var callbackData = this.callbacks[event.callback];
            //console.log(packet);
            //console.log(callbackData);
            if(callbackData) {
                if(callbackData.fn === 'create' || callbackData.fn === 'execute' || callbackData.fn === 'insert' || callbackData.fn == 'graph' ||
                   callbackData.fn === 'node' || callbackData.fn === 'insert' || callbackData.fn === 'delete' || callbackData.fn === 'clear' ||
                   callbackData.fn === 'load' || callbackData.fn === 'startObservingQueryEndCb' || callbackData.fn === 'registeredGraphs') {
                    delete this.callbacks[event.callback];
                    callbackData.cb(event.success, event.result);
                } else if(callbackData.fn === 'startObservingQuery') {
                    callbackData.cb(event.result);                
                } else if(callbackData.fn === 'startObservingNode') {
                    callbackData.cb(event.result);
                } else if(callbackData.fn === 'subscribe') {
                    callbackData.cb(event.event, event.result);
                }
            }
        }
    };

    RDFStoreClient.RDFStoreClient.prototype.registerCallback = function(fn, callback) {
        var id = ''+this.callbacksCounter;
        this.callbacks[id] = {'fn':fn, 'cb':callback};
        this.callbacksCounter++;

        return id;
    };

    RDFStoreClient.RDFStoreClient.prototype.execute = function() {
        if(arguments.length === 3) {
            this.executeWithEnvironment(arguments[0],
                                        arguments[1],
                                        arguments[2]);
        } else if(arguments.length === 4) {
            this.executeWithEnvironment(arguments[0],
                                        arguments[1],
                                        arguments[2],
                                        arguments[3]);
        } else {

            var queryString,callback;

            if(arguments.length === 1) {
                queryString = arguments[0];
                callback = function(){};

            } else if(arguments.length === 2) {
                queryString = arguments[0];
                callback = arguments [1];
            }

            var id = this.registerCallback('execute',callback);

            this.connection.postMessage({'fn':'execute', 'args':[queryString], 'callback':id});
        }

    };

    RDFStoreClient.RDFStoreClient.prototype.insert = function() {
        var graph;
        var triples;
        var callback;
        if(arguments.length === 1) {
            triples = arguments[0];
            this.connection.postMessage({'fn':'insert', 'args':[triples]})
        } else if(arguments.length === 2) {
            triples = arguments[0];
            callback= arguments[1] || function(){};
            var id = this.registerCallback('insert', callback);
            this.connection.postMessage({'fn':'insert', 'args':[triples], 'callback':id})
        } else if(arguments.length === 3) {
            triples = arguments[0];
            graph = arguments[1];
            callback= arguments[2] || function(){};
            var id = this.registerCallback('insert', callback);
            this.connection.postMessage({'fn':'insert', 'args':[triples,graph], 'callback':id})
        } else {
            throw("The triples to insert, an optional graph and callback must be provided");
        }
    };

    RDFStoreClient.RDFStoreClient.prototype.graph = function() {
        var graphUri = null;
        var callback = null;
        if(arguments.length === 1) {
            callback = arguments[0] || function(){};
        } else if(arguments.length === 2) {
            callback = arguments[1] || function(){};
            graphUri = arguments[0];
        } else {
            throw("An optional graph URI and a callback function must be provided");
        }

        var that = this;
        var wrapperCallback = function(success, toWrap) {
            //console.log("CALLBACK!\n\n");
            if(success) {
                var triple;
                for(var i=0; i<toWrap.triples.length; i++) {
                    triple = toWrap.triples[i];
                    toWrap.triples[i] = new RDFJSInterface.Triple(that.adaptJSInterface(triple.subject),
                                                                  that.adaptJSInterface(triple.predicate),
                                                                  that.adaptJSInterface(triple.object));
                }                
                callback(success, that.rdf.createGraph(toWrap.triples));
            } else {
                callback(success,toWrap);
            }
        };
        var id = this.registerCallback('insert', wrapperCallback);
        if(graphUri == null) {
            this.connection.postMessage({'fn':'graph', 'args':[], 'callback':id})
        } else {
            this.connection.postMessage({'fn':'graph', 'args':[graphUri], 'callback':id})
        }
    };

    RDFStoreClient.RDFStoreClient.prototype.node = function() {
        var graphUri = null;
        var callback = null;
        var nodeUri  = null;
        if(arguments.length === 2) {
            nodeUri = arguments[0];
            callback = arguments[1] || function(){};
        } else if(arguments.length === 3) {
            nodeUri = arguments[0];
            graphUri = arguments[1];
            callback = arguments[2] || function(){};
        } else {
            throw("An optional graph URI and a callback function must be provided");
        }

        var that = this;
        var wrapperCallback = function(success, toWrap) {
            //console.log("CALLBACK!\n\n");
            if(success) {
                var triple;
                for(var i=0; i<toWrap.triples.length; i++) {
                    triple = toWrap.triples[i];
                    toWrap.triples[i] = new RDFJSInterface.Triple(that.adaptJSInterface(triple.subject),
                                                                  that.adaptJSInterface(triple.predicate),
                                                                  that.adaptJSInterface(triple.object));
                }                
                callback(success, that.rdf.createGraph(toWrap.triples));
            } else {
                callback(success,toWrap);
            }
        };
        var id = this.registerCallback('insert', wrapperCallback);
        if(graphUri == null) {
            this.connection.postMessage({'fn':'node', 'args':[nodeUri], 'callback':id})
        } else {
            this.connection.postMessage({'fn':'node', 'args':[nodeUri, graphUri], 'callback':id})
        }

    };

    RDFStoreClient.RDFStoreClient.prototype.setPrefix = function(prefix, uri) {
        this.rdf.setPrefix(prefix, uri);
        this.connection.postMessage({'fn':'rdf/setPrefix', 'args':[prefix, uri], 'callback':null})
    };

    RDFStoreClient.RDFStoreClient.prototype.setDefaultPrefix = function(uri) {
        this.rdf.setDefaultPrefix(uri);
        this.connection.postMessage({'fn':'rdf/setDefaultPrefix', 'args':[uri], 'callback':null})
    };


    RDFStoreClient.RDFStoreClient.prototype['delete'] = function() {
        var graph;
        var triples;
        var callback;
        if(arguments.length === 1) {
            triples = arguments[0];
            this.connection.postMessage({'fn':'delete', 'args':[triples]})
        } else if(arguments.length === 2) {
            triples = arguments[0];
            callback= arguments[1] || function(){};
            var id = this.registerCallback('delete', callback);
            this.connection.postMessage({'fn':'delete', 'args':[triples], 'callback':id})
        } else if(arguments.length === 3) {
            triples = arguments[0];
            graph = arguments[1];
            callback= arguments[2] || function(){};
            var id = this.registerCallback('delete', callback);
            this.connection.postMessage({'fn':'delete', 'args':[triples,graph], 'callback':id})
        } else {
            throw("The triples to delete, an optional graph and callback must be provided");
        }
    };


    RDFStoreClient.RDFStoreClient.prototype.clear = function() {
        var graph;
        var callback;
     
        if(arguments.length === 1) {
            callback= arguments[0] || function(){};
            var id = this.registerCallback('clear', callback);
            this.connection.postMessage({'fn':'clear', 'args':[], 'callback':id})
        } else if(arguments.length === 2) {
            graph = arguments[0];
            callback= arguments[1] || function(){};
            var id = this.registerCallback('clear', callback);
            this.connection.postMessage({'fn':'clear', 'args':[graph], 'callback':id})
        } else {
            throw("The optional graph and a callback must be provided");
        }
    };


    /**
     * Boolean value determining if loading RDF must produce
     * triple add events and fire callbacks.
     * Default is false.
     */
    RDFStoreClient.RDFStoreClient.prototype.setBatchLoadEvents = function(mustFireEvents){
        this.connection.postMessage({'fn':'setBatchLoadEvents', 'args':[mustFireEvents]});
    };

    /**
     * Registers a namespace prefix that will be automatically declared
     * in all the queries
     */
    RDFStoreClient.RDFStoreClient.prototype.registerDefaultNamespace = function(ns, prefix) {
        this.connection.postMessage({'fn':'registerDefaultNamespace', 'args':[ns,prefix]});
    };
     
    /**
     * Registers the default namespaces declared in the RDF JS Interfaces
     * specification in the default Profile.
     */
    RDFStoreClient.RDFStoreClient.prototype.registerDefaultProfileNamespaces = function() {
        this.connection.postMessage({'fn':'registerDefaultProfileNamespaces', 'args':[]});
    };

    RDFStoreClient.RDFStoreClient.prototype.load = function(){
        var mediaType;
        var data;
        var graph;
        var callback;
     
        if(arguments.length === 3) {
            mediaType = arguments[0];
            data = arguments[1];
            callback= arguments[2] || function(){};
            var id = this.registerCallback('load', callback);
            this.connection.postMessage({'fn':'load', 'args':[mediaType, data], 'callback':id})
        } else if(arguments.length === 4) {
            mediaType = arguments[0];
            data = arguments[1];
            graph = arguments[2];
            callback= arguments[3] || function(){};
            var id = this.registerCallback('load', callback);
            this.connection.postMessage({'fn':'load', 'args':[mediaType, data, graph], 'callback':id})
        } else if(arguments.length === 2) {
            throw("The mediaType of the parser, the data a callback and an optional graph must be provided");
        }
     
    };

    RDFStoreClient.RDFStoreClient.prototype.startObservingQuery = function() {
        var query = arguments[0];
        var callback = arguments[1];
        var endCallback = arguments[2];
        if(endCallback!=null) {
            var id1 = this.registerCallback('startObservingQuery', callback);
            this.observingCallbacks[query] = id1;
            var id2 = this.registerCallback('startObservingQueryEndCb', endCallback);
            this.connection.postMessage({'fn':'startObservingQuery', 'args':[query], 'callback':[id1,id2]})
        } else {
            var id1 = this.registerCallback('startObservingQuery', callback);
            this.observingCallbacks[query] = id1;
            this.connection.postMessage({'fn':'startObservingQuery', 'args':[query], 'callback':[id1]})
        }
    };
     
    RDFStoreClient.RDFStoreClient.prototype.stopObservingQuery = function(query) {
        var id = this.observingCallbacks[query];
        delete this.observingCallbacks[query];
        delete this.callbacks[id];
        this.connection.postMessage({'fn':'stopObservingQuery', 'args':[query], 'callback':[]})
    };

    RDFStoreClient.RDFStoreClient.prototype.startObservingNode = function() {
        var uri, graphUri, callback;

        if(arguments.length === 2) {
            uri = arguments[0];
            callback = arguments[1];

            var that = this;
            var wrapperCallback = function(toWrap) {
                //console.log("CALLBACK!\n\n");
                var triple;
                for(var i=0; i<toWrap.triples.length; i++) {
                    triple = toWrap.triples[i];
                    toWrap.triples[i] = new RDFJSInterface.Triple(that.adaptJSInterface(triple.subject),
                                                                  that.adaptJSInterface(triple.predicate),
                                                                  that.adaptJSInterface(triple.object));
                }                
                callback(that.rdf.createGraph(toWrap.triples));
            };

            var id = this.registerCallback('startObservingNode', wrapperCallback);
            this.observingCallbacks[callback] = id;

            this.connection.postMessage({'fn':'startObservingNode', 'args':[uri], 'callback':id})
        } else if(arguments.length === 3) {
            uri = arguments[0];
            graphUri = arguments[1];
            callback = arguments[2];

            var that = this;
            var wrapperCallback = function(toWrap) {
                //console.log("CALLBACK!\n\n");
                var triple;
                for(var i=0; i<toWrap.triples.length; i++) {
                    triple = toWrap.triples[i];
                    toWrap.triples[i] = new RDFJSInterface.Triple(that.adaptJSInterface(triple.subject),
                                                                  that.adaptJSInterface(triple.predicate),
                                                                  that.adaptJSInterface(triple.object));
                }                
                callback(that.rdf.createGraph(toWrap.triples));
            };

            var id = this.registerCallback('startObservingNode', wrapperCallback);
            this.observingCallbacks[callback] = id;

            this.connection.postMessage({'fn':'startObservingNode', 'args':[uri,graphUri], 'callback':id})
        }
    };
     
    RDFStoreClient.RDFStoreClient.prototype.stopObservingNode = function(callback) {
        var id = this.observingCallbacks[callback];
        delete this.observingCallbacks[callback];
        delete this.callbacks[id];
        //console.log("STOP OBSERVING "+id);
        this.connection.postMessage({'fn':'stopObservingNode', 'args':[id], 'callback':[]})
    };

    RDFStoreClient.RDFStoreClient.prototype.subscribe = function(s, p, o, g, callback) {
        var that = this;
        var wrapperCallback = function(event,triples) {
            //console.log("CALLBACK!\n\n");
            var triple;
            for(var i=0; i<triples.length; i++) {
                triple = triples[i];
                triples[i] = new RDFJSInterface.Triple(that.adaptJSInterface(triple.subject),
                                                       that.adaptJSInterface(triple.predicate),
                                                       that.adaptJSInterface(triple.object));
            }                
            callback(event,triples);
        };
        var id = this.registerCallback('subscribe', wrapperCallback);
        this.observingCallbacks[callback] = id;

        this.connection.postMessage({'fn':'subscribe', 'args':[s,p,o,g], 'callback':id});
    };
     
    RDFStoreClient.RDFStoreClient.prototype.unsubscribe = function(callback) {
        var id = this.observingCallbacks[callback];
        delete this.observingCallbacks[callback];
        delete this.callbacks[id];
        //console.log("STOP OBSERVING "+id);
        this.connection.postMessage({'fn':'unsubscribe', 'args':[id], 'callback':[]})
    };
         
    RDFStoreClient.RDFStoreClient.prototype.registeredGraphs = function(callback) {
        var that = this;
        var wrapperCallback = function(success, graphs) {
            //console.log("CALLBACK!\n\n");
            if(success) {
                var triple;
                for(var i=0; i<graphs.length; i++) {
                    var graph = graphs[i];
                    graphs[i] = that.adaptJSInterface(graph);
                }                
                callback(success, graphs);
            } else {
                callback(success,graphs);
            }
        };

        var id = this.registerCallback('registeredGraphs', wrapperCallback);
        this.connection.postMessage({'fn':'registeredGraphs', 'args':[], 'callback':id})
    };

    // helper functions
    RDFStoreClient.RDFStoreClient.prototype.adaptJSInterface = function(node) {
        if(node.interfaceName === 'BlankNode') {
            return new RDFJSInterface.BlankNode(node.bnodeId);
        } else if(node.interfaceName === 'Literal') {
            return new RDFJSInterface.Literal(node.nominalValue, node.language, node.datatype);
        } else if(node.interfaceName === 'NamedNode') {
            return new RDFJSInterface.NamedNode(node.nominalValue);
        }
    };

    // make possible for clients to test if this i being executed inside a connection
    RDFStoreClient.RDFStoreClient.prototype.isWebWorkerConnection = true;
}

// end of ./src/js-connection/src/rdfstore_client.js 
// exports
var MicrographQL = {};

// imports

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

MicrographQL.counter = 0;

MicrographQL.filterNames = {'$eq':true, '$lt':true, '$gt':true, '$neq':true, '$lteq':true, '$gteq':true, '$not':true, '$like':true, '$and':true, '$or':true};

MicrographQL.newContext = function(isQuery) {
    return {variables: [], isQuery:isQuery, quads:[], varsMap: {}, 
	    filtersMap: {}, inverseMap:{}};
};

MicrographQL.isFilter = function(val) {
    if(typeof(val) !== 'object' || val.constructor === Array) {
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
	var acum = [];
	for(var i=0; i<value.length; i++) {
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
                "iriref": MicrographQL.parseURI(MicrographQL.base_uri+expression['$id'])
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
    var variable = "id"+MicrographQL.counter;
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

MicrographQL.parseLiteral = function(value) {
    if(typeof(value) === 'string') {
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

MicrographQL.parseJSON = function(object, graph) {
    var context = MicrographQL.newContext(false);
    var result = MicrographQL.parseBGP(object, context, true, graph);
    var quads = context.quads.concat(result[1]);
    return quads;
};


MicrographQL.parseBGP = function(expression, context, topLevel, graph) {
    var subject = null;
    var quads = [];
    var nextVariable = MicrographQL.nextVariable();
    var filterCounter = 0;
    if(expression['$id'] != null || !context.isQuery) {
	if(expression['$id'] == null) {
	    subject = MicrographQL.parseURI(null) // generates URI with next ID
	    if(expression['$id'] == null) 
		expression['$id'] = "object"+(MicrographQL.counter-1); // the previous ID

	} else {
	    if(expression['$id']['token'] ==='var') {
		// this node is an inverse relationship
		subject = expression['$id'];
	    } else {
		subject = MicrographQL.parseURI(MicrographQL.base_uri+expression['$id']);
	    }
	}

	context.varsMap[nextVariable] = subject.value;
    } else {
	subject = {'token':'var', 'value':nextVariable};
	context.variables.push(subject);
	context.varsMap[nextVariable] = nextVariable;
    }


    if(topLevel)
	context.topLevel = nextVariable;

    
    var predicate, object, result, linked, linkedId, inverseLinks, linkedProp, detectEmpty = true;
    for(var p in expression) {
	if(expression[p] != null) {
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

		    linked[linkedProp] = {'$id':invLinkedId};
		    result = MicrographQL.parseBGP(linked, context, false, graph);

		    inverseLinks = context.inverseMap[idInverseMap] || {};
		    context.inverseMap[idInverseMap] = inverseLinks;

		    var linked = inverseLinks[linkedProp] || [];
		    inverseLinks[linkedProp] = linked;
		    if(result[0].token === 'uri') {
			linked.push(result[0].value.split(MicrographQL.base_uri)[1]);
		    } else {
			linked.push(result[0].value);
		    }

		    context.quads = context.quads.concat(result[1]);
		} else {

		    var predicateUri = p;
		    if(p === '$type') {
			predicateUri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
		    }

		    predicate = MicrographQL.parseURI(predicateUri);

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
		    } else if(typeof(expression[p]) === 'object' && expression[p]['token'] === 'var') {
			object = expression[p];
			if(context.varsMap[expression] == null) {
			    context.varsMap[expression] = true;
			    context.variables.push(object);
			}
			var quad = {'subject':subject, 'predicate':predicate, 'object':object};
			if(graph != null)
			    quad['graph'] = graph;
			quads.push(quad);

		    } else if(typeof(expression[p]) === 'string' || 
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
				// @todo check if this is a literal instead of an object
				result = MicrographQL.parseBGP(expression[p][i], context, false, graph);
				object = result[0];
				context.quads = context.quads.concat(result[1]);
				var quad = {'subject':subject, 'predicate':predicate, 'object':object};
				if(graph != null)
				    quad['graph'] = graph;
				quads.push(quad);
			    }
			} else {
			    if(expression[p]['token'] === 'var') {
				var quad = {'subject':subject, 'predicate':predicate, 'object':expression[p]};
				if(graph != null)
				    quad['graph'] = graph;
				quads.push(quad);
			    } else {
				result = MicrographQL.parseBGP(expression[p], context, false, graph);
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
	     token: 'query' }
};

MicrographQL.literalToJS = function(object) {
    if(object.type === "http://www.w3.org/2001/XMLSchema#float") {
	object = parseFloat(object.value)
    } else if(object.type === "http://www.w3.org/2001/XMLSchema#boolean") {
	object = (object.value === "true") ? true : false;
    } else if(object.type === "http://www.w3.org/2001/XMLSchema#dateTime") {
	object = Utils.parseISO8601(object.value);
    } else {
	object = object.value;
    }
    return object;
}
// end of ./src/micrograph/src/micrograph_ql.js 
// imports
/*
var sys = null;
try {
    sys = require("util");
} catch(e) {
    sys = require("sys");
}
*/

// Query object
var MicrographQuery = function(template) {
    this.template = template;
    this.filter = null;
};

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
    this.filter = callback;
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

MicrographQuery.prototype.order = function(order) {
    this.sortValue = order;
    return this;
}

MicrographQuery.prototype.all = function(callback) {
    this.kind = 'all';
    this._executeQuery(callback);
    return this.store;
};

MicrographQuery.prototype.remove = function(callback) {
    this.kind = 'remove';
    this._executeUpdate(callback);
    return this.store;
};


MicrographQuery.prototype.removeNodes = function(callback) {
    this.kind = 'removeNodes';
    this._parseModifyNodes(this.template, callback);
    return this.store;
};
// protected inner methods

MicrographQuery.prototype._executeUpdate = function(callback) {
    var pattern;
    pattern = this._parseModify(this.template);
    this.query = pattern.query;
    this.varsMap = pattern.varsMap;
    this.topLevel = pattern.topLevel;
    this.subject = pattern.subject;
    this.inverseMap = pattern.inverseMap;
    //console.log(sys.inspect(this.query, true, 20));
    this.store.execute(this.query,function(success, results){
	if(callback)
	    callback(success);
    });
};

MicrographQuery.prototype._executeQuery = function(callback) {
    var pattern = this._parseQuery(this.template);
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
	var nextVariable = MicrographQL.nextVariable();
	var sortCounter = 0;
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
	    if(sortPredicate === '$type') {
		predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
	    }
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

    if(this.limitValue != null)
	unit.limit = this.limitValue;

    if(this.offsetValue != null) 
	unit.offset = this.offsetValue;

    if(sortAcum.length > 0)
	unit.order = sortAcum;


    if(callback != null )
	this.callback = callback;

    var that = this;
    if(this.kind === "all") {
	//console.log(sys.inspect(this.query, true, 20));
	var counter = 0;
	this.store.execute(this.query, function(success, results) {
	    //console.log("results : "+results.length);
	    if(MicrographQL.isUri(that.varsMap[that.topLevel]) && results.length>0) {
		// if the top level is a URI, not retrieved in the results,
		// and there are results, we add the node to one result
		// bindings to force retrieval of data
		results[0][that.topLevel] = that.varsMap[that.topLevel];
	    }

	    var pushed = {};
	    var processed = {};
	    var ignore = {};

	    if(success) {
		var nodes = {};
		var disambiguations = {};
		var toReturn = [];
		var result, isTopLevel, nodeDisambiguations;
		
		for(var i=0; i<results.length; i++) {
		    result = results[i];
		    for(var p in result) {
			isTopLevel = false;
			var idp = that.varsMap[p];

			if(idp == p)
			    idp = results[i][p].value;


			if(p === that.topLevel)
			    isTopLevel = true;

			var id = idp.split(MicrographQL.base_uri)[1];
			if(processed[id] == null) {
			    var node = nodes[id];
			    node = node || {'$id': id};
			    nodes[id] = node;
			    
			    toIgnore = ignore[id] || {};
			    ignore[id] = toIgnore;

			    var invLinks = that.inverseMap[id] || that.inverseMap[p];
			    if(invLinks) {
				for(var linkedProp in invLinks) {
				    if(invLinks[linkedProp].length === 1) {
					var linkedObjId = results[i][that.varsMap[invLinks[linkedProp][0]]];
					if(linkedObjId != null) {
					    // this is a variable resolved to a URI in the bindings results
					    linkedObjId = linkedObjId.value.split(MicrographQL.base_uri)[1];
					} else {
					    linkedObjId = invLinks[linkedProp][0];
					}

					var linkedNode = nodes[linkedObjId] || {'$id': linkedObjId};
					var toIgnore = ignore[linkedObjId] || {};
					ignore[linkedObjId] = toIgnore;
					toIgnore[linkedProp] = true;
					delete linkedNode[linkedProp];

					nodes[linkedObjId] = linkedNode;
					node[linkedProp+"$in"] = linkedNode;
				    } else {
					node[linkedProp+"$in"] = [];
					for(var i=0; i< invLinks[linkedProp].length; i++) {

					    var linkedNode = nodes[linkedObjId] || {'$id': linkedObjId};
					    var toIgnore = ignore[linkedObjId] || {};					  
					    ignore[linkedObjId] = toIgnore;
					    toIgnore[linkedProp] = true;
					    delete linkedNode[linkedProp];

					    var linkedObjId = that.varsMap[invLinks[linkedProp][0]] || invLinks[linkedProp][0];
					    var linkedNode = nodes[linkedObjId] || {'$id': linkedObjId};
					    nodes[linkedObjId].push(linkedNode);
					}
				    }
				}
			    }

			    if(MicrographQL.isUri(idp)) {
				that.store.execute(MicrographQL.singleNodeQuery(idp, 'p', 'o'), function(success, resultsNode){
				    processed[id] = true;
				    counter++;

				    nodeDisambiguations = disambiguations[id] || {};
				    disambiguations[id] = nodeDisambiguations;

				    var obj = null;
				    for(var i=0; i<resultsNode.length; i++) {
					var obj = resultsNode[i]['o'];
					if(obj.token === 'uri') {
					    var oid = obj.value.split(MicrographQL.base_uri)[1];
					    var linked  = nodes[oid] || {};
					    linked['$id'] = oid;
					    nodes[oid] = linked;
					    obj = linked;
					} else {
					    obj = MicrographQL.literalToJS(obj);
					}

					var pred = resultsNode[i]['p'].value;
					if(pred === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
					    pred = '$type';

					if(toIgnore[pred])
					    continue;

					if(node[pred] && node[pred].constructor === Array) {
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
					} else if(node[pred]) {
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

				    if(isTopLevel && pushed[node['$id']] == null) {
					toReturn.push(node);
					pushed[node['$id']] = true;
				    }
				});
			    }
			}
		    }
		}

		if(that.filter != null) {
		    var filtered = [];
		    var filteredResult;
		    Utils.repeat(0,toReturn.length, function(k,env) {
			var floop = arguments.callee;
			var result = toReturn[env._i];
			filteredResult = that.filter(result) || result;
			if(filtered !== false)
			    filtered.push(filteredResult);
			k(floop,env);
		    }, function(env) {
			callback(filtered); 
		    });
		} else {	
		    callback(toReturn);
		}
	    } else {
		if(that.onErrorCallback) {
		    that.onError(results);
		} else {
		    that.callback(null);
		}
	    }
	});
    }
}

MicrographQuery.prototype._parseQuery = function(object) {
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

		var subject = {'token':'uri', 'value':MicrographQL.base_uri+that.template['$id']};

		if(result===true)
		    counter++;

		var pattern = that._modifyQuery([{'subject': subject,
						  'predicate': {'token':'var', 'value':nextVariable+'pout'},
						  'object': {'token':'var', 'value':nextVariable+'oout'}}]);

		that.store.execute(pattern.query, function(success,res) {});

		pattern = that._modifyQuery([{'subject': {'token':'var', 'value':nextVariable+'sin'},
					      'predicate': {'token':'var', 'value':nextVariable+'pin'},
					      'object': subject}]);

		that.store.execute(pattern.query, function(success,res) {});

	    });
	};
    });

    if(callback)
	callback(counter);
};

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

// end of ./src/micrograph/src/micrograph_query.js 
// imports
var MongodbQueryEngine = { MongodbQueryEngine: function(){ throw 'MongoDB backend not supported in the browser version' } };


// Store
var Micrograph = function(options, callback) {
    if(options['treeOrder'] == null) {
        options['treeOrder'] = 15;
    }

    var that = this;

    for(var i=0; i<Micrograph.vars.length; i++) {
	this['_'+Micrograph.vars[i]] = this._(Micrograph.vars[i]);
    }


    new Lexicon.Lexicon(function(lexicon){
        if(options['overwrite'] === true) {
            // delete lexicon values
            lexicon.clear();
        }
        new QuadBackend.QuadBackend(options, function(backend){
            if(options['overwrite'] === true) {
                // delete index values
                backend.clear();
            }
            options.backend = backend;
            options.lexicon =lexicon;
            that.engine = new QueryEngine.QueryEngine(options);      

	    that.engine.abstractQueryTree.oldParseQueryString = that.engine.abstractQueryTree.parseQueryString;
	    that.engine.abstractQueryTree.parseQueryString = function(toParse) {

		if(typeof(toParse) === 'string') {
		    return this.oldParseQueryString(toParse);
		} else {
		    return toParse;
		}
	    };

            if(callback) {
                callback(that);
            }
        });
    },options['name']);
};

Micrograph.VERSION = "0.1.0";

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


Micrograph.prototype.execute = function(query, callback) {
    this.engine.execute(query,callback);
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

	//Utils.repeat(0,data.length, function(k,env) {
	// 	var floop = arguments.callee;
	for(var i=0; i<data.length; i++) {
	    quads = MicrographQL.parseJSON(data[i],graph);

	    //console.log("LOAD");
	    //console.log(quads);

	    that.engine.batchLoad(quads,function(){ 
		//k(floop,env); 
	    });
	}
	//}, function() {
	callback(data);
	//});
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
// end of ./src/micrograph/src/micrograph.js 
try {
  if(typeof(window) === 'undefined')
     exports.create = Micrograph.create;
  else
     window.mg = Micrograph;
} catch(e) { }
})();
