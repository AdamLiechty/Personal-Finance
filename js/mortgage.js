var _window = (function() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];
  return {
    width: w.innerWidth || e.clientWidth || g.clientWidth,
    height: w.innerHeight || e.clientHeight || g.clientHeight
  };
})();

var w = 400,
    h = 400,
    z = 5,
    x = w / z,
    y = h / z;

var minPrincipal = 0, maxPrincipal = 1000000;
var minRate = 0.03,   maxRate = 0.07;
var months = 360;
var maxPayment = getPayment(maxPrincipal, maxRate, months);
var minPayment = 0;
var detailsWidth = 80;
var detailsMargin = 5;
var rects;

d3.select("#chart")
  .attr("width", w + detailsWidth + detailsMargin)
  .attr("height", h);

d3.select("#details")
  .attr("x", w + detailsMargin)
  .attr("y", detailsMargin + 10)

d3.select("#minPrincipal").attr("value", minPrincipal)
  .on("input", function() { minPrincipal = parseInt(this.value); onChange(); })
d3.select("#maxPrincipal").attr("value", maxPrincipal)
  .on("input", function() { maxPrincipal = parseInt(this.value); onChange(); })
d3.select("#minRate").attr("value", (minRate * 100).toFixed(2))
  .on("input", function() { minRate = parseFloat(this.value) / 100; onChange(); })
d3.select("#maxRate").attr("value", (maxRate * 100).toFixed(2))
  .on("input", function() { maxRate = parseFloat(this.value) / 100; onChange(); })

var stackedBar = new StackedBar("#stackedBar", {
  keyName: "month",
  yLabel: "Amortization",
  sort: false,
  x: w + detailsMargin + detailsWidth,
  y: 0,
  width: _window.width - w - detailsMargin - detailsWidth - 5,
  height: h,
  labelXEvery: 12
});

function draw() {
  var rects = d3.select("#rects").selectAll("rect")
    .data(d3.range(x * y));

  rects.style("fill", fill);

  rects.enter().append("rect")
    .attr("transform", translate)
    .attr("width", z)
    .attr("height", z)
    .on("mouseover", mouseover)
    .style("fill", fill);

  rects.exit().remove();
}
draw();

function fill(d) {
  var principal = getPrincipal(d);
  var rate = getRate(d);
  var payment = getPayment(principal, rate, months)
  return d3.hsl(120, 1, 1 - payment / maxPayment);
}

function getPayment(principal, rate, months) {
  var r = (rate / 12) || 0.000000001;
  return r * principal / (1 - Math.pow(1 + r, -months));
}

function translate(d) {
  return "translate(" + (d % x) * z + "," + (y - Math.ceil(d / x)) * z + ")";
}

function expand(d) {
  return "translate(" + 0 + "," + 0 + ")scale(23)"
}

function getDetails(d) {
  var principal = getPrincipal(d);
  var rate = getRate(d);
  return "$" + principal.toFixed(2) +
    " @" + (rate*100).toFixed(2) + "% $" +
    getPayment(principal, rate, months).toFixed(0) + "/mo"
}

function getPrincipal(d) {
  return (d % x / x * (maxPrincipal - minPrincipal)) + minPrincipal;
}
function getRate(d) {
  return (Math.floor(d / x) / y * (maxRate - minRate)) + minRate;
}

function mouseover(d) {
  var details = d3.select("#details");
  details.selectAll("*").remove();
  details.text(getDetails(d));
  wrap(details, detailsWidth);

  // amoritation chart
  var amort = [];
  var principalRemaining = getPrincipal(d), rate = getRate(d);
  var payment = getPayment(principalRemaining, rate, months);
  for (var i = 0; i < months; ++i) {
    var interest = rate / 12 * principalRemaining;
    amort[i] = {
      month: i + 1,
      principal: payment - interest,
      interest: interest
    };
    principalRemaining -= amort[i].principal;
  }
  stackedBar.data(amort);
}

function onChange() {
  minPayment = getPayment(minPrincipal, minRate, months);
  maxPayment = getPayment(maxPrincipal, maxRate, months);
  draw();
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
