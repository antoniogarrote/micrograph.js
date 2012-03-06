#micrograph.js

Graph data layer for client JS applications using JSON, Microdata or RDF.

    var mg = require('micrograph');

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
     		        assert(removed === 2);
     	    }).
     	    where({author$in: {}}).
     	    all(function(authored){
     		    assert(authored.length === 1);
     		    assert(authored[0].title === 'The Open Society and its Enemies');
     		    assert(authored[0].author$in.surname === "Popper");		
     	    });
        });

## Building

Use the included ruby script:

    $./make.rb

## Modules

The default build of the library does not include persistence or support for the N3 RDF parser. These functionalities can be found in two additional files available from the dist directory.

## Documentation

A detailed description of the library with some examples can be found <a href="http://antoniogarrote.github.com/micrograph.js/index.html">here</a>.
JSDoc files for the project are available <a href="http://antoniogarrote.github.com/micrograph.js/doc/index.html">here</a>.

## License

Lincesed under the <a rel="license" href="http://www.gnu.org/licenses/lgpl.html">LGPL license V3</a>