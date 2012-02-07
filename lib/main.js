/// @filename main
/// @author Wang Zhuochun
/// @last edit 07/Feb/2012 08:35 PM

// Import the APIs
var pref = require("simple-prefs"); // get the IVLE API key

// Set variables
var LAPI  = pref.prefs.LAPI;
var TOKEN = "";

//const widgets = require("widget");
//const badges  = require("BadgedWidget");
//const tabs    = require("tabs");
//const data    = require("self").data;
//
//console.log("IVLE add-on is initializing");
//
////var widget = widgets.Widget({
//var widget = badges.BadgedWidget({
//  id: "mozilla-link",
//  label: "Mozilla website",
//  contentURL: data.url("Lion.ico"),
//  onClick: function() {
//    tabs.open("http://www.mozilla.org/");
//  }
//
////  onClick: function() {
////    changeText();
////  }
//});
//
//widget.badge = {
//    text: '5',
//    color: 'red',
//    opacity: '0.6'
//};
//
//function changeText() {
//    widget.badge.text = '8';
//}
//
//console.log("The add-on is running.");
//
var data = require("self").data;
var {Cc, Ci} = require("chrome");
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

exports.main = function(options, callbacks) {
    addToolbarButton();
    // other stuff
};

function addToolbarButton() {
    var document = mediator.getMostRecentWindow("navigator:browser").document;      
    var navBar = document.getElementById("nav-bar");
    if (!navBar) {
        return;
    }
    var btn = document.createElement("toolbarbutton");  

    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'toolbarbutton-1');
    btn.setAttribute('image', data.url("Lion.ico")); // path is relative to data folder
    btn.setAttribute('orient', 'horizontal');
    btn.setAttribute('label', 'My App');
    btn.setAttribute('panel', require("panel").Panel({contentURL: data.url("sample.html")}));
    btn.addEventListener('click', function() {
        // use tabs.activeTab.attach() to execute scripts in the context of the browser tab
        console.log('clicked');
    }, false)
    navBar.appendChild(btn);
}

/// vim: set ft=jetpack
