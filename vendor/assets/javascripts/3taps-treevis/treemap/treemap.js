var t3 = {};

t3.treemap = function(div) {
  var label = String,
      link = String,
      size = [460, 450],
      dimension = "category",
      x = d3.scale.linear().range([0, size[0]]),
      y = d3.scale.linear().range([0, size[1]]),
      format = d3.format(",f"),
      nq = 5,
      color = d3.scale.linear().range(d3.range(0, nq + 1)),
      listeners = {},
      denominators,
      callback = null,
      tree = null,
      sublevels = false,
      event = d3.dispatch("change");

  var treemap = {};

  var layout = d3.layout.treemap()
      .sort(function(a, b) { return a.value - b.value; })
      .children(function(d) { return d.children ? d.children.filter(function(d) { return d.value; }) : null; })
      .padding(2)
      .size([size[0] + 1, size[1] + 1]);

  function redraw() {
    var densities = (tree.children || []).map(function(d) {
      return d.density;
    });
    densities.sort();
    color.domain(d3.range(0, 1 + 1 / nq, 1 / nq).map(function(d, i) {
      return d3.quantile(densities, d);
    }));
    function padding(d) {
      return d.depth <= 1 ? 2 : 0;
    }

    var svg = div.selectAll("svg")
        .data([null]);
    svg.enter().append("svg:svg")
        .attr("class", "treemap")
      .append("svg:g")
        .attr("class", "treemap")
        .attr("transform", "translate(-.5, -.5)");

    layout.size([size[0] + 1, size[1] + 1]);

    svg.transition().duration(1000)
        .attr("width", size[0])
        .attr("height", size[1] + 50)
        .call(colorKey);

    svg = svg.select("g.treemap");
    var n = layout.nodes(tree);

    var cell = svg.selectAll("g.cell")
        .data(n, function(d) { return d.key || ""; });

    var cellEnter = cell.enter().append("svg:g")
        .attr("class", "cell")
        .attr("transform", function(d) {
           var p = padding(d);
           return "translate(" + (d.x + p) + "," + (d.y + p) + ")"; })
        .attr("visibility", "hidden")
        .on("click", function(d) {
          var e = {};
          e[dimension] = d.key;
          event.change.dispatch.call(treemap, e);
        })
        .on("mouseover", function(d, i) {
          var density = d.density || 1;
          tooltip(d3.event,
            "<p>" + label.call(this, d, i) +
            "<p>" + format(d.value) + " / " + format(d.total) +
            "<p>" + pformat(density));
        })
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    cellEnter.append("svg:rect")
        .attr("width", function(d) {
          var p = padding(d);
          return Math.max(0, d.dx - p - p);
        })
        .attr("height", function(d) {
          var p = padding(d);
          return Math.max(0, d.dy - p - p);
        })
        .attr("visibility", "hidden")
        .attr("class", function(d) { return "q" + quantize(d.density || 1) + "-" + (nq + 1); });

    cellEnter.append("svg:text")
        .attr("class", function(d) { return "q" + contrast(quantize(d.density || 1)) + "-" + (nq + 1); })
        .attr("x", function(d) { return d.dx / 2; })
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(fontSize);

    cell.transition()
        .duration(1000)
        .attr("transform", function(d) {
          var p = padding(d);
          return "translate(" + (d.x + p) + "," + (d.y + p) + ")";
        })
      .each("end", function() {
        d3.select(this).attr("visibility", function(d) { return isVisibleText(d) ? "visible" : "hidden"; })
        mouseout();
      });

    cell.select("rect")
        .attr("class", function(d) { return "q" + quantize(d.density || 1) + "-" + (nq + 1); })
      .transition()
        .duration(1000)
        .attr("width", function(d) {
          var p = padding(d);
          return Math.max(0, d.dx - p - p);
        })
        .attr("height", function(d) {
          var p = padding(d);
          return Math.max(0, d.dy - p - p);
        })
      .each("end", function() {
        d3.select(this).attr("visibility", function(d) { return d.children ? "hidden" : "visible"; });
      });

    cell.select("text")
        .attr("class", function(d) { return "q" + contrast(quantize(d.density || 1)) + "-" + (nq + 1); })
        .text(fontSize)
      .transition()
        .duration(1000)
        .attr("x", function(d) { return d.dx / 2; })
        .attr("y", function(d) { return d.dy / 2; });

    cell.select("title")
        .text(function(d, i) {
          var density = d.density || 1;
          return (label.call(this, d, i) + " " +
            format(d.value) +
            "/" + format(d.value / density) +
            " (" + pformat(density) + ")");
        });

    cell.sort(function(a, b) { return b.depth - a.depth; });

    cell.exit().remove();
  }

  function isVisible(d) {
    var showChildren = sublevels && (d.depth === 1 ? d.children : true);
    if (d.depth === 0 && !d.children) return true;
    return d.depth < (showChildren ? 3 : 2) && d.depth > (showChildren ? 1 : 0);
  }

  function isVisibleText(d) {
    return d.depth < 2 && d.depth > 0;
  }

  function clean(n) {
    n = _.clone(n);
    if (n.parent) delete n.parent;
    if (n.children) n.children = n.children.map(clean);
    return n;
  }

  function fontSize(d, i) {
    var strings = [label.call(this, d, i), d.key];
    for (var i=0; i<2; i++) {
      var s = strings[i];
      t3_treemapHiddenText.text(s);
      var box = t3_treemapHiddenText[0][0].getBBox(),
          p = 4;
      if (box.width + p < d.dx && box.height + p < d.dy) return s;
    }
    return null;
  }

  function quantize(d) {
    var c = color(d);
    return Math.max(1, Math.min(nq, 1 + Math.ceil(isNaN(c) ? 2 : c)));
  }

  function contrast(d) {
    d += 1;
    return 1 + d % nq;
  }

  var tooldiv = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("display", "none");
  tooldiv.on("mouseout", mouseout, true);

  function tooltip(e, text) {
    mousemove(e);
    $(tooldiv[0]).html(text);
    tooldiv.style("display", null);
  }

  function mousemove(e) {
    e = e || d3.event;
    var off = 10;
    tooldiv
        .style("left", (e.pageX + off) + "px")
        .style("top", (e.pageY + off) + "px");
  }

  function mouseout() {
    tooldiv.style("display", "none");
  }

  function on(type, f) {
    var i = type.indexOf("."),
        type = i === -1 ? type : type.substring(0, i),
        name = type.substring(i + 1);
    var l = listeners[type];
    if (!l) listeners[type] = l = {};
    l[name] = f;
  }

  function trigger(type, d) {
    // Override current state.
    var e = {};
    for (k in state) {
      if (k in d) e[k] = d[k];
      else e[k] = state[k];
    }
    var l = listeners[type];
    if (l) {
      for (n in l) {
        var f = l[n];
        if (f) f.call(this, e);
      }
    }
  }

  treemap.dimension = function(x) {
    if (!arguments.length) return dimension;
    dimension = x + "";
    return treemap;
  };

  treemap.label = function(x) {
    if (!arguments.length) return label;
    label = x;
    return treemap;
  };

  treemap.tree = function(x) {
    if (!arguments.length) return tree;
    tree = x;
    redraw();
    return treemap;
  };

  treemap.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    redraw();
    return treemap;
  };

  treemap.on = function(type, listener) {
    event[type].add(listener);
    return treemap;
  };

  treemap.off = function(type, listener) {
    event[type].remove(listener);
    return treemap;
  };

  return treemap;

  function colorKey(g) {
    g.each(function() {
      var svg = d3.select(this);
      var p = [15, 15];
      var domain = color.domain();
      var g = svg.selectAll("g.color-key")
          .data([domain.slice(1)]);
      g.enter().append("svg:g")
          .attr("class", "color-key");
      g.attr("transform", function(d) {
        return "translate(" + (size[0] - d.length * 20) / 2 + "," + (size[1] + 5.5) + ")";
      });
      var rect = g.selectAll("rect")
          .data(function(d) { return d3.zip(domain, d); });
      rect.enter().append("svg:rect")
          .attr("class", function(d, i) { return "q" + ++i + "-6"; })
          .attr("transform", function(d, i) { return "translate(" + i * 20 + ")"; })
          .attr("width", p[0])
          .attr("height", p[1])
          .on("mouseover", function(d) {
             tooltip(d3.event, "<p>" + pformat(d[0], d[1]));
          })
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);
      rect.exit().remove();
      var minmax = g.selectAll("text")
          .data([domain[0], domain[domain.length - 1]]);
      minmax.enter().append("svg:text")
          .attr("text-anchor", function(d, i) { return i ? "start" : "end"; })
          .attr("dx", function(d, i) { return i ? ".3em" : "-.5em"; })
          .attr("dy", "1em");
      minmax
          .attr("transform", function(d, i) {
            return i ? "translate(" + (domain.length - 1) * 20 + ")" : null;
          })
          .text(function(d) { return pformat(d); });
    });
  }
};

// 2011-11-08 00:09 Author: Igor Novak
// select "#content" instead of "body"
// in order to get rid of unnecessary scroll bar
var t3_treemapHiddenText = d3.select("#content").append("svg:svg")
    .attr("width", 0)
    .attr("height", 0)
  .append("svg:text")
    .style("visibility", "hidden");

function t3_treemapHTML(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/"/g, "&#39;");
}

var sigFormat = d3.format(",d");

function roundSig(num, n) {
  if (num == 0) { return 0; }
  var d = Math.ceil(Math.log(num < 0 ? -num: num) / Math.LN10);
  var power = n - d;
  var magnitude = Math.pow(10, power);
  var shifted = Math.round(num * magnitude);
  return sigFormat(Math.round(shifted / magnitude));
}

function pformat(d, e) {
  if (arguments.length < 2) e = 0;
  d *= 100;
  e *= 100;
  var s = "%";
  if (d < 1) { d *= 10;  e *= 10;  s = " per thousand"; }
  if (d < 1) { d *= 1e3; e *= 1e3; s = " per million"; }
  if (isNaN(d) || isNaN(e)) return "N/A";
  if (e) s = "\u2013" + roundSig(e, 3) + s;
  return roundSig(d, 3) + s;
}
