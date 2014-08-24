// var sb = new StackedBar(selector, options)
// sb.data([newData]); // Display new data
function StackedBar(selector, options) {
  var self = this;
  (function() { // Hide internals
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = options.width - margin.left - margin.right,
        height = options.height - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1 );

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#5555cc", "#bb2222", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select(selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    self.data = function(data) {
      color.domain(d3.keys(data[0]).filter(function(key) { return key !== options.keyName; }));

      data.forEach(function(d) {
        var y0 = 0;
        d.stack = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.stack[d.stack.length - 1].y1;
      });

      if (options.sort) data.sort(function(a, b) { return b.total - a.total; });

      x.domain(data.map(function(d) { return d[options.keyName]; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]);

      svg.selectAll(".axis").remove();

      var xAxis = d3.svg.axis()
          .scale(x)
          .tickValues(d3.range(1,termYears + 1).map(function(i){return i * 12;}))
          .orient("bottom");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("x", 10)
          .attr("y", 0)
          .attr("dy", "1.5em")
          .style("text-anchor", "end")
          .text(options.xLabel);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -6)
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(options.yLabel);

      var sbItems = svg.selectAll(".sbItem")
          .data(data);
      sbItems.attr("transform", sbItemTransform)
      sbItems.enter().append("g")
          .attr("class", "sbItem")
          .attr("transform", sbItemTransform)
      sbItems.exit().remove();

      var sbItemRects = sbItems.selectAll("rect")
          .data(function(d) { return d.stack; });
      sbItemRectStyle(sbItemRects);
      sbItemRectStyle(sbItemRects.enter().append("rect"));
      sbItemRects.exit().remove();

      var legend = svg.selectAll(".legend")
          .data(color.domain().slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

    }; // self.data
    function sbItemTransform(d) { return "translate(" + x(d[options.keyName]) + ",0)"; }
    function sbItemRectStyle(r) {
      r.attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .style("fill", function(d) { return color(d.name); });
    }
  })();
}
