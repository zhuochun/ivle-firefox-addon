/// @filename main
/// @author Wang Zhuochun
/// @last edit 01/Mar/2012 01:51 AM

// Import the APIs
const Pref    = require("simple-prefs");    // stores user preferences
const Storage = require("simple-storage");  // stores user token, name etc
const Request = require("request").Request; // request GET or POST
const Data    = require("self").data;       // require extension data

// For Develop Purporses
Storage.storage.user_token =  "2F9ECEDE7789C183693D763289582FA95632F1396CDC5D3DD7054332645E07D6131B5504FCC1B7B6C7C72CD1ED35B31654429681F192DA19F931C19DC85A2FABA7A0A3F61065E575E206C4EC0D89B1D1A41F1467E0D6C18C17459C64333CC244A2007FC0E8BBF69FE3F7BEA8927D44EA7718A36ED904E131C66C8BF067399D3F69A1E81663FC717ACAB4925508794DB36657929E48BDCF884B6BD9A97F4B9BF19737E0A30F31F7F0E7AF827D102B8A7B3A602401CBDCF3CC3BE82045ADF70B3A052FAA2165DFA39E6EF5EAE6AC3148C5";

// Set User
var USER      = {
    name    : Storage.storage.user_token,
    token   : Storage.storage.user_name
};

// Set IAPI
var IAPI      = {
    domain  : "http://ivle.nus.edu.sg/",
    key     : Pref.prefs.LAPI,
    request : function(item, parameters) {
        var url = this.domain + "api/lapi.svc/" + item + 
                    "?APIKey=" + this.key + 
                    "&AuthToken=" + USER.token;

        if (parameters) {
            for (var k in parameters) {
                url += "&" + k + "=" + parameters[k];
            }
        }

        return url + "&output=json";
    },
    login   : function() {
        return this.domain + "api/login/?apikey=" + this.key +
                "&url=" + encodeURIComponent("http://www.nus.edu.sg");
    }
};

console.log(IAPI.request("Modules", {
    Duration : 1,
    IncludeAllInfo : true
}));
console.log(IAPI.login());

// Set IAPI variables
var API_Domain = "http://ivle.nus.edu.sg/";
var API_URL    = API_Domain + "api/lapi.svc/";
var API_Key    = Pref.prefs.LAPI;
var API_Login  = API_Domain + "api/login/?apikey=" + API_Key +
                    "&url=" + encodeURIComponent("http://www.nus.edu.sg");

// Set up Storage
// TODO: support multiple user's storage data
Storage.storage.user_token = "";
Storage.storage.user_name  = "";

// Initial Token
var USER_TOKEN = "2F9ECEDE7789C183693D763289582FA95632F1396CDC5D3DD7054332645E07D6131B5504FCC1B7B6C7C72CD1ED35B31654429681F192DA19F931C19DC85A2FABA7A0A3F61065E575E206C4EC0D89B1D1A41F1467E0D6C18C17459C64333CC244A2007FC0E8BBF69FE3F7BEA8927D44EA7718A36ED904E131C66C8BF067399D3F69A1E81663FC717ACAB4925508794DB36657929E48BDCF884B6BD9A97F4B9BF19737E0A30F31F7F0E7AF827D102B8A7B3A602401CBDCF3CC3BE82045ADF70B3A052FAA2165DFA39E6EF5EAE6AC3148C5";

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
//        image: Data.url("Lion.ico"),
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
       contentURL: Data.url("index.html"),
       contentScriptFile: [Data.url('js/jquery-1.7.1.min.js'), Data.url("panel.js")],
       onShow: function() {
            this.postMessage(API_Key + "," + USER_TOKEN);
       }
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
    btn.setAttribute('image', Data.url("Lion.ico")); // path is relative to data folder
    btn.setAttribute('orient', 'horizontal');
    btn.setAttribute('label', 'NUS IVLE Panel');
    btn.addEventListener('command', function() {
        // use tabs.activeTab.attach() to execute scripts in the context of the browser tab
        console.log('clicked');

        if (!USER_TOKEN) {
            setUserToken();
        } else {
            console.log('open panel');

            //populate_UserName();
            //validateUserToken();

            if (panel) {
                panel.show(btn);
            }
        }
    }, true)

    navBar.appendChild(btn);
}

// Login First Time User
// TODO: move to login.js file
// TODO: store on storage, then save to USER_TOKEN
function setUserToken() {
    var tabs = require("tabs");

    require("page-mod").PageMod({
        include: "http://www.nus.edu.sg/?token=*",
        //contentScriptWhen: 'end',
        contentScriptFile: Data.url("test.js"),
        onAttach: function onAttach(worker) {
            console.log("pageMod on Attach to content scripts");

            worker.on('message', function(token) {
                USER_TOKEN = token;

                console.log("USER_TOKEN = " + USER_TOKEN);
            });

            this.destroy();
        }
    });

    tabs.open(API_Login);
}

function generateURL(behave, array) {
    return API_URL + behave + "?output=json&APIKey=" + API_Key + "&Token=" + USER_TOKEN;
}

// Validate User Token, and update to new token if old token expires
function validateUserToken() {
    var url = API_URL + "validate?output=json&APIKey=" + API_Key + "&Token=" + USER_TOKEN;

    console.log(url);

    require("tabs").open(url);

    Request({
        url: url,
        onComplete: function(response) {
            console.log(response.text);
            console.log(response.json);

            //var result = response.json
        }
    }).get();
}

// Logout User, clear USER_TOKEN and storage
function clearUserToken() {
    USER_TOKEN = "";
}

// Get User Name
function populate_UserName() {

    //var r = CC["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsXMLHttpRequest);

    //r.onload  = function(aEvent) {
    //    var text = r.responseText;

    //    var jsObj = JSON.parse(text);

    //    if (jsObj != null) {
    //        for (var i in jsObj) {
    //            console.log(i + " -> " + jsObj[i]);
    //        }
    //    }
    //};

    //r.open("GET", IAPI.request("Modules", { Duration : 1, IncludeAllInfo : true }), true);

    //r.send();

    var r1 = new XMLHttpRequest();

    console.log(r1);

    r1.open('GET', 'http://www.mozilla.org/', false);

    r1.send(null);

    if (r1.status === 200) {
        console.log(r1.responseText);
    }


    var url = API_URL + "UserName_Get?output=json&APIKey=" + API_Key + "&Token=" + USER_TOKEN;

    //console.log(url);

    require("tabs").open(url);

    Request({
        url: url,
        onComplete: function(response) {
            console.log("===============");
            console.log(response.text);
            console.log(response.json);
            console.log(response.headers);
            console.log(response.status);
            console.log(response.statusText);

            for (var hName in response.headers)
                console.log(hName + " : " + response.headers[hName]);

            console.log("===============");

            //var result = response.text;

            //console.log(result);
        }
    }).get();

    var moduleurl = API_URL + "Modules?output=json&APIKey=" + API_Key + "&AuthToken=" + USER_TOKEN + "&Duration=100&IncludeAllInfo=false";

    require("tabs").open(moduleurl);

    Request({
        url: moduleurl,
        onComplete: function(response) {
            console.log("===============");
            console.log(response.text);
            console.log(response.json);
            console.log(response.headers);
            console.log(response.status);
            console.log(response.statusText);

            for (var hName in response.headers)
                console.log(hName + " : " + response.headers[hName]);

            console.log("===============");
        }
    }).get();

    Request({
      url: "http://dl.dropbox.com/u/1212936/test.json",
      onComplete: function (response) {
            console.log("dropbox result: " + response.text);
            //console.log(response.json);
      }
    }).get();


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
