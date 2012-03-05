var TabulatorN3Parser=function(){var b={RDFSink_uniqueURI:function(){return"https://github.com/antoniogarrote/rdfstore-js/vocabulary/unique#"},graph:null,Util:{ArrayIndexOf:function(e,b,g){g||(g=0);var i=e.length;for(g<0&&(g=i+g);g<i;g++)if(e[g]===b)return g;return-1}}};if(typeof b.Util.uri=="undefined")b.Util.uri={};b.Util.uri.join=function(e,b){var e=e||"",g=b.indexOf("#");g>0&&(b=b.slice(0,g));if(e.length==0)return b;if(e.indexOf("#")==0)return b+e;if(e.indexOf(":")>=0)return e;var i=b.indexOf(":");
if(b=="")return e;if(i<0)return alert("Invalid base: "+b+" in join with "+e),e;g=b.slice(0,i+1);if(e.indexOf("//")==0)return g+e;if(b.indexOf("//",i)==i+1){var m=b.indexOf("/",i+3);if(m<0)return b.length-i-3>0?b+"/"+e:g+e}else if(m=b.indexOf("/",i+1),m<0)return b.length-i-1>0?b+"/"+e:g+e;if(e.indexOf("/")==0)return b.slice(0,m)+e;var i=b.slice(m),p=i.lastIndexOf("/");if(p<0)return g+e;p>=0&&p<i.length-1&&(i=i.slice(0,p+1));for(i+=e;i.match(/[^\/]*\/\.\.\//);)i=i.replace(/[^\/]*\/\.\.\//,"");i=i.replace(/\.\//g,
"");i=i.replace(/\/\.$/,"/");return b.slice(0,m)+i};b.Empty=function(){return this};b.Empty.prototype.termType="empty";b.Empty.prototype.toString=function(){return"()"};b.Empty.prototype.toQuads=function(){return{uri:"http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"}};b.Symbol=function(b){this.value=this.uri=b;return this};b.Symbol.prototype.termType="symbol";b.Symbol.prototype.toString=function(){return"<"+this.uri+">"};b.Symbol.prototype.toQuads=function(){return{token:"uri",prefix:null,suffix:null,
value:this.uri}};b.Symbol.prototype.XSDboolean=new b.Symbol("http://www.w3.org/2001/XMLSchema#boolean");b.Symbol.prototype.XSDdecimal=new b.Symbol("http://www.w3.org/2001/XMLSchema#decimal");b.Symbol.prototype.XSDfloat=new b.Symbol("http://www.w3.org/2001/XMLSchema#float");b.Symbol.prototype.XSDinteger=new b.Symbol("http://www.w3.org/2001/XMLSchema#integer");b.Symbol.prototype.XSDdateTime=new b.Symbol("http://www.w3.org/2001/XMLSchema#dateTime");b.Symbol.prototype.integer=new b.Symbol("http://www.w3.org/2001/XMLSchema#integer");
typeof b.NextId!="undefined"?b.log.error("Attempt to re-zero existing blank node id counter at "+b.NextId):b.NextId=0;b.NTAnonymousNodePrefix="_:";b.BlankNode=function(e){this.id=b.NextId++;this.value=e?e:this.id.toString();return this};b.BlankNode.prototype.termType="bnode";b.BlankNode.prototype.toString=function(){return b.NTAnonymousNodePrefix+this.id};b.BlankNode.prototype.toString=b.BlankNode.prototype.toNT;b.BlankNode.prototype.toQuads=function(){return{blank:b.NTAnonymousNodePrefix+this.id}};
b.Literal=function(b,f,g){this.value=b;this.lang=f==""||f==null?void 0:f;this.datatype=g==null?void 0:g;return this};b.Literal.prototype.termType="literal";b.Literal.prototype.toNT=function(){var b=this.value;if(typeof b!="string"){if(typeof b=="number")return""+b;throw Error("Value of RDF literal is not string: "+b);}b=b.replace(/\\/g,"\\\\");b=b.replace(/\"/g,'\\"');b=b.replace(/\n/g,"\\n");b='"'+b+'"';this.datatype&&(b=b+"^^"+this.datatype.toNT());this.lang&&(b=b+"@"+this.lang);return b};b.Literal.prototype.toQuads=
function(){var b=this.value;if(typeof b!="string"){if(typeof b=="number")return""+b;throw Error("Value of RDF literal is not string: "+b);}b={token:"literal",value:b};if(this.datatype)b.type=this.datatype.value;if(this.lang)b.lang=this.lang;return b};b.Collection=function(){this.id=b.NextId++;this.elements=[];this.closed=!1};b.Collection.idCounter=0;b.Collection.prototype.termType="collection";b.Collection.prototype.toNT=function(){return b.NTAnonymousNodePrefix+this.id};b.Collection.prototype.toQuads=
function(){var e=[],f="_:list"+b.Collection.idCounter;b.Collection.idCounter++;for(var g={uri:"http://www.w3.org/1999/02/22-rdf-syntax-ns#first"},i={uri:"http://www.w3.org/1999/02/22-rdf-syntax-ns#rest"},m={uri:"http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"},p,j={blank:f+"p"+h},h=0;h<this.elements.length;h++)p=j,j=h<this.elements.length-1?{blank:f+"p"+(h+1)}:m,e.push({subject:p,predicate:g,object:this.elements[h].toQuads(),graph:b.graph}),e.push({subject:p,predicate:i,object:j,graph:b.graph});return e};
b.Collection.prototype.append=function(b){this.elements.push(b)};b.Collection.prototype.unshift=function(b){this.elements.unshift(b)};b.Collection.prototype.shift=function(){return this.elements.shift()};b.Collection.prototype.close=function(){this.closed=!0};b.term=function(e){if(typeof e=="object")if(e instanceof Date){var f=function(b){return(""+(100+b)).slice(1,3)};return new b.Literal(""+e.getUTCFullYear()+"-"+f(e.getUTCMonth()+1)+"-"+f(e.getUTCDate())+"T"+f(e.getUTCHours())+":"+f(e.getUTCMinutes())+
":"+f(e.getUTCSeconds())+"Z",void 0,b.Symbol.prototype.XSDdateTime)}else if(e instanceof Array){for(var f=new b.Collection,g=0;g<e.length;g++)f.append(b.term(e[g]));return f}else return e;if(typeof e=="string")return new b.Literal(e);if(typeof e=="number")return f=(""+e).indexOf("e")>=0?b.Symbol.prototype.XSDfloat:(""+e).indexOf(".")>=0?b.Symbol.prototype.XSDdecimal:b.Symbol.prototype.XSDinteger,new b.Literal(e,void 0,f);if(typeof e=="boolean")return new b.Literal(e?"1":"0",void 0,b.Symbol.prototype.XSDboolean);
if(typeof e!="undefined")throw"Can't make term from "+e+" of type "+typeof e;};b.Statement=function(e,f,g,i){this.subject=b.term(e);this.predicate=b.term(f);this.object=b.term(g);if(typeof i!="undefined")this.why=i;return this};b.st=function(e,f,g,i){return new b.Statement(e,f,g,i)};b.Statement.prototype.toNT=function(){return this.subject.toNT()+" "+this.predicate.toNT()+" "+this.object.toNT()+" ."};b.Statement.prototype.toQuads=function(){var e=this.object.toQuads();if(e.constructor===Array){var f=
e[0].subject;e.push({subject:this.subject.toQuads(),predicate:this.predicate.toQuads(),object:f,graph:b.graph});return e}else return{subject:this.subject.toQuads(),predicate:this.predicate.toQuads(),object:this.object.toQuads(),graph:b.graph}};b.Formula=function(){this.statements=[];return this};b.Formula.prototype.termType="formula";b.Formula.prototype.toNT=function(){return"{"+this.statements.join("\n")+"}"};b.Formula.prototype.toQuads=function(){for(var b=[],f=0;f<this.statements.length;f++){var g=
this.statements[f].toQuads();g.constructor===Array?b=b.concat(g):b.push(g)}return b};b.Formula.prototype.add=function(e,f,g,i){this.statements.push(new b.Statement(e,f,g,i))};b.Formula.prototype.sym=function(e){return new b.Symbol(e)};b.sym=function(e){return new b.Symbol(e)};b.Formula.prototype.literal=function(e,f,g){return new b.Literal(""+e,f,g)};b.lit=b.Formula.prototype.literal;b.Formula.prototype.bnode=function(e){return new b.BlankNode(e)};b.Formula.prototype.formula=function(){return new b.Formula};
b.Formula.prototype.collection=function(){return new b.Collection};b.Formula.prototype.list=function(e){li=new b.Collection;if(e)for(var f=0;f<e.length;f++)li.append(e[f]);return li};b.Graph=function(){return new b.IndexedFormula};b.N3Parser=function(){function e(c,a,l,d,k,e,f,g){typeof a=="undefined"&&(a=null);typeof l=="undefined"&&(l="");typeof d=="undefined"&&(d=null);typeof k=="undefined"&&(k="");typeof f=="undefined"&&(f="");typeof g=="undefined"&&(g=null);this._bindings=new p([]);this._flags=
f;l&&l!=""&&(n(l.indexOf(":")>=0,"Document URI not absolute: "+l),this._bindings[""]=l+"#");this._store=c;k&&c.setGenPrefix(k);this._thisDoc=l;this.source=c.sym(l);this.previousLine=this.startOfLine=this.statementCount=this.lines=0;this._genPrefix=k;this.keywords=new m(["a","this","bind","has","is","of","true","false"]);this.keywordsSet=0;this._anonymousNodes=new p([]);this._variables=new p([]);this._parentVariables=new p([]);this._reason=g;this._reason2=null;if(q)this._reason2=why_BecauseOfData(c.sym(l),
this._reason);this._baseURI=d?d:l?l:null;n(!this._baseURI||this._baseURI.indexOf(":")>=0);if(!this._genPrefix)this._genPrefix=this._thisDoc?this._thisDoc+"#_g":b.RDFSink_uniqueURI();this._context=this._formula=a==null?this._thisDoc?c.formula(l+"#_formula"):c.formula():a;this._parentContext=null}function f(c,a,b,d,k){return"Line "+(a+1)+" of <"+c+">: Bad syntax: "+k+'\nat: "'+j(b,d,d+30)+'"'}var g={encode:function(c){for(var c=c.replace(/\r\n/g,"\n"),a="",b=0;b<c.length;b++){var d=c.charCodeAt(b);
d<128?a+=String.fromCharCode(d):(d>127&&d<2048?a+=String.fromCharCode(d>>6|192):(a+=String.fromCharCode(d>>12|224),a+=String.fromCharCode(d>>6&63|128)),a+=String.fromCharCode(d&63|128))}return a},decode:function(c){for(var a="",b=0;b<c.length;){var d=c.charCodeAt(b);d<128?(a+=String.fromCharCode(d),b++):d>191&&d<224?(a+=String.fromCharCode((d&31)<<6|c.charCodeAt(b+1)&63),b+=2):(a+=String.fromCharCode((d&15)<<12|(c.charCodeAt(b+1)&63)<<6|c.charCodeAt(b+2)&63),b+=3)}return a}},i=function(c){return c},
m=function(c){return c},p=function(c){if(c.length>0)throw"missing.js: oops nnonempty dict not imp";return[]},j=function(c,a,b){if(typeof c.slice=="undefined")throw"@@ mising.js: No .slice function for "+c+" of type "+typeof c;return typeof b=="undefined"||b==null?c.slice(a):c.slice(a,b)},h=Error("dummy error stop iteration"),o=function(c){this.last=0;this.li=c;this.next=function(){if(this.last==this.li.length)throw h;return this.li[this.last++]};return this},n=function(c,a){if(!c){if(a)throw"python Assertion failed: "+
a;throw"(python) Assertion failed.";}};String.prototype.encode=function(c){if(c!="utf-8")throw"UTF8_converter: can only do utf-8";return g.encode(this)};String.prototype.decode=function(c){if(c!="utf-8")throw"UTF8_converter: can only do utf-8";return this};var q=0,s=RegExp("^([-+]?[0-9]+)(\\.[0-9]+)?(e[-+]?[0-9]+)?","g"),t=RegExp('[\\\\\\r\\n\\"]',"g"),u=RegExp("^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)?","g");e.prototype.here=function(c){return this._genPrefix+"_L"+this.lines+"C"+(c-this.startOfLine+1)};e.prototype.formula=
function(){return this._formula};e.prototype.loadStream=function(c){return this.loadBuf(c.read())};e.prototype.loadBuf=function(c){this.startDoc();this.feed(c);return this.endDoc()};e.prototype.feed=function(c){var a=c.decode("utf-8"),c=[],b=a.length,d=0;numChunks=b/524288;for(var k=0;k<numChunks+1;k++)d+524288<b?c.push(a.substring(d,d+524288)):c.push(a.substring(d,b)),d+=524288;for(k=a=0;k>=0;)if(b=this.skipSpace(c[a],k),b<0)if(a==c.length-1)break;else a++,k=0;else{k=b;try{k=this.directiveOrStatement(c[a],
b)}catch(e){if(a==c.length-1)throw e;b=k;k=-1}k<0&&(k=c[a].substring(b,c[a].length),a++,c[a]=k+c[a],k=0)}};e.prototype.directiveOrStatement=function(c,a){var b=this.skipSpace(c,a);if(b<0)return b;var d=this.directive(c,b);if(d>=0)return this.checkDot(c,d);d=this.statement(c,b);return d>=0?this.checkDot(c,d):d};e.prototype.tok=function(c,a,l){if(j(a,l,l+1)=="@")l+=1;else if(b.Util.ArrayIndexOf(this.keywords,c)<0)return-1;var d=l+c.length;return j(a,l,d)==c&&"\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~".indexOf(a.charAt(d))>=
0?d:-1};e.prototype.directive=function(c,a){var l=this.skipSpace(c,a);if(l<0)return l;var d=new m([]),l=this.tok("bind",c,a);if(l>0)throw f(this._thisDoc,this.lines,c,a,"keyword bind is obsolete: use @prefix");l=this.tok("keywords",c,a);if(l>0){a=this.commaSeparatedList(c,l,d,!1);if(a<0)throw f(this._thisDoc,this.lines,c,a,"'@keywords' needs comma separated list of words");this.setKeywords(j(d,null,null));return a}l=this.tok("forAll",c,a);if(l>0){a=this.commaSeparatedList(c,l,d,!0);if(a<0)throw f(this._thisDoc,
this.lines,c,a,"Bad variable list after @forAll");l=new o(d);try{for(;;){var k=l.next();if(b.Util.ArrayIndexOf(this._variables,k)<0||b.Util.ArrayIndexOf(this._parentVariables,k)>=0)this._variables[k]=this._context.newUniversal(k)}}catch(e){if(e!=h)throw e;}return a}l=this.tok("forSome",c,a);if(l>0){a=this.commaSeparatedList(c,l,d,this.uri_ref2);if(a<0)throw f(this._thisDoc,this.lines,c,a,"Bad variable list after @forSome");l=new o(d);try{for(;;)k=l.next(),this._context.declareExistential(k)}catch(g){if(g!=
h)throw g;}return a}l=this.tok("prefix",c,a);if(l>=0){k=new m([]);a=this.qname(c,l,k);if(a<0)throw f(this._thisDoc,this.lines,c,l,"expected qname after @prefix");l=this.uri_ref2(c,a,k);if(l<0)throw f(this._thisDoc,this.lines,c,a,"expected <uriref> after @prefix _qname_");d=k[1].uri;this._baseURI?d=b.Util.uri.join(d,this._baseURI):n(d.indexOf(":")>=0,"With no base URI, cannot handle relative URI for NS");n(d.indexOf(":")>=0);this._bindings[k[0][0]]=d;this.bind(k[0][0],encodeURI(d));return l}l=this.tok("base",
c,a);if(l>=0){k=new m([]);a=this.uri_ref2(c,l,k);if(a<0)throw f(this._thisDoc,this.lines,c,l,"expected <uri> after @base ");d=k[0].uri;if(this._baseURI)d=b.Util.uri.join(d,this._baseURI);else throw f(this._thisDoc,this.lines,c,l,"With no previous base URI, cannot use relative URI in @base  <"+d+">");n(d.indexOf(":")>=0);this._baseURI=d;return a}return-1};e.prototype.bind=function(c,a){this._store.setPrefixForURI(c,a);c!=""&&this._store.setPrefixForURI(c,a)};e.prototype.setKeywords=function(c){c==
null?this.keywordsSet=0:(this.keywords=c,this.keywordsSet=1)};e.prototype.startDoc=function(){};e.prototype.endDoc=function(){return this._formula};e.prototype.makeStatement=function(c){c[0].add(c[2],c[1],c[3],this.source);this.statementCount+=1};e.prototype.statement=function(c,a){var b=new m([]),a=this.object(c,a,b);if(a<0)return a;b=this.property_list(c,a,b[0]);if(b<0)throw f(this._thisDoc,this.lines,c,a,"expected propertylist");return b};e.prototype.subject=function(c,a,b){return this.item(c,
a,b)};e.prototype.verb=function(c,a,b){var d=this.skipSpace(c,a);if(d<0)return d;var k=new m([]),d=this.tok("has",c,a);if(d>=0){a=this.prop(c,d,k);if(a<0)throw f(this._thisDoc,this.lines,c,d,"expected property after 'has'");b.push(new i(["->",k[0]]));return a}d=this.tok("is",c,a);if(d>=0){a=this.prop(c,d,k);if(a<0)throw f(this._thisDoc,this.lines,c,d,"expected <property> after 'is'");d=this.skipSpace(c,a);if(d<0)throw f(this._thisDoc,this.lines,c,a,"End of file found, expected property after 'is'");
a=d;d=this.tok("of",c,a);if(d<0)throw f(this._thisDoc,this.lines,c,a,"expected 'of' after 'is' <prop>");b.push(new i(["<-",k[0]]));return d}d=this.tok("a",c,a);if(d>=0)return b.push(new i(["->",this._store.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")])),d;if(j(c,a,a+2)=="<=")return b.push(new i(["<-",this._store.sym("http://www.w3.org/2000/10/swap/log#implies")])),a+2;if(j(c,a,a+1)=="="){if(j(c,a+1,a+2)==">")return b.push(new i(["->",this._store.sym("http://www.w3.org/2000/10/swap/log#implies")])),
a+2;b.push(new i(["->",this._store.sym("http://www.w3.org/2002/07/owl#sameAs")]));return a+1}if(j(c,a,a+2)==":=")return b.push(new i(["->","http://www.w3.org/2000/10/swap/log#becomes"])),a+2;d=this.prop(c,a,k);if(d>=0)return b.push(new i(["->",k[0]])),d;if(j(c,a,a+2)==">-"||j(c,a,a+2)=="<-")throw f(this._thisDoc,this.lines,c,d,">- ... -> syntax is obsolete.");return-1};e.prototype.prop=function(c,a,b){return this.item(c,a,b)};e.prototype.item=function(c,a,b){return this.path(c,a,b)};e.prototype.blankNode=
function(c){return this._context.bnode(c,this._reason2)};e.prototype.path=function(c,a,b){a=this.nodeOrLiteral(c,a,b);if(a<0)return a;for(;"!^.".indexOf(j(c,a,a+1))>=0;){var d=j(c,a,a+1);if(d=="."){var k=j(c,a+1,a+2);if(!k||"\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~:".indexOf(k)>=0&&":?<[{(".indexOf(k)<0)break}var k=b.pop(),e=this.blankNode(this.here(a)),a=this.node(c,a+1,b);if(a<0)throw f(this._thisDoc,this.lines,c,a,"EOF found in middle of path syntax");var g=b.pop();d=="^"?this.makeStatement(new i([this._context,
g,e,k])):this.makeStatement(new i([this._context,g,k,e]));b.push(e)}return a};e.prototype.anonymousNode=function(c){var a=this._anonymousNodes[c];if(a)return a;a=this._store.bnode(this._context,this._reason2);return this._anonymousNodes[c]=a};e.prototype.node=function(c,a,b,d){typeof d=="undefined"&&(d=null);var e=d,d=this.skipSpace(c,a);if(d<0)return d;a=d;d=j(c,a,a+1);if(d=="["){var g=this.here(a),d=this.skipSpace(c,a+1);if(d<0)throw f(this._thisDoc,this.lines,c,a,"EOF after '['");if(j(c,d,d+1)==
"="){var a=d+1,r=new m([]),d=this.objectList(c,a,r);if(d>=0){e=r[0];if(r.length>1){r=new o(r);try{for(;;){var n=r.next();this.makeStatement(new i([this._context,this._store.sym("http://www.w3.org/2002/07/owl#sameAs"),e,n]))}}catch(q){if(q!=h)throw q;}}d=this.skipSpace(c,d);if(d<0)throw f(this._thisDoc,this.lines,c,a,"EOF when objectList expected after [ = ");j(c,d,d+1)==";"&&(d+=1)}else throw f(this._thisDoc,this.lines,c,a,"objectList expected after [= ");}e==null&&(e=this.blankNode(g));a=this.property_list(c,
d,e);if(a<0)throw f(this._thisDoc,this.lines,c,d,"property_list expected");d=this.skipSpace(c,a);if(d<0)throw f(this._thisDoc,this.lines,c,a,"EOF when ']' expected after [ <propertyList>");if(j(c,d,d+1)!="]")throw f(this._thisDoc,this.lines,c,d,"']' expected");b.push(e);return d+1}if(d=="{"){d=j(c,a+1,a+2);if(d=="$"){a+=1;d=a+1;e=new m([]);for(g=!0;;){a=this.skipSpace(c,d);if(a<0)throw f(this._thisDoc,this.lines,c,a,"needed '$}', found end.");if(j(c,a,a+2)=="$}"){d=a+2;break}if(g)g=!1;else if(j(c,
a,a+1)==",")a+=1;else throw f(this._thisDoc,this.lines,c,a,"expected: ','");n=new m([]);d=this.item(c,a,n);if(d<0)throw f(this._thisDoc,this.lines,c,a,"expected item in set or '$}'");e.push(n[0])}b.push(this._store.newSet(e,this._context))}else{d=a+1;n=this._parentContext;this._parentContext=this._context;g=this._anonymousNodes;r=this._parentVariables;this._parentVariables=this._variables;this._anonymousNodes=new p([]);this._variables=this._variables.slice();var s=this._reason2;this._reason2=null;
e==null&&(e=this._store.formula());for(this._context=e;;){a=this.skipSpace(c,d);if(a<0)throw f(this._thisDoc,this.lines,c,a,"needed '}', found end.");if(j(c,a,a+1)=="}"){d=a+1;break}d=this.directiveOrStatement(c,a);if(d<0)throw f(this._thisDoc,this.lines,c,a,"expected statement or '}'");}this._anonymousNodes=g;this._variables=this._parentVariables;this._parentVariables=r;this._context=this._parentContext;this._reason2=s;this._parentContext=n;b.push(e.close())}return d}if(d=="("){g=this._store.list;
d=j(c,a+1,a+2);if(d=="$")g=this._store.newSet,a+=1;d=a+1;for(e=new m([]);;){a=this.skipSpace(c,d);if(a<0)throw f(this._thisDoc,this.lines,c,a,"needed ')', found end.");if(j(c,a,a+1)==")"){d=a+1;break}n=new m([]);d=this.item(c,a,n);if(d<0)throw f(this._thisDoc,this.lines,c,a,"expected item in list or ')'");e.push(n[0])}b.push(g(e,this._context));return d}d=this.tok("this",c,a);if(d>=0)throw f(this._thisDoc,this.lines,c,a,"Keyword 'this' was ancient N3. Now use @forSome and @forAll keywords.");d=this.tok("true",
c,a);if(d>=0)return b.push(!0),d;d=this.tok("false",c,a);return d>=0?(b.push(!1),d):e==null&&(d=this.uri_ref2(c,a,b),d>=0)?d:-1};e.prototype.property_list=function(c,a,b){for(;;){var d=this.skipSpace(c,a);if(d<0)throw f(this._thisDoc,this.lines,c,a,"EOF found when expected verb in property list");if(j(c,d,d+2)==":-"){var a=d+2,e=new m([]),d=this.node(c,a,e,b);if(d<0)throw f(this._thisDoc,this.lines,c,a,"bad {} or () or [] node after :- ");a=d}else{a=d;e=new m([]);d=this.verb(c,a,e);if(d<=0)return a;
var g=new m([]),a=this.objectList(c,d,g);if(a<0)throw f(this._thisDoc,this.lines,c,d,"objectList expected");d=new o(g);try{for(;;){var r=d.next(),n=e[0],p=n[1];n[0]=="->"?this.makeStatement(new i([this._context,p,b,r])):this.makeStatement(new i([this._context,p,r,b]))}}catch(q){if(q!=h)throw q;}d=this.skipSpace(c,a);if(d<0)throw f(this._thisDoc,this.lines,c,d,"EOF found in list of objects");if(j(c,a,a+1)!=";")return a;a+=1}}};e.prototype.commaSeparatedList=function(c,a,b,d){var e=this.skipSpace(c,
a);if(e<0)throw f(this._thisDoc,this.lines,c,e,"EOF found expecting comma sep list");if(c.charAt(e)==".")return a;e=d?this.uri_ref2(c,e,b):this.bareWord(c,e,b);if(e<0)return-1;for(;;){a=this.skipSpace(c,e);if(a<0)return a;e=j(c,a,a+1);if(e!=",")return e!="."?-1:a;e=d?this.uri_ref2(c,a+1,b):this.bareWord(c,a+1,b);if(e<0)throw f(this._thisDoc,this.lines,c,e,"bad list content");}};e.prototype.objectList=function(c,a,b){a=this.object(c,a,b);if(a<0)return-1;for(;;){a=this.skipSpace(c,a);if(a<0)throw f(this._thisDoc,
this.lines,c,a,"EOF found after object");if(j(c,a,a+1)!=",")return a;a=this.object(c,a+1,b);if(a<0)return a}};e.prototype.checkDot=function(c,a){var b=this.skipSpace(c,a);if(b<0)return b;if(j(c,b,b+1)==".")return b+1;if(j(c,b,b+1)=="}")return b;if(j(c,b,b+1)=="]")return b;throw f(this._thisDoc,this.lines,c,b,"expected '.' or '}' or ']' at end of statement");};e.prototype.uri_ref2=function(c,a,e){var d=new m([]),k=this.qname(c,a,d);if(k>=0){var g=d[0],d=g[0],g=g[1];if(d==null){n(0,"not used?");var i=
this._baseURI+"#"}else if(i=this._bindings[d],!i){if(d=="_")return e.push(this.anonymousNode(g)),k;throw f(this._thisDoc,this.lines,c,a,"Prefix "+d+" not bound.");}c=this._store.sym(i+g);b.Util.ArrayIndexOf(this._variables,c)>=0?e.push(this._variables[c]):e.push(c);return k}a=this.skipSpace(c,a);if(a<0)return-1;if(c.charAt(a)=="?")return d=new m([]),k=this.variable(c,a,d),k>0?(e.push(d[0]),k):-1;else if(c.charAt(a)=="<"){a+=1;for(d=a;a<c.length;){if(c.charAt(a)==">")return k=j(c,d,a),this._baseURI?
k=b.Util.uri.join(k,this._baseURI):n(k.indexOf(":")>=0,"With no base URI, cannot deal with relative URIs"),j(c,a-1,a)=="#"&&j(k,-1,null)!="#"&&(k+="#"),c=this._store.sym(k),b.Util.ArrayIndexOf(this._variables,c)>=0?e.push(this._variables[c]):e.push(c),a+1;a+=1}throw f(this._thisDoc,this.lines,c,k,"unterminated URI reference");}else if(this.keywordsSet){d=new m([]);k=this.bareWord(c,a,d);if(k<0)return-1;if(b.Util.ArrayIndexOf(this.keywords,d[0])>=0)throw f(this._thisDoc,this.lines,c,a,'Keyword "'+
d[0]+'" not allowed here.');e.push(this._store.sym(this._bindings[""]+d[0]));return k}else return-1};e.prototype.skipSpace=function(c,a){for(var b=c,d=a?a:0;d<c.length;d++)if(" \n\r\t\u000c\u000b\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000".indexOf(c.charAt(d))===-1)if(c.charAt(d)==="#")c=c.slice(a).replace(/^[^\n]*\n/,""),a=0,d=-1;else break;val=b.length-c.length+d;return val===b.length?-1:val};e.prototype.variable=function(c,a,b){var d=this.skipSpace(c,
a);if(d<0)return-1;if(j(c,d,d+1)!="?")return-1;d+=1;a=d;if("0123456789-".indexOf(c.charAt(d))>=0)throw f(this._thisDoc,this.lines,c,d,"Varible name can't start with '"+c.charAt(d)+"s'");for(;a<c.length&&"\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~:".indexOf(c.charAt(a))<0;)a+=1;if(this._parentContext==null)throw f(this._thisDoc,this.lines,c,d,"Can't use ?xxx syntax for variable in outermost level: "+j(c,d-1,a));b.push(this._store.variable(j(c,d,a)));return a};e.prototype.bareWord=function(c,a,b){var d=
this.skipSpace(c,a);if(d<0)return-1;a=c.charAt(d);if("0123456789-".indexOf(a)>=0)return-1;if("\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~:".indexOf(a)>=0)return-1;for(a=d;a<c.length&&"\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~:".indexOf(c.charAt(a))<0;)a+=1;b.push(j(c,d,a));return a};e.prototype.qname=function(c,a,e){a=this.skipSpace(c,a);if(a<0)return-1;var d=c.charAt(a);if("0123456789-+".indexOf(d)>=0)return-1;if("\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~:".indexOf(d)<0){var f=d;for(a+=1;a<c.length;)if(d=c.charAt(a),
"\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~:".indexOf(d)<0)f+=d,a+=1;else break}else f="";if(a<c.length&&c.charAt(a)==":"){var g=f;a+=1;for(f="";a<c.length;)if(d=c.charAt(a),"\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~:".indexOf(d)<0)f+=d,a+=1;else break;e.push(new i([g,f]));return a}else return f&&this.keywordsSet&&b.Util.ArrayIndexOf(this.keywords,f)<0?(e.push(new i(["",f])),a):-1};e.prototype.object=function(c,a,b){var d=this.subject(c,a,b);if(d>=0)return d;else{d=this.skipSpace(c,a);if(d<0)return-1;else a=
d;return c.charAt(a)=='"'?(d=j(c,a,a+3)=='"""'?'"""':'"',a+=d.length,c=this.strconst(c,a,d),d=c[0],b.push(this._store.literal(c[1])),d):-1}};e.prototype.nodeOrLiteral=function(c,a,b){var d=this.node(c,a,b);if(d>=0)return d;else{d=this.skipSpace(c,a);if(d<0)return-1;else a=d;if("-+0987654321".indexOf(c.charAt(a))>=0){s.lastIndex=0;var e=s.exec(c.slice(a));if(e==null)throw f(this._thisDoc,this.lines,c,a,"Bad number syntax");var d=a+s.lastIndex,g=j(c,a,d);g.indexOf("e")>=0?b.push(this._store.literal(parseFloat(g),
void 0,this._store.sym("http://www.w3.org/2001/XMLSchema#double"))):j(c,a,d).indexOf(".")>=0?b.push(this._store.literal(parseFloat(g),void 0,this._store.sym("http://www.w3.org/2001/XMLSchema#decimal"))):b.push(this._store.literal(parseInt(g),void 0,this._store.sym("http://www.w3.org/2001/XMLSchema#integer")));return d}if(c.charAt(a)=='"'){d=j(c,a,a+3)=='"""'?'"""':'"';a+=d.length;var g=null,i=this.strconst(c,a,d),d=i[0],i=i[1],e=null;if(j(c,d,d+1)=="@"){u.lastIndex=0;e=u.exec(c.slice(d+1));if(e==
null)throw f(this._thisDoc,startline,c,a,"Bad language code syntax on string literal, after @");a=u.lastIndex+d+1;e=j(c,d+1,a);d=a}j(c,d,d+2)=="^^"&&(a=new m([]),d=this.uri_ref2(c,d+2,a),g=a[0]);b.push(this._store.literal(i,e,g));return d}else return-1}};e.prototype.strconst=function(c,a,b){for(var d=a,e="",g=this.lines;d<c.length;){a=d+b.length;if(j(c,d,a)==b)return new i([a,e]);if(c.charAt(d)=='"')e+='"',d+=1;else{t.lastIndex=0;if(!t.exec(c.slice(d)))throw f(this._thisDoc,g,c,d,"Closing quote missing in string at ^ in "+
j(c,d-20,d)+"^"+j(c,d,d+20));a=d+t.lastIndex-1;e+=j(c,d,a);var h=c.charAt(a);if(h=='"')d=a;else if(h=="\r")d=a+1;else if(h=="\n"){if(b=='"')throw f(this._thisDoc,g,c,a,"newline found in string literal");this.lines+=1;e+=h;d=a+1;this.previousLine=this.startOfLine;this.startOfLine=d}else if(h=="\\"){d=a+1;h=j(c,d,d+1);if(!h)throw f(this._thisDoc,g,c,a,"unterminated string literal (2)");var m='abfrtvn\\"'.indexOf(h);if(m>=0)h='a\u0008\u000c\r\t\u000b\n\\"'.charAt(m),e+=h,d+=1;else if(h=="u")h=this.uEscape(c,
d+1,g),d=h[0],h=h[1],e+=h;else if(h=="U")h=this.UEscape(c,d+1,g),d=h[0],h=h[1],e+=h;else throw f(this._thisDoc,this.lines,c,a,"bad escape");}}}throw f(this._thisDoc,this.lines,c,a,"unterminated string literal");};e.prototype.uEscape=function(c,a,b){for(var d=a,e=0,g=0;e<4;){var h=j(c,d,d+1).toLowerCase();d+=1;if(h=="")throw f(this._thisDoc,b,c,a,"unterminated string literal(3)");h="0123456789abcdef".indexOf(h);if(h<0)throw f(this._thisDoc,b,c,a,"bad string literal hex escape");g=g*16+h;e+=1}c=String.fromCharCode(g);
return new i([d,c])};e.prototype.UEscape=function(b,a,e){for(var d=a,g=0,h="\\U";g<8;){var m=j(b,d,d+1).toLowerCase();d+=1;if(m=="")throw f(this._thisDoc,e,b,a,"unterminated string literal(3)");if("0123456789abcdef".indexOf(m)<0)throw f(this._thisDoc,e,b,a,"bad string literal hex escape");h+=m;g+=1}b="0x"+j(h,2,10)-0;b=String.fromCharCode(b);return new i([d,b])};return function(b,a,f,d,g,h,i,j){return new e(b,a,f,d,g,h,i,j)}}();b.IndexedFormula=function(){function e(e,g){if(typeof g!="object"){if(typeof g==
"string")return new b.Literal(g);if(typeof g=="number")return new b.Literal(g);if(typeof g=="boolean")return new b.Literal(g?"1":"0",void 0,b.Symbol.prototype.XSDboolean);else if(typeof g=="number")return new b.Literal(""+g);else if(typeof g=="undefined")return;else throw"Can't make Term from "+g+" of type "+typeof g;}return g}b.IndexedFormula=function(){this.statements=[];this.propertyActions=[];this.classActions=[];this.redirections=[];this.aliases=[];this.HTTPRedirects=[];this.subjectIndex=[];
this.predicateIndex=[];this.objectIndex=[];this.whyIndex=[];this.index=[this.subjectIndex,this.predicateIndex,this.objectIndex,this.whyIndex];this.namespaces={}};b.IndexedFormula.prototype=new b.Formula;b.IndexedFormula.prototype.constructor=b.IndexedFormula;b.IndexedFormula.SuperClass=b.Formula;b.IndexedFormula.prototype.setPrefixForURI=function(b,e){b=="tab"&&this.namespaces.tab||(this.namespaces[b]=e)};b.IndexedFormula.prototype.register=function(b,e){this.namespaces[b]=e};b.IndexedFormula.prototype.canon=
function(b){return b};b.IndexedFormula.prototype.add=function(f,g,i,m){m==void 0&&(m=this.fetcher?this.fetcher.appNode:this.sym("chrome:theSession"));f=e(this,f);g=e(this,g);i=e(this,i);m=e(this,m);f=new b.Statement(f,g,i,m);this.statements.push(f);return f};b.IndexedFormula.prototype.formula=function(e){return new b.IndexedFormula(e)};return b.IndexedFormula}();b.parse=function(e,f,g,i){try{if(i=="text/n3"||i=="text/turtle"){b.graph=g;b.N3Parser(f,f,null,g,null,null,"",null).loadBuf(e);return}}catch(m){throw"Error trying to parse N3 data:"+
m;}throw"Don't know how to parse "+i+" yet";};return b}(),defaultNs={owl:"http://www.w3.org/2002/07/owl#",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#",dcterms:"http://purl.org/dc/terms/",rdfs:"http://www.w3.org/2000/01/rdf-schema#",foaf:"http://xmlns.com/foaf/0.1/",atom:"http://www.w3.org/2005/Atom/",cal:"http://www.w3.org/2002/12/cal/ical#",vcard:"http://www.w3.org/2006/vcard/ns# ",geo:"http://www.w3.org/2003/01/geo/wgs84_pos#",sioc:"http://rdfs.org/sioc/ns#",doap:"http://usefulinc.com/ns/doap#",
com:"http://purl.org/commerce#",ps:"http://purl.org/payswarm#",gr:"http://purl.org/goodrelations/v1#",sig:"http://purl.org/signature#",ccard:"http://purl.org/commerce/creditcard#",og:"http://opengraphprotocol.org/schema/",geonames:"http://www.geonames.org/ontology#",geographis:"http://telegraphis.net/ontology/geography/geography#",xml:"http://www.w3.org/XML/1998/namespace",xsd:"http://www.w3.org/2001/XMLSchema#"},compactPredicate=function(b){return b.indexOf("#")!==-1?b.split("#")[1]:(b=b.split("/"),
b[b.length-1])},toNodes=function(b,e){var f={},g=[],i={},m={},p=e.lang||"en";if(e.ns){for(var j in e.ns)m[e.ns[j]]=j;for(j in defaultNs)m[defaultNs[j]]=j}for(var h,o,n,q,s=0;s<b.length;s++){h=b[s];j=h.subject;o=h.predicate.value;o==="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"&&(o="$type");if(e.compactProperties===!0)o=compactPredicate(o);else for(var t in m)if(o.indexOf(t)===0){o=o.replace(t,m[t]+":");break}h=h.object;j.blank!=null?(q="blank"+mg.blank,mg.blank++,j=q,i[mg.blank]=q):j=j.value;
f[j]?n=f[j]:(n={$id:j},g.push(n),f[j]=n);h.token==="uri"?h=o!=="$type"?{$id:h.value}:h.value:h.token==="literal"?h.type&&h.type.indexOf("int")!=-1||h.type&&h.type.indexOf("float")!=-1||h.type&&h.type.indexOf("decimal")!=-1?h=parseFloat(h.value):h.type&&h.type.indexOf("bool")!=-1?h=h.value==="true":h.lang==null||h.lang===p?h=h.value:e.lang&&(h=null):h.blank!=null&&(i[h.blank]!=null?h={$id:i[h.blank]}:(q="blank"+mg.blank,mg.blank++,h={$id:q},i[mg.blank]=q));h!=null&&(n[o]==null?n[o]=h:n[o].constructor===
Array?n[o].push(h):n[o]=[n[o],h])}return g},parse=function(b,e,f){var g=new TabulatorN3Parser.Graph;try{TabulatorN3Parser.parse(b,g,e,"text/n3")}catch(i){throw i;}b=g.toQuads();return toNodes(b,f)};mg.n3=function(b,e,f){return parse(e,b,f)};
