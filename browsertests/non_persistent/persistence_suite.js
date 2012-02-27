this.persistence_suite = {};

/*
this.persistence_suite.creation_overwrite = function(test) {
    var data = [{data:1},
		{data:2},
		{data:3},
		{data:4},
		{data:5},
		{data:6},
	        {data:7}];

    mg.open('tests', true, function(g) {
	g.load(data);

	mg.open('tests',false, function(g) {
	    g.where({}).
		all(function(res){
		    console.log("HERE WE GO");
		    debugger;
		}).
		where({}).
		all(function(res){
		    console.log("AND BACK");
		    debugger;
		    test.done();
		});
	});
    });
};
*/


this.persistence_suite.creation_overwrite = function(test) {
    this.localStorage.clear();

    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein'};

    mg.open('tests', true, function(g) {
	g.save(data);

	g.where({$type: 'Person'}).
	    all(function(people) {
		test.ok(people.length === 1);
		test.ok(people[0].surname === 'Wittgenstein');

		mg.open('tests', false, function(g) {
		    g.where({$type: 'Person'}).
			all(function(people) {
			    test.ok(people.length === 1);
			    console.log(people);
			    test.ok(people[0].surname === 'Wittgenstein');

			    mg.open('non_existent', false, function(g) {
				g.where({$type: 'Person'}).
				    all(function(people){
					test.ok(people.length === 0);

					mg.open('tests', true, function(g) {
					    g.where({$type: 'Person'}).
						all(function(people) {
						    test.ok(people.length === 0);
						    test.done();
						});
					});

				    });
			    });
			});
		});
	    });
    });
};


this.persistence_suite.parseTriples1 = function(test) {
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

    mg.open('tests',true,function(g) {
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

		    mg.open('tests', false, function(g) {

			bookCounter = 0;
			books = {};
			peopleCounter = 0;

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
	});
    });
};


this.persistence_suite.filters1 = function(test) {
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

    mg.open('tests', true, function(g) {
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
		
		    mg.open('tests',false, function(g) {

			var bookCounter = 0;
			var books = {};
			var other = 0;

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
	});
    });
};


this.persistence_suite.filters3 = function(test) {
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

    mg.open('test', true, function(g) {
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

		    mg.open('test', false, function(g) {
			bookCounter = 0;
			books = {};
			other = 0;

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
	});
    });
};


this.persistence_suite.saveTest = function(test) {
    var data = {
	$type: 'Person',
	name: 'Ludwig',
	surname: 'Wittgenstein',
	birthplace: 'Wien'
    };

    var bookCounter = 0;
    var books = {};
    var other = 0;

    mg.open('test',true,function(g) {
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


this.persistence_suite.inverseProperties = function(test) {
    mg.open('test',true,function(g) {
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

this.persistence_suite.remove1 = function(test) {
    mg.open('test',true,function(g) {
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

this.persistence_suite.remove2 = function(test) {
    mg.open('test',true,function(g) {
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

this.persistence_suite.remove3 = function(test) {
    mg.open('test',true,function(g) {
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

this.persistence_suite.remove4 = function(test) {
    mg.open('test',true,function(g) {
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


this.persistence_suite.remove5 = function(test) {
    mg.open('test',true,function(g) {
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

this.persistence_suite.update1 = function(test) {
    mg.open('test',true,function(g) {
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


this.persistence_suite.bind1 = function(test) {
    try{
	var counter = 0;
	mg.open('test',true,function(g) {
	    g.where({$type:'Person'}).
		bind(function(results) {
		    counter++;
		}).
		load([{$type: 'Person',
	               name: 'Bertrand',
	               surname: 'Russell'}]).
		load([{$type: 'Person',
	               name: 'Niels',
		       surname: 'Bohr'}]);
	});
    
	test.ok(counter==3);
	test.done();
    }catch(e) {
	console.log(e);
	console.log(e.stack);
	test.ok(false);
	test.done();
    }
};


this.persistence_suite.bind2a = function(test) {
    try{
	var counter = 0;
	mg.open('test',true,function(g) {
	    g.where({$type:'Person'}).
		bind(function(results) {
		    counter++;
		}).
		load([{$type: 'Person',
	               name: 'Bertrand',
	               surname: 'Russell'}]).
		load([{$type: 'Person',
	               name: 'Niels',
		       surname: 'Bohr'}]);

	    test.ok(counter===3);

	    g.where({name: 'Niels'}).
		first(function(nb){
		    nb['profession'] = 'phisicist';
		    g.save(nb);
		}).
		save({name: 'Wolfgang',
		      surname: 'Pauli',
 		      profession: 'phisicist',
		      $type: 'Person'});

	    test.ok(counter===5);
	    test.done();
	});
    
    }catch(e) {
	console.log(e);
	console.log(e.stack);
	test.ok(false);
	test.done();
    }
};

this.persistence_suite.bind2b = function(test) {
    try{
	var counter = 0;
	mg.open('test',true,function(g) {
	    g.where({$type:'Person'}).
		bind(function(results) {
		    counter++;
		}).
		load([{$type: 'Person',
	               name: 'Bertrand',
	               surname: 'Russell'}]).
		load([{$type: 'Person',
	               name: 'Niels',
		       surname: 'Bohr'}]);

	    test.ok(counter===3);

	    g.where({name: 'Niels'}).
		first(function(nb){
		    nb['profession'] = 'phisicist';
		    g.update(nb);
		}).
		save({name: 'Wolfgang',
		      surname: 'Pauli',
 		      profession: 'phisicist',
		      $type: 'Person'});

	    test.ok(counter===5);
	    test.done();
	});
    
    }catch(e) {
	console.log(e);
	console.log(e.stack);
	test.ok(false);
	test.done();
    }
};

