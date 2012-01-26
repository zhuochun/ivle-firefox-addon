const widgets = require("widget");
const tabs    = require("tabs");
const data    = require("self").data;

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: data.url("Lion.ico"),
  onClick: function() {
    tabs.open("http://www.mozilla.org/");
  }
});

console.log("The add-on is running.");
