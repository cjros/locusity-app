"use strict";

//////////////////////////////////////////////////
/// These require calls will be in your
/// modules/files, not in app-browserify.js.
///
/// app-browserify.js will then require() your prerequisites.
///
/// Here's how to include
/// various libs with require...
//////////////////////////////////////////////////
//
// -- when using Backbone, use this line
// var Backbone = require("backbone")
// -- when using Parse, comment out the above line and uncomment the line below
// var Parse = require("parse")
//
// -- when using React (and the plugin JSnoX), uncomment the following two lines
// var React = require("react")
// var d = require("jsnox")(React)
//
// -- if turning on React, uncomment the following line
// React.initializeTouchEvents(true);
//
// -- if using TemplateView, uncomment the following three lines
// var $ = require("jquery")
// var _ = require("lodash")
// (typeof Parse !== "object" ? Parse : Backbone).TemplateView = require("./TemplateView.js").TemplateView(Backbone, _, $)
//
//////////////////////////////////////////////////

// es6 polyfills, powered by babel
require("babel/register")

// other stuff that we don't really use in our own code
var Pace = require("../bower_components/pace/pace.js")

// require your own libraries, too!
// var _777 = require("./777.js")

window.onload = app;

function app(){
    document.querySelector("html").style.opacity = 1;
    // start app?
    // new _777.SevensRouter();
}