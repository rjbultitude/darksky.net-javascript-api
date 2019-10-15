'use strict'

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var sinon = require('sinon');
var DarkSky = require('../lib/darkskyjs');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomNumbers(length) {
    var numArray = [];
    for (var i = 0; i < length; i++) {
        numArray[i] = getRandomInt(1, 10000);
    }
    return numArray;
}

// Calculator module suite
// Group specs with describe
// Use as many specs as you like
describe('Test the methods of DarkSky', function() {
    before(function() {
        this.darkSky = new DarkSky({API_KEY: 'xxxyyy', PROXY_SCRIPT: 'http://testsite.com'});
    });
    // executes once, before all tests
    beforeEach(function() {
        this.randomPosLatitude = getRandomInt(0, 90);
        this.randomPosLongitude = getRandomInt(0, 180);
        this.randomNegLatitude = -Math.abs(getRandomInt(0, 90));
        this.randomNegLongitiude = -Math.abs(getRandomInt(0, 180));
        // stubs
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.xhr.response = {};
        this.makeRequestStub = sinon.stub(this.darkSky, 'makeRequest');
        sinon.spy(this.darkSky, 'processData');
    });

    afterEach(function() {
        this.makeRequestStub.restore();
        this.xhr.restore();
        this.darkSky.processData.restore();
    });

    //create scale spec
    it('getURL should return a string', function() {
        expect(this.darkSky.getURL(this.randomPosLatitude, this.randomNegLongitiude)).to.be.a('string');
    });
    it('makeRequest should return an object', function() {
        var makeRequestStubSuccess = this.makeRequestStub.returns(Promise.resolve(this.xhr.response));
        expect(makeRequestStubSuccess()).to.eventually.be.an('object');
    });
    it('makeRequest should return an object as a response', function() {
        var makeRequestStubSuccess = this.makeRequestStub.returns(Promise.resolve(this.xhr.response));
        return makeRequestStubSuccess().then((response) => {
            expect(response).to.be.an('object');
        });
    });
    it('makeRequest should return an error', function() {
        var makeRequestStubFail = this.makeRequestStub.returns(Promise.reject('error'));
        return makeRequestStubFail().catch((e) => {
            expect(e).to.equal('error');
        });
    });
    it('checkObject should return an array if arg is not an array', function() {
        expect(this.darkSky.checkObject({})).to.be.an('array');
    });
    it('checkObject should return the same array if arg is an array', function() {
        var testArr = [0];
        expect(this.darkSky.checkObject(testArr)).to.equal(testArr);
    });
    it('requestAllLocData should return an array when passed an array', function() {
        var locations = [0, 1, 2];
        expect(this.darkSky.requestAllLocData(locations)).to.be.an('array');
    });
    it('requestAllLocData should return an array of same length as arg array', function() {
        var locations = [0, 1, 2];
        expect(this.darkSky.requestAllLocData(locations)).to.have.lengthOf(3);
    });
    it('requestAllLocData should throw an error when passed a non-iterable data type', function() {
        expect(function () {this.darkSky.requestAllLocData('test')}).to.throw();
    });
    it('checkData should return false when forecasts arg has length of 0', function() {
        expect(this.darkSky.checkData([])).to.be.false;
    });
    it('checkData should return false when forecasts arg is null', function() {
        expect(this.darkSky.checkData(null)).to.be.false;
    });
    it('checkData should return false when forecasts arg is undefined', function() {
        expect(this.darkSky.checkData(undefined)).to.be.false;
    });
    it('processData should be called once when checkData is called with correct args', function() {
        this.darkSky.checkData(['test']);
        expect(this.darkSky.processData).to.be.calledOnce;
    });
    it('processData should call it\'s callback arg', function() {
        var callback = sinon.spy();
        this.darkSky.processData([0, 1, 2], [0, 1, 2], 'processCurrent', callback);
        expect(callback).to.be.calledOnce;
    });
    it('processData should return false if fnKey is not a string', function() {
        expect(this.darkSky.processData([0], [0], null, function() {})).to.be.false;
    });
    it('processWeek to return an array when passed valid args', function() {
        var parsedData = {daily: {data: [0]}};
        expect(this.darkSky.processWeek(parsedData, [0], 0)).to.be.an('array');
    });
    it('processWeek to throw when passed invalid parsedData arg', function() {
        var parsedData = {};
        expect(function() {this.darkSky.processWeek(parsedData, [0], 0)}).to.throw(TypeError);
    });
    it('processToday to return an array when passed valid args', function() {
        var parsedData = {hourly: {data: [0]}};
        expect(this.darkSky.processToday(parsedData, [0], 0)).to.be.an('array');
    });
    it('processToday to throw when passed invalid parsedData arg', function() {
        var parsedData = {};
        expect(function() {this.darkSky.processToday(parsedData, [0], 0)}).to.throw(TypeError);
    });
    it('processCurrent to return an object when passed valid args', function() {
        var parsedData = {currently: {}};
        expect(this.darkSky.processCurrent(parsedData, [0], 0)).to.be.an('object');
    });
    it('processCurrent to throw when passed invalid parsedData arg', function() {
        var parsedData = {};
        expect(function() {this.darkSky.processCurrent(parsedData, [0], 0)}).to.throw(TypeError);
    });
});
