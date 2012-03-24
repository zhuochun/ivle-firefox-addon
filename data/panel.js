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

// set User name
function setUserName(name) {
    $('#username').html(name);
    $('#user').append(' | <a href="#">Logout</a>');

    // User Logout
    $("#user a").click(function() {
        console.log("logout");
        self.port.emit("logout");
    });
}
self.port.on("userName", setUserName);

// set User modules
function setModules(data) {
    var moduleTab  = $("#modules-tab");
    var moduleItem = $(".mod-item:first");

    Modules.data = data.Results;

    for (var i = 0; i < data.Results.length; i++) {
        Modules.num++;

        var module    = data.Results[i];
        var cloneItem = moduleItem.clone();

        var moduleName = module.CourseCode.substring(0, 7);

        //$(".modules-submenu").append("<li for=\"" + module.ID + "\">" + moduleName + "</li>");
        $(".modules-submenu").append("<li><a href=\"#" + module.ID + "\">" + moduleName + "</a></li>");

        cloneItem.find("h1").html(moduleName);
        cloneItem.find("h2").html(module.CourseName);
        cloneItem.find(".mod-id").html(module.ID);
        cloneItem.find(".unread").html(module.Badge);

        if (module.Badge > 0) {
            cloneItem.find(".unread").removeClass("zero-unread");
        }

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

    moduleItem.hide();

    // bind module items with events
    $(".mod-item").click(function() {
        var mod = $(this).find(".mod-id");

        if (mod) {
            console.log("Load Module : " + mod.html());
            // loading tab
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
        } else {
            console.log("error: empty module id");
        }
    });
}
self.port.on("modules", setModules);

function setWorkbin(data) {
    var workbinTab = $("#workbin-tab");
    var folderItem = $(".folder:first");
    var fileItem   = $(".file:first");

    // TODO: cannot parse the data correctly
    //var results = data.Results;

    //console.log(results.ID);
    //console.log(data["Results"]["Title"].length);

    var folders = data.Results[0].Folders;

    for (var i = 0; i < folders.length; i++) {
        var folderClone = folderItem.clone();

        folderClone.find("h2").append(folders[i].FolderName)

        for (var j = 0; j < folders[i].Files.length; j++) {
            var file      = folders[i].Files[j];
            var fileClone = fileItem.clone();

            fileClone.find(".file-type").addClass(file.FileType);
            fileClone.find(".file-name").html(seperateFilename(file.FileName));
            fileClone.find(".file-id").html(file.ID);

            folderClone.append(fileClone);
        }

        workbinTab.append(folderClone);
    }

    folderItem.hide();
    fileItem.hide();

    clearLoad("#workbin-tab");

    // add download file events to each file
}
self.port.on("workbin", setWorkbin);

function addModFolder(data) {
}

function seperateFilename(name) {
    var result = "";

    if (name.length > 13) {
        result += name.substr(0, 13);
        result += "<br/>";

        var subname = name.substr(13);

        if (subname.length > 13) {
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

    //Announcements.data.concat(data.Results);

    for (var i = 0; i < data.Results.length; i++) {
        Announcements.data.push(data.Results[i]);

        data.Results[i].CreatedDate = new Date(parseInt(data.Results[i].CreatedDate.substr(6, 18)));
    }

    console.log("Announcement : " + Announcements.num + " - " + Announcements.data.length);

    if (Announcements.num === Modules.num) {
        setAnnouncements();
    }
}
self.port.on("announcements", saveAnnouncements);

function setAnnouncements() {
    var annTab  = $("#announcement-tab");
    var annItem = $(".ann-item:first");

    Announcements.data.sort(function(a, b) {
        return b.CreatedDate - a.CreatedDate;
    });

    for (var i = 0; i < Announcements.data.length; i++) {
        var ann       = Announcements.data[i];
        var cloneItem = annItem.clone();

        cloneItem.find("h1").html(ann.Title);

        // TODO: refractor code
        var testStr = ann.Description.replace(/&lt;/g, "<");
        testStr     = testStr.replace(/&gt;/g, ">");
        testStr     = testStr.replace(/&amp;/g, "&");
        //console.log(testStr);

        cloneItem.find(".ann-content").html(testStr);

        annTab.append(cloneItem);
    }

    annItem.hide();

    clearLoad("#announcement-tab");

    $(".ann-content").slideUp();

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
    switchTab("#modules-tab", "#load-tab");
}

// clear loading tab
function clearLoad(newTab) {
    switchTab("#load-tab", newTab);
}

// switch between two tabs
function switchTab(oldTab, newTab) {
    $(oldTab).addClass("hide-tab");
    $(newTab).removeClass("hide-tab");

    $(oldTab).hide();
    $(newTab).show();
}

/*******************************************************
 * Binding with the HTML files                         *
 *******************************************************/
