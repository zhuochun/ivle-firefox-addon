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

function clearLoad(status) {
    $("#load-tab").addClass("hide-tab");
    $("#announcement-tab").removeClass("hide-tab");

    $("#load-tab").hide();
    $("#announcement-tab").show();
}
//self.port.on("initialized", clearLoad);

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

        // get this module's workbin files
        self.port.emit("request", {
            api    : "Workbins",
            input  : {
                CourseID  : module.ID,
                Duration  : 0,
                TitleOnly : true
            },
            output : "workbin"
        });
    }

    moduleItem.hide();
}
self.port.on("modules", setModules);

function getWorkbin(data) {
    //for (var i = 0; i < )
}
self.port.on("workbin", getWorkbin);

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

    clearLoad();

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
