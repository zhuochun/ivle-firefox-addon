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

        cloneItem.find("h1").html(module.CourseCode.substring(0, 7));
        cloneItem.find(".unread").html(module.Badge);

        if (module.Badge > 0) {
            cloneItem.find(".unread").removeClass("zero-unread");
        }

        cloneItem.find("h2").html(module.CourseName);

        moduleTab.append(cloneItem);

        // get this module's announcements in the past 14 days
        self.port.emit("request", {
            api    : "Announcements",
            input  : {
                CourseID  : module.ID,
                Duration  : 20160, // 7 days
                TitleOnly : false
            },
            output : "announcements"
        });
    }

    moduleItem.hide();
}
self.port.on("modules", setModules);

// save Announcements
function saveAnnouncements(data) {
    Announcements.num++;

    //Announcements.data.concat(data.Results);

    for (var i = 0; i < data.Results.length; i++) {
        Announcements.data.push(data.Results[i]);

        console.log(data.Results[i].Title);
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

    // TODO: need to convert CreatedDate from String to date
    Announcements.data.sort(function(a, b) {
        return b.CreatedDate - a.CreatedDate;
    });

    for (var i = 0; i < Announcements.data.length; i++) {
        var ann       = Announcements.data[i];
        var cloneItem = annItem.clone();

        cloneItem.find("h1").html(ann.Title);

        // TODO: html tags
        cloneItem.find(".ann-content").html(ann.Description);

        annTab.append(cloneItem);
    }

    annItem.hide();

    $(".ann-item").click(function() {
        if ( $(this).hasClass("ann-selected") ) {
            $(this).removeClass("ann-selected");
            $(".ann-content", this).slideToggle("fast");
        } else {
            var oldAnnItem = $(".ann-selected");
            if (oldAnnItem) {
              $(".ann-content", oldAnnItem).slideToggle("fast");
              oldAnnItem.removeClass("ann-selected");
        }

        // append class to newly selected
        $(this).addClass("ann-selected");
        $(".ann-content", this).slideToggle("fast");
    }
  });
}

// User Logout
$("#user a").click(function() {
    self.port.emit("logout");
});
