/// @filename panel.js
/// @author Wang Zhuochun
/// @last edit 29/Mar/2012 09:43 PM

// Variables
var UpdateInterval = 10; // default: 10 minutes

var Modules = {
    num      : 0,
    acadYear : undefined,
    semester : undefined,
    data     : []
}

var Announcements = {
    num    : 0,
    unread : 0,
    data   : []
}

// open panel
self.on("message", function(USER) {
    UpdateInterval = USER.interval;

    console.log("initialed updateInterval = " + UpdateInterval);
});

// set username
function setUserName(name) {
    $('#username').html(name);
    $('#user').append(' | <span id="user-logout">Logout</span>');

    // bind Logout event
    $("#user-logout").click(function() {
        console.log("logout");
        self.port.emit("logout");
    });
}
self.port.on("userName", setUserName);

// set modules
function setModules(data) {
    var moduleTab  = $("#modules-tab");
    var moduleItem = $(".mod-item:last");

    Modules.data     = data.Results;        // save a copy of modules data
    Modules.num      = data.Results.length; // record number of modules

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
            output : "module_annoucement"
        });

        // clear the old contents in announcement tab
        var annTab = $("#module-announce-tab");
        annTab.empty();
        annTab.append("<h1>" + course + " - " + title + "</h1>")
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
        var workbinTab = $("#workbin-tab");
        workbinTab.empty();
        workbinTab.append("<h1>" + course + " - " + title + "</h1>")
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

        // emit notification
        if (notice.Update) {
            self.port.emit("send-notifications", notice);
            self.port.emit("icon-change", notice.AnnCount);
        }
    }
}
self.port.on("update-modules", updateModules);

function updateAnnouncements(data) {
    // add all announcements to data
    for (var i = 0; i < data.Results.length; i++) {
        data.Results[i].CreatedDate = new Date(parseInt(data.Results[i].CreatedDate.substr(6, 18)));
        Announcements.data.push(data.Results[i]);
    }
    // TODO: finish this

}
self.port.on("update-announcements", updateAnnouncements)

// set Workbin tab
function setWorkbin(data) {
    var workbinTab = $("#workbin-tab");

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
    clearLoad("#workbin-tab");

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
    }

    // all modules' annoucements are collected
    if (Announcements.num === Modules.num) {
        setAnnouncements(Announcements.data, "#announcement-tab");
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

    setAnnouncements(data.Results, "#module-announce-tab")
}
self.port.on("module_annoucement", moduleAnnouncements);

// display announcements in sorted order in announcement tab
function setAnnouncements(data, tab) {
    var annTab  = $(tab);
    var annItem = $(".ann-item:last");

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
            Announcements.unread++;
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
                parent.removeClass("ann-unread");
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

                // TODO: link to todo

                $(this).addClass("ann-pushed");
                $(this).find(".word").html("Pushed Successfully!");
            }
        });

        // append class to newly selected
        annTab.append(cloneItem);
    }

    clearLoad(tab); // hide loading bar, show announcements

    $(".ann-content").slideUp();
}

/*******************************************************
 * Functions that does not depends on message transfer *
 *******************************************************/

// on loading tab
function showLoad() {
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
    $(newTab).removeClass("hide-tab");
    $(newTab).show();
}
