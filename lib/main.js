/// @filename main
/// @author Wang Zhuochun
/// @last edit 07/Feb/2012 08:35 PM

// Import the APIs
const pref    = require("simple-prefs");   // get the IVLE API key
const storage = require("simple-storage"); // to store the TOKEN, user name
const data    = require("self").data;

// Set IAPI variables
var API_Domain = "https://ivle.nus.edu.sg/";
var API_Key    = pref.prefs.LAPI;
var API_Login  = API_Domain + "api/login/?apikey=" + API_Key +
                    "&url=" + encodeURIComponent("http://www.nus.edu.sg");

// Set up Storage
storage.storage.user_token = "";
storage.storage.user_name  = "";

// Initial Token
var USER_TOKEN = "";

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
//var data = require("self").data;
var {Cc, Ci} = require("chrome");
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
//
//exports.main = function(options, callbacks) {
//    var test = 0;
//
//    var toolbarBtn = require("toolbarbutton").ToolbarButton({
//        id: "ivle-panel",
//        label: "NUS IVLE",
//        image: data.url("Lion.ico"),
//        panel: require("panel").Panel({
//            width: 400,
//            height: 550,
//            contentURL: "http://www.google.com/"
//        }),
//        onCommand: function() {
//            console.log("onCommand test = " + test);
//
//            if (test === 0) {
//                toolbarBtn.image = data.url("Gandam.png");
//                test = 1;
//            } else {
//                toolbarBtn.image = data.url("Lion.ico");
//                test = 0;
//            }
//        }
//    });
//
//    if (options.loadReason == "install") {
//        toolbarBtn.moveTo({
//            toolbarID: "nav-bar",
//            forceMove: false,
//            insertbefore: "stop-button"
//        });
//    }
//};
//
//function _makeContentURL(imageURL, badge) {
//    let str =
//      'data:text/html,<html><body style="margin:0; padding:0;">' +
//      '<div style="position: relative;">' +
//      '<img src="' + imageURL + '">' +
//      '<span style="font-size: 0.6em; font-weight: bold; position: absolute; bottom: 0; right: 0; padding: 0; margin: 0;">' +
//      (badge.text || '') + '</span>' +
//      '<span style="font-size: 0.6em; background-color: ' + (badge.color || '') + ';' +
//      'position: absolute; bottom: 0; right: 0; opacity: ' + (badge.opacity || '') + '; padding: 0; margin: 0; -moz-border-radius: 0.3em;">' +
//      (badge.text || '') + '</span>' +
//      '</div>' +
//      '</body></html>';
//    return str;
//  }

exports.main = function(options, callbacks) {
    var panel = require("panel").Panel({
       width: 400,
       height: 550,
       contentURL: data.url("success.html")
       //contentScriptFile: data.url("test.js")
    });

    addToolbarButton(panel);
};

function addToolbarButton(panel) {
    var document = mediator.getMostRecentWindow("navigator:browser").document;      
    var navBar = document.getElementById("nav-bar");

    if (!navBar) { return; }

    var btn = document.createElement("toolbarbutton");  

    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'toolbarbutton-1 chromeclass-toolbar-additional');
    btn.setAttribute('image', data.url("Lion.ico")); // path is relative to data folder
    btn.setAttribute('orient', 'horizontal');
    btn.setAttribute('label', 'NUS IVLE Panel');
    btn.addEventListener('command', function() {
        // use tabs.activeTab.attach() to execute scripts in the context of the browser tab
        console.log('clicked');

        if (!USER_TOKEN) {
            setUserToken();
        } else {
            if (panel) {
                panel.show(btn);
            }
        }
    }, true)

    navBar.appendChild(btn);
}

function setUserToken() {
    var tabs = require("tabs");

    require("page-mod").PageMod({
        include: "http://www.nus.edu.sg/?token=*",
        //contentScriptWhen: 'end',
        contentScriptFile: data.url("test.js"),
        onAttach: function onAttach(worker) {
            console.log("pageMod on Attach to content scripts");

            worker.on('message', function(data) {
                USER_TOKEN = data;

                console.log("USER_TOKEN = " + USER_TOKEN);
            });

            this.destroy();
        }
    });

    tabs.open(API_Login);
}

// add css style to page
//var 
//    pageMod = require("page-mod"),
//    data = require("self").data
//;
//pageMod.PageMod({
//    include: "*.twitter.com",
//    contentScriptWhen: 'ready',
//    contentScript:  'var css = document.createElement("link");'
//                    + 'css.rel = "stylesheet";'
//                    + 'css.type = "text/css";'
//                    + 'css.href = "' + data.url("fluid-twitter-layout.css") + '";'
//                    + 'document.getElementsByTagName("head")[0].appendChild(css);'
//});

/// vim: set ft=jetpack
