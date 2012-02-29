// Author: Wang Zhuochun
// Last Edit: 01/Mar/2012 03:04 AM

$(document).ready(function() {
  $(".hide-tab").hide();

  $("#nav li").click(function() {
    if ( !$(this).hasClass("tab-selected") ) {
      $("#user").show();

      $("#nav li").removeClass("tab-selected");
      $(this).addClass("tab-selected");

      $(".hide-tab").show();
      $("#announcement-tab").toggleClass("hide-tab");
      $("#modules-tab").toggleClass("hide-tab");
      $(".hide-tab").hide();
    }
  });
});
