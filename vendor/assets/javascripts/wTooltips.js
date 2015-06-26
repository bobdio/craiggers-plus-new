// wTooltips.js
//
// This Javascript module implements a simple tooltip library based on JQuery.
// It was originally based on the tutorial at:
//
//     http://www.kriesi.at/archives/
//     create-simple-tooltips-with-css-and-jquery-part-2-smart-tooltips
//
// though it has changed a lot from this basic tutorial.
//
// Importing this module adds a single global variable to the Javascript
// namespace:
//
//      wTooltips
//
// This variable is an object which contains all the various parts of the
// tooltips module.  To add a tooltip to your page, call wTooltips.add().

var wTooltips = (function() {

    // The following object holds the public interface to the wTooltips module.
    // We add functions and other definitions to this object as necessary to
    // make them publically available.

    var wTooltips = {}; // Our public interface.

    // Private globals:

    var next_tooltip_id = 1;
    var all_tooltips    = []; // Array of tooltip <div> elements we've created.

    // ======================================================================

    wTooltips.add = function(target, options) {

        // Create a tooltip for the given HTML or SVG element.
        //
        // The parameters are as follows:
        //
        //     'target'
        //
        //         The HTML or SVG element that will be given the tooltip.
        //
        //     'options'
        //
        //         An optional object containing various options for formatting the
        //         tooltip.  If this is not supplied, the default values listed
        //         below will be used.
        //
        // The following options are currently supported:
        //
        //     'tooltip'
        //
        //         The text to use for the tooltip.  If this is set to null, the
        //         target's "title" attribute will be used as the text of the
        //         tooltip.  Note that the tooltip's text can include HTML
        //         formatting codes.
        //
        //             Default: null.
        //
        //     'delay'
        //
        //         How long to wait before displaying the tooltip, in seconds.
        //
        //             Default: 0.4
        //
        //     'width'
        //
        //         The width of the interior of the tooltip, in pixels.
        //
        //             Default: 400.
        //
        //     'height'
        //
        //         The height of the interior of the tooltip, in pixels.
        //
        //             Default: 200.
        //
        //     'opacity'
        //
        //         The opacity setting to use for the tooltip, in the range 0.0
        //         (completely transparent) to 1.0 (completely opaque).
        //
        //             Default: 1.0
        //
        //     'border_color'
        //
        //         The HTML colour code to use for the tooltip's main border.
        //
        //             Default: "#dedede" (light grey).
        //
        //     'border_width'
        //
        //         The width of the tooltip's main border, in pixels.
        //
        //             Default: 5.
        //
        //     'outer_color'
        //
        //         The HTML colour code to use for the tooltip's outer border.
        //
        //             Default: "#fff" (white).
        //
        //     'outer_width'
        //
        //         The width of the tooltip's outer border, in pixels.
        //
        //             Default: 1.
        //
        //     'background_color'
        //
        //         The HTML colour code to use for the tooltip's background.
        //
        //             Default: "#222" (dark grey).
        //
        //     'color'
        //
        //         The HTML colour code to use for the tooltip's text.
        //
        //             Default: "#fff" (white).
        //
        //     'font_family'
        //
        //         The name of the font family to use for the tooltip's text.
        //
        //             Default: serif.
        //
        //     'font_size'
        //
        //         The CSS font size to use for the tooltip's text.
        //
        //             Default: 100%.

        var defaults = {
                'tooltip'          : null,
                'delay'            : 0.4,
                'width'            : 400,
                'height'           : 200,
                'opacity'          : 1.0,
                'border_color'     : "#dedede",
                'border_width'     : 5,
                'outer_color'      : "#fff",
                'outer_width'      : 1,
                'background_color' : "#222",
                'color'            : "#fff",
                'font_family'      : "serif",
                'font_size'        : "100%",
        };

        var user_options = options;

        var options = defaults;
        if (typeof user_options != 'undefined') {
            // User-supplied options overwrite the defaults.
            $.extend(options, user_options);
        }

        // Start by obtaining the unique ID to use for our tooltip's <div> element.
        // We calculate this on the fly.

        var tooltip_id = "simple_tooltip_" + next_tooltip_id;
        next_tooltip_id = next_tooltip_id + 1;

        // Create the tooltip itself.

        var tipHTML = [];
        tipHTML.push("<div id='"+tooltip_id+"'>");
        tipHTML.push("<div id='inner_"+tooltip_id+"'>");
        if (options.tooltip != null) {
            tipHTML.push(options.tooltip);
        } else {
            tipHTML.push(target.attr('title'));
        }
        tipHTML.push("</div>");
        tipHTML.push("</div>");
        $("body").append(tipHTML.join(""));

        var tooltip = $("#" + tooltip_id);
        var tooltip_inner = $("#inner_" + tooltip_id);

        // Remember that we've created this tooltip.

        all_tooltips.push(tooltip);

        // Style our tooltip DIVs.

        var border_width = options.border_width;

        tooltip.css({'display'          : "none",
                     'position'         : "absolute",
                     'left'             : "-2000px",
                     'background-color' : options.border_color,
                     'padding'          : options.border_width + "px",
                     'border'           : options.outer_width + "px solid " +
                                          options.outer_color,
                     'width'            : options.width + "px",
                     'height'           : options.height + "px",
        });

        tooltip_inner.css({'margin'           : 0,
                           'padding'          : 0,
                           'color'            : options.color,
                           'font-family'      : options.font_family,
                           'font-size'        : options.font_size + "px",
                           'background-color' : options.background_color,
                           'padding'          : "5px 5px",
                           'width'            : (options.width - 10) + "px",
                           'height'           : (options.height - 10) + "px",
        });

        // If the target element already has a title, remove it so that the web
        // browser doesn't try to display its own tooltip on top of our one.

        if (typeof target.attr("title") !== "undefined") {
            target.removeAttr("title");
        }

        // Setup our event handlers.

        target.mouseover(function() {
            tooltip.css({opacity: options.opacity,
                         display:"none"}).fadeIn(options.delay*1000);
        });
        target.mousemove(function(mouse) {
            var border_top = $(window).scrollTop(); 
            var border_right = $(window).width();
            var left_pos;
            var top_pos;
            var offset = 20;
            if (border_right - offset*2 >= tooltip.width() + mouse.pageX) {
                left_pos = mouse.pageX + offset;
            } else {
                left_pos = border_right - tooltip.width() - offset;
            }
            if(border_top + offset*2 >= mouse.pageY - tooltip.height()) {
                top_pos = border_top + offset;
            } else{
                top_pos = mouse.pageY - tooltip.height() - offset;
            }       
            tooltip.css({left:left_pos,
                         top:top_pos});
        });
        target.mouseout(function() {
            tooltip.css({left:"-9999px"});                                 
        });
        target.mousedown(function() {
            tooltip.css({left:"-9999px"});
        });
    }

    // ======================================================================

    wTooltips.clear = function() {

        // Clear the tooltips we have defined.
        //
        // We hide the tooltips we've created, and remove them from the web
        // page.  This should be called whenever the existing tooltips need to
        // be removed.

        all_tooltips.forEach(function(tooltip) {
            tooltip.remove();
        });
        all_tooltips = []
    }

    // ======================================================================

    // Finally, return our public interface back to the caller.

    return wTooltips;
}());

