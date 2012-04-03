/// @filename panel.js
/// @author Wang Zhuochun
/// @last edit 03/Apr/2012 04:16 PM

// Variables
var UpdateInterval = 10; // default: 10 minutes

var Items = {
    error    : $("#error-msg"),
    module   : $(".mod-item:last"),
    announce : $(".ann-item:last"),
    todoList : $("#todo-list"),
    todoItem : $(".todo-item:last"),
    todoComp : $("#todo-stats-completed"),
    todoInco : $("#todo-stats-incomplete")
};

var Tabs = {
    modules  : $("#modules-tab"),
    workbin  : $("#workbin-tab"),
    announce : $("#announcement-tab"),
    modAnn   : $("#module-announce-tab")
};

var Modules = {
    num      : 0,
    update   : 0,
    acadYear : undefined,
    semester : undefined,
    data     : []
};

var Announcements = {
    num    : 0,
    update : 0,
    unread : 0,
    data   : []
};

// open panel
self.on("message", function(USER) {
});

// initial panel
self.port.on("initial-panel", function(USER) {
    UpdateInterval = USER.interval;
});

// set username
function setUserName(name) {
    $('#username').html(name);

    // bind Logout event
    $("#user-logout").click(function() {
        self.port.emit("logout");
    });
}
self.port.on("userName", setUserName);

// set modules
function setModules(data) {
    var moduleTab  = Tabs.modules;
    var moduleItem = Items.module;

    Modules.data = data.Results;        // save a copy of modules data
    Modules.num  = data.Results.length; // record number of modules

    if (data.Results.length > 0) {
        Modules.acadYear = data.Results[0].CourseAcadYear; // record academic year
        Modules.semester = data.Results[0].CourseSemester.substr(9);

        console.log(Modules.acadYear);
        console.log(Modules.semester);
    }

    for (var i = 0; i < data.Results.length; i++) {
        var module    = data.Results[i];
        var cloneItem = moduleItem.clone();

        // add this cloneItem to Modules array as well
        Modules.data[i].Item = cloneItem;

        // get module name, make sure it is only 7 chars long
        var moduleName = module.CourseCode.substring(0, 7);
        // set module in submenu of modules
        $("#modules-submenu").append('<li for="' + module.ID + '" title="' + module.CourseName + '">' + moduleName + '</li>');

        // set contents in module box
        cloneItem.find("h1").html(moduleName);
        cloneItem.find("h2").html(module.CourseName);
        cloneItem.find(".mod-id").html(module.ID);
        cloneItem.find(".mod-label").html(module.Badge);
        // set unread module badge
        if (module.Badge > 0) {
            cloneItem.find(".mod-label").removeClass("zero-unread");
        }
        // add module box into module-tab
        moduleTab.append(cloneItem);

        // get this module's announcements in the past 14 days
        self.port.emit("request", {
            api    : "Announcements",
            input  : {
                CourseID  : module.ID,
                Duration  : 20160, // 14 days
                TitleOnly : false
            },
            output : "announcements"
        });
    }

    // bind module badget with showing announcement events
    $(".mod-label").click(function() {
        var module = $(this).parent();
        var mod_id = module.find(".mod-id").html();
        var course = module.find("h1").html();
        var title  = module.find("h2").html();

        console.log("module announcement id : " + mod_id);

        // show loading tab
        showLoad();
        // get this module's all annoucements
        self.port.emit("request", {
            api    : "Announcements",
            input  : {
                CourseID  : mod_id,
                Duration  : 0,
                TitleOnly : false
            },
            output : "module-annoucement"
        });

        // clear the old contents in announcement tab
        Tabs.modAnn.empty();
        Tabs.modAnn.append("<h1>" + course + " - " + title + "</h1>")
    });

    // load workbin for a specific module
    var loadWorkbin = function(mod_id, course, title) {
        console.log("Load Workbin for Module : " + mod_id);

        // show loading tab
        showLoad();
        // get this module's workbin files
        self.port.emit("request", {
            api    : "Workbins",
            input  : {
                CourseID  : mod_id,
                Duration  : 0,
                TitleOnly : false
            },
            output : "workbin"
        });

        // clear the old contents in workbin tab
        Tabs.workbin.empty();
        Tabs.workbin.append("<h1>" + course + " - " + title + "</h1>")
    }

    // bind module box items with events
    $(".mod-info").click(function() {
        var mod_id = $(this).find(".mod-id").html();
        var course = $(this).find("h1").html();
        var title  = $(this).find("h2").html();

        loadWorkbin(mod_id, course, title);
    });
    // bind module submenu with events
    $("#modules-submenu>li").click(function() {
        var mod_id = $(this).attr("for");
        var course = $(this).html();
        var title  = $(this).attr("title");

        loadWorkbin(mod_id, course, title);
    });
}
self.port.on("modules", setModules);

// update modules and announcements if there is new
function updateModules(data) {
    var notice = {
        Update    : false,
        AnnCount  : 0,
        FileCount : 0
    };

    // clear Modules.update to accept new announcements
    Modules.update       = 0;
    Announcements.update = 0;

    // check all modules for new announcements or new files in workbins
    for (var i = 0; i < data.Results.length; i++) {
        var oldMod = Modules.data[i];
        var newMod = data.Results[i];

        console.log(" = update " + newMod.CourseCode + " -> " + (newMod.Badge-oldMod.Badge));

        if (oldMod.Badge != newMod.Badge) {
            // update badge display in Module Tab
            oldMod.Item.find(".mod-label").html(newMod.Badge);
        }

        var AnnCount  = newMod.BadgeAnnouncement - oldMod.BadgeAnnouncement;
        var FileCount = newMod.Workbins[0].BadgeTool - oldMod.Workbins[0].BadgeTool;

        if (AnnCount > 0) {
            notice.Update    = true;
            notice.AnnCount += AnnCount;

            Modules.update++;

            // get this module's announcements in the passed interval
            self.port.emit("request", {
                api    : "Announcements",
                input  : {
                    CourseID  : newMod.ID,
                    Duration  : UpdateInterval,
                    TitleOnly : false
                },
                output : "update-announcements"
            });
        }

        if (FileCount > 0) {
            notice.Update     = true;
            notice.FileCount += FileCount;
        }

        // update data in oldMod
        oldMod.Badge = newMod.Badge;
        oldMod.BadgeAnnouncement = newMod.BadgeAnnouncement;
        oldMod.Workbins[0].BadgeTool = newMod.Workbins[0].BadgeTool;

        // emit notifications
        if (notice.Update) {
            self.port.emit("send-notifications", notice);
            self.port.emit("icon-change", notice.AnnCount);
        }
    }
}
self.port.on("update-modules", updateModules);

// update announcements tab if there are new Announcements coming
// TODO: update announcments may be do not switch tab
function updateAnnouncements(data) {
    Announcements.update++;

    // add all announcements to data
    for (var i = 0; i < data.Results.length; i++) {
        data.Results[i].CreatedDate = new Date(parseInt(data.Results[i].CreatedDate.substr(6, 18)));
        Announcements.data.push(data.Results[i]);
    }

    if (Announcements.update === Modules.update) {
        console.log("new announcements updated");
        setAnnouncements(Announcements.data, Tabs.announce);
    }
}
self.port.on("update-announcements", updateAnnouncements)

// set Workbin tab
function setWorkbin(data) {
    var workbinTab = Tabs.workbin;

    // retrieve the folders in workbin
    var folders = data.Results[0].Folders;

    // create folders and sub-folders
    for (var i = 0; i < folders.length; i++) {
        var folderClone = createFolder(folders[i], 0);

        if (folderClone != null) {
            workbinTab.append(folderClone);
        }
    }

    // clear loading, show workbin-tab
    clearLoad(Tabs.workbin);

    // bind folder events
    $(".file, .sub-folder").slideUp();
    $(".folder>h2").click(function() {
        if ( $(this).hasClass("open-folder") ) {
            $(this).removeClass("open-folder");
            $(this).parent().children(".file, .sub-folder").slideUp();
        } else {
            $(this).addClass("open-folder");
            $(this).parent().children(".file, .sub-folder").slideDown();
        }
    });

    // add download file events to each file
    $(".file").click(function() {
        var id = $(this).find(".file-id");

        var isDownloaded = $(this).find(".file-status");

        if (!isDownloaded.hasClass("isDownloaded")) {
            isDownloaded.addClass("isDownloaded");
        }

        console.log("download file : " + id.html());
        self.port.emit("download-file", id.html());
    });
}
self.port.on("workbin", setWorkbin);

// create folder and inside files for Workbin
function createFolder(folder, level) {
    // do not add folder that is empty
    if (folder.Files.length === 0 && folder.Folders.length === 0) {
        return null;
    }

    // create folder
    var folderClone = $(".folder:last").clone();
    // modify folder's icon, default: f_blue.png
    if (folder.AllowUpload) { // allow upload - yellow
        folderClone.find("img").attr("src", "img/f_yellow.png");
    } else if (level > 0) {   // sub folders - green
        folderClone.addClass("sub-folder");
        folderClone.find("img").attr("src", "img/f_green.png");
    }
    // add folder name
    folderClone.find("h2").append(folder.FolderName);

    // add files inside folder
    var fileItem   = $(".file:last");
    for (var i = 0; i < folder.Files.length; i++) {
        var fileClone = fileItem.clone();
        var file      = folder.Files[i];

        fileClone.find(".file-type").addClass(file.FileType);
        fileClone.find(".file-name").html(seperateFilename(file.FileName));
        fileClone.find(".file-id").html(file.ID);

        if (file.isDownloaded) {
            fileClone.find(".file-status").addClass("isDownloaded");
        }

        folderClone.append(fileClone);
    }

    // add subfolders
    for (var i = 0; i < folder.Folders.length; i++) {
        var subfolder = createFolder(folder.Folders[i], level + 1);

        if (subfolder !== null) {
            folderClone.append(subfolder);
        }
    }

    return folderClone;
}

function seperateFilename(name) {
    var result = "";

    if (name.length > 14) {
        result += name.substr(0, 13);
        result += "<br/>";

        var subname = name.substr(13);

        if (subname.length > 14) {
            result += seperateFilename(subname);
        } else {
            result += subname;
        }
    } else {
        return name;
    }

    return result;
}

// save announcements from each module to an array
function latestAnnouncements(data) {
    Announcements.num++;

    // add all announcements to data
    for (var i = 0; i < data.Results.length; i++) {
        data.Results[i].CreatedDate = new Date(parseInt(data.Results[i].CreatedDate.substr(6, 18)));
        Announcements.data.push(data.Results[i]);

        if (!data.Results[i].isRead) {
            Announcements.unread++;
        }
    }

    // all modules' annoucements are collected
    if (Announcements.num === Modules.num) {
        setAnnouncements(Announcements.data, Tabs.announce);

        console.log("unread announcements = " + Announcements.unread);

        if (Announcements.unread > 0) {
            self.port.emit("icon-change", Announcements.unread);
        }

        console.log("initialization finished");
    }
}
self.port.on("announcements", latestAnnouncements);

// display all annoucements from a selected module
function moduleAnnouncements(data) {
    console.log("module ann => " + data.Results.length);

    for (var i = 0; i < data.Results.length; i++) {
        data.Results[i].CreatedDate = new Date(parseInt(data.Results[i].CreatedDate.substr(6, 18)));
    }

    setAnnouncements(data.Results, Tabs.modAnn);
}
self.port.on("module-annoucement", moduleAnnouncements);

// display announcements in sorted order in announcement tab
function setAnnouncements(data, annTab) {
    var annItem = Items.announce;

    // sort announcements according to their created date
    data.sort(function(a, b) {
        return b.CreatedDate - a.CreatedDate;
    });

    // display announcements
    for (var i = 0; i < data.length; i++) {
        var ann       = data[i];
        var cloneItem = annItem.clone();

        // update contents in announcement item
        cloneItem.find("h1").html(ann.Title);

        var description = ann.Description.replace(/&lt;/g, "<");
        description     = description.replace(/&gt;/g, ">");
        description     = description.replace(/&amp;/g, "&");

        cloneItem.find(".ann-description").html(description);
        cloneItem.find(".ann-id").html(ann.ID);

        // check this announcement is unread
        if (!ann.isRead) {
            cloneItem.addClass("ann-unread");
        }

        // bind click event to this announcement item
        cloneItem.find("h1").click(function() {
            var parent = $(this).parent();

            // fold and unfold announcement
            if (parent.hasClass("ann-selected")) {
                parent.removeClass("ann-selected");
                parent.find(".ann-content").slideUp();
            } else {
                parent.addClass("ann-selected");
                parent.find(".ann-content").slideDown();
            }

            // mark this announcement as read to IVLE server
            if (parent.hasClass("ann-unread")) {
                Announcements.unread--;

                parent.removeClass("ann-unread");

                self.port.emit("icon-change", Announcements.unread);
                self.port.emit("mark-ann-read", parent.find(".ann-id").html());
            }
        });

        // bind push to todos event to this announcement item
        cloneItem.find(".ann-push-todo").click(function() {
            if ($(this).hasClass("ann-pushed")) {
                alert("You have pushed this annoucement to to-dos already.");
            } else {
                var annItem = $(this).parents("div:eq(2)");
                var title   = annItem.find("h1").html();

                console.log("Push to Todos : " + title);

                addTask("announcement", title);

                $(this).addClass("ann-pushed");
                $(this).find(".word").html("Pushed Successfully!");
            }
        });

        // append class to newly selected
        annTab.append(cloneItem);
    }

    clearLoad(annTab); // hide loading bar, show announcements

    $(".ann-content").slideUp();
}

function addTask(type, title) {
    var todo = {
        type  : type,
        title : title
    };

    self.port.emit("todo-add", todo);
}

// todo list initial
function initialTodoList(list) {
    Items.todoComp.hide();

    setTodoList(list);

    // bind input event to add task
    $("#todo-add-input").keypress(function(event) {
        if (event.which == 13) {
            var title = $(this).val();

            if (title && title.length > 0) {
                addTask("task", title);

                $(this).val("");
            }
        }
    });

    // bind clear all completed tasks event
    Items.todoComp.click(function() {
        self.port.emit("todo-clear-done");
    });
}
self.port.on("todo-initial", initialTodoList);

// set todo list
function setTodoList(list) {
    var todoList = Items.todoList;
    var todoItem = Items.todoItem;

    // clear all contents in todoList
    todoList.empty();

    // add all todos to todoList
    for (var i = 0; i < list.todos.length; i++) {
        var task       = list.todos[i];
        var cloneItem  = todoItem.clone();
        var cloneTitle = cloneItem.find(".todo-title");
        
        // set up elements in clone
        cloneItem.find(".todo-id").html(task.id);
        cloneTitle.html(task.title);
        cloneTitle.addClass("todo-" + task.type);

        if (task.done) {
            cloneItem.find(".todo-title").addClass("todo-done");
            cloneItem.find(".todo-button").attr("checked", "checked");
        }

        // bind delete task event to this item
        cloneItem.find(".todo-delete").click(function() {
            var parent = $(this).parent();
            var id     = parent.find(".todo-id:first").html();

            self.port.emit("todo-remove", id);
        });

        // bind task status change to this item
        cloneItem.find(".todo-button").click(function() {
            var parent    = $(this).parent();
            var completed = $(this).attr("checked");

            var todo      = {
                id   : parent.find(".todo-id:first").html(),
                done : completed === "checked"
            };

            self.port.emit("todo-done", todo);
        });

        // TODO: bind task edit to this item
        //cloneItem.find(".todo-title").click(function() {

        //});

        // append clone to todoList
        todoList.append(cloneItem);
    }

    if (list.todos.length === 0) {
        todoList.append("<p style=\"color:#aaa;text-align:center\">Y U Have Nothing to Do!!! :)</p>")
    }

    // change stats in todo-ab
    Items.todoInco.find("strong:first").html(list.stats.todoLeft);
    Items.todoInco.find(".word:first").html(list.stats.todoLeft <= 1 ? "item" : "items");

    Items.todoComp.find("span:first").html(list.stats.todoCompleted);
    Items.todoComp.find(".word:first").html(list.stats.todoCompleted <= 1 ? "item" : "items");

    if (list.stats.todoCompleted > 0) {
        Items.todoComp.fadeIn();
    } else {
        Items.todoComp.fadeOut();
    }
}
self.port.on("todo-update",  setTodoList);

function showError() {
    showLoad();
    Items.error.append("<h1>Sorry! Failed to Retrieve Data from IVLE API. :(</h1>");
    Items.error.append("<p>Please check your Internet connection or change the IVLE API key in the Add-On setting page by using your own API key.</p>");
}
self.port.on("internet-failed", showError);

// ****************************************************************************
// functions that does not depends on message transfer
// ****************************************************************************

// on loading tab
function showLoad() {
    Items.error.empty();
    // clear all nav
    $("#nav li").removeClass("tab-selected");
    // hide all tabs
    $(".tab").addClass("hide-tab");
    $(".tab").hide();
    // show the loading tab
    $("#load-tab").removeClass("hide-tab");
    $("#load-tab").show();
}

// clear loading tab
function clearLoad(newTab) {
    // hide all tabs
    $(".tab").addClass("hide-tab");
    $(".tab").hide();
    // show new tab
    newTab.removeClass("hide-tab");
    newTab.show();
}
