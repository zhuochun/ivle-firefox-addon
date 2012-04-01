// Author: Wang Zhuochun
// Last Edit: 30/Mar/2012 09:56 PM

// set options for Tinycon
Tinycon.setOptions({
    background : '#002A9A'
});

// variables
var original = document.title;
var timeout;

// change the flashing page title
function flashCount(count) {
    if (count < 1) {
        clearFlash();
    }

    var newTitle = "[ " + count + " ] " + original;

    timeout = setInterval(function() {
        document.title = (document.title == original) ? newTitle : original;
    }, 1000);
}
self.port.on("flash-count", flashCount);

// clear the flashing page title
function clearFlash() {
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }

    document.title = original;
}
self.port.on("flash-clear", clearFlash);

// change the badget ico in IVLE
function changeCount(count) {
    console.log("change count = " + count);
    Tinycon.setBubble(count);
}
self.port.on("change-count", changeCount);
