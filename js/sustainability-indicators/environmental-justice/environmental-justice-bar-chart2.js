(function () {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById("environmental-justice-bar-chart2");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);

  const tooltip = d3.select(container).select("#tooltip");

  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.4;

  // Get the container and its dimensions
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.05,
    right: containerWidth * 0.1, // Adjust right margin if labels are too long
    bottom: containerHeight * 0.05,
    left: containerWidth * 0.2, // Increase left margin to fit labels
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#environmental-justice-bar-chart2")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- Scales, axes, and color ----------------------- */
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleBand().range([0, height]).padding(0.1);
  const formatDecimal = d3.format(".1f"); // Formatter to round to one decimal place

  /* ----------------------- Icon mapping ----------------------- */
  const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(5));

  /* ----------------------- Loading and processing data ----------------------- */
  d3.csv("../../data/sustainability-indicators/environmental-justice/environmental-justice4.csv", (d) => ({
    category: d.Category,
    percentage: +d["Percentage"],
  })).then((data) => {
    // Update scales and color domain
    xScale.domain([0, d3.max(data, (d) => d.percentage)]);
    yScale.domain(data.map((d) => d.category));

    // Draw the y-axis
    svg
      .append("g")
      .call(yAxis)
      .selectAll(".tick text") // select all text elements within ticks
      .attr("class", "chart-labels"); // Set the class to 'chart-labels'

    /* ----------------------- Drawing bars ----------------------- */
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.category))
      .attr("width", (d) => xScale(d.percentage))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#3167A4")
      .on("mouseover", function (d, i) {
        d3.select(this).attr("opacity", 0.7);
      })
      .on("mouseout", function (d, i) {
        d3.select(this).attr("opacity", 1);
      });

    /* ----------------------- Adding labels ----------------------- */
    svg
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", (d) => xScale(d.percentage) + 3) // Offset the label to the right of the bar
      .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em") // Vertically center
      .text((d) => `${formatDecimal(d.percentage)}%`) // Append % to the formatted number
      .attr("fill", "#000"); // Text color
  });
})();