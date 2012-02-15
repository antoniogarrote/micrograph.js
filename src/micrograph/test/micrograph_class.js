var MicrographClass = require('./../src/micrograph_class').MicrographClass;

exports.instantiation = function(test) {
    MicrographClass.reset();
    MicrographClass.define("Person", {
	decorated: function(){
	    if(this.country === 'Germany') {
		return 'Herr '+this.name+' '+this.surname;
	    } if(this.country === 'Britain') {
		return 'Mr. '+this.name+' '+this.surname;
	    } else {
		return this.name+' '+this.surname;
	    }
	}
    });

    data = {$id: 'lw',
	    $type: 'Person',
	    country: 'Germany',
	    name: 'Ludwig',
	    surname: 'Wittgenstein'}

    MicrographClass.check(data);
    var instance = data;

    test.ok(instance.name === 'Ludwig');
    test.ok(instance.surname === 'Wittgenstein');
    test.ok(instance.decorated() === 'Herr Ludwig Wittgenstein');

    test.done();
};

exports.instantiation2 = function(test) {
    MicrographClass.reset();
    MicrographClass.define("Person", {
	decorated: function(){
	    if(this.country === 'Germany') {
		return 'Herr '+this.name+' '+this.surname;
	    } if(this.country === 'Britain') {
		return 'Mr. '+this.name+' '+this.surname;
	    } else {
		return this.name+' '+this.surname;
	    }
	}
    });

    data = {$id: 'lw',
	    $type: ['Person', 'Philosopher', 'Logician'],
	    country: 'Germany',
	    name: 'Ludwig',
	    surname: 'Wittgenstein'}

    MicrographClass.check(data);
    var instance = data;

    test.ok(instance.name === 'Ludwig');
    test.ok(instance.surname === 'Wittgenstein');
    test.ok(instance.decorated() === 'Herr Ludwig Wittgenstein');

    test.done();
};

exports.instantiation3 = function(test) {
    MicrographClass.reset();
    MicrographClass.define("or(Philosopher, Logician)", {
	likesLogic: function(){
	    return true;
	}
    });

    data = {$id: 'lw',
	    $type: ['Person', 'Philosopher', 'Logician'],
	    country: 'Germany',
	    name: 'Ludwig',
	    surname: 'Wittgenstein'}

    MicrographClass.check(data);
    var instance = data;

    test.ok(instance.name === 'Ludwig');
    test.ok(instance.surname === 'Wittgenstein');
    test.ok(instance.likesLogic());


    data = {$id: 'gb',
	    $type: ['Logician'],
	    name: 'George',
	    surname: 'Boole'}

    MicrographClass.check(data);
    instance = data;

    test.ok(instance.name === 'George');
    test.ok(instance.surname === 'Boole');
    test.ok(instance.likesLogic());

    data = {$id: 'rm',
	    $type: ['Painter'],
	    name: 'Rene',
	    surname: 'Magritte'}

    MicrographClass.check(data);
    instance = data;

    test.ok(instance.name === 'Rene');
    test.ok(instance.surname === 'Magritte');
    test.ok(instance.likesLogic == null);

    test.done();

};

exports.instantiation4 = function(test) {
    MicrographClass.reset();
    MicrographClass.define("Person", {
	isMortal: function(){
	    return true;
	}
    });

    MicrographClass.define("Philosopher", {
	isMoral: function(){
	    return true;
	}
    });

    data = {$type: ['Person', 'Philosopher'],
	    name: 'Socrates'}

    MicrographClass.check(data);
    var instance = data;

    test.ok(instance.name === 'Socrates');
    test.ok(instance.isMoral() === true);
    test.ok(instance.isMortal() === true);

    test.done();
};


exports.instantiation5 = function(test) {
    MicrographClass.reset();
    MicrographClass.define("or(Philosopher, Logician)", {
	likesLogic: function(){
	    return true;
	}
    });

    MicrographClass.define("not(or(Philosopher, Logician))", {
	likesLogic: function(){
	    return false;
	}
    });

    data = {$id: 'lw',
	    $type: ['Person', 'Philosopher', 'Logician'],
	    country: 'Germany',
	    name: 'Ludwig',
	    surname: 'Wittgenstein'}

    MicrographClass.check(data);
    var instance = data;

    test.ok(instance.name === 'Ludwig');
    test.ok(instance.surname === 'Wittgenstein');
    test.ok(instance.likesLogic());


    data = {$id: 'gb',
	    $type: ['Logician'],
	    name: 'George',
	    surname: 'Boole'}

    MicrographClass.check(data);
    instance = data;

    test.ok(instance.name === 'George');
    test.ok(instance.surname === 'Boole');
    test.ok(instance.likesLogic());

    data = {$id: 'rm',
	    $type: ['Painter'],
	    name: 'Rene',
	    surname: 'Magritte'}

    MicrographClass.check(data);
    instance = data;

    test.ok(instance.name === 'Rene');
    test.ok(instance.surname === 'Magritte');
    test.ok(instance.likesLogic() == false);

    test.done();

};

exports.instantiation6 = function(test) {
    MicrographClass.reset();
    MicrographClass.define('prop(country)',{
	hasNationality: function() {
	    return true;
	}
    });

    MicrographClass.define('not(prop(country))', {
	hasNationality: function() {
	    return false;
	}
    });


    var instance1 = {country: 'Spain'};
    var instance2 = {};

    MicrographClass.check(instance1);
    MicrographClass.check(instance2);

    test.ok(instance1.hasNationality() === true);
    test.ok(instance2.hasNationality() === false);

    test.done();
}


exports.instantiation7 = function(test) {
    MicrographClass.reset();
    MicrographClass.define('Person',{
	nationality: function() {
	    if(this.country) {
		return country;
	    } else {
		return 'apatride';
	    }
	},
	init: function(){
	    this.__lastType = this.__lastType+'Person';
	    this._isPerson = true;
	}
    });

    MicrographClass.define('Philosopher',{
	init: function(){
	    this.__lastType = this.__lastType+'Philosopher';
	    this._isPhilosopher = true;
	}
    });

    MicrographClass.define('Logician',{
	init: function(){
	    this.__lastType = this.__lastType+'Logician';
	    this._isLogician = true;
	}
    });

    var instance = {name: 'Ludwig',
		    surname: 'Wittgenstein',
		    $type: ['Philosopher', 'Logician', 'Person']};

    MicrographClass.check(instance);

    test.ok(instance.name === 'Ludwig');
    test.ok(instance.nationality() === 'apatride');
    console.log(instance.__lastType);
    test.ok(instance.__lastType === 'undefinedPersonPhilosopherLogician');
    test.ok(instance._isPerson === true);
    test.ok(instance._isPhilosopher === true);
    test.ok(instance._isLogician === true);
    test.done();
}