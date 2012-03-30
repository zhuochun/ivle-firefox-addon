// Author: Wang Zhuochun
// Last Edit: 30/Mar/2012 08:26 PM

$(document).ready(function() {
    $(".hide-tab").hide(); // hide tabs
    $(".sub-menu").hide(); // hide sub-menus

    $("#nav li>strong").click(function() {
        var newTab = $(this).parent().attr("for");

        // hide all tabs
        $(".tab").addClass("hide-tab");
        $(".tab").hide();
        // remove the tab-selected li
        $("#nav li").removeClass("tab-selected");
        $(this).parent().addClass("tab-selected");
        // show the clicked tab
        $("#" + newTab + "-tab").removeClass("hide-tab");
        $("#" + newTab + "-tab").show();
    });

    $(".sub-menu-button").click(function() {
        var submenu = $(this).next();

        $(this).parent().mouseleave(function() {
            submenu.hide();
        });

        submenu.slideToggle();
    });
});
