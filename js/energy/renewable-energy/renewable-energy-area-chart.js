(function () {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById("renewable-energy-area-chart");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);
  
  const tooltip = d3.select(container).select("#tooltip");

  const aspectRatio = 0.7; // Define an aspect ratio for the chart

  // Get the container and its dimensions
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.1, // 10% of the container height
    right: containerWidth * 0.1, // 10% of the container width
    bottom: containerHeight * 0.1, // 10% of the container height
    left: containerWidth * 0.07, // 10% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#renewable-energy-area-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // X and Y scales
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Define the axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(d3.timeYear.every(10));
  const yAxis = d3.axisLeft(y).tickFormat(d3.format(",")); // Adjust ticks as needed

  // Load and process the CSV data
  d3.csv(renewable5).then((data) => {
    // Parse years and convert string values to numbers
    data.forEach((d) => {
      d.Year = new Date(+d.Year, 0, 1);
      d["Trillion Btu"] = +d["Trillion Btu"];
    });

    // Update the scale domains with the processed data
    x.domain(d3.extent(data, (d) => d.Year));
    y.domain([0, Math.ceil(d3.max(data, (d) => d["Trillion Btu"]) / 200) * 200]);

    // Draw X-axis
    const xTickValues = x.ticks(d3.timeYear.every(10))
      .filter(year => year.getFullYear());

    xAxis.tickValues(xTickValues);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup
      .selectAll(".tick text")
      .attr("class", "chart-labels")
      .style("text-anchor", (d) => {
        return d.getFullYear();
      });

    // Draw the Y-axis
    const yAxisGroup = svg
      .append("g")
      .call(yAxis)
      .attr("class", "chart-labels");

    // Append y-axis label
    yAxisGroup
      .append("text")
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
      .style("fill", "#000")
      .text("Trillion Btu");

    // Define the line generator
    const lineGenerator = d3
      .line()
      .x((d) => x(d.Year))
      .y((d) => y(d["Trillion Btu"]));

    const mainLine = svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#2f65a7")
      .style("stroke-width", 1.5);

    // Define the area generator
    const areaGenerator = d3.area()
      .x((d) => x(d.Year))
      .y0(height) // Start of the area at the bottom of the chart
      .y1((d) => y(d["Trillion Btu"])); // End of the area at the line

    // Append the area path
    const areaPath = svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", areaGenerator)
      .attr("fill", "#8CC9F2");
    areaPath.style("opacity", 1);

    function onMouseMove(event) {
      const [xPos, yPos] = d3.pointer(event, this);
      const date = x.invert(xPos);
      const hoverData = data.find(
        (d) => d.Year.getFullYear() === date.getFullYear()
      );

      // Area gets highlighted
      areaPath.style("opacity", 0.2);

      const tooltipX = event.clientX;
      const tooltipY = event.clientY;

      // Position tooltip
      tooltip
        .style("opacity", 0.9)
        .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
        .style("top", `${tooltipY}px`);

      const formatNumber = d3.format(",.1f");
      if (hoverData) {
        tooltip.html(`
          <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
          <table class="tooltip-content">
              <tr>
                  <td><span class="color-legend" style="background-color: #377eb8"></span>Production</td>
                  <td class="value">${formatNumber(hoverData["Trillion Btu"])} Trillion Btu</td>
              </tr>
          </table>
        `);

        mouseG
          .selectAll("circle")
          .attr("cx", x(hoverData.Year))
          .attr("cy", y(hoverData["Trillion Btu"]))
          .attr("r", 4)
          .style("fill", "#377eb8")
          .style("stroke", "white")
          .style("opacity", "1");

        // Draw the vertical line
        mouseG
          .select(".mouse-line")
          .style("opacity", "1")
          .attr("d", () => `M${x(hoverData.Year)},0V${height}`);
      }
    }

    const mouseG = svg.append("g").attr("class", "mouse-over-effects");

    // Append a line that will follow the mouse cursor
    mouseG
      .append("path")
      .attr("class", "mouse-line")
      .style("stroke", "#999")
      .style("stroke-width", "0.5px")
      .style("opacity", "0");

    // Append a circle that will follow the mouse cursor
    mouseG
      .append("circle")
      .attr("class", "mouse-circle")
      .style("opacity", "0");

    // Create a rect for listening to mouse events
    svg
      .append("rect")
      .attr("class", "listening-rect")
      .attr("width", width + dynamicMargin.left / 4)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", onMouseMove)
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
        mouseG.selectAll("circle").style("opacity", "0");
        mouseG.select(".mouse-line").style("opacity", "0");
        areaPath.style("opacity", 1);
      });
  });
})();
