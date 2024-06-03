// Set the dimensions and margins of the graph
const margin = { top: 20, right: 150, bottom: 50, left: 60 }; // Increased right margin for legends
const width = 850 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append SVG object to the body of the page
const svg = d3.select(".chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// x and y scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Define the axes
const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).tickPadding(5);
const yAxis = d3.axisLeft(y).tickPadding(5).tickFormat(d => d / 1000000);

const colorScale = d3.scaleOrdinal()
  .domain(["Bus", "Heavy rail", "Other rail", "Other"])
  .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"]);

// Load and process the CSV data
d3.csv("graph-1-data.csv").then(data => {
  // Parse years and convert string values to numbers
  data.forEach(d => {
    d.Year = new Date(+d.Year, 0, 1); // Parse Year into a Date object
    for (let prop in d) {
      if (prop !== "Year") d[prop] = +d[prop];
    }
  });

  // Stack the data
  const stack = d3.stack().keys(["Bus", "Heavy rail", "Other rail", "Other"]);
  const stackedData = stack(data);

  // Update the scale domains with the processed data
  x.domain(d3.extent(data, d => d.Year));
  y.domain([0, d3.max(stackedData, layer => d3.max(layer, d => d[1]))]);

  // Draw the Y-axis
  const yAxisGroup = svg.append("g")
    .call(yAxis)
    .style("font-size", "12px");

  // Append "in millions" label
  yAxisGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(0, ${-margin.top / 2})`)
    .style("fill", "#000")
    .style("font-size", "12px")
    .text("in millions");

  // Draw the X-axis
    // Generate tick values, including 2023
    const xTickValues = x.ticks().concat(new Date(2023, 0, 1)); // Add 2023 as a Date object
    xAxis.tickValues(xTickValues); // Update the xAxis with the new tick values

    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

  xAxisGroup.selectAll(".tick text")
    .style("font-size", "12px")
    .style("text-anchor", d => {
      return d.getFullYear() === 1990 ? "start" : (d.getFullYear() === 2023 ? "end" : "middle");
    });

  // Define the area generator
  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // Draw the areas
// Define the line generator
const lineGenerator = d3.line()
    .x(d => x(d.data.Year))
    .y(d => y(d[1])); // Using the top edge of the area for the line

// Create a group for each stacked area layer
const layers = svg.selectAll(".layer")
    .data(stackedData)
    .enter().append("g");

// Add the stacked area paths to each group
layers.append("path")
    .attr("d", area)
    .style("fill-opacity", "0.8")
    .style("fill", d => colorScale(d.key));

// Add the line paths for each group
layers.append("path")
    .attr("d", lineGenerator)
    .style("fill", "none")
    .style("stroke", d => colorScale(d.key)) 
    .style("stroke-width", 1);

  // Add legend
  const legend = svg.selectAll(".legend")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", d => {
      const lastPoint = d[d.length - 1];
      const yPosition = y(lastPoint[0]) + (y(lastPoint[1]) - y(lastPoint[0])) / 2;
      return `translate(${width + 5},${yPosition})`;
    });

  legend.append("text")
    .attr("x", 5)
    .attr("y", 0)
    .style("text-anchor", "start")
    .style("alignment-baseline", "middle")
    .style("fill", d => colorScale(d.key))
    .style("font-size", "14px")
    .text(d => d.key);
});
