// Variables
var Modules = {
    num  : 0,
    data : []
}

var Announcements = {
    num  : 0,
    data : []
}

// open panel
self.on("message", function(USER) {
/*
    if (!USER.token) {
        $('#tabs').hide("fast");
        $('#wrapper').append("<p>Please Login First. :)</p>");
    } else if (!USER.initial) {
        $('#tabs').hide("fast");
        $('#wrapper').append("<p>Loading...</p>")
    }
*/
});

// set username
function setUserName(name) {
    $('#username').html(name);
    $('#user').append(' | <a href="#">Logout</a>');

    // bind Logout event
    $("#user a").click(function() {
        console.log("logout");
        self.port.emit("logout");
    });
}
self.port.on("userName", setUserName);

// set modules
function setModules(data) {
    var moduleTab  = $("#modules-tab");
    var moduleItem = $(".mod-item:last");

    Modules.data = data.Results;        // save a copy of modules data
    Modules.num  = data.Results.length; // record number of modules

    for (var i = 0; i < data.Results.length; i++) {
        var module    = data.Results[i];
        var cloneItem = moduleItem.clone();

        // get module name, make sure it is only 7 chars long
        var moduleName = module.CourseCode.substring(0, 7);
        // set module in submenu of modules
        $("#modules-submenu").append("<li for=\"" + module.ID + "\">" + moduleName + "</li>");
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

    // bind module badget with events
    $(".mod-label").click(function() {
        var module = $(this).parent();
        var mod_id = module.find(".mod-id");

        console.log("mod-label clicked, id : " + mod_id.html());

        // TODO: bind announcement event
        // TODO: fix .mod-item and .mod-lable click events both occur bug
    });
    // bind module box items with events
    $(".mod-item").click(function() {
        var mod = $(this).find(".mod-id");

        console.log("Load Module : " + mod.html());
        // show loading tab
        showLoad();
        // get this module's workbin files
        self.port.emit("request", {
            api    : "Workbins",
            input  : {
                CourseID  : mod.html(),
                Duration  : 0,
                TitleOnly : false
            },
            output : "workbin"
        });
    });
    // bind module submenu with events
    $("#modules-submenu>li").click(function() {
        var mod = $(this).attr("for");

        console.log("Load Module : " + mod);
        // show loading tab
        showLoad();
        // get this module's workbin files
        self.port.emit("request", {
            api    : "Workbins",
            input  : {
                CourseID  : mod,
                Duration  : 0,
                TitleOnly : false
            },
            output : "workbin"
        });
    });
}
self.port.on("modules", setModules);

function setWorkbin(data) {
    var workbinTab = $("#workbin-tab");

    // clear the contents in workbin
    workbinTab.empty();

    var folders = data.Results[0].Folders;

    // create folders and sub-folders
    for (var i = 0; i < folders.length; i++) {
        var folderClone = createFolder(folders[i], 0);
        workbinTab.append(folderClone);
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

        console.log("download file : " + id.html());

        self.port.emit("download-file", id.html());
    });
}
self.port.on("workbin", setWorkbin);

function createFolder(folder, level) {
    var folderItem = $(".folder:last");
    var fileItem   = $(".file:last");

    // create folder
    var folderClone = folderItem.clone();
    // modify folder's icon, default: f_blue.png
    if (folder.AllowUpload) {
        folderClone.find("img").attr("src", "img/f_yellow.png"); // allow upload - yellow
    } else if (level > 0) {
        folderClone.addClass("sub-folder");
        folderClone.find("img").attr("src", "img/f_green.png");  // sub folders - green
    }
    // add folder name
    folderClone.find("h2").append(folder.FolderName);

    // add files inside folder
    for (var i = 0; i < folder.Files.length; i++) {
        var file      = folder.Files[i];
        var fileClone = fileItem.clone();

        fileClone.find(".file-type").addClass(file.FileType);
        fileClone.find(".file-name").html(seperateFilename(file.FileName));
        fileClone.find(".file-id").html(file.ID);

        folderClone.append(fileClone);
    }

    // add subfolders
    for (var i = 0; i < folder.Folders.length; i++) {
        var subfolder = createFolder(folder.Folders[i], level+1);
        folderClone.append(subfolder);
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

// save Announcements
function saveAnnouncements(data) {
    Announcements.num++;

    for (var i = 0; i < data.Results.length; i++) {
        Announcements.data.push(data.Results[i]);

        data.Results[i].CreatedDate = new Date(parseInt(data.Results[i].CreatedDate.substr(6, 18)));
    }

    //console.log("Announcement : " + Announcements.num + " - " + Announcements.data.length);

    if (Announcements.num === Modules.num) {
        setAnnouncements();
    }
}
self.port.on("announcements", saveAnnouncements);

function setAnnouncements() {
    var annTab  = $("#announcement-tab");
    var annItem = $(".ann-item:last");

    // Sort annoucements according to their created date
    Announcements.data.sort(function(a, b) {
        return b.CreatedDate - a.CreatedDate;
    });

    // Display annoucements
    for (var i = 0; i < Announcements.data.length; i++) {
        var ann       = Announcements.data[i];
        var cloneItem = annItem.clone();

        cloneItem.find("h1").html(ann.Title);

        var description = ann.Description.replace(/&lt;/g, "<");
        description     = description.replace(/&gt;/g, ">");
        description     = description.replace(/&amp;/g, "&");

        cloneItem.find(".ann-content").html(description);

        annTab.append(cloneItem);
    }

    clearLoad("#announcement-tab"); // hide loading bar, show announcements

    $(".ann-content").slideUp();

    // bind all annoucenments events
    $(".ann-item").click(function() {
        if ( $(this).hasClass("ann-selected") ) {
            $(this).removeClass("ann-selected");
            $(".ann-content", this).slideToggle();
        } else {
            var oldAnnItem = $(".ann-selected");
            if (oldAnnItem) {
              $(".ann-content", oldAnnItem).slideUp();
              oldAnnItem.removeClass("ann-selected");
        }

        // append class to newly selected
        $(this).addClass("ann-selected");
        $(".ann-content", this).slideDown("fast");
    }
  });
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
