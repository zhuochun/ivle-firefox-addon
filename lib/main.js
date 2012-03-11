/// @filename main
/// @author Wang Zhuochun
/// @last edit 01/Mar/2012 01:51 AM

// Import the APIs
const Pref    = require("simple-prefs");    // stores user preferences
const Storage = require("simple-storage");  // stores user token, name etc
const PageWorkers = require("page-worker"); // to retrieve data from IVLE APIs
const Request = require("request").Request; // request GET or POST
const Data    = require("self").data;       // require extension data

// Create Panel
var panel = require("panel").Panel({
   width: 400,
   height: 550,
   contentURL: Data.url("index.html"),
   contentScriptFile: [Data.url('js/jquery-1.7.1.min.js'), Data.url("panel.js")],
   onShow: function() {
        //this.postMessage(IAPI.key + "," + USER_TOKEN);
   }
});

// Main
exports.main = function(options, callbacks) {
    addToolbarButton(panel);

    validateLogin();
};

// Set User object
var USER      = {
    name      : Storage.storage.user_name,
    token     : Storage.storage.user_token,
    validate  : false,
    modules   : Storage.storage.modules,
    // Save the token for offline uses
    saveToken : function(token) {
        Storage.storage.user_token = token;
        this.token                 = token;
    },
    saveName  : function(name) {
        Storage.storage.user_name  = name;
        this.name                  = name;
    },
    cacheModules : function(modules) {
        Storage.storage.modules    = modules;
        this.modules               = modules;
    }
};

USER.token = "17A29901F8FB5047E9D49219BD9DB2487C31A5AEA383742D5D09E25F7045FDC7148FDF78F313211F27FB3682F475E69B81AAFD3A5B7E200BE1543C1550C899C6EE993BD6FE750CA188808D090C82BD5377535283838B66BE9A375CF5FA1EF4AA8A28B8E08BC2C184E2096A29B88B396954A5F6BF3F5B8EB9194D348D0DCF444EAF28F4C50C0B0A708BBCDD64A92E8E9B243B7CD42B9A80F9F59143847BD8639A38EB920F12CDFB0805D19D616E517FE2DDF3F72EF9C6CC2437027062E03A5C2DABB0E6E863DC1657325AE4F3F91787EB";

// Set IAPI object
var IAPI      = {
    domain     : "http://ivle.nus.edu.sg/",
    key        : Pref.prefs.LAPI,
    // get the request url with API name, parameters
    requestURL : function(item, parameters) {
        var url = this.domain + "api/lapi.svc/" + item +
                    "?APIKey=" + this.key + "&AuthToken=" + USER.token;

        if (parameters) {
            for (var k in parameters) {
                url += "&" + k + "=" + parameters[k];
            }
        }

        return url + "&output=json";
    },
    // get the login url
    loginURL    : function(item) {
        if (item) {
            return this.domain + "api/lapi.svc/" + item + "?output=json" +
                    "&APIKey=" + this.key + "&Token=" + USER.token;
        } else {
            return this.domain + "api/login/?apikey=" + this.key +
                    "&url=" + encodeURIComponent("http://www.nus.edu.sg");
        }
    },
    // get the response from requestURL
    getResponse : function(message, url) {
        var temp = PageWorkers.Page({
            contentURL: url,
            contentScript: "self.postMessage(document.getElementsByTagName('pre')[0].innerHTML);",
            contentScriptWhen: "ready",
            onMessage: function(response) {
                var json = JSON.parse(response)
                panel.port.emit(message, json);
            }
        });
    }
};

// test code for IAPI functions
console.log(IAPI.requestURL("Modules", {
    Duration : 1,
    IncludeAllInfo : true
}));
console.log(IAPI.loginURL());

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

// Create toolbar Button
var {Cc, Ci} = require("chrome");
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

function addToolbarButton(panel) {
    var document = mediator.getMostRecentWindow("navigator:browser").document;
    var navBar = document.getElementById("nav-bar");

    if (!navBar) { return; }

    var btn = document.createElement("toolbarbutton");

    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'toolbarbutton-1 chromeclass-toolbar-additional');
    btn.setAttribute('image', Data.url("Lion.ico"));
    btn.setAttribute('orient', 'horizontal');
    btn.setAttribute('label', 'NUS IVLE Panel');
    btn.addEventListener('command', function() {
        if (!USER.token) {
            login();
        } else if (!USER.validate) {
            validateLogin();
        } else {

            console.log('open panel');

            //console.log("=====================");

            var userVal = IAPI.loginURL("Validate");
            //require("tabs").open(userVal);

            var userGET = IAPI.requestURL("Modules", { Duration : 1, IncludeAllInfo : true });
            //require("tabs").open(userGET);

            //console.log(userGET);
            //var userResult = IAPI.getResponse(userGET);

            var userGET2 = IAPI.loginURL("UserName_Get");
            //require("tabs").open(userGET2);

            IAPI.getResponse("userName", userGET2);
            //var userResult2 = IAPI.getResponse(userGET2);

            ////console.log(IAPI.getResponse(userGET));
            //console.log(userResult);

            //var moduleResult = IAPI.getResponse(IAPI.requestURL("Modules", { Duration : 1, IncludeAllInfo : true }));

            //console.log(moduleResult);

        }

        if (panel) {
            panel.show(btn);
        }
    }, true)

    navBar.appendChild(btn);
}

// Login User and Save Token, User Name
function login() {
    var tabs = require("tabs");

    require("page-mod").PageMod({
        include: "http://www.nus.edu.sg/?token=*",
        contentScriptFile: Data.url("js/getToken.js"),
        onAttach: function onAttach(worker) {
            worker.on('message', function(token) {
                USER.saveToken(token);
                console.log("USER_TOKEN = " + USER_TOKEN);
            });

            this.destroy();
        }
    });

    tabs.open(IAPI.loginURL());
}

// Logout User and clear saved data
function logout() {
    USER.saveToken("");
    USER.saveName("");
    USER.cacheModules({});
}

// Validate User Login
function validateLogin() {
    var url = IAPI.loginURL("Validate");

    require("tabs").open(url);

    var temp = PageWorkers.Page({
        contentURL: url,
        contentScript: "self.postMessage(document.getElementsByTagName('pre')[0].innerHTML);",
        contentScriptWhen: "ready",
        onMessage: function(response) {
            var json = JSON.parse(response)

            if (json.success) {
                USER.validate = true;
                //USER.saveToken(json.token);
            }
        }
    });
}

// TODO: change it to blinking, seperate script into files
function setIVLETitle(num) {
    require("page-mod").PageMod({
        include: "http://ivle.nus.edu.sg/*",
        contentScript: "document.title = \"[" + num + "] Workspace\""
        //onMessage:
    });
}

setIVLETitle(5);

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
