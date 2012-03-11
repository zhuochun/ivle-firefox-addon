// Author: Wang Zhuochun
// Last Edit: 01/Mar/2012 03:04 AM

$(document).ready(function() {
  $(".hide-tab").hide();

  $("#nav li").click(function() {
    if ( !$(this).hasClass("tab-selected") ) {
      var oldTab = $("#nav li.tab-selected").html().toLowerCase();
      var newTab = $(this).html().toLowerCase();

      $("#nav li").removeClass("tab-selected");
      $(this).addClass("tab-selected");

      $("#" + newTab + "-tab").toggleClass("hide-tab");
      $("#" + oldTab + "-tab").toggleClass("hide-tab");
      $("#" + newTab + "-tab").show();
      $("#" + oldTab + "-tab").hide();
    }
  });
});
