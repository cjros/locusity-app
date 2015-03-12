var mocha = require('mocha'),
    chai = require('chai');

var assert = chai.assert;
var expect = chai.expect;

//--- your setup code goes here (i.e. create test instances of your Constructors)
var Person = require('../Person.js').Person;
//--- your setup code goes above here


//--- example tests
describe("Array", function(){ // a Constructor name
    describe("#indexOf()", function(){ // a method of said Constructor
        it("should return -1 when the value is not present", function(){
            expect([1,2,3].indexOf(5)).to.equal(-1);
            expect([1,2,3].indexOf(0)).to.equal(-1);
        })
    })
})

//--- your tests go here
describe("Person", function(){
    var matt = new Person("Matt");
    describe("#constructor()", function(){
        it("should handle a first argument as a name", function(){
            expect(matt.name).to.equal("Matt");
        })
    })
    describe("#setName()", function(){
        it("should overwrite the name", function(){
            matt.setName("Bob");
            expect(matt.name).to.not.equal("Matt");
            expect(matt.name).to.equal("Bob");
        })
    })
})