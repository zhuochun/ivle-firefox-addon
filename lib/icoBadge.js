/// @filename icoBadge.js
/// @author Wang Zhuochun
/// @last edit 30/Mar/2012 09:13 PM

// import the APIs
const Data = require("self").data; // require extension data

// exports functions
exports.initial = initialBadge;
exports.update  = updateBadge;

// variables
var workers = [];

// remove worker that is detached with an open tab
function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);

    if (index != -1) {
        workerArray.splice(index, 1);
    }
}

// initial icoBadge to attach PageMod to IVLE pages
function initialBadge() {
    require("page-mod").PageMod({
        include: "http://ivle.nus.edu.sg/*",
        contentScriptFile: [Data.url("js/tinycon.min.js"), Data.url("js/icon.js")],
        onAttach: function onAttach(worker) {
            workers.push(worker);

            console.log("Tinycon Attached: " + worker.tab.title);

            //worker.port.emit("change-count", 8);
            //worker.port.emit("flash-count", 10);

            worker.tab.on('activate', function() {
                worker.port.emit("flash-clear");
            })

            worker.on('detach', function() {
                detachWorker(this, workers);
            });
        }
    });
}

// update the ico badge at each webpage
function updateBadge(count) {
    for (var i = 0; i < workers.length; i++) {
        workers[i].port.emit("change-count", count);

        if (count > 0) {
            workers[i].port.emit("flash-count", count);
        } else {
            workers[i].port.emit("flash-clear");
        }
    }
}
