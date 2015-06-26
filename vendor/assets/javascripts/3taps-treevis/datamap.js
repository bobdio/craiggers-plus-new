var CraiggersDatamap = (function() {
  var w = 960,
      h = 680,
      geoLocations = null,
      locationsGeo = null,
      callback = null,
      currentLocation = null;

  var metroAreas = ["USA-ATL", "USA-BOS", "USA-CHI", "USA-DAL", "USA-DET",
    "USA-HON", "USA-LAX", "USA-MIN", "USA-NYM", "USA-PHX", "USA-POR",
    "USA-SAN", "USA-SEA", "USA-SFO", "USA-MIA", "USA-TPA", "USA-WAS"];

  function drawLocation(code) {
    callback = function() {
      code = geoLocations[code] || code;
      $.getJSON("http://3taps.net/tableau/?location="+encodeURIComponent(code)+"&tableau=DEFAULT&callback=?", {
        width: w * 2,
        height: h * 2
      }, function(data) {
        if (data.error) {
          drawTableau({views: []});
          showError(data.error.message);
          return;
        }
        if (currentLocation !== code) {
          currentLocation = code;
          drawTableau(data.tableau);
        }
      });
    }
    if (geoLocations) callback();
  }

  function showError(message) {
    var error = d3.select("#datamap .map").select("svg").selectAll("text.error")
        .data([message]);
    error.enter().append("svg:text")
        .attr("class", "error")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
    error.text(String);
  }

  function colour(type) {
    return {
      NEIGHBOR: 1,
      CURRENT: 2,
      CHILD: 2
    }[type];
  }

  var line = d3.svg.line().interpolate("basis");

  function drawTableau(tab) {
    var svg = d3.select("#datamap .map").selectAll("svg")
        .data([null]);
    svg.enter().append("svg:svg")
        .attr("class", "Purples")
        .attr("width", w)
        .attr("height", h)
      .append("svg:rect")
        .style("stroke", "none")
        .attr("class", "q0-3")
        .attr("width", w)
        .attr("height", h)

    svg.selectAll("text.error").remove();

    var view = svg.selectAll("g.view").data(tab.views);
    var viewEnter = view.enter().append("svg:g")
        .attr("class", "view");
    viewEnter.append("svg:g")
        .attr("class", "locations");
    viewEnter.append("svg:g")
        .attr("class", "bubbles");
    view.exit().remove();

    var loc = view.select("g.locations").selectAll("g.location")
        .data(function(d) { return d.locations; }, code);
    var locEnter = loc.enter().append("svg:g")
        .attr("class", function(d) { return "location q" + colour(d.metadata.loc_type) + "-3 " + d.metadata.loc_type; })
        .on("click", function(d) {
          Craiggers.Search.update({location: locationsGeo[d.code]}).submit();
        });
    locEnter.append("svg:title")
        .text(function(d) { return d.displayName; });
    loc.exit().remove();

    var polygon = loc.selectAll("polygon")
        .data(function(d) { return d.polygons; });
    polygon.enter().append("svg:polygon");
    polygon
        .attr("points", function(d) {
          return d.exterior.map(function(d) { return d[0] / 2 + "," + d[1] / 2; }).join(" ");
        });
    polygon.exit().remove();

    var bubble = view.select("g.bubbles").selectAll("circle")
        .data(function(d) {
          return d.locations.filter(function(d) {
            return metroAreas.indexOf(d.code) !== -1;
          });
        }, code);
    bubble.enter().append("svg:circle")
      .append("svg:title")
        .text(function(d) { return d.displayName; });
    bubble
        .attr("cx", function(d) { return d.displayPoint_x / 2; })
        .attr("cy", function(d) { return d.displayPoint_y / 2; })
        .attr("r", function() { return 50; });
    bubble.exit().remove();
  }

  function code(d) { return d.code; }

  d3.csv("data/locationsGeolocationCodes.csv", function(rows) {
    geoLocations = {};
    locationsGeo = {};
    rows.forEach(function(row) {
      var geo = row["Geolocation Code"],
          loc = row.original_loc_2 || row.original_loc_1 || row.original_st;
      geoLocations[loc] = geo;
      locationsGeo[geo] = loc;
    });
    ["USA-AL", "USA-AK", "USA-AZ", "USA-AR", "USA-CA",
      "USA-CO", "USA-CT", "USA-DE", "USA-DC", "USA-FL", "USA-GA", "USA-HI",
      "USA-ID", "USA-IL", "USA-IN", "USA-IA", "USA-KS", "USA-KY", "USA-LA",
      "USA-ME", "USA-MD", "USA-MA", "USA-MI", "USA-MN", "USA-MS", "USA-MO",
      "USA-MT", "USA-NE", "USA-NV", "USA-NH", "USA-NJ", "USA-NM", "USA-NY",
      "USA-NC", "USA-ND", "USA-OH", "USA-OK", "USA-OR", "USA-PA", "USA-RI",
      "USA-SC", "USA-SD", "USA-TN", "USA-TX", "USA-UT", "USA-VT", "USA-VA",
      "USA-WA", "USA-WV", "USA-WI", "USA-WY"].forEach(function(geo) {
        var loc = geo.substr(4);
        geoLocations[loc] = geo;
        locationsGeo[geo] = loc;
    });
    if (callback) callback();
  });

  // Initialise empty <svg:svg>.
  drawTableau({views: []});

  return drawLocation;
})();
