/// @filename main
/// @author Wang Zhuochun
/// @last edit 01/Mar/2012 01:51 AM

// Import the APIs
const Tabs    = require('tabs');            // require tab
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
        this.postMessage(USER);
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
    validated : false,
    initial   : false,
    modules   : Storage.storage.modules,
    // Save the token for offline uses
    saveToken : function(token) {
        console.log("old token = " + this.token);

        Storage.storage.user_token = token;
        this.token                 = token;

        console.log("update token = " + this.token);
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

USER.token = "A5AEA94D4FA3C4EFE7490FF89EC955C0E5DFC5375D50BF00E0439F763B2655AEC9CA154F5978E5EEEA994699DDFED98065CD553C5468802023FAE8F8C573E0B2D6E0E6A61CA7142B18DCAE4F7877DC65AC00261B4CBFB0E82C3A2DE2B282E2338209D5071030CE3FC7FD624A9C2ECBF390CA0C3DD0951AF6F6903F59AA548AC2C83161E0A88D487CC0A86B57B5DF3E3098AF4702CE9E2A5D64FE7546A82237ACD432B0A26007877D5883F3951605EED5BA015C8718C66C951191DEC27E0BDED61CDA080271A49B9B3A3913A080A630CF";

// Set IAPI object
var IAPI      = {
    domain     : "https://ivle.nus.edu.sg/",
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
    },
    // download file from workbins
    download    : function(id) {
        var url = this.domain + "api/downloadfile.ashx?apikey=" + this.key +
                    "&AuthToken=" + USER.token  + "&ID=" + id + "&target=workbin";

        Tabs.open(url);
    }
};

// test code for IAPI functions
//console.log(IAPI.requestURL("Modules", {
//    Duration : 1,
//    IncludeAllInfo : true
//}));
//console.log(IAPI.loginURL());

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
        // check user login
        if (!USER.token) {
            console.log("user login --> " + USER.token);
            login();
        } else if (!USER.validated) {
            console.log("validate user login --> " + USER.validated);
            validateLogin();
        } else {
            if (!USER.initial) {
                initialUser();
            }

            if (panel) {
                panel.show(btn);
            }
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
                USER.validated = true;

                console.log("USER_TOKEN = " + USER.token);

                if (!USER.initial) {
                    initialUser();
                }
            });

            this.destroy();
        }
    });

    tabs.open(IAPI.loginURL());
}

// Logout User and clear saved data
function logout() {
    panel.hide();

    USER.saveToken("");
    USER.saveName("");
    USER.cacheModules({});
}
panel.port.on("logout", logout);

// Validate User Login
function validateLogin() {
    if (!USER.token) {
        USER.validated = false;
        return;
    }

    var url = IAPI.loginURL("Validate");

    //require('tabs').open(url);

    var temp = PageWorkers.Page({
        contentURL: url,
        contentScript: "self.postMessage(document.getElementsByTagName('pre')[0].innerHTML);",
        contentScriptWhen: "ready",
        onMessage: function(response) {
            var json = JSON.parse(response)

            console.log("Validate result --> " + json.Success);

            if (json.Success) {
                USER.validated = true;

                if (USER.token !== json.Token) {
                    USER.saveToken(json.token);
                }

                if (!USER.initial) {
                    initialUser();
                }
            } else {
                login();
            }
        }
    });
}

// Initialzie User Basic Info
function initialUser() {
    console.log("initial user");

    // get user name
    var nameURL = IAPI.loginURL("UserName_Get");
    IAPI.getResponse("userName", nameURL);

    // get user modules
    var moduleURL = IAPI.requestURL("Modules", { Duration : 60, IncludeAllInfo : true });
    IAPI.getResponse("modules", moduleURL);

    USER.initial = true;
    //panel.port.emit("initialized", true);
}

// Panel request
function request(data) {
    var url = IAPI.requestURL(data.api, data.input);

    //require("tabs").open(url);

    IAPI.getResponse(data.output, url);
}
panel.port.on("request", request);

function downloadFile(id) {
    IAPI.download(id);
}
panel.port.on("download-file", downloadFile);

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
