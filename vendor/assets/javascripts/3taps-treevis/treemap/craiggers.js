// Lightweight event queue system for treemaps.
var CraiggersTreemap = (function() {
  var size = [460, 450],
      sublevels = false,
      query = {location: "all", category: "all"},
      text = "";

  var left = d3.select("#left").select(".chart").attr("class", "Blues chart");
  var right = d3.select("#right").select(".chart").attr("class", "Purples chart");
  var link = function(d) {
    d = _.extend({postKey: d.posting.postKey, text: text}, query);
    var template = "#!/search/{location}/{category}/{text}/has-image=true&postKey={postKey}&subnav=workspace-link"
    return template.replace(/{([^}]+)}/g, function(s, v) {
      return d[v] || "";
    });
  };

  var search = new threeTapsSearchClient(THREETAPS_KEY);

  var tooldiv = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("display", "none");
  tooldiv.on("mouseout", mouseout, true);

  var options,
      levels = {
        category: ["original_cat", "original_subcat", "original_subcat_2"],
        location: ["original_continent", "original_st", "original_loc_1", "original_loc_2"]
      };

  var categories = t3.treemap(left)
        .label(label)
        .dimension("category"),
      locations = t3.treemap(right)
        .label(label)
        .dimension("location"),
      codes = {},
      parents = {},
      pretty = {},
      allLocations = {},
      allCategories = {},
      dimensions = {};

  function summary(dimension) {
    return function(text, code, cb) {
      var div = dimension === "category" ? left : right;
      var params = {source: "CRAIG"};
      var c = d3.keys(codes[dimension][code]);
      var hasChildren = c.length > 0;
      if (!hasChildren) c = [code];
      params.dimension = dimensions[dimension][c[0]];
      params.codes = c.join(',');
      async.parallel({
        numerator: function(cb) {
          Craiggers.Search.summary(_.extend({text: text}, params), function(x) {
            return cb(null, x);
          });
        },
        denominator: function(cb) {
          Craiggers.Search.summary(params, function(x) {
            return cb(null, x);
          });
        }
      }, function(err, data) {
        var children = addDensities(data.numerator.totals, data.denominator.totals);
        cb(err, hasChildren ? {key: code, children: children} : children[0]);
      });
    };
  }

  function addDensities(numerator, denominator) {
    return d3.entries(numerator).map(function(d) {
      return {
        key: d.key,
        value: d.value,
        total: denominator[d.key],
        density: d.value / denominator[d.key],
        children: null
      };
    });
  }

  async.parallel({
    category: loadCategories,
    location: loadLocations
  }, function(err, results) {
    options = results;
    ["location", "category"].forEach(function(dimension) {
      for (var parent in codes[dimension]) {
        var children = d3.keys(codes[dimension][parent] || {});
        children.forEach(function(child) {
          parents[child] = parent;
        });
      }
    });
    refresh();
  });

  function loadCategories(callback) {
    var levels = ["all", "original_cat", "original_subcat", "original_subcat_2"];
    var categoryTypes = dimensions.category = {};
    var dimension = "category";
    codes[dimension] = {};
    d3.csv("../data/categories.csv", function(rows) {
      var nest = d3.nest()
          .key(function(d) { return d.original_cat; })
          .key(function(d) { return d.original_subcat; })
          .key(function(d) { return d.original_subcat_2; });

      rows.forEach(function(row) {
        _.each(levels.slice(1), function(d, i) {
          var c;
          if (i) {
            var parent = levels[i];
            c = codes[dimension][row[parent]];
            if (!c) c = codes[dimension][row[parent]] = {};
          } else {
            c = codes[dimension].all;
            if (!c) c = codes[dimension].all = {};
          }
          if (row[d]) c[row[d]] = 1;
        });
        _.each({
          original_cat: "original_category",
          original_subcat: "original_subcategory",
          original_subcat_2: "original_subcategory_2"
        }, function(b, a) {
          categoryTypes[row[a]] = a;
          a = row[a];
          b = row[b];
          if (!(a in pretty)) pretty[a] = b;
        });
        var context = [];
        ["original_cat", "original_subcat", "original_subcat_2"].forEach(function(k) {
          if (row[k]) {
            context.push(row[k]);
            allCategories[row[k]] = context.slice();
          }
        });
      });
      callback(null, nest.map(rows));
    });
  }

  function loadLocations(callback) {
    var levels = ["all", "original_continent", "original_st", "original_loc_1", "original_loc_2"];
    var locationTypes = dimensions.location = {};
    var dimension = "location";
    codes[dimension] = {};
    d3.csv("../data/locations.csv", function(rows) {
      var nest = d3.nest()
          .key(function(d) { return d.original_continent; })
          .key(function(d) { return d.original_st; })
          .key(function(d) { return d.original_loc_1; })
          .key(function(d) { return d.original_loc_2; });

      rows.forEach(function(row) {
        _.each(levels.slice(1), function(d, i) {
          var c;
          if (i) {
            var parent = levels[i];
            c = codes[dimension][row[parent]];
            if (!c) c = codes[dimension][row[parent]] = {};
          } else {
            c = codes[dimension].all;
            if (!c) c = codes[dimension].all = {};
          }
          if (row[d]) c[row[d]] = 1;
        });
        _.each({
          original_continent: "original_continent",
          original_st: "original_state",
          original_loc_1: "original_location_1",
          original_loc_2: "original_location_2"
        }, function(b, a) {
          locationTypes[row[a]] = a;
          a = row[a];
          b = row[b];
          if (!(a in pretty)) pretty[a] = b;
        });
        var context = [];
        ["original_continent", "original_st", "original_loc_1", "original_loc_2"].forEach(function(k) {
          if (row[k]) {
            context.push(row[k]);
            allLocations[row[k]] = context.slice();
          }
        });
      });
      callback(null, nest.map(rows));
    });
  }

  // Use mini-treemaps for sublevel toggle icons!
  d3.selectAll("a#category-sublevels, a#location-sublevels")
      .on("click", function(d, i) {
        d3.event.preventDefault();
        var treemap = [categories, locations][i];
        treemap.sublevels = !d3.select(this).classed("active");
        d3.select(this).classed("active", treemap.sublevels);
        fetchTree(treemap);
        if (treemap.sublevels) $(this).css('background', 'url(/images/sublevel-on-' + this.id + '.png)')
        else $(this).css('background', '')
      })

  /*
    .append("svg:svg")
      .attr("width", 20)
      .attr("height", 20)
    .selectAll("rect")
      .data(d3.layout.treemap()
        .size([20, 20])
        .sort(function(a, b) { return a.value - b.value; })
        .nodes({children: fib(8)}))
    .enter().append("svg:rect")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("width", function(d) { return d.dx; })
      .attr("height", function(d) { return d.dy; });
  */

  function fib(n) {
    var f = [];
    for (var i=0; i<n; i++) {
      f.push(i < 2 ? 1 : f[i - 1] + f[i - 2]);
    }
    return f.map(function(d) { return {value: d}; });
  }

  function fetchTree(treemap) {
    var dimension = treemap.dimension();
    var div = dimension === "category" ? left : right;
    summary(dimension)(text, query[dimension], function(err, tree) {
      treemap.tree(tree);
      div.call(breadcrumbs, getCrumbs(query, dimension), dimension);
      d3.selectAll(".tooltip").style("display", "none");
      if (!tree.children) {
        loadPhotos(div, query.location, query.category);
      } else {
        div.select("svg").select("g.photos").remove();
        mouseout();
      }
      if (treemap.sublevels) {
        tree.children.forEach(function(d) {
          summary(dimension)(text, d.key, function(err, childTree) {
            d.children = childTree.children;
            treemap.tree(tree);
          });
        });
      }
    });
  }

  function getCrumbs(query, dimension) {
    // 2011-10-18 18:46 Author: Igor Novak
    var crumbs = [];
    var c = query[dimension];
    var name
    while (c) {
      name = (dimension === "category") ? Craiggers.Categories.nameByCode(c) : c;
      crumbs.unshift({code: c, name: name});
      c = parents[c];
    }
    crumbs[0] = {name: "all " + (dimension === "category" ? "categories" : "locations"), code: "all"};
    return crumbs;
  }

  function deepClone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function hasQueryChanged(e, current) {
    return !_.isEqual(_.extend(deepClone(current.query), e.query), current.query)
      || (e.location && e.location != current.location)
      || (e.category && e.category != current.category);
  }

  function trigger(dimension, code) {
    var params = {};
    params[dimension] = code;
    Craiggers.Search.update(params).submit();
    query[dimension] = code;
    refresh();
  }

  categories.on("change", function(e) {
    trigger("category", e.category);
  });

  locations.on("change", function(e) {
    trigger("location", e.location);
  });

  function refresh() {
    if (!options) return;
    fetchTree(categories);
    fetchTree(locations);
  }

  d3.selectAll("#category, #both, #location")
      .on("click", function() {
        var id = d3.select(this).attr("id");
        d3.selectAll("#category, #both, #location").classed("active", function() {
          return d3.select(this).attr("id") === id;
        });
        d3.select("#left")
            .transition().duration(1000)
            .style("width", id === "category" ? "920px"
              : id === "location" ? "0px" : "460px");
        d3.select("#right")
            .transition().duration(1000)
            .style("width", id === "location" ? "920px"
              : id === "category" ? "0px" : "460px");
        locations.size([460 * (id === "both" ? 1 : id === "location" ? 2 : 0), 450]);
        categories.size([460 * (id === "both" ? 1 : id === "category" ? 2 : 0), 450]);
      });

  function update(x) {
    if ("query" in x) text = x.query || "";
    if (x.location != null) query.location = x.location;
    if (x.category != null) query.category = x.category;
    refresh();
  }

  return {
    update: update
  };

  function loadPhotos(div, location, category) {
    var query = {
      image: "yes",
      source: "CRAIG",
      rpp: 50,
      safe: "yes",
      text: text,
      annotations: {}
    };
    var locationDim = dimensions.location[location];
    if (locationDim) query.annotations[locationDim] = location;
    var categoryDim = dimensions.category[category];
    if (categoryDim) query.annotations[categoryDim] = category;
    search.search(query, function(data) {
      var photos = [];
      data.results.forEach(function(d) {
        if (d.images && d.images.length)
          photos.push({posting: d, url: d.images[0]});
      });
      handlePhotos(photos);
    });
    div.select("g.photos").attr("visibility", "visible");

    function handlePhotos(photos) {
      var phototree = d3.layout.treemap()
          .size([size[0] + 1, size[1] + 1])
          .padding(2)
          .value(function() { return 1; });
      var n = phototree.nodes({children: photos}).slice(1);
      var svg = div.select("svg");

      var g = svg.selectAll("g.photos")
          .data([null]);
      g.enter().append("svg:g")
          .attr("class", "photos");

      var a = g.selectAll("a").data(n, function(d) { return d.url; });
      a.enter().append("svg:a")
        .append("svg:image")
          .attr("overflow", "hidden")
          .attr("preserveAspectRatio", "xMinYMin slice")
          .on("mouseover", function(d) {
            var model = new Craiggers.Models.Posting(d.posting);
            tooltip(d3.event, JST['posting-detail-tooltip'](model.toJSON()));
            var el = $(tooldiv[0]);
            el.find('.images').html(
              new Craiggers.Views.PostingImageViewer({model: model}).el
            );
          })
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);
      a.attr("xlink:href", link)
      a.exit().remove();

      a.select("image")
          .attr("x", function(d) { return d.x })
          .attr("y", function(d) { return d.y })
          .attr("width", function(d) { return d.dx; })
          .attr("height", function(d) { return d.dy; })
          .attr("xlink:href", function(d) { return d.url; })
    }
  }

  function tooltip(e, text) {
    $(tooldiv[0]).html(text);
    tooldiv.style("display", null);
    mousemove(e);
  }

  function mousemove(e) {
    e = e || d3.event;
    var off = 10;

    var x = e.pageX// || e.x
    var y = e.pageY// || e.y
    var top = y + off;
    var left = x + off;
    var width = $(tooldiv[0]).width();
    var windowWidth = $(window).width();
    var height = $(tooldiv[0]).height();
    var windowHeight = $(window).height();

    if (left + width > windowWidth) left = left - width;
    if (top + height > windowHeight) top = top - height;

    tooldiv.style("left",left + 'px').style("top",top + 'px');
  }

  function mouseout() {
    tooldiv.style("display", "none");
  }

  function label(d, i) {
    return pretty[d.key] || d.key || "";
  }

  function breadcrumbs(div, crumbs, dimension) {
    var span = div.selectAll("div.breadcrumbs")
        .data([null])
      .enter().insert("div", "svg")
        .attr("class", "breadcrumbs");
    span = div.select("div.breadcrumbs")
        .selectAll("span.crumb")
        .data(crumbs, function(d) { return d.name; });

    var spanEnter = span.enter().append("span")
        .attr("class", "crumb")
        .style("opacity", 1e-6);
    spanEnter.append("a")
        .attr("href", "javascript:void(null)")
        .text(function(d) { return d.name; })
        .on("click", function(d) {
          trigger(dimension, d.code);
        });

    // moved to css
    // spanEnter.append("span").html(function(d) {
    //   return "&raquo;"
    // });

    spanEnter.transition()
        .duration(1000)
        .style("opacity", 1);

    span.select("a").text(function(d) { return d.name; });

    span.exit().transition()
        .duration(1000)
        .style("opacity", 1e-6)
        .remove();
  }
})();
