var w = 400,
    h = 400,
    z = 5,
    x = w / z,
    y = h / z;

var minPrincipal = 0, maxPrincipal = 1000000;
var minRate = 0, maxRate = .07;
var months = 360;
var maxPayment = getPayment(maxPrincipal, maxRate, months);
var minPayment = 0;
var detailsWidth = 100;
var detailsMargin = 15;
var rects;

d3.select("#chart")
  .attr("width", w + detailsWidth + detailsMargin)
  .attr("height", h);

d3.select("#details")
  .attr("x", w + detailsMargin)
  .attr("y", detailsMargin)

d3.select("#minPrincipal").attr("value", 0)
  .on("input", function() { minPrincipal = parseInt(this.value); })
d3.select("#maxPrincipal").attr("value", maxPrincipal)
  .on("input", function() { maxPrincipal = parseInt(this.value); })
d3.select("#minRate").attr("value", 0)
  .on("input", function() { minRate = parseFloat(this.value) / 100; })
d3.select("#maxRate").attr("value", (maxRate * 100).toFixed(2))
  .on("input", function() { maxRate = parseFloat(this.value) / 100; })

d3.select(".mortVar").on("input", onChange);

function draw() {
  var rects = d3.select("#rects").selectAll("rect")
    .data(d3.range(x * y));

  rects.style("fill", fill);

  rects.enter().append("rect")
    .attr("transform", translate)
    .attr("width", z)
    .attr("height", z)
    .on("mouseover", mouseover)
    .on("dragstart", dragstart)
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
  return "$" + principal +
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
  wrap(details, detailsWidth)
}

function dragstart(e) {
  e.foo;
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
