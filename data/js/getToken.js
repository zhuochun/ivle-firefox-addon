// To Retrieve the user token from url
// Last Edit 06/Mar/2012 05:11 PM

var search = function () {
    var p = window.location.search.substr(1).split(/\&/), l = p.length, kv, r = {};
    while (l--) {
        kv = p[l].split(/\=/);
        r[kv[0]] = kv[1] || true; //if no =value just set it as true
    }
    return r;
} ();

if (search.token && search.token.length > 0 && search.token != 'undefined') {
    self.postMessage(search.token);
    alert("You have successfully logged in. You may close this page and start using IVLE Firefox Add-on");
}
