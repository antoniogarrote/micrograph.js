(function(){
// exports
var PriorityQueue = {};

/**
 * @constructor
 * @class PriorityQueue manages a queue of elements with priorities. Default
 * is highest priority first.
 *
 * @param [options] If low is set to true returns lowest first.
 */
PriorityQueue.PriorityQueue = function(options) {
    var contents = [];
    var store = {};
    var sorted = false;
    var sortStyle;
    var maxSize = options.maxSize || 10;

    //noinspection UnnecessaryLocalVariableJS
    sortStyle = function(a, b) {
        return store[b].priority - store[a].priority;
    };


    /**
     * @private
     */
    var sort = function() {
        contents.sort(sortStyle);
        sorted = true;
    };

    var self = {
        debugContents: contents,
        debugStore: store,
        debugSort: sort,

        push: function(pointer, object) {
            if(contents.length === maxSize) {
                if(!sorted) {
                    sort();
                }
                if(store[pointer] == null) {
                    delete store[contents[0]];
                    contents[0] = pointer;
                    var priority = (store[contents[contents.length - 1]].priority) - 1;
                    store[pointer] = {object: object, priority: priority};
                    sorted = false;
                } else {
                    priority = (store[contents[contents.length - 1]].priority) - 1;
                    store[pointer].priority = priority;
                    sorted = false;
                }
            } else if(contents.length === 0){
                contents.push(pointer);
                store[pointer] = {object: object, priority: 1000};
            } else  {
                priority = (store[contents[contents.length - 1]].priority) - 1;
                if(store[pointer] == null) {
                    store[pointer] = {object: object, priority: priority};
                    contents.push(pointer);
                } else {
                    store[pointer].priority = priority;
                    sorted = false;
                }
            }
        },

        remove: function(pointer) {
            if(store[pointer] != null) {
                delete store[pointer];
                var pos = null;
                for(var i=0; i<contents.length; i++) {
                    if(contents[i] === pointer) {
                        pos = i;
                        break;
                    }
                }

                if(pos != null) {
                    contents.splice(pos,1);
                }
            }
        },

        fetch: function(pointer) {
            var obj = store[pointer];
            if(store[pointer] != null) {
                if(!sorted) {
                    sort();
                }
                var priority = (store[contents[contents.length - 1]].priority) - 1;
                store[pointer].priority = priority;
                sorted = false;
                return obj.object;
            } else {
                return null;
            }
        }

    };

    return self;
};

// end of ./src/js-trees/src/priority_queue.js 
// exports
var WebLocalStorageBTree = {};

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
WebLocalStorageBTree.Tree = function(order, name, persistent, cacheMaxSize) {
    if(arguments.length != 0) {
        var storage = null;
        if(persistent === true) {
            try {
                storage = window.localStorage;
                if(storage == null) {
                    throw("not found");
                }
            } catch(e) {
                throw("Local storage is not present, cannot create persistent storage");
            }
        }

        if(storage == null) {
            storage = (function(){ 
                var content = {};
                return { setItem: function(pointer, object) {
                            content[pointer] = object;
                        },
                        getItem: function(pointer) {
                            return (content[pointer] || null);
                        },
                        removeItem: function(pointer) {
                            delete content[pointer];
                        },
                        get: function(i) {
                            var j=0;
                            for(var k in content) {
                                if(i===j) {
                                    return k;
                                }
                                j++;
                            }

                            return "";
                        },
                        length: content.length
                       };
            })();
        }

        this.storage = storage;
        this.order = order;
        this.name = name;
        this.diskManager = new WebLocalStorageBTree.LocalStorageManager(name, storage, cacheMaxSize);
        this.root = this.diskManager._readRootNode();
        //this.root = this.diskManager._diskRead("__"+name+"__ROOT_NODE__");
        if(this.root == null) {
            this.root = this._allocateNode();
            this.root.isLeaf = true;
            this.root.level = 0;
            this._diskWrite(this.root);
            this._updateRootNode(this.root);
            this.root = this.root.pointer;
        } else {
            this.root = this.diskManager._diskRead(this.root).pointer;
        };

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
WebLocalStorageBTree.Tree.prototype._allocateNode = function() {
    return new WebLocalStorageBTree.Node();
};

/**
 * _diskWrite
 *
 * Persists the node to secondary memory.
 */
WebLocalStorageBTree.Tree.prototype._diskWrite= function(node) {
    this.diskManager._diskWrite(node);
};


/**
 * _diskRead
 *
 * Retrieves a node from secondary memory using the provided
 * pointer
 */
WebLocalStorageBTree.Tree.prototype._diskRead = function(pointer) {
    return this.diskManager._diskRead(pointer);
};


WebLocalStorageBTree.Tree.prototype._diskDelete = function(node) {
    this.diskManager._diskDelete(node);
};

/**
 * _updateRootNode
 *
 * Updates the pointer to the root node stored in disk.
 */
WebLocalStorageBTree.Tree.prototype._updateRootNode = function(node) {
    this.diskManager._updateRootNode(node);
    return node;
};


/**
 * search
 *
 * Retrieves the node matching the given value.
 * If no node is found, null is returned.
 */
WebLocalStorageBTree.Tree.prototype.search = function(key, checkExists) {
    var searching = true;
    var node = this._diskRead(this.root);

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
WebLocalStorageBTree.Tree.prototype.walk = function(f) {
    this._walk(f,this._diskRead(this.root));
};

WebLocalStorageBTree.Tree.prototype._walk = function(f,node) {
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
WebLocalStorageBTree.Tree.prototype.walkNodes = function(f) {
    this._walkNodes(f,this._diskRead(this.root));
};

WebLocalStorageBTree.Tree.prototype._walkNodes = function(f,node) {
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
WebLocalStorageBTree.Tree.prototype._splitChild = function(parent, index, child) {
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
    this._diskWrite(newChild);

    parent.children[index+1] = newChild.pointer;

    for(i = parent.numberActives; i>index; i--) {
	parent.keys[i] = parent.keys[i-1];
    }

    parent.keys[index] = newParentChild;
    parent.numberActives++;

    this._diskWrite(parent);
    this._diskWrite(child);
};

/**
 * insert
 *
 * Creates a new node with value key and data and inserts it
 * into the tree.
 */
WebLocalStorageBTree.Tree.prototype.insert = function(key,data) {
    var currentRoot = this._diskRead(this.root);


    if(currentRoot.numberActives === (2 * this.order - 1)) {
        var newRoot = this._allocateNode();
        newRoot.isLeaf = false;
        newRoot.level = currentRoot.level + 1;
        newRoot.numberActives = 0;
        newRoot.children[0] = currentRoot.pointer;
        this._diskWrite(newRoot);

        this._splitChild(newRoot, 0, currentRoot);
        this.root = newRoot.pointer;
        this._updateRootNode(newRoot);
        this._insertNonFull(newRoot, key, data);
    } else {
        this._insertNonFull(currentRoot, key, data);
    }
};

/**
 * _insertNonFull
 *
 * Recursive function that tries to insert the new key in
 * in the prvided node, or splits it and go deeper
 * in the BTree hierarchy.
 */
WebLocalStorageBTree.Tree.prototype._insertNonFull = function(node,key,data) {
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
WebLocalStorageBTree.Tree.prototype['delete'] = function(key) {
    var node = this._diskRead(this.root);
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
                        node = this._diskRead(node.pointer);
                    } else if(lsibling != null && lsibling.numberActives > (this.order-1)) {
                        // The current node has (t - 1) keys but the left sibling has > (t - 1) keys
                        this._moveKey(parent,i,right);
                        node = this._diskRead(node.pointer);
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
        if(node.isLeaf && (node.pointer === this.root)) {
            this._deleteKeyFromNode(node,idx);
            return true;
        }

    try {
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
            } else {
                if ((tmpNode = this._diskRead(node.children[idx+1])).numberActives >(this.order-1)) {
                    var subNodeIdx = this._getMinKeyPos(tmpNode);
                    key = subNodeIdx.node.keys[subNodeIdx.index];

                    node.keys[idx] = key;

                    //this._delete(node.children[idx+1],key.key);
                    this._diskWrite(node);
                    node = tmpNode;
                    key = key.key;
                    shouldContinue = true;
                    searching = true;
                } else {
                    if((tmpNode = this._diskRead(node.children[idx])).numberActives === (this.order-1) &&
                       (tmpNode2 = this._diskRead(node.children[idx+1])).numberActives === (this.order-1)) {

                        var combNode = this._mergeNodes(tmpNode, node.keys[idx], tmpNode2);
                        node.children[idx] = combNode.pointer;

                        idx++;
                        for(var i=idx; i<node.numberActives; i++) {
          	            node.children[i] = node.children[i+1];
          	            node.keys[i-1] = node.keys[i];
                        }
                        // freeing unused references
                        node.children[i] = null;
                        node.keys[i-1] = null;

                        node.numberActives--;
                        if (node.numberActives === 0 && this.root === node.pointer) {
                            this.root = combNode.pointer;
                            this._updateRootNode(combNode);
                        }

                        this._diskWrite(node);

                        node = combNode;
                        shouldContinue = true;
                        searching = true;
                    }
                }
            }
        }
    } catch(e) {
        console.log("!!!");
        console.log(e);
    }


        // Case 3:
	// In this case start from the top of the tree and continue
	// moving to the leaf node making sure that each node that
	// we encounter on the way has at least 't' (order of the tree)
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
WebLocalStorageBTree.Tree.prototype._moveKey = function (parent, i, position) {

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
WebLocalStorageBTree.Tree.prototype._mergeSiblings = function (parent, index, pos) {
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

    this._diskWrite(newNode);
    parent.children[index] = newNode.pointer;

    for (j = index; j < parent.numberActives; j++) {
        parent.keys[j] = parent.keys[j + 1];
        parent.children[j + 1] = parent.children[j + 2];
    }

    newNode.numberActives = n1.numberActives + n2.numberActives + 1;
    parent.numberActives--;

    for (i = parent.numberActives; i < 2 * this.order - 1; i++) {
        parent.keys[i] = null;
    }

    if (parent.numberActives === 0 && this.root === parent.pointer) {
        this.root = newNode.pointer;
        if (newNode.level) {
            newNode.isLeaf = false;
        } else {
            newNode.isLeaf = true;
        }
    }

    this._diskWrite(newNode);
    if (this.root === newNode.pointer) {
        this._updateRootNode(newNode);
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
WebLocalStorageBTree.Tree.prototype._deleteKeyFromNode = function (node, index) {
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
    node.keys.splice(keysMax - 1, (node.keys.length - (keysMax - 1)));
    node.numberActives--;

    this._diskWrite(node);

    return true;
};

WebLocalStorageBTree.Tree.prototype._mergeNodes = function (n1, key, n2) {
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
    this._diskDelete(n1);
    this._diskDelete(n2);
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
WebLocalStorageBTree.Tree.prototype.audit = function (showOutput) {
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
            console.log(" - pointer: " + n.pointer);
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

        if (n.pointer != that.root) {
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

WebLocalStorageBTree.Tree.prototype.clear = function () {
    this.diskManager.clear();
    this.root = this._allocateNode();
    this.root.isLeaf = true;
    this.root.level = 0;
    this._diskWrite(this.root);
    this._updateRootNode(this.root);
    this.root = this.root.pointer;
};

/**
 *  _getMaxKeyPos
 *
 *  Used to get the position of the MAX key within the subtree
 *  @return An object containing the key and position of the key
 */
WebLocalStorageBTree.Tree.prototype._getMaxKeyPos = function (node) {
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
WebLocalStorageBTree.Tree.prototype._getMinKeyPos = function (node) {
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
WebLocalStorageBTree.Node = function() {
    this.numberActives = 0;
    this.isLeaf = null;
    this.keys = [];
    this.children = [];
    this.level = 0;
};

/**
 * LocalStorageManager
 *
 * Handle read/writes in the local storage object.
 * In this implementation the pointers are just the keys in
 * the local storage object.
 */
WebLocalStorageBTree.LocalStorageManager  = function(name,storage, maxSize) {
    this.name = name;
    this.storage = storage;
    this.maxSize = maxSize;
    this.bufferCache = new PriorityQueue.PriorityQueue({"maxSize": maxSize});
    this.counter = this.storage.getItem("__"+this.name+"__ID_COUNTER__") || 0;
};

/**
 * Cleans all data in the local storage
 */
WebLocalStorageBTree.LocalStorageManager.prototype.clear = function() {
    var localStorageLength = this.storage.length;
    var keysToDelete = [];

    for(var i=0; i<localStorageLength; i++) {        
        // number of elments changes, always get the first key
        var key = this.storage.key(i);
        if(key.indexOf(this.name) == 0 || key.indexOf("__"+this.name)==0) {
            keysToDelete.push(key);
        }
    }

    for(var i=0; i<keysToDelete.length; i++) {
        this.storage.removeItem(keysToDelete[i]);
    }


    this.bufferCache = new PriorityQueue.PriorityQueue({"maxSize": this.maxSize});
};

/**
 * Generates a new index for b-tree nodes using
 * the b-tree name as a namespace. This is done
 * to avoid collissions in the local storage hash.
 */
WebLocalStorageBTree.LocalStorageManager.prototype._genIndex = function() {
    var newId = this.name + this.counter;
    this.counter++;
    this.storage.setItem("__"+this.name+"__ID_COUNTER__", this.counter);
    return newId;
};

/**
 * Returns the object stored in local storage using the provided reference
 */
WebLocalStorageBTree.LocalStorageManager.prototype._diskRead = function (pointer) {
    if (typeof(pointer) === 'object') {
        pointer = pointer.pointer;
    }
    var node = this.bufferCache.fetch(pointer);
    //var node = null;
    if (node == null) {
        var node = this.storage.getItem(pointer);
        if (node != null) {
            node = this._decode(node);
            //node = JSON.parse(node)
            node.pointer = pointer;
            this.bufferCache.push(pointer, node);
        }
    }

    return node;
};


/**
 * Returns the object stored in local storage using the provided reference
 */
WebLocalStorageBTree.LocalStorageManager.prototype._diskWrite = function(node) {
    if(node.pointer == null) {
        // create
        node.pointer = this._genIndex();
    }

    var origChildren = node.children;
    var childPointers = [];
 
    if(node.isLeaf === false) {
        //for(var i=0; i<(node.numberActives+1); i++) {
        for(var i=0; i<(origChildren.length); i++) {
            if(origChildren[i]==null) {
                childPointers.push(null);                
            } else if(typeof(origChildren[i]) === 'object') {
                //this._diskWrite(origChildren[i]);
                childPointers.push(origChildren[i].pointer);
            } else {
                childPointers.push(origChildren[i]);
            }
        }
    }
    node.children = childPointers;

    this.storage.setItem(node.pointer, this._encode(node));
    //this.storage.setItem(node.pointer, JSON.stringify(node));
    //this.storage.setItem(node.pointer, node);
    node.children = origChildren;
    this.bufferCache.push(node.pointer, node);
};

WebLocalStorageBTree.LocalStorageManager.prototype._diskDelete = function(node) {
    this.storage.removeItem(node.pointer);
    this.bufferCache.remove(node.pointer);
};

WebLocalStorageBTree.LocalStorageManager.prototype._updateRootNode = function(node) {
    if(node.pointer) {
        this.storage.setItem("__"+this.name+"__ROOT_NODE__",node.pointer);
    } else {
        throw "Cannot set as root of the b-tree a node without pointer";
    }
};

WebLocalStorageBTree.LocalStorageManager.prototype._readRootNode = function() {
    var pointer = this.storage.getItem("__"+this.name+"__ROOT_NODE__");
    if(pointer == null) {
        return null;
    } else {
        return this._diskRead(pointer);
    }
};

WebLocalStorageBTree.LocalStorageManager.prototype._encode = function(node) {
    //console.log("<<");
    //console.log(node);
    var encoded = ""+node.numberActives;
    encoded = encoded+":"+node.pointer;
    encoded = encoded+":"+node.level;
    encoded = encoded+":"+(node.isLeaf ? 1 : 0);
    var numKeys = 0;
    var keys = "";
    for(var i=0; i<node.keys.length; i++) {
        if(node.keys[i] != null) {          
            if(typeof(node.keys[i].key) === 'number') {
                keys = keys+":"+node.keys[i].key;
            } else {
                var keyStr = "_"+(node.keys[i].key['subject']||"")+"_"+(node.keys[i].key['predicate']||"")+"_"+(node.keys[i].key['object']||"")+"_"+(node.keys[i].key['graph']||"");
                keys = keys+":"+keyStr;
            }

            if(node.keys[i].data==null) {
                keys = keys+":n:";                
            } else if(typeof(node.keys[i].data)=='string') {
                keys = keys+":s:"+(node.keys[i].data);
            } else if(typeof(node.keys[i].data)=='number') {
                if(node.keys[i] % 1 ==0) {
                    keys = keys+":i:"+(node.keys[i].data);
                } else {
                    keys = keys+":f:"+(node.keys[i].data);
                }
            } else {
                keys = keys+":o:"+(JSON.stringify(node.keys[i].data).replace(":","&colon;"));
            }
            numKeys++;
        }
    }
    encoded = encoded+":"+numKeys+keys;
    if(node.isLeaf === false) {

        var children = "";
        var numChildren = 0;       

        for(var i=0; i<node.children.length; i++) {
            if(node.children[i] != null) {
                children = children+":"+node.children[i];
                numChildren++;
            }
        }

        encoded = encoded+":"+numChildren+children;        
    }
    //console.log("<< "+encoded);
    return encoded;
};

WebLocalStorageBTree.LocalStorageManager.prototype._decode = function(encodedNode) {
    //console.log(">> "+encodedNode);
    var node =  new WebLocalStorageBTree.Node();
    var parts = encodedNode.split(":");
    
    //encoded = ""+node.numberActives;
    node.numberActives = parseInt(parts[0]);
    //encoded = encoded+":"+node.pointer;
    node.pointer = parts[1];
    //encoded = encoded+":"+node.level;
    node.level = parseInt(parts[2]);
    //encoded = encoded+":"+(node.isLeaf ? 1 : 0);
    if(parts[3] === '1') {
        node.isLeaf = true;
    } else {
        node.isLeaf = false;
    }

    var numKeys = parseInt(parts[4]);
    var counter = 5;
    var key, type, data;
    for(var i=0; i<numKeys; i++) {
        key = parts[counter];
        if(key[0]=="_") {
            var kparts = key.split("_");
            key = {'subject': (parseInt(kparts[1])||null), 
                   'predicate': (parseInt(kparts[2])||null), 
                   'object': (parseInt(kparts[3])||null),
                   'graph': (parseInt(kparts[4]||null)) };

        } else {
            key = parseInt(parts[counter]);
        }
        type = parts[counter+1];
        data = parts[counter + 2];

        if(type === 'n') {
            data = undefined
        } else if(type === 'i') {
            data = parseInt(data);
        } else if(type === 'f') {
            data = parseFloat(data);
        } else if(type === 'o') {
            data = JSON.parse(data.replace("&colon;",":"));
        }

        node.keys.push({ "key": key, "data":data});


        counter = counter+3;
    }

    if(node.isLeaf === false) {        
        var numChildren = parseInt(parts[counter]);
        counter++;
        for(var i=0; i<numChildren; i++) {
            node.children[i] = parts[counter];
            counter++;
        }
    }

    //console.log(" >> ");
    //console.log(node);
    return node;
};


// end of ./src/js-trees/src/web_local_storage_b_tree.js 
// exports
var WebLocalStorageLexicon = {};


/**
 * Temporal implementation of the lexicon
 */

WebLocalStorageLexicon.Lexicon = function(callback,name){
    this.name = name || "";
    this.storage = null;

    try {
        this.storage = window.localStorage;
    } catch(e) { }

    if(this.storage == null) {
        this.storage = { //content: {},
            setItem: function(pointer, object) {
                //nop
            },
            getItem: function(pointer) {
                return null;
            },
            removeItem: function(pointer) {
                //nop
            },
            key: function(index) {
                return "";
            },
            length: 0
        };
    }

    // these hashes will be used as cachés
    this.uriToOID = {};
    this.OIDToUri = {};

    this.literalToOID = {};
    this.OIDToLiteral = {};

    this.blankToOID = {};
    this.OIDToBlank = {};

    this.defaultGraphOid = 0;

    this.defaultGraphUri = "https://github.com/antoniogarrote/rdfstore-js#default_graph";
    this.defaultGraphUriTerm = {"token": "uri", "prefix": null, "suffix": null, "value": this.defaultGraphUri, "oid": this.defaultGraphOid};
    this.oidCounter = parseInt(this.storage.getItem(this.pointer("oidCounter"))) || 1;

    // create or restor the hash of known graphs
    if(this.storage.getItem(this.pointer("knownGraphs"))==null) {
        this.knownGraphs = {};
        this.storage.setItem(this.pointer("knownGraphs"), JSON.stringify(this.knownGraphs));
    } else {
        this.knownGraphs = JSON.parse(this.storage.getItem(this.pointer("knownGraphs")));
    }
    
    if(callback != null) {
        callback(this);
    }
};

WebLocalStorageLexicon.Lexicon.prototype.updateAfterWrite = function() {
    this.storage.setItem(this.pointer("oidCounter"),""+this.oidCounter);
};

WebLocalStorageLexicon.Lexicon.prototype.pointer = function (hashName, val) {
    if (hashName == "uriToOID") {
        hashName = "uo";
    } else if (hashName == "OIDToUri") {
        hashName = "ou";
    } else if (hashName == "literalToOID") {
        hashName = "lo";
    } else if (hashName == "OIDToLiteral") {
        hashName = "ok";
    } else if (hashName == "blankToOID") {
        hashName = "bo";
    } else if (hashName == "OIDToBlank") {
        hashName = "ob";
    }

    if (val == null) {
        return this.name + "_l_" + hashName;
    } else {
        return this.name + "_l_" + hashName + "_" + val;
    }
};

WebLocalStorageLexicon.Lexicon.prototype.clear = function() {
    this.uriToOID = {};
    this.OIDToUri = {};
    this.literalToOID = {};
    this.OIDToLiteral = {};
    this.blankToOID = {};
    this.OIDToBlank = {};
    var localStorageLength = this.storage.length;
    var lexiconPrefix = this.name+"_l_";
    var keysToDelete = [];

    for(var i=0; i<localStorageLength; i++) {        
        // number of elments changes, always get the first key
        var key = this.storage.key(i);
        if(key.indexOf(lexiconPrefix) == 0) {
            keysToDelete.push(key);
        }
    }

    for(var i=0; i<keysToDelete.length; i++) {
        this.storage.removeItem(keysToDelete[i]);
    }
};

WebLocalStorageLexicon.Lexicon.prototype.registerGraph = function(oid){
    if(oid != this.defaultGraphOid) {
        this.knownGraphs[oid] = true;
        this.storage.setItem(this.pointer("knownGraphs"),JSON.stringify(this.knownGraphs));
    }
    return true;
};

WebLocalStorageLexicon.Lexicon.prototype.registeredGraphs = function(shouldReturnUris) {
    var acum = [];

    for(var g in this.knownGraphs) {
        if(shouldReturnUris === true) {
            acum.push(this.retrieve(g));
        } else {
            acum.push(g);
        }
    }
    return acum;
};

WebLocalStorageLexicon.Lexicon.prototype.registerUri = function(uri) {
    if(uri === this.defaultGraphUri) {
        return(this.defaultGraphOid);
    } else if(this.uriToOID[uri] == null){
        var fromStorage = this.storage.getItem(this.pointer("uriToOID",uri));
        if(fromStorage == null) {
            var oid = this.oidCounter;
            var oidStr = 'u'+oid;
            this.oidCounter++;

            this.uriToOID[uri] =[oid, 0];
            this.OIDToUri[oidStr] = uri;

            this.storage.setItem(this.pointer("uriToOID", uri), oid + ":" + 0);
            this.storage.setItem(this.pointer("OIDToUri", oidStr), uri);
            return(oid);
        } else {
            var parts = fromStorage.split(":");
            var oid = parseInt(parts[0]);
            var oidStr = 'u'+oid;
            var counter = parseInt(parts[1])+1;

            this.uriToOID[uri] = [oid, counter];
            this.OIDToUri[oidStr] = uri;
            this.storage.setItem(this.pointer("uriToOID",uri), oid+":"+0);

            return(oid);
        }
    } else {
        var oidCounter = this.uriToOID[uri];
        var oid = oidCounter[0];
        var counter = oidCounter[1] + 1;
        this.uriToOID[uri] = [oid, counter];
        this.storage.setItem(this.pointer("uriToOID",uri), oid+":"+counter);
        return(oid);
    }
};

WebLocalStorageLexicon.Lexicon.prototype.resolveUri = function(uri) {
    if(uri === this.defaultGraphUri) {
        return(this.defaultGraphOid);
    } else {
        var oidCounter = this.uriToOID[uri];
        if(oidCounter != null) {
            return(oidCounter[0]);
        } else {
            var fromStorage = this.storage.getItem(this.pointer("uriToOID",uri));
            if(fromStorage == null) {
                return(-1);
            } else {
                var parts = fromStorage.split(":");
                var oid = parseInt(parts[0]);
                var oidStr = 'u'+oid;
                var counter = parseInt(parts[1]);
                this.uriToOID[uri] = [oid,counter];
                this.OIDToUri[oidStr] = uri;
                return(oid);
            }
        }
    }
};

WebLocalStorageLexicon.Lexicon.prototype.resolveUriCost = function(uri) {
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

WebLocalStorageLexicon.Lexicon.prototype.registerBlank = function(label) {
    var oid = this.oidCounter;
    this.oidCounter++;
    var oidStr = ""+oid;
    this.storage.setItem(this.pointer("OIDToBlank",oidStr),true);
    this.OIDToBlank[oidStr] = true;
    
    return(oidStr);
};

WebLocalStorageLexicon.Lexicon.prototype.resolveBlank = function(label) {
    var oid = this.oidCounter;
    this.oidCounter++;
    return(""+oid);
};

WebLocalStorageLexicon.Lexicon.prototype.resolveBlankCost = function(label) {
    return 0;
};

WebLocalStorageLexicon.Lexicon.prototype.registerLiteral = function(literal) {
    if(this.literalToOID[literal] == null){
        var fromStorage = this.storage.getItem(this.pointer("literalToOID",literal));
        if(fromStorage==null) {
            var oid = this.oidCounter;
            var oidStr =  'l'+ oid;
            this.oidCounter++;

            this.literalToOID[literal] = [oid, 0];
            this.OIDToLiteral[oidStr] = literal;

            this.storage.setItem(this.pointer("literalToOID",literal), oid+":"+0);
            this.storage.setItem(this.pointer("OIDToLiteral",oidStr), literal);
            return(oid);
        } else {
            var oidCounter = fromStorage.split(":");
            var oid = parseInt(oidCounter[0]);
            var counter = parseInt(oidCounter[1]) + 1;
            this.literalToOID[literal] = [oid, counter];
            this.storage.setItem(this.pointer("literalToOID",literal), oid+":"+counter);
            return(oid);
        }
    } else {
        var oidCounter = this.literalToOID[literal];
        var oid = oidCounter[0];
        var counter = oidCounter[1] + 1;
        this.storage.setItem(this.pointer("literalToOID",literal), oid+":"+counter);
        this.literalToOID[literal] = [oid, counter];
        return(oid);
    }
};

WebLocalStorageLexicon.Lexicon.prototype.resolveLiteral = function (literal) {
    var oidCounter = this.literalToOID[literal];
    if (oidCounter != null) {
        return(oidCounter[0]);
    } else {
        var fromStorage = this.storage.getItem(this.pointer("literalToOID", literal));
        if (fromStorage != null) {
            oidCounter = fromStorage.split(":");
            var oid = parseInt(oidCounter[0]);
            var counter = parseInt(oidCounter[1]);
            var oidStr = 'l' + oid;
            this.literalToOID[literal] = [oid, counter];
            this.OIDToLiteral[oidStr] = literal;
            return(oid);
        } else {
            return(-1);
        }
    }
};

WebLocalStorageLexicon.Lexicon.prototype.resolveLiteralCost = function (literal) {
    var oidCounter = this.literalToOID[literal];
    if (oidCounter != null) {
        return(oidCounter[1]);
    } else {
        return(0);
    }
};

WebLocalStorageLexicon.Lexicon.prototype.parseLiteral = function(literalString) {
    var parts = literalString.lastIndexOf("@");
    if(parts!=-1 && literalString[parts-1]==='"') {
        var value = literalString.substring(1,parts-1);
        var lang = literalString.substring(parts+1, literalString.length);
        return {token: "literal", value:value, lang:lang};
    }

    var parts = literalString.lastIndexOf("^^");
    if(parts!=-1 && literalString[parts-1]==='"' && literalString[parts+2] === '<' && literalString[literalString.length-1] === '>') {
        var value = literalString.substring(1,parts-1);
        var type = literalString.substring(parts+3, literalString.length-1);

        return {token: "literal", value:value, type:type};
    }

    var value = literalString.substring(1,literalString.length-1);
    return {token:"literal", value:value};
};

WebLocalStorageLexicon.Lexicon.prototype.parseUri = function(uriString) {
    return {token: "uri", value:uriString};
};

WebLocalStorageLexicon.Lexicon.prototype.retrieve = function(oid) {
    var fromStorage;
    try {
        if(oid === this.defaultGraphOid) {
            return({ token: "uri", 
                     value:this.defaultGraphUri,
                     prefix: null,
                     suffix: null,
                     defaultGraph: true });
        } else {
          var maybeUri = this.OIDToUri['u'+oid];
          if(maybeUri!=null) {
              return(this.parseUri(maybeUri));
          } else {
              var maybeLiteral = this.OIDToLiteral['l'+oid];
              if(maybeLiteral!=null) {
                  return(this.parseLiteral(maybeLiteral));
              } else {
                  var maybeBlank = this.OIDToBlank[""+oid];
                  if(maybeBlank!=null) {
                      return({token:"blank", value:"_:"+oid});
                  } else {
                      // uri
                      maybeUri = this.storage.getItem(this.pointer("OIDToUri","u"+oid));
                      if(maybeUri != null) {
                          this.OIDToUri["u"+oid] = maybeUri;
                          fromStorage = this.storage.getItem(this.pointer("uriToOID", maybeUri));
                          var parts = fromStorage.split(":");
                          var counter = parseInt(parts[1]);
                          this.uriToOID[maybeUri] = [oid,counter];
                          return(this.parseUri(maybeUri));
                      } else {
                          // literal
                          maybeLiteral = this.storage.getItem(this.pointer("OIDToLiteral","l"+oid));
                          if(maybeLiteral != null) {
                              this.OIDToLiteral["l"+oid] = maybeLiteral;
                              fromStorage = this.storage.getItem(this.pointer("literalToOID",maybeLiteral));
                              var oidCounter = fromStorage.split(":");
                              var oid = parseInt(oidCounter[0]);
                              var counter = parseInt(oidCounter[1]);
                              this.literalToOID[maybeLiteral] = [oid, counter];
                              return(this.parseLiteral(maybeLiteral));
                          } else {
                              // blank
                              maybeBlank = this.storage.getItem(this.pointer("OIDToBlank",""+oid));
                              if(maybeBlank != null) {
                                  this.OIDToBlank[""+oid] = true;
                                  return({token:"blank", value:"_:"+oid});
                              } else {
                                  throw("Null value for OID");
                              }
                          }
                      }
                  }
              }
          }
        }
    } catch(e) {
        console.log("error in lexicon retrieving OID:");
        console.log(oid);
        if(e.message) {
            console.log(e.message); 
        }
        if(e.stack) {
            console.log(e.stack);
        }
        throw new Error("Unknown retrieving OID in lexicon:"+oid);

    }
};


WebLocalStorageLexicon.Lexicon.prototype.unregister = function (quad, key) {
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

WebLocalStorageLexicon.Lexicon.prototype.unregisterTerm = function (kind, oid) {
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

// end of ./src/js-rdf-persistence/src/web_local_storage_lexicon.js 

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
// end of ./src/micrograph/src/micrograph_persistence.js 
})();