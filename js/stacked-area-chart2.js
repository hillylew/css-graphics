(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
  
    // Get the container and its dimensions
    const container = document.getElementById("stacked-area-chart2");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.1,
      right: containerWidth * 0.12,
      bottom: containerHeight * 0.1,
      left: containerWidth * 0.05,
    };
  
    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#stacked-area-chart2")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    /* ----------------------- X and Y Scales ----------------------- */
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
  
    const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(y).tickFormat((d) => d);
  
    const colorScale = d3
    .scaleOrdinal()
    .domain(["Biomass", "Hydroelectric", "Wind", "Solar",  "Geothermal"])
    .range(["#eb5250", "#6298c6", "#75bf70", "#ae71b6", "#f38f53"]);
    // .range(["#1d476d", "#3167a4", "#8fc8e5", "#ffcb03", "#ffd579"]);
  
  
    const tooltip = d3.select("#tooltip");
  
    /* ----------------------- Load and process the CSV data ----------------------- */
    d3.csv("./data/graph-9-data.csv").then((data) => {
      // Parse years and convert string values to numbers
      data.forEach((d) => {
        d.Year = new Date(+d.Year, 0, 1);
        for (let prop in d) {
          if (prop !== "Year") d[prop] = +d[prop];
        }
      });
  
      // Stack the data
      const stack = d3.stack().keys(["Biomass", "Hydroelectric", "Wind", "Solar",  "Geothermal"]);
      const stackedData = stack(data);
  
      /* ----------------------- Update the scale domains with the processed data ----------------------- */
      x.domain(d3.extent(data, (d) => d.Year));
      const maxYValue =
        Math.ceil(
          d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) 
        );
      y.domain([0, maxYValue]);
  
      // Draw the X-axis
      const xTickValues = x.ticks().concat(new Date(2023, 0, 1)); // Add 2023 as a Date object
      xAxis.tickValues(xTickValues);
  
      const xAxisGroup = svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
  
      xAxisGroup
        .selectAll(".tick text")
        .attr("class", "chart-labels")
        .style("text-anchor", (d) => {
          return d.getFullYear() === 1990
            ? "start"
            : d.getFullYear() === 2023
            ? "end"
            : "middle";
        });
  
      // Draw the Y-axis
      const yAxisGroup = svg
        .append("g")
        .call(yAxis)
        .attr("class", "chart-labels");
  
      // Append "in millions" label
      yAxisGroup
        .append("text")
        .attr("class", "chart-labels")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
        .style("fill", "#000")
        .text("Quads");
  
      /* ----------------------- Draw the chart ----------------------- */
      // Define the area generator
      const area = d3
        .area()
        .x((d) => x(d.data.Year))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]));
  
      // Define the line generator
      const lineGenerator = d3
        .line()
        .x((d) => x(d.data.Year))
        .y((d) => y(d[1])); // Using the top edge of the area for the line
  
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
  
      // Add the line paths for each group
      layers
        .append("path")
        .attr("d", lineGenerator)
        .style("fill", "none")
        .style("stroke", (d) => colorScale(d.key))
        .style("stroke-width", 0.5);
  
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
            "fill-opacity", 1);
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
  
        // Position tooltip
        tooltip
          .style("opacity", 0.9)
          .style("left", `${event.pageX + dynamicMargin.left/4}px`)
          .style("top", `${event.pageY}px`);
  
        const formatNumber = d3.format(",");
        if (hoverData) {
          /* ----------------------- Highlight the area layer being hovered over ----------------------- */
          let cumulative = 0;
          let foundLayer = false;
      
          // Look through each layer to find which one we're hovering over
          stackedData.forEach((layer) => {
            const y0 = y(cumulative); // Bottom of the layer
            cumulative += hoverData[layer.key];
            const y1 = y(cumulative); // Top of the layer
      
            // Check if yPos is between top and bottom of the layer
            if (yPos >= y1 && yPos < y0) {
              // Highlight the current layer
              highlightAreaLayer(layer.key);
              foundLayer = true;
            }
          });
    
          
  
          tooltip.html(`
                <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
                <table class="tooltip-content">
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale(
                        "Geothermal"
                        )};"></span>Geothermal</td>
                        <td class="value">${formatNumber(hoverData.Geothermal)}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale(
                            "Solar"
                        )};"></span>Solar</td>
                        <td class="value">${formatNumber(
                          hoverData.Solar
                        )}</td>
                    </tr>
                    <tr>
                    <td><span class="color-legend" style="background-color: ${colorScale(
                        "Hydroelectric"
                    )};"></span>Hydroelectric</td>
                    <td class="value">${formatNumber(
                      hoverData.Hydroelectric
                    )}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale(
                          "Wind"
                        )};"></span>Wind</td>
                        <td class="value">${formatNumber(hoverData.Wind)}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale(
                          "Biomass"
                        )};"></span>Biomass</td>
                        <td class="value">${formatNumber(hoverData.Biomass)}</td>
                    </tr>
                </table>
                <table class="tooltip-total">
                  <tr>
                      <td><strong>Total</strong></td>
                      <td class="value">${formatNumber(
                        hoverData.Biomass + hoverData.Wind + hoverData.Solar + hoverData.Hydroelectric + hoverData.Geothermal
                      )}</td>
                  </tr>
                </table>
              `);
  
          // Positioning the circles
          const totalStack = [];
          let accumulatingStack = 0;
  
          // Calculate the top edge of each stack element
          ["Biomass", "Hydroelectric", "Wind", "Solar",  "Geothermal"].forEach((cat) => {
            accumulatingStack += hoverData[cat];
            totalStack.push(accumulatingStack);
          });
  
          mouseG
            .selectAll("circle")
            .data(totalStack)
            .join("circle")
            .attr("cx", x(hoverData.Year))
            .attr("cy", (d) => y(d))
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
          resetAreaLayers()
          mouseG.selectAll("circle").style("opacity", "0");
          mouseG.select(".mouse-line").style("opacity", "0");
        });
    });
  })();
  