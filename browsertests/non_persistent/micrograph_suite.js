this.micrograph_suite = {};

this.micrograph_suite.parseTriples1 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations'
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus'
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var peopleCounter = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else if(node.$type === "Person") {
			peopleCounter++;
			test.ok(node.name="Ludwig");
			test.ok(node.surname = "Wittgenstein");
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(books["Philosophical Investigations"]);
		    test.ok(bookCounter == 2);
		    test.done();
		});
	});
    });
};

/*
this.micrograph_suite.bgpExecution1 = function(test) {
    mg.create(function(g) {
	g.execute("INSERT DATA { <http://rdfstore-js.org/micrographql/graph#obj1> <name> \"John\"; <name> \"Juan\"; <age> \"26\"^^<http://www.w3.org/2001/XMLSchema#float> ; <friend> <http://rdfstore-js.org/micrographql/graph#obj2> .\
                                 <http://rdfstore-js.org/micrographql/graph#obj2> <name> \"Mary\" ; <height> \"15\"^^<http://www.w3.org/2001/XMLSchema#float>.}",
		  function(success, result) {
		      var counter = 0;
		      g.where({name: "John", friend:{}}).
			  onError(function(reason) {
			      test.done();
			  }).
			  each(function(result) {
			      counter++;
			      test.ok(result.name.length === 2);
			      test.ok(result.age === 26);
			  }).
			  all(function(results) {
			      console.log(results);
			      test.ok(results.length === 1);
			      test.ok(counter === 1);
			      test.done();
			  });
		  });
    });
};
*/

this.micrograph_suite.filters1 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({pages: {$eq: 120}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(bookCounter == 1);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};


this.micrograph_suite.filters2 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({pages: {$gt: 200}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Philosophical Investigations"]);
		    test.ok(bookCounter == 1);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};


this.micrograph_suite.filters3 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({pages: {$lt: 200}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(bookCounter == 1);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};


this.micrograph_suite.filters4 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({pages: {$neq: 320}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(bookCounter == 1);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};

this.micrograph_suite.filters5 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({pages: {$lteq: 120}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(bookCounter == 1);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};


this.micrograph_suite.filters6 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({pages: {$gteq: 320}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Philosophical Investigations"]);
		    test.ok(bookCounter == 1);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};

this.micrograph_suite.filters7 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({title: {$not: {$eq: "Philosophical Investigations"}}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(bookCounter == 1);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};

this.micrograph_suite.filters8 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({title: {$like: /[a-z]*Philo[a-z]+/}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(books["Philosophical Investigations"]);
		    test.ok(bookCounter == 2);
		    test.ok(other == 0);
		    test.done();
		});
	});
    });
};

this.micrograph_suite.filters9 = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien',
	authorOf: [
	    {
		$type: 'Book',
		title: 'Philosophical Investigations',
		pages: 320
	    },
	    {
		$type: 'Book',
		title: 'Tractatus Logico-Philosophicus',
		pages: 120
	    }
	]
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.load(data,function(){
	    g.where({pages: {$and: [{$gt: 10}, {$lt: 1000}]}}).
		each(function(node) {
		    if(node.$type === "Book") {
			bookCounter++;
			books[node.title] = true;
		    } else {
			other++;
		    }
		}).
		onError(function(reason){
		    test.ok(false);
		}).
		all(function(){
		    test.ok(books["Tractatus Logico-Philosophicus"]);
		    test.ok(books["Philosophical Investigations"]);
		    test.ok(bookCounter == 2);
		    test.ok(other == 0);
		    g.where({pages:{$and:[{$gt:1000},{$lt:10}]}}).
			all(function(res) {
			    test.ok(res.length === 0);
			    test.done();
			});
		});
	});
    });
};


this.micrograph_suite.limitOffset = function(test) {
    var data = [{a: 1},
		{a: 3},
		{a: 2},
		{a: 4},
		{a: 6},
		{a: 7},
		{a: 5},
		{a: 8}];

    mg.create(function(g) {
	g.load(data,function() {
	    g.where({}).order('a').offset(0).limit(2).
		all(function(nodes){
		    test.ok(nodes[0].a === 1);
		    test.ok(nodes[1].a === 2);
		    test.ok(nodes.length === 2);

		    g.where({}).order('a').offset(2).limit(4).
			all(function(nodes) {
			    test.ok(nodes[0].a === 3);
			    test.ok(nodes[1].a === 4);
			    test.ok(nodes[2].a === 5);
			    test.ok(nodes[3].a === 6);
			    test.ok(nodes.length === 4);
			    
			    test.done();
			});
		});
	});
    });
};

this.micrograph_suite.saveTest = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien'
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.create(function(g) {
	g.save(data, function(lw){

	    var book1 = {$type: 'Book',
			 title: 'Philosophical Investigations',
			 pages: 320};
	    var book2 = {$type: 'Book',
			 title: 'Tractatus Logico-Philosophicus',
			 pages: 120};

	    lw.author = book1;
	    g.save(lw);

	    lw.author = book2;
	    g.save(lw);


	    lw.author = {};
	    g.where(lw).all(function(result){

		//console.log("----");
		//console.log(result);

		test.ok(result.length == 1);
		result = result[0];
		test.ok(result.$id == lw.$id);
		lw = result;
		test.ok(lw.author.length === 2);

		var books = {};
		for(var i=0; i<lw.author.length; i++) {
		    //console.log(lw.author[i]);
		    books[lw.author[i].title] = true;
		}

		test.ok(books["Tractatus Logico-Philosophicus"]);
		test.ok(books["Philosophical Investigations"]);
		
		test.done();
	    });
	});
    });
};

this.micrograph_suite.inverseProperties = function(test) {
    mg.create(function(g) {
	// saving a Person
	g.save([{$type: 'Person',
		 name: 'Ludwig',
		 surname: 'Wittgenstein',
		 birthplace: 'Wien'}], 	       
	       function(lw){		   
		   // saving some books
		   g.save({$type: 'Book',
			   title: 'The Open Society and its Enemies',
			   // Popper is included as author here
			   author$in: {$type: 'Person',
				       name:'Karl',
				       surname: 'Popper'},
			   pages: 510}).
		       save({$type: 'Book',
			     title: 'Philosophical Investigations',
			     pages: 320,
			     author$in: lw.$id}).
		       save({$type: 'Book',
			     title: 'Tractatus Logico-Philosophicus',
			     pages: 120,
			     author$in: lw.$id}).
		       // all books written by something whose name is not Wittgenstein
		       where({$type: 'Book',
			      author$in: 
			      {surname: {$neq: 'Wittgenstein'}}}).
		       all(function(books){
			   var titles = {};
			   for(var i=0; i<books.length; i++) {
			       titles[books[i].title] = true;
			   }
			   test.ok(titles["The Open Society and its Enemies"]);

			   titles = {};
			   // All books written by Wittgenstein
			   g.where({surname: 'Wittgenstein',
				    author: {}}).
			       each(function(wittgenstein){
				   for(var i=0; i<wittgenstein.author.length; i++)
				       titles[wittgenstein.author[i].title] = true;				   
			       }).
			       all(function(){
				   test.ok(titles["Philosophical Investigations"]);
				   test.ok(titles["Tractatus Logico-Philosophicus"]);
				   test.done();
			       });
		       });
	       });
    });
};

this.micrograph_suite.remove1 = function(test) {
    mg.create(function(g) {
	g.save([{$type: 'Person',
		 name: 'Ludwig',
		 surname: 'Wittgenstein',
		 birthplace: 'Wien'}], 	       
	       function(lw){		   
		   g.save({$type: 'Book',
			   title: 'The Open Society and its Enemies',
			   author$in: {$type: 'Person',
				       name:'Karl',
				       surname: 'Popper'},
			   pages: 510}).
		       save({$type: 'Book',
			     title: 'Philosophical Investigations',
			     pages: 320,
			     author$in: lw.$id}).
		       save({$type: 'Book',
			     title: 'Tractatus Logico-Philosophicus',
			     pages: 120,
			     author$in: lw.$id}).
		       where({$type: 'Book'}).
		       all(function(books){
			   test.ok(books.length === 3);
			   g.where({title: g._t}).
                               remove(function(res) {
				   test.ok(res);
			       }).
			       where({$type: 'Book'}).
			       each(function(book) {
				   test.ok(book.$id != null);
				   test.ok(book.pages != null);
				   test.ok(book.$type === 'Book');
				   test.ok(book.title == null);
			       }).
			       all(function(books){
				   test.ok(books.length === 3);
				   test.done();
			       });
		       });
	       });
    });
};

this.micrograph_suite.remove2 = function(test) {
    mg.create(function(g) {
	g.save([{$type: 'Person',
		 name: 'Ludwig',
		 surname: 'Wittgenstein',
		 birthplace: 'Wien'},
		{$type: 'Person',
		 name:'Karl',
		 surname: 'Popper'}]).
	    where({surname: 'Popper'}).
            remove(function(res) {
		test.ok(res);
	    }).
	    where({$type: 'Person'}).
	    each(function(person) {
		if(person.name === 'Karl') {
		    test.ok(person.surname == null);
		} else {
		    test.ok(person.surname === 'Wittgenstein');
		}
	    }).
	    all(function(people){
		test.ok(people.length === 2);
		test.done();
	    });
    });
};

this.micrograph_suite.remove3 = function(test) {
    mg.create(function(g) {
	g.save([{$type: 'Person',
		 name: 'Ludwig',
		 surname: 'Wittgenstein',
		 birthplace: 'Wien'},
		{$type: 'Person',
		 name:'Karl',
		 surname: 'Popper'}]).
	    where({surname: 'Popper'}).
            removeNodes(function(removed) {
		test.ok(removed === 1);
	    }).
	    where({$type: 'Person'}).
	    each(function(person) {
		test.ok(person.surname === 'Wittgenstein');
	    }).
	    all(function(people){
		test.ok(people.length === 1);
		test.done();
	    });
    });
};

this.micrograph_suite.remove4 = function(test) {
    mg.create(function(g) {
	g.save({$type: 'Person',
		name: 'Ludwig',
		surname: 'Wittgenstein',
		birthplace: 'Wien',
	        author: [{$type: 'Book',
			  title: 'Tractatus Logico-Philosophicus'},
			 {$type: 'Book',
			  title: 'Philosophical Investigations'}]}).
	    where({title: 'Philosophical Investigations'}).
            removeNodes(function(removed) {
		test.ok(removed === 1);
	    }).
	    where({author: {}}).
	    all(function(authors){
		test.ok(authors.length === 1);
		test.ok(authors[0].author.title === "Tractatus Logico-Philosophicus");		
		test.done();
	    });
    });
};


this.micrograph_suite.remove5 = function(test) {
    mg.create(function(g) {
	g.save([{$type: 'Person',
		 name: 'Ludwig',
		 surname: 'Wittgenstein',
		 birthplace: 'Wien',
	         author: [{$type: 'Book',
			   title: 'Tractatus Logico-Philosophicus'},
			  {$type: 'Book',
			   title: 'Philosophical Investigations'}]},
		{$type: 'Person',
		 name: 'Karl',
		 surname: 'Popper',
		 author: {$type: 'Book',
			  title: 'The Open Society and its Enemies'}}]).
	    where({author$in: {surname: 'Wittgenstein'}}).
            removeNodes(function(removed) {
		test.ok(removed === 2);
	    }).
	    where({author$in: {}}).
	    all(function(authored){
		test.ok(authored.length === 1);
		test.ok(authored[0].title === 'The Open Society and its Enemies');
		test.ok(authored[0].author$in.surname === "Popper");		
		test.done();
	    });
    });
};

this.micrograph_suite.update1 = function(test) {
    mg.create(function(g) {
	g.load([{$type: 'Person',
	         name: 'Bertrand',
	         surname: 'Russell'},
		{$type: 'Person',
	         name: 'Niels',
		 surname: 'Bohr'}]).
	    where({name: 'Bertrand'}).
	    first(function(russell) {
		russell.profession = 'logician';
		g.update(russell, function(res) {
		    test.ok(res);
		});
	    }).
	    where({profession: 'logician'}).
	    all(function(logicians){
		test.ok(logicians.length === 1);
		test.ok(logicians[0].surname === 'Russell');
		test.done();
	    });
    });
}
