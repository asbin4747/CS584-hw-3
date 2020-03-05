
//defining ticks
var tick =[0,10,20,30,40,50,60,70,80,90,100]     

var margin = {top: 60, right: 20, bottom: 30, left: 50},
    width = 700 - margin.left - margin.right,
    height = 365 - margin.top - margin.bottom;

// Adjust parsing of data to properly show tooltip
var parseDate = d3.time.format("%b %Y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatValue = d3.format(",.2f"),
    formatCurrency = function(d) { return formatValue(d) + "%"; };

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");                  

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");                   

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.rate); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("unemployment_2005_2019.csv", function(error, data) {
  if (error) throw error;
  console.log(data);

  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.rate = +d.rate;
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain(d3.extent(data, function(d) { return d.rate; }));

  // Configuring x-axis
svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

//Adding caption to the chart
svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -25)
    .style("text-anchor", "middle")
    .text("Time Animation for US Unemployment rate");

// text label for the x axis
svg.append("text")
.attr("transform",
  "translate(" + (width / 2) + " ," +
  (height + margin.top + 20) + ")")
.style("text-anchor", "middle")
.text("Date(Year)");

// Adding the y Axis
svg.append("g")
    .call(d3.axisLeft(y));

// text label for the y axis
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Unemployment");      

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .ticks
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Unemployment Rate (%)");

  //Adding a plotting line
  svg.selectAll("body")
    .data(data)
    .enter().append("circle")
    .attr("r", 3.5)
    .attr("cx", function (d) { return x(d.date); })
    .attr("cy", function (d) { return y(d.close); });


  // Start Animation on Click
  d3.select("#start").on("click", function() {
    var path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    // Variable to Hold Total Length
    var totalLength = path.node().getTotalLength();

    // Set Properties of Dash Array and Dash Offset and initiate Transition
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
     .transition() // Call Transition Method
      .duration(4000) // Set Duration timing (ms)
      .ease("linear") // Set Easing option
      .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

    // Create SVG for Tooltip and Circle on Mouseover
    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    // Append a circle to show on Mouseover
    focus.append("circle")
        .attr("r", 4.5);

    // Append text to show on Mouseover
    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

    // Append overlay rectangle as container for Circle and Tooltips
    // that allows user to hover anywhere on graphic
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    // Mousemove function that sets location and changes properties of Focus SVG
    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.date) + "," + y(d.rate) + ")");
      focus.select("text").text(formatCurrency(d.rate));
    }
  });

  // Reset Animation
  d3.select("#reset").on("click", function() {
    d3.select(".line").remove();
  });
});

