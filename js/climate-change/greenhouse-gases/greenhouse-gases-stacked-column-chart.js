(function () {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById(
    "greenhouse-gases-stacked-column-chart"
  );

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);

  const tooltip = d3.select(container).select("#tooltip");

  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.7;

  // Get the container and its dimensions
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.1,
    right: containerWidth * 0.17,
    bottom: containerHeight * 0.1,
    left: containerWidth * 0.08,
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#greenhouse-gases-stacked-column-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- X and Y Scales ----------------------- */
  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(y).tickFormat(d3.format(","));

  const colorScale = d3
    .scaleOrdinal()
    .domain(["CO2", "CH4", "N2O", "HFC, PFC, SF6, NF*"])
    .range(["#eb5250", "#6298c6", "#75bf70", "#ae71b6"]);

  /* ----------------------- Load and process the CSV data ----------------------- */
  d3.csv(greenhouseGases2).then((data) => {
    // Parse years and convert string values to numbers
    data.forEach((d) => {
      d.Year = new Date(+d.Year, 0, 1);
      for (let prop in d) {
        if (prop !== "Year") d[prop] = +d[prop];
      }
    });

    // Stack the data
    const stack = d3.stack().keys(["CO2", "CH4", "N2O", "HFC, PFC, SF6, NF*"]);
    const stackedData = stack(data);

    /* ----------------------- Update the scale domains with the processed data ----------------------- */
    x.domain(data.map((d) => d.Year));
    const maxYValue =
      Math.ceil(
        d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) / 1000
      ) * 1000;
    y.domain([0, maxYValue]);

    // Draw the X-axis
    const xTickValues = x.domain().filter((d) => d.getFullYear() % 3 === 0); // Only even years
    xAxis.tickValues(xTickValues);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup.selectAll(".tick text").attr("class", "chart-labels");
    // .attr("transform", "rotate(-45)") // Rotate the text
    // .style("text-anchor", "end");

    // Draw the Y-axis
    const yAxisGroup = svg
      .append("g")
      .call(yAxis)
      .attr("class", "chart-labels");

    // Append "y-axis" label
    yAxisGroup
      .append("text")
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
      .style("fill", "#000")
      .text("MMT CO2e");

    /* ----------------------- Draw the chart ----------------------- */
    // Use categoryGroups instead of bars for the rectangles to capture mouseover with the proper context
    const categoryGroups = svg
      .selectAll(".category-group")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "category-group")
      .style("fill", (d) => colorScale(d.key));

    categoryGroups
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.data.Year))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());
    // .on("mouseover", function (event, d) {
    //     // Highlight all bars in this category
    //     highlightCategory(d3.select(this.parentNode).datum().key);
    // })
    // .on("mouseout", resetCategoryHighlight);

    /* ----------------------- Highlight ----------------------- */
    function highlightCategory(category) {
      svg.selectAll(".category-group").style("fill-opacity", 0.2); // Mute all other categories
      svg
        .selectAll(".category-group")
        .filter((d) => d.key === category)
        .style("fill-opacity", 1); // Highlight the current category
    }

    function resetCategoryHighlight() {
      svg.selectAll(".category-group").style("fill-opacity", 1); // Reset opacity to default
    }

    /* ----------------------- Legend & hover effect ----------------------- */
    const legend = svg
      .selectAll(".legend")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("transform", (d) => {
        const lastPoint = d[d.length - 1];
        const yPosition =
          y(lastPoint[0]) + (y(lastPoint[1]) - y(lastPoint[0])) / 2;
        return `translate(${width},${yPosition})`;
      });

    legend
      .append("foreignObject")
      .attr("x", 5)
      .attr("y", -10)
      .attr("width", 200)
      .attr("height", 20)
      .append("xhtml:div")
      .attr("class", "chart-labels")
      .style("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .style("fill", (d) => colorScale(d.key))
      .html((d) => {
        const labels = {
          CO2: "CO<sub>2</sub>",
          CH4: "CH<sub>4</sub>",
          N2O: "N<sub>2</sub>O",
          "HFC, PFC, SF6, NF*": "HFC, PFC, SF<sub>6</sub>, NF<sub>*</sub>",
        };
        return labels[d.key];
      });

    // Bind the legend to the same highlight logic
    legend
      .on("mouseover", function (event, d) {
        highlightCategory(d.key);
      })
      .on("mouseout", resetCategoryHighlight);

    /* ----------------------- Mouseover event ----------------------- */
    function onMouseMove(event) {
      const [xPos, yPos] = d3.pointer(event, this);
      const hoveredYear = x
        .domain()
        .find((year) => x(year) <= xPos && xPos < x(year) + x.bandwidth());
      const hoverData = data.find(
        (d) => d.Year.getFullYear() === hoveredYear.getFullYear()
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
                        <td><span class="color-legend" style="background-color: ${colorScale(
                          "CO2"
                        )};"></span>CO<sub>2</sub></td>
                        <td class="value">${formatNumber(hoverData["CO2"])}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale(
                          "CH4"
                        )};"></span>CH<sub>4</sub></td>
                        <td class="value">${formatNumber(hoverData.CH4)}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale(
                          "N2O"
                        )};"></span>N<sub>2</sub>O</td>
                        <td class="value">${formatNumber(hoverData.N2O)}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale(
                          "HFC, PFC, SF6, NF*"
                        )};"></span>HFC, PFC, SF<sub>6</sub>, NF*</td>
                        <td class="value">${formatNumber(
                          hoverData["HFC, PFC, SF6, NF*"]
                        )}</td>
                    </tr>
                    </table>
                `);
      }
    }

    // Draw the overlay rects
    const overlayRects = svg
      .selectAll(".overlay-rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "overlay-rect")
      .attr("x", (d) => x(d.Year))
      .attr("y", 0)
      .attr("width", x.bandwidth())
      .attr("height", height)
      .style("fill", "transparent")
      .style("pointer-events", "all")
      .on("mousemove", onMouseMove)
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });
  });
})();
