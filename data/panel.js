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

    for (var i = 0; i < data.Results.length; i++) {
        var module    = data.Results[i];
        var cloneItem = moduleItem.clone();

        cloneItem.find("h1").html(module.CourseCode.substring(0, 7));
        cloneItem.find(".unread").html(module.Badge);

        if (module.Badge > 0) {
            cloneItem.find(".unread").removeClass("zero-unread");
        }

        cloneItem.find("h2").html(module.CourseName);

        moduleTab.append(cloneItem);
    }

    moduleItem.hide();
}
self.port.on("modules", setModules);

// User Logout
$("#user a").click(function() {
    self.port.emit("logout");
});
