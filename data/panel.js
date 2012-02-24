var API_Domain = "https://ivle.nus.edu.sg/";
var API_URL    = API_Domain + "api/lapi.svc/";
var API_Key    = "";
var USER_TOKEN = "";
var API_Login  = API_Domain + "api/login/?apikey=" + API_Key +
                    "&url=" + encodeURIComponent("http://www.nus.edu.sg");

self.on("message", function(info) {
  console.log(info);

  var infoArr = info.split(",");

  API_Key = infoArr[0];
  USER_TOKEN = infoArr[1];

  console.log("panel: " + API_Key + " , " + USER_TOKEN);

    //Populate_UserName();

});

console.log("real staff");

    function Populate_UserName() {

    var url = API_URL + "UserName_Get?APIKey=" + API_Key + "&Token=" + USER_TOKEN;

        $('#dbg_UserInfo').append("<span>Request: " + url + "</span><br />");

        // try xml

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open("GET", url, true);

        console.log("********************");

        xmlhttp.onreadystatechange = function(oEvent) {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    console.log("xml ==> " + xmlhttp.responseText);
                } else {
                    console.log("Error xml ==> " + xml.statusText);
                }
            }
        }

        xmlhttp.send(null);



// JSON does not work !!!!!!!!!!!!
        //jQuery.getJSON(url, function (data) {

        //    console.log(data);

        //    $('#lbl_Name').html(data);
        //    $('#dbg_UserInfo').append("<span>Response: " + data + "</span>");
        //});
    }
