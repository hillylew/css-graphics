(function() {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById("greenhouse-gases-bar-chart");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);

  const tooltip = d3.select(container).select("#tooltip");

  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.8;

  // Get the container and its dimensions
  const containerWidth = container.offsetWidth;
  const containerHeight = containerWidth * aspectRatio;

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.02,
    right: containerWidth * 0.07,
    bottom: containerHeight * 0.15,
    left: containerWidth * 0.2,
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#greenhouse-gases-bar-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- Scales and axes ----------------------- */
  const yScale = d3.scaleBand().range([height, 0]).padding(0.15); // Scale for activities
  const xScale = d3.scaleLinear().range([0, width]);

  const xAxis = (g) => g
    .call(d3.axisBottom(xScale).tickValues(d3.range(0, xScale.domain()[1] + 1000, 1000)))
    .call(g => g.select(".domain").attr("stroke", "none"))  // This removes the x-axis line
    .call(g => g.selectAll(".tick line").attr("stroke", "#aaaaaa").attr("stroke-width", "0.2"))  // Make tick lines light grey
    .call(g => g.selectAll(".tick text").attr("class", "chart-labels").attr("fill", "#000"));  // Make tick texts light grey

  const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));

  // Append the main label text with CO2 subscripted
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + dynamicMargin.bottom * 0.6)
    .attr("class", "chart-labels")
    .attr("text-anchor", "middle")
    .attr("fill", "#000")
    .call(function(label) {
        label.append("tspan").text("Average Annual CO");
        label.append("tspan")
            .text("2")
            .attr("baseline-shift", "sub")
            .attr("font-size", "60%"); // Adjust the font size for subscript
        label.append("tspan").text(" Emissions (lbs)");
    });

  /* ----------------------- Loading and processing data ----------------------- */
  d3.csv(greenhouseGases4, (d) => ({
    Activity: d["Activity"],
    CO2Emission: +d["Annual CO2 emission per household"],
  })).then((data) => {
    // Get unique activities
    const activities = data.map(d => d.Activity).reverse();

    // Update scales
    const maxValue = Math.ceil(Math.max(...data.map(d => d.CO2Emission)) / 1000) * 1000;
    yScale.domain(activities);
    xScale.domain([0, maxValue]);

    // Draw the y-axis
    svg.append("g").call(yAxis).selectAll(".tick text").attr("class", "chart-labels").style("font-weight", "bold");

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    // Add vertical grid lines
    svg.selectAll("line.vertical-grid")
      .data(xScale.ticks(Math.floor(maxValue / 1000)))  // Adjust to match tickValues
      .enter()
      .append("line")
      .attr("class", "vertical-grid")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#aaaaaa")
      .attr("stroke-width", "0.2");

    // Draw the bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.Activity))
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", d => xScale(d.CO2Emission))
      .attr("fill", "#ED974A") // Single color for all bars
      .on("mouseover", function(event, d) {
        d3.select(this).attr("class", "bar active");

        const tooltipX = event.clientX;
        const tooltipY = event.clientY;

        const formatNumber = d3.format(",");

        // Show and populate the tooltip
        tooltip
          .html(
            `<div class="tooltip-title">${d.Activity}</div>
              <table class="tooltip-content">
                <tr>
                  <td>Emissions:</td>
                  <td class="value"><strong>${formatNumber(d.CO2Emission)}</strong> lbs</td>
                </tr>
              </table>`
          )
          .style("opacity", 0.9)
          .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
          .style("top", `${tooltipY}px`);

        d3.select(this).attr("opacity", 0.7);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (tooltipX + dynamicMargin.left / 4) + "px")
          .style("top", (tooltipY + window.scrollY) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("class", "bar");
        tooltip.style("opacity", 0);

        d3.select(this).attr("opacity", 1);
      });
  });
})();