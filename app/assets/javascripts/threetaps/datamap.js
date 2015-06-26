// datamap.js
//
// This Javascript module implements a tableau-based datamap visualisation.
// The main class, Datamap, represents a datamap. To use it, you need to
// define a <div> element on the page which corresponds to the datamap.  You
// then instantiate a Datamap object as follows:
//
//     var map = new Datamap({option:value, ...});
//
// The various options are used to customise the behaviour and look of the data
// map, as described below.  Once the datamap has been instantiated, you can
// tell it to display the tableau for a given location by calling:
//
//     map.showLocation(loc_code);
//
// where 'loc_code' is the Whenua location code for the location to display.
//
//
// Datamap Configuration Options
// -----------------------------
//
// The following options can be supplied when instantiating a new Datamap
// object:
//
//     mapID
//
//         The ID of the <div> element into which to place the datamap.  If no
//         ID is specified, the datamap will be placed into a <div> with an ID
//         value of "datamap".
//
//     headingID
//
//         The ID of a <div> element to use as a heading to use to display the
//         name of the current location.  If this is not specified, the current
//         location's name will not be displayed.
//
//     width
//
//         The width of the datamap, in pixels.  If no width is specified, the
//         datamap will default to being 600 pixels wide.
//
//     height
//
//         The height of the datamap, in pixels.  If no height is specified,
//         the datamap will default to being 400 pixels high.
//
//     fontFamily
//
//         The CSS font-family to use for the datamap's labels.  If no
//         font-family is specified, the datamap will use a serif font.
//
//     fontSize
//
//         The size to use for the datamap's labels, in pixels.  If no
//         font-size is specified, the datamap will use a font-size of 12.
//
//     minBubbleSize
//
//         The minimum size of a bubble to display on the datamap, as a
//         fraction of the datamap's width and height.  If this is not
//         specified, the minimum bubble size will be set to 0.05, which will
//         make the smallest bubble equal to a twentieth of the datamap's
//         smallest dimension.
//
//     maxBubbleSize
//
//         The maximum size of a bubble to display on the datamap, as a
//         fraction of the datamap's width and height.  If this is not
//         specified, the maximum bubble size will be set to 0.25, which will
//         make the largest bubble equal to a quarter of the datamap's smallest
//         dimension.
//
//     showBubbleForZeroMatches
//
//         If this is set to true, locations which have zero matches will still
//         have bubbles drawn at the minimum bubble size.  If this is set to
//         false, locations with zero matches won't have a bubble drawn at all.
//         If this is not specified, showBubbleForZeroMatches will default to
//         false.
//
//     wrapHeading
//
//         If this is set to true, the heading will be word-wrap when it
//         reaches the width of the tableau.  If this is set to false, the
//         heading will not word wrap.  If this is not specified, wrapHeading
//         will default to false.
//
//     baseURL
//
//         The URL to use to access the Whenua system.  If this is not
//         specified, it will default to "http://3taps.net".  This URL must not
//         end with a trailing slash ("/") character.
//
//     onLocChanged
//
//         A Javascript function to call when the user changes the current
//         location within the datamap.  This function will be called with two
//         parameters: the Datamap object, and the Whenua location code for the
//         new location.  Note that the datamap will not display this location
//         automatically; it is up to the onLocChanged() function to call
//         datamap.showLocation() so that the new location will be displayed.
//
//     matchCalc
//
//         A Javascript function to calculate the total number of matches for
//         each location.  This function will be called with two parameters: an
//         array of Whenua location codes to obtain the totals for, and a
//         callback function to use when the results have been obtained.  The
//         match calculator is used to calculate the size to use for each of
//         the bubbles to be displayed on the datamap.  If no matchCalc
//         function is supplied, no bubbles will be displayed on the datamap.
//
//         When the match calculator has obtained the required data, it should
//         call the supplied callback function with two parameters: the array
//         of location codes, and an array containing the number of matches for
//         each of these locations.

// ##########################################################################

function Datamap(options) {

    // Process our parameters.

    if ("mapID" in options) {
        this.mapID = options.mapID;
    } else {
        this.mapID = "datamap";
    }

    if ("headingID" in options) {
        this.headingID = options.headingID;
    } else {
        this.headingID = null;
    }

    if ("width" in options) {
        this.width = options.width;
    } else {
        this.width = 600;
    }

    if ("height" in options) {
        this.height = options.height;
    } else {
        this.height = 400;
    }

    if ("fontFamily" in options) {
        this.fontFamily = options.fontFamily;
    } else {
        this.fontFamily = "serif";
    }

    if ("fontSize" in options) {
        this.fontSize = options.fontSize;
    } else {
        this.fontSize = 12;
    }

    if ("minBubbleSize" in options) {
        this.minBubbleSize = options.minBubbleSize;
    } else {
        this.minBubbleSize = 0.05;
    }

    if ("maxBubbleSize" in options) {
        this.maxBubbleSize = options.maxBubbleSize;
    } else {
        this.maxBubbleSize = 0.25;
    }

    if ("showBubbleForZeroMatches" in options) {
        this.showBubbleForZeroMatches = options.showBubbleForZeroMatches;
    } else {
        this.showBubbleForZeroMatches = false;
    }

    if ("wrapHeading" in options) {
        this.wrapHeading = options.wrapHeading;
    } else {
        this.wrapHeading = false;
    }

    if ("baseURL" in options) {
        this.baseURL = options.baseURL;
    } else {
        this.baseURL = "http://3taps.net";
    }

    if ("onLocChanged" in options) {
        this.onLocChanged = options.onLocChanged;
    } else {
        this.onLocChanged = null;
    }

    if ("matchCalc" in options) {
        this.matchCalc = options.matchCalc;
    } else {
        this.matchCalc = null;
    }

    // Define our class variables.  These are global to the datamap module, and
    // act as private globals for our module.

    Datamap.prototype._datamaps = []; // Master list of all created datamaps.

    // ----------------------------------------------------------------------
    //
    // showLocation(loc_code)
    //
    //     This public method displays the tableau for the given location
    //     within this datamap.
    //
    //     'loc_code' should be the Whenua location code for the location to
    //     display.

    this.showLocation = function(loc_code) {

        if (this.curLocation == loc_code) {
            return; // Already displayed -> nothing to do.
        }

        var datamap = this;

        this._showWaiting();
        wTooltips.clear();

        // $.getJSON(this.baseURL + "/tableau/?location=" +
        //           encodeURIComponent(loc_code) + "&tableau=DEFAULT&callback=?",
        //           {width : datamap.width,
        //            height: datamap.height},
        //           function(data) {
        //               if (data.error) {
        //                   datamap._hideTableau();
        //                   datamap._hideWaiting();
        //                   datamap._showError(data.error.message);
        //               } else {
        //                   if (datamap.curLocation != loc_code) {
        //                       datamap.curLocation = loc_code;
        //                       datamap._drawTableau(data.tableau);

        //                       if (datamap.headingID != null) {
        //                           datamap._showLocationDetails(loc_code);
        //                       }
        //                   }
        //               }
        // });
    }

    // ----------------------------------------------------------------------
    //
    // _showLocationDetails()
    //
    //     This private method downloads the details of the current location
    //     from the Whenua server, and updates the datamap's heading to show
    //     these details.
    //
    //     'loc_code' should be the Whenua location code for the current
    //     location.
    
    this._showLocationDetails = function(loc_code) {

        $.getJSON(this.baseURL + "/reference/locations/" + encodeURIComponent(loc_code) + '?' + AUTH_TOKEN,
                  function(data) {
                      if (data.error) {
                          datamap._hideTableau();
                          datamap.hideWaiting();
                          datamap._showError(data.error.message);
                        } else {
                            datamap._hideError();
                            datamap._hideWaiting();
                            datamap._updateHeading(data.location);
                        }
        });
    }

    // ----------------------------------------------------------------------
    //
    // _showError()
    //
    //     This private method used to display an error message to the user.

    this._showError = function(message) {

        var error = d3.select("#" + this.mapID)
                      .select("svg")
                      .selectAll("text.datamap_error")
                      .data([message]);

        error.enter().append("svg:text")
                     .style("font-family", this.fontFamily)
                     .style("font-size", (this.fontSize*2) + "px")
                     .attr("class", "datamap_error")
                     .attr("text-anchor", "middle")
                     .attr("transform", "translate(" + this.width/2 + ","
                                                     + this.height/2 + ")");
        error.text(String);
    }

    // ----------------------------------------------------------------------
    //
    // _hideError()
    //
    //     This private method used to hide the current error message, if any.

    this._hideError = function() {

        return;

        d3.select("#" + this.mapID)
          .select("svg")
          .selectAll("text.datamap_error")
          .remove();
    }

    // ----------------------------------------------------------------------
    //
    // _updateHeading()
    //
    //     This private method used to display the details of the current
    //     location within our "heading" DIV.
    //
    //     'location' is an object containing the location details downloaded
    //     from the server.  This object will include the following fields:
    //
    //         'name'
    //
    //             The full name for this location.
    //
    //         'displayName'
    //
    //             An abbreviated version of the name for this location.
    //
    //         'level'
    //
    //             A string indicating the level of this location:
    //
    //                "country"
    //                "state"
    //                "metro"
    //                "region"
    //                "county"
    //                "city"
    //                "locality"
    //                "zipcode"
    //
    //         'context'
    //
    //             An object defining the various higher-level locations that
    //             this location is part of.  This object will have zero or
    //             more of the following fields:
    //
    //                 "countries"
    //                 "states"
    //                 "metros"
    //                 "regions"
    //                 "counties"
    //                 "cities"
    //                 "localities"
    //                 "zipcodes"
    //
    //             Each of these (if present) will be an array of locations at
    //             that level, where each array entry will be an object with
    //             "code", "name", "displayName" and "abbreviation" entries.
    //
    //     We use this object to construct the heading to display at the top of
    //     the datamap.  Note that if we haven't been given the ID of a heading
    //     DIV, we don't do anything.

    this._updateHeading = function(location) {

        if (this.headingID == null) {
            // No heading DIV specified -> nothing to do.
            return;
        }

        // Get the heading DIV itself, and style it appropriately.

        var headingDIV = d3.select("#" + this.headingID);
        headingDIV.attr("class",  "datamap_heading")
                  .style("font-family", this.fontFamily)
                  .style("font-size", this.fontSize + "px")
                  .style("text-align", "left");

        if (this.wrapHeading) {
            headingDIV.style("width", this.width + "px");
        }

        // Build a list of entries to display in the heading.  Each entry can
        // be a piece of plain text, or a link which changes the current
        // location when the user clicks on it.

        entries = []; // Array of entries to add to the heading.  Each item in
                      // the array is an object with the following fields:
                      //
                      //     text
                      //
                      //         The text to display for this entry.
                      //
                      //     class
                      //
                      //          The CSS class name to use for this entry's
                      //          <span> element.
                      //
                      //     loc_code
                      //
                      //          If this entry is clickable, this should be
                      //          the location code to jump to when the user
                      //          clicks on this entry.

        var PEER_SEPARATOR  = "&nbsp;&#124;&nbsp;"; // " | ".
        var CHILD_SEPARATOR = "&nbsp;&#187;&nbsp;"; // " >> ".

        if ("countries" in location.context) {
            for (var i=0; i<location.context.countries.length; i++) {
                var country = location.context.countries[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "Country: " + country.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : country.code})
            }
        }

        if ("states" in location.context) {
            for (var i=0; i<location.context.states.length; i++) {
                var state = location.context.states[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "State: " + state.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : state.code})
            }
        }

        if ("metros" in location.context) {
            for (var i=0; i<location.context.metros.length; i++) {
                var metro = location.context.metros[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "Metro: " + metro.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : metro.code})
            }
        }

        if ("regions" in location.context) {
            for (var i=0; i<location.context.regions.length; i++) {
                var region = location.context.regions[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "Region: " + region.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : region.code})
            }
        }

        if ("counties" in location.context) {
            for (var i=0; i<location.context.counties.length; i++) {
                var county = location.context.counties[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "County: " + county.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : county.code})
            }
        }

        if ("cities" in location.context) {
            for (var i=0; i<location.context.cities.length; i++) {
                var city = location.context.cities[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "City: " + city.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : city.code})
            }
        }

        if ("localities" in location.context) {
            for (var i=0; i<location.context.localities.length; i++) {
                var locality = location.context.localities[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "Locality: " + locality.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : locality.code})
            }
        }

        if ("zipcodes" in location.context) {
            for (var i=0; i<location.context.zipcodes.length; i++) {
                var zipcode = location.context.zipcodes[i];
                if (entries.length > 0) {
                    // Add a separator.
                    if (i == 0) {
                        entries.push({'text'  : CHILD_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    } else {
                        entries.push({'text'  : PEER_SEPARATOR,
                                      'class' : "datamap_heading_separator"});
                    }
                }
                entries.push({'text'     : "ZIP Code: " + zipcode.displayName,
                              'class'    : "datamap_heading_link",
                              'loc_code' : zipcode.code})
            }
        }

        // Add the current location to the end of the list.

        if (entries.length > 0) {
            // Add a separator.
            entries.push({'text'  : CHILD_SEPARATOR,
                          'class' : "datamap_heading_separator"});
        }

        var level_label = location.level.charAt(0).toUpperCase()
                        + location.level.slice(1); // Capitalize first letter.

        entries.push({'text'  : level_label + ": " + location.displayName,
                      'class' : "datamap_heading_cur_loc"});

        // (Re)create the contents of our DIV.  Note that the entries
        // themselves don't word-wrap, but that we add a word-wrapping "span"
        // element between each entry so that the heading can word-wrap if
        // necessary.

        headingDIV.selectAll("span").remove();
        headingDIV.selectAll("text").remove();

        var wrapHeading = this.wrapHeading;

        entries.forEach(function(entry) {
            var span = headingDIV.append("span");
            span.attr("class", entry['class']);
            span.data([entry]);
            span.html(entry['text']);
            span.style("white-space", "nowrap");
            if ("loc_code" in entry) {
                // Make link clickable.
                span.style("cursor", "pointer")
                    .on("click", function(d) {
                        if (datamap.onLocChanged != null) {
                            datamap.onLocChanged(datamap, d.loc_code);
                        }
                    });
            }

            if (wrapHeading) {
                var gap = headingDIV.append("span");
                gap.html(" ")
                gap.style("white-space", "wrap");
            }
        });
    }

    // ----------------------------------------------------------------------
    //
    // _showWaiting()
    //
    //     This private method used to show a "waiting" message while the
    //     tableau is being displayed.

    this._showWaiting = function() {

        var waitingMsg = d3.select("#" + this.mapID)
                           .select("svg")
                           .selectAll("text.datamap_waiting")
                           .data(["Loading..."]);

        waitingMsg.enter().append("svg:text")
                          .attr("class", "datamap_waiting")
                          .style("font-family", this.fontFamily)
                          .style("font-size", (this.fontSize*2) + "px")
                          .attr("text-anchor", "middle")
                          .attr("transform", "translate("+this.width/2+","
                                                         +this.height/2+")");
        waitingMsg.text(String);
    }

    // ----------------------------------------------------------------------
    //
    // _hideWaiting()
    //
    //     This private method used to hide the "waiting" message once the
    //     tableau has been displayed.

    this._hideWaiting = function() {

        d3.select("#" + this.mapID)
          .select("svg")
          .selectAll("text.datamap_waiting")
          .remove();
    }

    // ----------------------------------------------------------------------
    //
    // _getSVG()
    //
    //     This private method returns a reference to the SVG element which we
    //     will use to draw the datamap.  Note that the SVG element will be
    //     created if it doesn't aready exist.

    this._getSVG = function() {

        var svg = d3.select("#" + this.mapID)
                    .selectAll("svg")
                    .data([null]);

        svg.enter().append("svg:svg")
            .attr("width", this.width)
            .attr("height", this.height)
          .append("svg:rect")
            .attr("class", "background")
            .style("stroke", "none")
            .attr("width", this.width)
            .attr("height", this.height)

        return svg;
    }

    // ----------------------------------------------------------------------
    //
    // _drawTableau()
    //
    //     This private method displays the contents of a tableau within the
    //     datamap.  You should not call this method directly.

    this._drawTableau = function(tableau) {

        var datamap = this; // Give handler functions access to our datamap.

        // Get a reference to our outermost SVG element, creating it if it
        // doesn't already exist.

        var svg = this._getSVG();

        // Format the SVG element's rectangle to display the tableau's
        // rendering style.

        _apply_render_style(tableau.render, svg.selectAll(".background"));

        // Remove the existing error message, if any.

        datamap._hideError();

        // Remove the existing data, so that we're starting with a clean slate.

        svg.selectAll("g.view").remove();

        // Create an SVG group for each of our views, and sub-groups to hold
        // the locations and the bubbles.

        var view = svg.selectAll("g.view").data(tableau.views);
        var viewEnter = view.enter().append("svg:g")
            .attr("class", "view");
        var viewRects = viewEnter.append("svg:rect")
            .attr("class", "view_background")
            .attr("x", function(d) { return d.min_x; })
            .attr("y", function(d) { return d.min_y; })
            .attr("width", function(d) { return d.max_x - d.min_x; })
            .attr("height", function(d) { return d.max_y - d.min_y; });
        viewEnter.append("svg:g")
            .attr("class", "locations");
        viewEnter.append("svg:g")
            .attr("class", "bubbles");
        viewRects.each(function(d) {
                         _apply_render_style(d.render, d3.select(this));
                       })
        view.exit().remove();

        // Create an SVG group for each of our locations.

        var loc = view.select("g.locations").selectAll("g.location")
            .data(function(d) { return d.locations; }, _get_code);
        var locEnter = loc.enter().append("svg:g")
            .attr("class", "location")
            .attr("id", function(d) { return d.code; })
            .style("cursor", "pointer")
            .on("click", function(d) {
                if (d3.event.shiftKey == true) {
                    // The user was holding down the shift key -> zoom out.
                    datamap._onZoomOut();
                } else {
                    // A normal click.
                    if (datamap.onLocChanged != null) {
                        datamap.onLocChanged(datamap, d.code);
                    }
                }
            });

        loc.exit().remove();

        // Create an SVG polygon object for each of our polygons.

        var polygon = loc.selectAll("polygon")
            .data(function(d) {
                    var polygons = [];
                    for (var i=0; i<d.polygons.length; i++) {
                        polygons.push({'code'     : d.code,
                                       'polygon'  : d.polygons[i],
                                       'render'   : d.render});
                    }
                    return polygons; 
                  });
        var polyEnter = polygon.enter().append("svg:polygon");
        polyEnter.each(function(d) {
            var poly = d3.select(this);
            poly.on("mouseover", function() {
                                    _hilite_location(d.code);
            });
            poly.on("mouseout", function() {
                                    _unhilite_location(d.code);
            });
        });

        polygon.attr("points", function(d) {
              return d.polygon.exterior.map(function(d) {
                        return d[0] + "," + d[1];
                    }).join(" ");
            });
        polygon.each(function(d) {
                        _apply_render_style(d.render, d3.select(this));
                     });
        polygon.exit().remove();

        // If we don't have a match calculator, give up.  Since we won't be
        // able to calculate the bubble sizes, we can't draw any bubbles.

        if (this.matchCalc == null) {
            //return;
        }

        // Build the master list of all the locations we want to draw bubbles
        // for.

        loc_codes = [];
        tableau.views.forEach(function(view) {
            view.locations.forEach(function(loc) {
                loc_codes.push(loc.code);
            });
        });

        // Finally, call the match calculator to get the totals for each of
        // these locations.  When we have the bubbles, our _gotMatches()
        // closure function will be called with 'datamap' set to the current
        // datamap.

        this.matchCalc(loc_codes, datamap._gotMatches);
    }

    // ----------------------------------------------------------------------
    //
    // _gotMatches()
    //
    //     This private function is called when the match calculator returns
    //     with the number of matches for each desired location.  We create a
    //     tooltip for each location, and add bubbles for those locations which
    //     have requested it.
    //
    //     Note that this is intended to be used as a callback function, and is
    //     called as a closure.  The 'datamap' closure variable will refer to
    //     the current datamap.  You should not call this function directly.

    this._gotMatches = function(loc_codes, num_matches) {

        var view = datamap._getSVG().selectAll("g.view");
        var loc = view.select("g.locations").selectAll("g.location");

        // Add a tooltip for each location.

        loc.each(function(d) {
            var found = false;
            for (var i=0; i<loc_codes.length; i++) {
                if (d.code == loc_codes[i]) {
                    found = true;
                    break;
                }
            }

            var tooltip_html;
            var num_lines;

            if (found) {
                tooltip_html = "<b>" + d.displayName + "</b>" +
                               "<br/>" +
                               num_matches[i] + " matches";
                num_lines    = 2;
            } else {
                tooltip_html = "<b>" + d.displayName + "</b>";
                num_lines    = 1;
            }

            wTooltips.add($(this), {tooltip      : tooltip_html,
                                    delay        : 0.1,
                                    width        : 180,
                                    border_width : 1,
                                    height       : datamap.fontSize*num_lines+10,
                                    font_family  : datamap.fontFamily,
                                    font_size    : datamap.fontSize});
        });

        // Build a separate list of the location code and the number of matches
        // for each location which needs a bubble.

        bubble_matches = [];
        bubble_locs    = [];

        loc.each(function(d) {
            if ("bubble_render" in d) {
                var found = false;
                for (var i=0; i<loc_codes.length; i++) {
                    if (d.code == loc_codes[i]) {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    bubble_matches.push(num_matches[i]);
                    bubble_locs.push(loc_codes[i]);
                }
            }
        });

        // Calculate the radius to use for each bubble.

        var radiuses = datamap._calcBubbleRadiuses(bubble_matches);

        // Create the bubbles.

        var bubble = view.select("g.bubbles").selectAll("circle")
            .data(function(d) {
                    var data = [];

                    d.locations.forEach(function(loc) {
                        if ("bubble_render" in loc) {
                            var bubble_radius = null;
                            var loc_matches   = null;
                            for (var i=0; i<bubble_locs.length; i++) {
                                if (loc.code == bubble_locs[i]) {
                                    bubble_radius = radiuses[i];
                                    loc_matches   = bubble_matches[i];
                                    break
                                }
                            }

                            if (bubble_radius != null) {
                                data.push({code           : loc.code,
                                           bubble_render  : loc.bubble_render,
                                           displayName    : loc.displayName,
                                           displayPoint_x : loc.displayPoint_x,
                                           displayPoint_y : loc.displayPoint_y,
                                           bubble_radius  : bubble_radius,
                                           num_matches    : loc_matches,
                                          });
                            }
                        }
                    });

                    return data;
                  }, _get_code);

        var circles = bubble.enter().append("svg:circle");
        circles.style("cursor", "pointer")
        circles.attr("id", function(d) {
                              return d.code;
        });
        circles.on("click",
                   function(d) {
                      if (d3.event.shiftKey == true) {
                          // The user was holding down the shift key -> zoom
                          // out.
                          datamap._onZoomOut();
                      } else {
                          // A normal click.
                          if (datamap.onLocChanged != null) {
                              datamap.onLocChanged(datamap, d.code);
                          }
                      }
        });

        circles.each(function(d) {
                        var tooltip_html = "<b>" + d.displayName + "</b>" +
                                           "<br/>" +
                                           d.num_matches + " matches";
                        wTooltips.add($(this),
                                      {tooltip      : tooltip_html,
                                       delay        : 0.1,
                                       width        : 180,
                                       border_width : 1,
                                       height       : datamap.fontSize*2 + 10,
                                       font_family  : datamap.fontFamily,
                                       font_size    : datamap.fontSize});
        });

        bubble.attr("class", "datamap_bubble")
              .attr("cx",    function(d) { return d.displayPoint_x; })
              .attr("cy",    function(d) { return d.displayPoint_y; })
              .attr("r",     function(d) { return d.bubble_radius; });

        bubble.each(function(d) {
                        var element = d3.select(this);
                        _apply_render_style(d.bubble_render, d3.select(this));
                     });

        bubble.each(function(d) {
            d3.select(this)
              .on("mouseover", function() {
                                    _hilite_location(d.code);
              })
              .on("mouseout", function() {
                                    _unhilite_location(d.code);
              });
        });

        bubble.exit().remove();
    }

    // ----------------------------------------------------------------------
    //
    // _calcBubbleRadiuses()
    //
    //     This private method calculates the radius, in pixels, to use for
    //     each bubble, based on the number of matches found for each location.

    this._calcBubbleRadiuses = function(num_matches) {

        var max_value = 0;
        num_matches.forEach(function(n) {
            if (n > max_value) {
                max_value = n;
            }
        });

        var min_bubble_radius = Math.min(datamap.width, datamap.height)
                              * datamap.minBubbleSize / 2;

        var max_bubble_radius = Math.min(datamap.width, datamap.height)
                              * datamap.maxBubbleSize / 2;

        var sizes = []
        num_matches.forEach(function(n) {
            var radius;
            if (datamap.showBubbleForZeroMatches) {
                radius = min_bubble_radius +
                         (n / max_value) * (max_bubble_radius -
                                            min_bubble_radius);
            } else {
                if (n == 0) {
                    radius = 0;
                } else {
                    radius = min_bubble_radius +
                             (n / max_value) * (max_bubble_radius -
                                                min_bubble_radius);
                }
            }
            sizes.push(radius);
        });

        return sizes;
    }

    // ----------------------------------------------------------------------
    //
    // _hideTableau()
    //
    //     This private method hides the current tableau from the datamap.

    this._hideTableau = function() {

        var svg = this._getSVG();
        svg.selectAll("g.view").remove();
    }

    // ----------------------------------------------------------------------
    //
    // _onZoomOut()
    //
    //     This private method responds to the user shift-clicking on the
    //     tableau to zoom out.

    this._onZoomOut = function() {

        var datamap = this;

        if (datamap.curLocation == null) {
            return; // Should never happen.
        }

        datamap._showWaiting();

        $.getJSON(this.baseURL + "/reference/locations/" + encodeURIComponent(datamap.curLocation) + "/parents?"
                  + AUTH_TOKEN,
                  function(data) {
                      if (data.error) {
                          datamap._hideTableau();
                          datamap._showError(data.error.message);
                      } else {
                          if (data.parents.length > 0) {
                            if (datamap.onLocChanged != null) {
                                datamap._hideError();
                                datamap.onLocChanged(datamap, data.parents[0]);
                            }
                          }
                      }
                  });
    }

    // ----------------------------------------------------------------------
    //
    // The following helper function returns the Whenua location code
    // associated with a given piece of tableau data.

    function _get_code(d) {
        return d.code;
    }

    // ----------------------------------------------------------------------
    //
    // The following helper function visually highlights the polygons for the
    // given location.

    function _hilite_location(loc_code) {

        d3.selectAll("g.location#" + loc_code)
          .selectAll("polygon")
          .each(function(d) {
                  _apply_hilite_style(d.render, d3.select(this));
          });

        d3.selectAll("circle#" + loc_code)
          .each(function(d) {
                  _apply_hilite_style(d.bubble_render, d3.select(this));
          });
    }

    // ----------------------------------------------------------------------
    //
    // The following helper function removes the visual highlighting from the
    // polygons for the given location.

    function _unhilite_location(loc_code) {

        d3.selectAll("g.location#" + loc_code)
          .selectAll("polygon")
          .each(function(d) {
                  _apply_render_style(d.render, d3.select(this));
          });

        d3.selectAll("circle#" + loc_code)
          .each(function(d) {
                  _apply_render_style(d.bubble_render, d3.select(this));
          });
    }

    // ----------------------------------------------------------------------
    //
    // The following helper function uses the given set of rendering
    // instructions to style the given elements.

    function _apply_render_style(render, elements) {

        if ("border_color" in render) {
            elements.style("stroke", "#"+render.border_color);
        }
        if ("border_size" in render) {
            elements.style("stroke-width", render.border_size+"px");
        }
        if ("border_opacity" in render) {
            elements.style("stroke-opacity", render.border_opacity);
        }
        if ("fill_color" in render) {
            elements.style("fill", "#"+render.fill_color);
        }
        if ("fill_opacity" in render) {
            elements.style("fill-opacity", render.fill_opacity);
        }
    }

    // ----------------------------------------------------------------------
    //
    // The following helper function uses the given set of rendering
    // instructions to visually highlight the given elements.

    function _apply_hilite_style(render, elements) {

        if ("border_color" in render) {
            var colour = d3.rgb("#" + render.border_color);
            elements.style("stroke", colour.brighter().toString());
        }
        if ("border_size" in render) {
            elements.style("stroke-width", render.border_size+"px");
        }
        if ("border_opacity" in render) {
            elements.style("stroke-opacity", render.border_opacity);
        }
        if ("fill_color" in render) {
            var colour = d3.rgb("#" + render.fill_color);
            elements.style("fill", colour.brighter().toString());
        }
        if ("fill_opacity" in render) {
            elements.style("fill-opacity", render.fill_opacity);
        }
    }

    // ----------------------------------------------------------------------
    //
    // Finally, finish initialising this datamap.

    Datamap.prototype._datamaps.push(this); // Remember this datamap.
    this._datamapNum = Datamap.prototype._datamaps.length - 1;

    var ignore = this._getSVG(); // Create the SVG elements used to draw the
                                 // tableau.
}

