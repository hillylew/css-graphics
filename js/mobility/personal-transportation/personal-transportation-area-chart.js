(function () {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById("personal-transportation-area-chart");

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
    top: containerHeight * 0.05,
    right: containerWidth * 0.15,
    bottom: containerHeight * 0.1,
    left: containerWidth * 0.07,
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#personal-transportation-area-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- X and Y Scales ----------------------- */
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(y).tickFormat(d => `${d * 100}%`); // Multiply by 100 for percentage display

  const colorScale = d3
    .scaleOrdinal()
    .domain(["Cars and Wagons", "SUVs", "Vans", "Pickups"])
    .range(["#1C476D","#8FC8E5", "#3167A4",  "#FFCB05"]);

  /* ----------------------- Load and process the CSV data ----------------------- */
  d3.csv("../../data/mobility/personal-transportation/personal-transportation2.csv").then((data) => {
    // Parse years and convert string values to numbers
    data.forEach((d) => {
      d.Year = new Date(+d.Year, 0, 1);
      for (let prop in d) {
        if (prop !== "Year") d[prop] = +d[prop];
      }
    });

    // Stack the data
    const stack = d3
      .stack()
      .keys(["Cars and Wagons", "SUVs", "Vans", "Pickups"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetExpand);
    
    const stackedData = stack(data);

    /* ----------------------- Update the scale domains with the processed data ----------------------- */
    x.domain(d3.extent(data, (d) => d.Year));
    y.domain([0, 1]); // y-domain remains from 0 to 1 to map to 0% to 100%

    // Draw X-axis
    // const endYear = d3.max(data, (d) => d.Year.getFullYear());

    // Filter xTickValues to exclude filteredYears
    const xTickValues = x.ticks(d3.timeYear.every(5))
      .filter(year => year.getFullYear());

    // if (!xTickValues.includes(endYear)) {
    //   xTickValues.push(new Date(endYear, 0, 1));
    // }
    xAxis.tickValues(xTickValues);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup
      .selectAll(".tick text")
      .attr("class", "chart-labels")
      .style("text-anchor", (d) => {
        return d.getFullYear()
      });

    // Draw the Y-axis
    const yAxisGroup = svg
      .append("g")
      .call(yAxis)
      .attr("class", "chart-labels");

    /* ----------------------- Draw the chart ----------------------- */
    // Define the area generator
    const area = d3
      .area()
      .x((d) => x(d.data.Year))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    const layers = svg
      .selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("g");

    // Add the stacked area paths to each group
    layers
      .append("path")
      .attr("class", "area-path")
      .attr("d", area)
      .style("fill", (d) => colorScale(d.key));

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
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", 5)
      .attr("y", 0)
      .style("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .style("fill", (d) => colorScale(d.key))
      .text((d) => d.key)
      .on("mouseover", (event, d) => {
        highlightAreaLayer(d.key);
      })
      .on("mouseout", () => {
        resetAreaLayers();
      });

    // Function to highlight the area layer corresponding to the legend text
    function highlightAreaLayer(key) {
      svg.selectAll(".area-path").style("fill-opacity", 0.2);

      const index = colorScale.domain().indexOf(key);
      if (index !== -1) {
        d3.select(svg.selectAll(".area-path").nodes()[index]).style(
          "fill-opacity",
          1
        );
      }
    }

    // Function to reset all area layers to default opacity
    function resetAreaLayers() {
      svg.selectAll(".area-path").style("fill-opacity", 1);
    }

    /* ----------------------- Mouseover event ----------------------- */
    function onMouseMove(event) {
      const [xPos, yPos] = d3.pointer(event, this);
      const date = x.invert(xPos);
      const hoverData = data.find(
        (d) => d.Year.getFullYear() === date.getFullYear()
      );

      const tooltipX = event.clientX + window.scrollX;
      const tooltipY = event.clientY + window.scrollY;

      // Position tooltip
      tooltip
        .style("opacity", 0.9)
        .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
        .style("top", `${tooltipY}px`);

      const formatNumber = d3.format(".1f");
      if (hoverData) {
        /* ----------------------- Highlight the area layer being hovered over ----------------------- */
        tooltip.html(`
            <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
            <table class="tooltip-content">
                <tr>
                       <td><span class="color-legend" style="background-color: ${colorScale("Pickups")};"></span>Pickups</td>
                       <td class="value">${formatNumber(hoverData["Pickups"])}%</td>
                </tr>
                <tr>
                    <td><span class="color-legend" style="background-color: ${colorScale("Vans")};"></span>Vans</td>
                    <td class="value">${formatNumber(hoverData["Vans"])}%</td>
                </tr>
                <tr>
                    <td><span class="color-legend" style="background-color: ${colorScale("SUVs")};"></span>SUVs</td>
                    <td class="value">${formatNumber(hoverData["SUVs"])}%</td>
                </tr>
                <tr>
                    <td><span class="color-legend" style="background-color: ${colorScale("Cars and Wagons")};"></span>Cars and Wagons</td>
                    <td class="value">${formatNumber(hoverData["Cars and Wagons"])}%</td>
                </tr>
            </table>
          `);

        // Positioning the circles
        const totalStack = [];
        let accumulatingStack = 0;

        // Calculate the top edge of each stack element
        ["Cars and Wagons", "SUVs", "Vans", "Pickups"].forEach((cat) => {
          accumulatingStack += hoverData[cat];
          totalStack.push(accumulatingStack);
        });

        mouseG
          .selectAll("circle")
          .data(totalStack)
          .join("circle")
          .attr("cx", x(hoverData.Year))
          .attr("cy", (d) => y(d / 100))
          .attr("r", 4)
          .style("fill", (d, i) => colorScale(colorScale.domain()[i]))
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
      .style("stroke-width", 0.5)
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
        tooltip.style("opacity", "0");
        resetAreaLayers();
        mouseG.selectAll("circle").style("opacity", "0");
        mouseG.select(".mouse-line").style("opacity", "0");
      });
  });
})();