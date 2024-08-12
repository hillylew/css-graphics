(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("wind-energy-line-chart");

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
    right: containerWidth * 0.12, // 10% of the container width
    bottom: containerHeight * 0.1, // 10% of the container height
    left: containerWidth * 0.07, // 10% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#wind-energy-line-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // X and Y scales
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Define the axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(d3.timeYear.every(2));
  const yAxis = d3.axisLeft(y).tickFormat(d3.format("$")).ticks(4); 

  // Load and process the CSV data
  d3.csv(wind1).then((data) => {
    // Parse years and convert string values to numbers
    data.forEach((d) => {
      d.Year = new Date(+d.Year, 0, 1);
      d["LCOE"] = +d["LCOE"];
    });

    // Update the scale domains with the processed data
    x.domain(d3.extent(data, (d) => d.Year));
    y.domain([0, Math.ceil(d3.max(data, (d) => d["LCOE"]) / 50) * 50]);

    // Draw X-axis
    const startYear = d3.min(data, (d) => d.Year.getFullYear());
    const endYear = d3.max(data, (d) => d.Year.getFullYear());

    // Define the years you want to filter out
    // const filteredYears = [1985, 2020];

    // Filter xTickValues to exclude filteredYears
    const xTickValues = x.ticks(d3.timeYear.every(2));
      // .filter(year => !filteredYears.includes(year.getFullYear()));

    if (!xTickValues.includes(startYear)) {
      xTickValues.unshift(new Date(startYear, 0, 1));
    }
    if (!xTickValues.includes(endYear)) {
      xTickValues.push(new Date(endYear, 0, 1));
    }
    xAxis.tickValues(xTickValues);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup
      .selectAll(".tick text")
      .attr("class", "chart-labels")
      .style("text-anchor", (d) => {
        return d.getFullYear() === startYear
          ? "start"
          : d.getFullYear() === endYear
          ? "end"
          : "middle";
      });

    // Draw Y-axis
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
      .text("$/MWh");


    // Define the line generator
    const lineGenerator = d3
      .line()
      .x((d) => x(d.Year))
      .y((d) => y(d["LCOE"]));

    const mainLine = svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#377eb8")
      .style("stroke-width", 2);

    // Appending circles to each data point on the LCOE line
    svg
      .selectAll(".lcoe-dot")
      .data(data)
      .enter()
      .append("circle") // Creates a new circle for each data point
      .attr("class", "lcoe-dot")
      .attr("cx", function (d) {
        return x(d.Year);
      })
      .attr("cy", function (d) {
        return y(d["LCOE"]);
      })
      .attr("r", 3) // Specifies the radius of the circle
      .attr("fill", "#377eb8");

    const lastDataPoint = data[data.length - 1]; // Get the last data point
    const lcoeLabel = svg
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", x(lastDataPoint.Year) + 5) // Slightly offset to the right of the end of the line
      .attr("y", y(lastDataPoint["LCOE"]))
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .attr("fill", "#377eb8")
      .text("LCOE");

    function onMouseMove(event) {
      const [xPos, yPos] = d3.pointer(event, this);
      const date = x.invert(xPos);
      const hoverData = data.find(
        (d) => d.Year.getFullYear() === date.getFullYear()
      );

      const tooltipX = event.clientX;
      const tooltipY = event.clientY;

      // Position tooltip
      tooltip
        .style("opacity", 0.9)
        .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
        .style("top", `${tooltipY}px`);

      const formatNumber = d3.format(",");
      if (hoverData) {
        tooltip.html(`
                <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
                <table class="tooltip-content">
                    <tr>
                        <td><span class="color-legend" style="background-color: #377eb8"
                        )};"></span>LCOE</td>
                        <td class="value">$<strong>${formatNumber(
                          hoverData["LCOE"]
                        )}</strong>/MWh</td>
                    </tr>
                </tr>
                </table>
              `);

        mouseG
          .selectAll("circle")
          .attr("cx", x(hoverData.Year))
          .attr("cy", y(hoverData["LCOE"]))
          .attr("r", 5)
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
    mouseG.append("circle").attr("class", "mouse-circle").style("opacity", "0");

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
      });
  });
})();
