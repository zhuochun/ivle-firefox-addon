// Author: Wang Zhuochun
// Last Edit: 11/Mar/2012 11:52 AM

$(document).ready(function() {
  $(".hide-tab").hide("fast"); // hide tabs
  $(".ann-content").slideUp("fast"); // hide ann-content

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
});
