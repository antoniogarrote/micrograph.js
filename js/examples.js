var queryExampleData1 = '[\n\
  {$type: "Person",\n\
   $id: "http://en.wikipedia.org/wiki/Bertrand_Russell",\n\
   name: "Bertrand",\n\
   surname: "Russell",\n\
   born: {name: "United Kingdom",\n\
	  $type: "Country",\n\
	  $id: "http://en.wikipedia.org/wiki/United_Kingdom"},\n\
   author: {title: "Principia Mathematica",\n\
            $type: "Book",\n\
           pages: 2300}},\n\
\n\
  {$type: "Person",\n\
   $id: "http://en.wikipedia.org/wiki/David_Hilbert",\n\
   name: "David",\n\
   surname: "Hilbert",\n\
   born: {$id: "http://en.wikipedia.org/wiki/Germany"},\n\
   author: {title: "Foundations of Geometry",\n\
            $type: "Book",\n\
            pages: 143}},\n\
\n\
  {$type: "Person",\n\
   $id: "http://en.wikipedia.org/wiki/Karl_Popper",\n\
   name: "Karl",\n\
   surname: "Popper",\n\
   born: {$id: "http://en.wikipedia.org/wiki/Autria",\n\
	  name: "Austria",\n\
	  $type: "Country"},\n\
   author: {title: "The Open Society and Its Enemies",\n\
	      $type: "Book",\n\
            pages: 471}},\n\
\n\
  {$type: "Country",\n\
   name: "Germany",\n\
   $id: "http://en.wikipedia.org/wiki/Germany"},\n\
\n\
  {$type: "Person",\n\
   $id: "http://en.wikipedia.org/wiki/Niels_Bohr",\n\
   name: "Niels",\n\
   surname: "Bohr",\n\
   born: {$id: "http://en.wikipedia.org/wiki/Denmark",\n\
          $type: "Country",\n\
          name: "Denmark"},\n\
   nobelPrizeWinner: true}\n\
]';

window['examples'] = {
    ex1: {
	source: 
'g.where({$type: "Book"})\n\
 .all(function(books) {\n\
     output(books);\n\
});',
	data:
'{\n\
    $type: "Person",\n\
    name: "Ludwig",\n\
    surname: "Wittgenstein",\n\
    birthplace: "Wien",\n\
    authorOf: [\n\
      {\n\
        $type: "Book",\n\
        title: "Philosophical Investigations"\n\
      },\n\
      {\n\
        $type: "Book",\n\
        title: "Tractatus Logico-Philosophicus"\n\
      }\n\
    ]\n\
}'
    },
    ex2: {
	source: 
'g.where({surname: g._("author"),\n\
         authorOf:\n\
         { title: g._("title") }})\n\
 .tuples(function(results) {\n\
     output(results);\n\
});',
	data:
'{\n\
    $type: "Person",\n\
    name: "Ludwig",\n\
    surname: "Wittgenstein",\n\
    birthplace: "Wien",\n\
    authorOf: [\n\
      {\n\
        $type: "Book",\n\
        title: "Philosophical Investigations"\n\
      },\n\
      {\n\
        $type: "Book",\n\
        title: "Tractatus Logico-Philosophicus"\n\
      }\n\
    ]\n\
}'
    },

    ex3: {
	source:
'mg.create(function(g) {\n\
   // g is a fresh graph\n\
});'
    },

    ex4: {
	source:
'mg.open("graph1", true, function(g) {\n\
   // data in graph1 has been overwritten\n\
});'
    },

    ex5: {
	source:
'g.load([\n\
        {$type: "Person",\n\
         name: "Bertrand",\n\
         surname: "Russell"},\n\
  \n\
        {$type: "Person",\n\
         name: "Niels",\n\
         surname: "Bohr"}\n\
       ],\n\
       function(){\n\
	     g.where({name: "Bertrand"})\n\
          .first(function(russell) {\n\
		      output(russell);\n\
	       });\n\
});',
	data: true
    },

    ex6: {
	source:
'g.from("https://api.github.com/repos/mbostock/d3/commits?callback=commits&per_page=5")\n\
 .load(function() {\n\
	g.where({author: {login: "mbostock"}})\n\
     .all(function(commits){\n\
	  output("mbostock authored "+commits.length+"/5 latest commits in d3.js");\n\
	 });\n\
});',
	data: true
    },

    ex7: {
	source:
'g.from("https://api.github.com/repos/rails/rails/collaborators",\n\
       {jsonp: "callback"})\n\
 .transform(function(prop,obj) {\n\
     if(prop == null) {\n\
       // top level object receives null\n\
       delete obj.meta;\n\
     } else if(prop === "data") {\n\
       obj.$id = obj.url\n\
       obj.$type = "Person"\n\
     }\n\
 })\n\
 .load(function() {\n\
        g.where({$type: "Person"})\n\
         .all(function(collaborators){\n\
             output(collaborators);\n\
	 });\n\
});',
	data: true
    },

    ex8: {
	source:
'g.from("https://api.github.com/repos/rails/rails/collaborators?callback=collabs")\n\
 .transform({\n\
     "null": {"@delete":"meta"},\n\
     "data": {"@id": "url",\n\
              "@type": function(){ return "Person" }}\n\
 })\n\
 .load(function() {\n\
        g.where({$type: "Person"})\n\
         .all(function(collaborators){\n\
             output(collaborators);\n\
	 });\n\
});',
	data: true
    },

    ex9: {
	source:
'g.from("https://nonexistent.host/data", \n\
       {jsonp: "callback", retries:0, timeout:2000})\n\
 .onError(function(error) {\n\
    output(error);\n\
 })\n\
 .load(function() {\n\
    output("this will not be invoked");\n\
});',
	data: true
    },

    ex10: {
	source:
'g.where({})\n\
 .all(function(nodes) {\n\
\n\
     var acum = {Person: 0,\n\
                 Book:   0,\n\
                 Country:0};\n\
\n\
     for(var i=0; i<nodes.length; i++)\n\
         acum[nodes[i].$type]++;\n\
\n\
     output("People:"+acum.Person+\n\
            ", Books:"+acum.Book+\n\
            ", Countries:"+acum.Country);\n\
});',
	data: queryExampleData1
    },

    ex11: {
	source:
'g.where({$type: "Person"})\n\
 .all(function(people) {\n\
     output(people);\n\
});',
	data: queryExampleData1
    },

    ex12: {
	source:
'g.where({$type: "Person",\n\
         born: {name: "United Kingdom"},\n\
         author: {} })\n\
 .all(function(people) {\n\
     output(people);\n\
});',
	data: queryExampleData1
    },

    ex13: {
	source:
'g.where({$type: "Country",\n\
         born$in: {nobelPrizeWinner: true} })\n\
 .all(function(countries) {\n\
     var result = "";\n\
\n\
     for(var i=0; i<countries.length; i++)\n\
        result += countries[i].name+": "+\n\
                  countries[i].born$in.name + " " +\n\
                  countries[i].born$in.surname;\n\
\n\
     output(result);\n\
});',
	data: queryExampleData1
    },

   ex14: {
	source:
'var res = {};\n\
\n\
var test = function(message, value) {\n\
 return function(nodes) {\n\
  if(nodes.length === 1 && nodes[0].testProp === value)\n\
   res[message] = true;\n\
  else\n\
   res[message] = false;\n\
 };\n\
};\n\
\n\
var date = new Date();\n\
\n\
g.load({testProp: date}, function() {\n\
\n\
  g.where({ testProp: null })\n\
   .all(test("null",null))\n\
   .where({ testProp: true })\n\
   .all(test("bool",true))\n\
   .where({ testProp: 1 })\n\
   .all(test("int",1))\n\
   .where({ testProp: 1.5 })\n\
   .all(test("float", 1.5))\n\
   .where({ testProp: "test" })\n\
   .all(test("string","test"))\n\
   .where({ testProp: date })\n\
   .all(function(nodes) {\n\
       res["date"] = (date.getTime() === nodes[0].testProp.getTime());\n\
   })\n\
   .where({ testProp: [4,6] })\n\
   .all(function(nodes) {\n\
     res["array"] = (nodes[0].testProp.length === 3);\n\
\n\
     output(res)\n\
\n\
  });\n\
\n\
});',
	data: 
'[{testProp: null},\n\
  {testProp: true},\n\
  {testProp: 1},\n\
  {testProp: 1.5},\n\
  {testProp: "test"},\n\
  {testProp: [4,5,6]}]'
   },

    ex15: {
	source:
'g.where({$type: "Word",\n\
         text: {$like: "f[ei]nestra"},\n\
         length: {$and: [{$lteq: 9},\n\
                         {$gt: 7}]}})\n\
 .all(function(res){\n\
     output(res);\n\
});',
	data: 
'[\n\
    {$type: "Word",\n\
     text: "fenestra",\n\
     lang: "lat",\n\
     length: 8},\n\
    {$type: "Word",\n\
     text: "finestra",\n\
     lang: "cat",\n\
     length: 8},\n\
    {$type: "Word",\n\
     text: "fenêtre",\n\
     lang: "fr",\n\
     length: 7},\n\
    {$type: "Word",\n\
     text: "ventana",\n\
     lang: "es",\n\
     length: 7},\n\
    {$type: "Word",\n\
     text: "janela",\n\
     lang: "pt",\n\
     length: 6}\n\
]'
    },

    ex16: {
	source:
'var result = {};\n\
\n\
g\n\
\n\
// map\n\
 .where({$type: "Book"})\n\
 .map(function(book){\n\
   return book.pages * 2;\n\
 })\n\
 .all(function(res){\n\
     result["map"] = res;\n\
 })\n\
\n\
// select\n\
 .where({$type: "Book"})\n\
 .select(function(book) {\n\
    return book.pages > 200; \n\
 })\n\
 .all(function(res) {\n\
    result["select"] = "selected "+res.length+" books";\n\
 })\n\
\n\
// group by\n\
 .where({$type: "Book"})\n\
 .groupBy(function(book) {\n\
    return "group "+(book.pages % 2); \n\
 })\n\
 .all(function(res) {\n\
\n\
    for(var group in res)\n\
      res[group] = res[group].length;\n\
\n\
    result["groupBy"] = res;\n\
 })\n\
\n\
// reduce\n\
 .where({$type: "Book"})\n\
 .reduce(0, function(acum, book) {\n\
    return acum + book.pages;\n\
 })\n\
 .all(function(res) {\n\
     result["reduce"] = "sum of pages: "+res;\n\
\n\
     output(result);\n\
});',
	data: queryExampleData1
    },

    ex16b: {
	source:
'g.where({$type: "Book"})\n\
 .map(function(book){\n\
   return book.pages * 2;\n\
 })\n\
 .map(function(pages){\n\
   return pages + 1.3;\n\
 })\n\
 .reduce(0,function(acum, pages) {\n\
    return acum + pages;\n\
 })\n\
 .all(function(res){\n\
     output("Pages: "+res);\n\
});',
	data: queryExampleData1
    },

    ex17: {
	source:
'var acum = [], batch;\n\
\n\
var processBatch = function(title) {\n\
  return function(nodes) {\n\
     batch = [title];\n\
     for(var i=0; i<nodes.length; i++)\n\
         batch.push(nodes[i].a);\n\
     acum.push(batch);\n\
  }\n\
};\n\
\n\
g.where({}).order("a").offset(0).limit(2)\n\
 .all(processBatch("first batch:"))\n\
 .where({}).order("a").offset(2).limit(4)\n\
 .all(processBatch("second batch:"))\n\
 .where({}).order("a").offset(6).limit(10)\n\
 .all(function(nodes) {\n\
     (processBatch("third batch:"))(nodes);\n\
\n\
     output(acum);\n\
  });',
	data:
'[{a: 1},\n\
{a: 3},\n\
{a: 2},\n\
{a: 4},\n\
{a: 6},\n\
{a: 7},\n\
{a: 5}]'
    },

    ex18: {
	source:
'g.where({$type: "Country",\n\
         name: g._c,\n\
         born$in:{surname: g._("surname"),\n\
                  author:{title: g._t}}})\n\
 .map(function(tuple) {\n\
     return [tuple.surname, tuple.c, tuple.t];\n\
 })\n\
 .tuples(function(results) {\n\
     output(results);\n\
});',
	data: queryExampleData1
    },

    ex19: {
	source:
'g.traverse("parent*/name")\n\
 .map(function(pair) {\n\
   return [pair.start.name, pair.end];\n\
 })\n\
 .groupBy(function(pair){\n\
   return pair[0]  \n\
 })\n\
 .all(function(results) {\n\
   output(results);\n\
});',
	data:
'[{$type: "Node",\n\
		 name: "a",\n\
	         parent:{$type: "Node",\n\
			 name: "b",\n\
			 parent: {$type: "Node",\n\
				  name: "c",\n\
				  parent: {$type: "Node",\n\
					   name: "d",\n\
					   parent: {$type: "Node",\n\
						    name: "e"}}}}},\n\
		{$type: "Other", name: "foo"}]'
    },

    ex20: {
	source:
	'var acum = [];\n\
\n\
g.where({name: "Albert",\n\
         lives:{},\n\
         brother$in:{}})\n\
 .first(function(einstein) {\n\
\n\
     acum.push([einstein.age,\n\
                einstein.lives.name,\n\
                (einstein.brother$in === undefined)]);\n\
\n\
     delete einstein["brother$in"];\n\
\n\
     einstein.age = 70;\n\
     einstein.lives = {$type: "Country",\n\
                       name: "United States"};\n\
\n\
     g.updateNode(einstein);\n\
 })\n\
 .where({name: "Albert",\n\
         lives: {},\n\
         brother$in:{}})\n\
 .first(function(einstein) {\n\
\n\
     acum.push([einstein.age,\n\
                einstein.lives.name,\n\
                (einstein.brother$in === undefined)]);\n\
\n\
     output(acum);\n\
});',
	data:
	'{$type: "Person",\n\
          name: "Maria",\n\
          surname: "Einstein",\n\
          brother:{$type: "Person",\n\
 name: "Albert",\n\
 surname: "Einstein",\n\
 age: 3,\n\
 lives: {$type: "Country",\n\
	 name: "Germany"}}}'
    },

    ex21: {
	source:
'g.where({})\n\
 .select(function(d) {\n\
    return d.data % 2 === 0;\n\
 })\n\
 .removeNodes()\n\
 .where({})\n\
 .map(function(d) { return d.data; })\n\
 .all(function(ds) {\n\
     output(ds);\n\
});',
	data:
'[{data:1},\n\
 {data:2},\n\
 {data:3},\n\
 {data:4},\n\
 {data:5}]'
    },

    ex22: {
	source:
'g.where({data: {$or: [{$eq: 2},{$eq: 4}]}})\n\
 .remove()\n\
 .where({})\n\
 .map(function(d) { return d.data; })\n\
 .all(function(ds) {\n\
     output(ds);\n\
});',
	data:
'[{data:1},\n\
 {data:2},\n\
 {data:3},\n\
 {data:4},\n\
 {data:5}]'
    },

    ex23: {
	source:
'g.where({$type: "Event"})\n\
 .map(function(event) {\n\
   var t = event.time;\n\
   return t.getHours()+":"+\n\
          t.getMinutes()+":"+\n\
          t.getSeconds();\n\
 })\n\
 .bind(function(ts) {\n\
    output(ts);\n\
  });\n\
\n\
g.load({$type: "Event",\n\
        time: new Date()});\n\
\n\
setTimeout(function() {\n\
    g.load({$type: "Event",\n\
            time: new Date()});\n\
}, 2000);\n\
\n\
setTimeout(function() {\n\
    g.load({$type: "Event",\n\
            time: new Date()});\n\
}, 4000);',

	data: true
    },

    ex24: {
	source:
'g.where({$type: "Person",\n\
         surname: "Russell",\n\
         author: {title: "Principia Mathematica"}})\n\
 .bind(function(people) {\n\
\n\
     output(["Readers Principia Mathematica: ",\n\
              people[0].author.readers || 0]);\n\
\n\
  });\n\
\n\
setTimeout(function() {\n\
    g.where({title: "Principia Mathematica"})\n\
     .first(function(pm) {\n\
         pm.readers = 1;\n\
         g.updateNode(pm);\n\
     });\n\
}, 3000);',
	data: queryExampleData1
    },

    ex25: {
	source:
'var c = 0;\n\
\n\
g.where({$type: "Event"})\n\
 .map(function(event) {\n\
   var t = event.time;\n\
   return t.getHours()+":"+\n\
          t.getMinutes()+":"+\n\
          t.getSeconds();\n\
 })\n\
 .bind(function(ts, id) {\n\
     if(c<2) {\n\
        c++;\n\
        output(ts);\n\
     } else {\n\
        g.unbind(id);\n\
        // this should only be invoked once\n\
        output(ts.concat(["unbound"]));\n\
     }\n\
  });\n\
\n\
for(var i=1; i<7; i++) {\n\
  setTimeout(function() {\n\
      g.load({$type: "Event",\n\
              time: new Date()})\n\
  }, i*1000);\n\
}',
	data: true
    },

    ex25b: {
	source:
'g.load({"name": "obj1",\n\
        "value": 1})\n\
.onUpdate(function(node) {\n\
    output(["updated", node, g.toJSON(node)]);\n\
})\n\
.onDelete(function(node) {\n\
    output(["deleted", node, g.toJSON(node)]);\n\
})\n\
.where({"name":"obj1"})\n\
.first(function(obj1) {\n\
    obj1.value = 0;\n\
    g.updateNode(obj1);\n\
})\n\
.where({"name":"obj1"})\n\
.removeNodes();',
	data: true
    },

    ex26: {
	source:
'var colors = ["#CCFFCC", "#FFFFCC", "#FF9999"];\n\
var max, min, objs;\n\
\n\
g.define("and(Book,prop(pages))",{\n\
\n\
           init: function() {\n\
             this.__counter = 0;\n\
           },\n\
\n\
           setColor: function(min,max) {\n\
              if(this.pages === min)\n\
                  this.__color = colors[0];\n\
              else if(this.pages === max)\n\
                  this.__color = colors[2];\n\
              else\n\
                  this.__color = colors[1];\n\
           },\n\
\n\
           display: function(){\n\
              this.__counter++;\n\
              output([this.title+" shown "+this.__counter]);\n\
              jQuery("#ex26-output-tab .CodeMirror")\n\
                .css("background-color", this.__color);\n\
           }\n\
\n\
    })\n\
    .where({$type: "Book"})\n\
    .each(function(book) {\n\
        if(min == null || book.pages<min)\n\
            min = book.pages;\n\
        if(max == null || book.pages>max)\n\
            max = book.pages;\n\
    })\n\
    .each(function(book){ book .setColor(min,max);})\n\
    .instances(function(books) {\n\
        objs = books;\n\
    });\n\
\n\
for(var i=0; i<10; i++) {\n\
    setTimeout(function() {\n\
\n\
       objs[Math.floor(Math.random()*3)].display();\n\
\n\
    }, i*2*1000);\n\
}',
	data: queryExampleData1
    },

    ex27: {
	source:
'g.from("http://anyorigin.com/get?url=http%3A//www.imdb.com/title/tt0264235/",\n\
        {jsonp:true,\n\
         media:"microdata",\n\
         result:"contents",\n\
         base:"http://www.imdb.com/title/tt026423"})\n\
 .load(function() {\n\
\n\
    g.where({$type: "http://schema.org/TVSeries",\n\
             genre: g._("genre"),\n\
             name: g._("name")})\n\
     .tuples(function(res){\n\
         output(res);\n\
     });\n\
\n\
})',
	data: true
    },

    ex28: {
	source:
'g.from("http://dbpedia.org/data/Barcelona.n3", \n\
       {media: "n3",\n\
        lang: "en",\n\
        ns: {dbont: "http://dbpedia.org/ontology/",\n\
             dbprop: "http://dbpedia.org/property/"}})\n\
 .onError(function() {\n\
    output("Error loading data from DBPedia, is DBPedia down?");\n\
 })\n\
 .load(function() {\n\
\n\
     g.where({"foaf:name":"Barcelona"})\n\
      .all(function(data) {\n\
           output(data)\n\
      })\n\
\n\
});',
	data:true
    },

    ex29: {
	source:
'g.from("http://graph.facebook.com/platform", \n\
       {media: "n3",\n\
        compactProperties: true})\n\
 .load(function() {\n\
\n\
   g.where({name: g._("name"),\n\
            founded: g._("founded")})\n\
    .tuples(function(data) {\n\
         output(data);\n\
    })\n\
\n\
});',
	data:true
    },

    ex30: {
	source:
'var query="ipad";\n\
\n\
g.from("https://www.googleapis.com/freebase/v1/search?query="+query+"&callback=matches")\n\
 .load(function() {\n\
        \n\
     g.where({name: {$like: "^iPad( [23])?$"}})\n\
      .map(function(match) {\n\
         return match.mid;\n\
      })\n\
      .each_cc(function(mid, k) {\n\
          query = JSON.stringify({mid:mid,type:"/base/gadgets/gadget","*":null});\n\
          g.from("https://www.googleapis.com/freebase/v1/mqlread?query="+query+"&callback=laodgadget")\n\
           .load(k);\n\
      })\n\
      .all(function() {\n\
\n\
          g.where({type:"/base/gadgets/gadget",\n\
                   name: g._("name"),\n\
                   weight: g._("weight")})\n\
           .tuples(function(result) {\n\
               output(result);\n\
           });\n\
\n\
      })\n\
\n\
});',
	data:true
    }

}