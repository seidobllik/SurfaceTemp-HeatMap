function getColor(val, range, domain) {
  // val: a number inside of range.
  // range: [start, end] of original values
  // domain: [start, end] of new value range.
  const temp =
    Math.floor(domain[0]) +
    ((Math.ceil(domain[1]) - Math.floor(domain[0])) /
      (Math.ceil(range[1]) - Math.floor(range[0]))) *
      (Math.round(val) - Math.floor(range[0]));
  return "hsl(" + temp + ", 100%, 50%)";
}

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let xhr = new XMLHttpRequest();
xhr.open("GET", url);
xhr.send();
xhr.onload = () => {
  const dataset = JSON.parse(xhr.response);
  const yearMinMax = [
    d3.min(dataset.monthlyVariance.map((obj) => obj.year)),
    d3.max(dataset.monthlyVariance.map((obj) => obj.year))
  ];
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const varianceMinMax = [
    d3.min(dataset.monthlyVariance.map((obj) => obj.variance)),
    d3.max(dataset.monthlyVariance.map((obj) => obj.variance))
  ];
  const tempMinMax = [
    Math.round((dataset.baseTemperature + varianceMinMax[0]) * 1000) / 1000,
    Math.round((dataset.baseTemperature + varianceMinMax[1]) * 1000) / 1000
  ];

  // Title and description.
  document.getElementById("description").innerText =
    yearMinMax[0] +
    " - " +
    yearMinMax[1] +
    "\nBase temperature of " +
    dataset.baseTemperature +
    String.fromCharCode(176) +
    "C";

  // Tooltip.
  const tooltip = d3
    .select("#graph")
    .append("g")
    .attr("id", "tooltip")
    .attr("data-year", "")
    .style("opacity", 0);
  tooltip.append("text").attr("id", "tooltip-year");
  tooltip.append("text").attr("id", "tooltip-month");
  tooltip.append("text").attr("id", "tooltip-variance");

  // Graph.
  const graphW = 1500;
  const graphH = 500;
  const padding = 100;
  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", graphW)
    .attr("height", graphH);
  const xScale = d3
    .scaleLinear()
    .domain(yearMinMax)
    .range([padding, graphW - padding]);
  const yScale = d3
    .scaleBand()
    .domain(months)
    .range([padding, graphH - padding]);
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat((month) => monthNames[month]);

  svg
    .append("g")
    .attr("transform", "translate(0, " + (graphH - padding) + ")")
    .attr("id", "x-axis")
    .call(xAxis);
  svg
    .append("g")
    .attr("transform", "translate(" + (padding - 1) + ", 0)")
    .attr("id", "y-axis")
    .call(yAxis);

  svg
    .selectAll("rect")
    .data(dataset.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", (d, i) => d.month - 1)
    .attr("data-year", (d, i) => d.year)
    .attr("data-temp", (d, i) => dataset.baseTemperature + d.variance)
    .attr("x", (d, i) => xScale(d.year))
    .attr("y", (d, i) => yScale(d.month - 1)) //- (graphH - padding) / 24)
    .attr("width", graphW / (yearMinMax[1] - yearMinMax[0]))
    .attr("height", yScale.bandwidth()) //(graphH - padding) / 12)
    .style("fill", (d, i) => {
      return getColor(dataset.baseTemperature + d.variance, tempMinMax, [
        240,
        355
      ]);
    })
    .on("mouseover", (d, i) => {
      //console.log(this.event);
      d3.select(this.event.target).style("stroke", "black");
      d3.select("#tooltip-year").text("Year: " + d.year);
      d3.select("#tooltip-month").text("Month: " + monthNames[d.month - 1]);
      d3.select("#tooltip-variance").text("Variance: " + d.variance);
      d3.select("#tooltip")
        .attr("data-year", d.year)
        .style("top", yScale(d.month - 1) + "px")
        .style("left", xScale(d.year) + "px");
      d3.select("#tooltip").style("opacity", 0.9);
    })
    .on("mouseout", (d, i) => {
      d3.select(this.event.target).style("stroke", "none");
      d3.select("#tooltip").style("opacity", 0);
    });

  // Legend.
  let legendData = [];
  for (let i = Math.floor(tempMinMax[0]); i <= Math.ceil(tempMinMax[1]); i++) {
    legendData.push(i);
  }

  const legendScale = d3.scaleBand().domain(legendData).range([0, 300]);
  const legendAxis = d3.axisBottom(legendScale);

  svg
    .append("g")
    .attr("transform", "translate(" + padding * 2 + ", " + (graphH - 30) + ")")
    .attr("id", "legend")
    .call(legendAxis);

  svg
    .select("#legend")
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", (d, i) => legendScale(d))
    .attr("y", -15)
    .attr("width", legendScale.bandwidth())
    .attr("height", 15)
    .style("fill", (d, i) => {
      return getColor(d, [1, 14], [240, 355]);
    });
};
