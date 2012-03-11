function setUserName(json) {
    jQuery('#username').html(json);
}

self.port.on("userName", setUserName);
