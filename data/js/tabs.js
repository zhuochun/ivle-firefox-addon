// Author: Wang Zhuochun
// Last Edit: 11/Mar/2012 11:52 AM

$(document).ready(function() {
  $(".hide-tab").hide(); // hide tabs
  $(".sub-menu").hide(); // hide sub-menus
  //$(".ann-content").slideUp(); // hide ann-contents

  $("#nav li").click(function() {
    if ( !$(this).hasClass("tab-selected") ) {
      var oldTab = $("#nav li.tab-selected").attr("for");
      var newTab = $(this).attr("for");

      oldTab = oldTab || "load"; // in case of oldTab == null

      $("#nav li").removeClass("tab-selected");
      $(this).addClass("tab-selected");

      $("#" + newTab + "-tab").toggleClass("hide-tab");
      $("#" + oldTab + "-tab").toggleClass("hide-tab");
      $("#" + newTab + "-tab").show();
      $("#" + oldTab + "-tab").hide();
    }
  });

  $(".sub-menu-button").click(function() {
    var submenu = $(this).next();

    $(this).parent().mouseleave(function() {
        submenu.hide();
    });

    $(this).next().toggle();
  });

 // $(".sub-menu").mouseout(function() {
 //   $(this).toggle();
 // });

/*
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
*/
});
