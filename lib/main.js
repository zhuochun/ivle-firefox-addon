/// @filename main.js
/// @author Wang Zhuochun
/// @last edit 31/Mar/2012 06:34 PM

// ****************************************************************************
// imports part
// ****************************************************************************

// Import the APIs
const Tabs    = require("tabs");            // require tab
const Pref    = require("simple-prefs");    // stores user preferences
const Storage = require("simple-storage");  // stores user token, name etc
const PageWorkers = require("page-worker"); // to retrieve data from IVLE APIs
const Request = require("request").Request; // request GET or POST
const Data    = require("self").data;       // require extension data
const Notify  = require("notifications");   // to notification user
const Timers  = require("timers");          // to update information periodically

// Import IVLE add-on modules
const IcoBadge = require("icoBadge.js");
const Todo     = require("todo.js");

// ****************************************************************************
// main functions
// ****************************************************************************

// Main
exports.main = function(options, callbacks) {
    addToolbarButton(panel);
    validateLogin();
};

// the addon-on unloaded
// exports.onUnload = function(reason) {
// }

// Preferences change listeners
Pref.on("ivle_interval", function() {
    if (Pref.prefs.ivle_interval < 1) {
        Pref.prefs.ivle_interval = 10;
    }

    USER.interval = Pref.prefs.ivle_interval;
    panel.port.emit("initial-panel", USER);
});

Pref.on("ivle_lapi", function() {
    var oldKey = IAPI.key;

    if (Pref.prefs.ivle_lapi.length !== 21) { // basic key check
        Pref.prefs.ivle_lapi = oldKey;
    }

    // IAPI key updated when Firefox restarted
    //IAPI.key = Pref.prefs.ivle_lapi;
});

// ****************************************************************************
// USER and IAPI objects functions
// ****************************************************************************

// Set User object
var USER      = {
    token     : Storage.storage.user_token, // IVLE token
    validated : false,                      // validate token
    initialed : false,                      // initial basic modules/announcements
    todoList  : undefined,                  // stores the todolist of this user
    updateSID : undefined,                  // peridoic update object
    interval  : Pref.prefs.ivle_interval || 10,  // update interval, default: 10 mins
    // Save the token for next time
    saveToken : function(token) {
        Storage.storage.user_token = token;
        this.token                 = token;

        if (this.todoList) {
            this.todoList.token = token;
        }
    },
    // Clear this user's data
    clearUser : function() {
        this.token      = "";
        this.validated  = false;
        this.initialed  = false;
        this.todoList   = undefined;

        if (this.updateSID) {
            Timers.clearTimeout(this.updateSID);
        }

        Storage.storage.user_token = "";
    }
};

// Set IAPI object
var IAPI      = {
    domain     : "https://ivle.nus.edu.sg/",
    key        : Pref.prefs.ivle_lapi,
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
                try {
                    if (response) {
                        var json = JSON.parse(response);
                        panel.port.emit(message, json);
                    } else {
                        panel.port.emit("internet-failed");
                        console.log("Error, no response received");
                    }
                } catch (err) {
                    panel.port.emit("internet-failed");
                    console.log("Error, parsing response meet problem");
                }
            }
        });

        // Request does not work, leave it for later use in case IVLE fixed the problem
        //Request({
        //    url : url,
        //    onComplete : function(response) {
        //        console.log(response.text);

        //        console.log(response.status);
        //        console.log(response.statusText);

        //        for (var h in response.headers) {
        //            console.log(h + " -> " + response.headers[h]);
        //        }
        //    }
        //}).get();
    },
    // mark an announcement as read
    markAnnRead : function(id) {
        var url = this.domain + "api/lapi.svc/Announcement_AddLog_JSON";

        Request({
            url         : url,
            content     : {
                APIKey     : this.key,
                AuthToken  : USER.token,
                AnnEventID : id
            },
            onComplete : function(response) {
                console.log(response.status);
                console.log(response.statusText);
            }
        }).post();
    },
    // download file from workbins
    download    : function(id) {
        var url = this.domain + "api/downloadfile.ashx?apikey=" + this.key +
                    "&AuthToken=" + USER.token  + "&ID=" + id + "&target=workbin";

        Tabs.open(url);
    }
};

// ****************************************************************************
// add-on UI part
// ****************************************************************************

// Create Panel
var panel = require("panel").Panel({
    width: 400,
    height: 550,
    contentURL: Data.url("index.html"),
    contentScriptFile: [
        Data.url("js/jquery-1.7.1.min.js"),
        Data.url("panel.js"),
        Data.url("js/tabs.js")
    ],
    onShow: function() {
        //this.postMessage(USER);
    }
});

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
            if (!USER.initialed) {
                initialUser();
            }

            if (panel) {
                panel.show(btn);
            }
        }
    }, true)

    navBar.appendChild(btn);
}

// ****************************************************************************
// initialization part
// ****************************************************************************

// Initialzie User Basic Info
function initialUser() {
    console.log("initial user");

    // initial icoBadge
    IcoBadge.initial();

    // initial USER setting to panel
    panel.port.emit("initial-panel", USER);

    // get user's name
    var nameURL = IAPI.loginURL("UserName_Get");
    IAPI.getResponse("userName", nameURL);

    // get user's modules
    var moduleURL = IAPI.requestURL("Modules", { Duration : 60, IncludeAllInfo : true });
    IAPI.getResponse("modules", moduleURL);

    // get user's timetable
    // TODO: finish this styling
    //var timetableURL = IAPI.requestURL("Timetable_Student", { AcadYear : "2011/2012", Semester : 2 });
    //Tabs.open(timetableURL);

    // initial update interval
    var updateFun = function() {
        var url = IAPI.requestURL("Modules", {
            Duration : USER.interval,
            IncludeAllInfo : true
        });
        IAPI.getResponse("update-modules", url);

        console.log("Update Modules");
    };
    USER.updateSID = Timers.setInterval(updateFun, USER.interval * 60 * 1000);

    // initial user's todoList
    if (Storage.storage.todoLists) {
        for (var i = 0; i < Storage.storage.todoLists.length; i++) {
            if (Storage.storage.todoLists[i].token === USER.token) {
                console.log("load todoLists from Storage = " + i);

                USER.todoList = Storage.storage.todoLists[i];
                break;
            }
        }

        // user's todolist is not found
        if (!USER.todoList) {
            console.log("new user, not found in Storage");

            USER.todoList = new Todo.todoList(USER.token);
            Storage.storage.todoLists.push(USER.todoList);
        }
    } else {
        console.log("Storage.storage.todoLists first create");
        // initial Storage.storage.todoLists
        Storage.storage.todoLists = [];
        // create new todoList for user, push it to storage
        USER.todoList = new Todo.todoList(USER.token);
        Storage.storage.todoLists.push(USER.todoList);
    }
    panel.port.emit("todo-initial", USER.todoList);

    USER.initialed = true;
}

// ****************************************************************************
// basic user related functions part
// ****************************************************************************

// Login User and Save Token, User Name
function login() {
    require("page-mod").PageMod({
        include: "http://www.nus.edu.sg/?token=*",
        contentScriptFile: Data.url("js/getToken.js"),
        onAttach: function onAttach(worker) {
            worker.on('message', function(token) {
                USER.saveToken(token);
                USER.validated = true;

                console.log("USER_TOKEN = " + USER.token);

                if (!USER.initialed) {
                    initialUser();
                }
            });

            this.destroy();
        }
    });

    Tabs.open(IAPI.loginURL());

    //Tabs.open({
    //    url     : IAPI.loginURL(),
    //    onReady : function(tab) {
    //        tab.attach({
    //            contentScript: Data.url("");
    //        })
    //    }
    //});
}

// Logout User and clear saved data
function logout() {
    panel.hide();
    USER.clearUser();
    IcoBadge.destroy();
}
panel.port.on("logout", logout);

// Validate User Login
function validateLogin() {
    if (!USER.token) {
        USER.validated = false;
        return ;
    } else if (USER.validated) {
        return ;
    }

    var url = IAPI.loginURL("Validate");

    var temp = PageWorkers.Page({
        contentURL: url,
        contentScript: "self.postMessage(document.getElementsByTagName('pre')[0].innerHTML);",
        contentScriptWhen: "ready",
        onMessage: function(response) {
            if (response) {
                var json = JSON.parse(response)

                console.log("Validate result --> " + json.Success);

                if (json.Success) {
                    USER.validated = true;

                    if (USER.token !== json.Token) {
                        USER.saveToken(json.token);
                    }

                    if (!USER.initialed) {
                        initialUser();
                    }
                } else {
                    login();
                }
            } else {
                console.log("Error, no response received");

                USER.clearUser();
                login();
            }

        }
    });
}

// ****************************************************************************
// panel interacting related functions part
// ****************************************************************************

// Panel general request
function request(data) {
    var url = IAPI.requestURL(data.api, data.input);

    //Tabs.open(url);

    IAPI.getResponse(data.output, url);
}
panel.port.on("request", request);

// Panel download file request
function downloadFile(id) {
    IAPI.download(id);
}
panel.port.on("download-file", downloadFile);

// Panel mark announcement as read request
function markAnnRead(id) {
    IAPI.markAnnRead(id);
}
panel.port.on("mark-ann-read", markAnnRead);

// Panel notifications request
function sendNotifications(notice) {
    var title = "IVLE Notification";
    var text  = "";

    if (notice.AnnCount > 0) {
        text  += notice.AnnCount + " New Announcements";
    }

    if (notice.FileCount > 0) {
        if (notice.AnnCount > 0) {
            text  += " and ";
        }

        text += notice.FileCount + " New Files in Workbins";
    }

    Notify.notify({
        title : title,
        text  : text
    });
}
panel.port.on("send-notifications", sendNotifications);

// Panel change icon badge request
function setIconCount(count) {
    IcoBadge.update(count);
}
panel.port.on("icon-change", setIconCount);

// Panel update todo tab request
function updateTodo() {
    console.log("updating todo list in todo-tab");

    panel.port.emit("todo-update", USER.todoList);
}
panel.port.on("todo-update", updateTodo);

// Panel add new todo request
function addTodo(todo) {
    console.log("add todo = " + todo.title);

    var newTodo = new Todo.todo(todo.type, todo.title, false);
    // update user's todo list
    USER.todoList.todos.push(newTodo);
    USER.todoList.stats.todoTotal++;
    USER.todoList.stats.todoLeft++;

    console.log("* Todos in Storage = " + Storage.storage.todoLists[0].todos.length);

    // update display
    updateTodo();
}
panel.port.on("todo-add", addTodo);

// Panel delete todo request
function removeTodo(id) {
    for (var i = 0; i < USER.todoList.todos.length; i++) {
        if (USER.todoList.todos[i].id === id) {
            console.log("delete todo = " + USER.todoList.todos[i].title);

            // update stats
            USER.todoList.stats.todoTotal--;
            if (USER.todoList.todos[i].done) {
                USER.todoList.stats.todoCompleted--;
            } else {
                USER.todoList.stats.todoLeft--;
            }

            // remove it from array
            USER.todoList.todos.splice(i, 1);
        }
    }

    // update display
    updateTodo();
}
panel.port.on("todo-remove", removeTodo);

// Panel clear all done todos request
function removeDoneTodo() {
    for (var i = USER.todoList.todos.length - 1; i >= 0; i--) {
        if (USER.todoList.todos[i].done) {
            // remove it from array
            USER.todoList.todos.splice(i, 1);
        }
    }

    // update stats
    USER.todoList.stats.todoCompleted = 0;

    // update display
    updateTodo();
}
panel.port.on("todo-clear-done", removeDoneTodo);

// Panel change todo complete request
function doneTodo(task) {
    for (var i = 0; i < USER.todoList.todos.length; i++) {
        if (USER.todoList.todos[i].id === task.id) {
            console.log("change todo = " + USER.todoList.todos[i].title + " --> " + task.done);

            USER.todoList.todos[i].done = task.done;

            // update stats
            if (task.done) {
                USER.todoList.stats.todoCompleted++;
                USER.todoList.stats.todoLeft--;
            } else {
                USER.todoList.stats.todoCompleted--;
                USER.todoList.stats.todoLeft++;
            }
        }
    }

    // update display
    updateTodo();
}
panel.port.on("todo-done", doneTodo);

// Panel edit todo request
function editTodo(todo) {
    console.log("edit todo id = " + todo.id)
    USER.todoList.edit(id, title);
}
panel.port.on("todo-edit", editTodo);
