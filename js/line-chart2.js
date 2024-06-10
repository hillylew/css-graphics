(function () {
    const aspectRatio = 0.7; // Define an aspect ratio for the chart
  
    // Get the container and its dimensions
    const container = document.getElementById("line-chart2");
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
      .select("#line-chart2")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    // X and Y scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
  
    // Define the axes
    const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));

    // const yAxis = d3.axisLeft(y).tickFormat(d3.format("$"));
    const yAxis = d3.axisLeft(y).tickFormat(d3.format("$")).ticks(4); // CHECK THIS 
  
    const tooltip = d3.select("#tooltip6");
  
    // Load and process the CSV data
    d3.csv("./data/graph-7-data.csv").then((data) => {
      // Parse years and convert string values to numbers
      data.forEach((d) => {
        d.Year = new Date(+d.Year, 0, 1);
        d["$/MWh"] = +d["$/MWh"];
      });
  
      // Update the scale domains with the processed data
      x.domain(d3.extent(data, (d) => d.Year));
      y.domain([0, Math.ceil(d3.max(data, (d) => d["$/MWh"]) / 100) * 100]);

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
        .text("$/MWh");
  
      const xAxisGroup = svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

      xAxisGroup.call(xAxis);
      xAxisGroup.selectAll(".tick text").attr("class", "chart-labels");

      // Define the line generator
      const lineGenerator = d3
        .line()
        .x((d) => x(d.Year))
        .y((d) => y(d["$/MWh"]));
  
      const mainLine = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "#377eb8")
        .style("stroke-width", 1.5);

      // Add the 2030 goal dashed horizontal line
      const goalValue = 30;
      const goalLine = svg.append("line")
        .attr("x1", 0)
        .attr("y1", y(goalValue))
        .attr("x2", width)
        .attr("y2", y(goalValue))
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "6,6");
      
      // Add the label for the 2030 goal
      const goalLabel = svg.append("text")
        .attr("class", "chart-labels")
        .attr("x", width + 5) // Slightly offset to the right of the line
        .attr("y", y(goalValue))
        .attr("dy", "0.35em") // Vertically align with the line
        .attr("text-anchor", "start")
        .attr("fill", "#e41a1c")
        .text("2030 Goal");

      // Highlight function for goal line
      function highlightGoal() {
        goalLine
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "6,6");
        mainLine.style("opacity", 0.2);
      }

      // Reset function for goal line
      function resetHighlight() {
        goalLine
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4");
        mainLine.style("opacity", 1);
      }

      goalLabel
        .on("mouseover", highlightGoal)
        .on("mouseout", resetHighlight);
  
      function onMouseMove(event) {
        const [xPos, yPos] = d3.pointer(event, this);
        const date = x.invert(xPos);
        const hoverData = data.find(
          (d) => d.Year.getFullYear() === date.getFullYear()
        );
  
        // Position tooltip
        tooltip
          .style("opacity", 0.9)
          .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
          .style("top", `${event.pageY}px`);
  
        const formatNumber = d3.format(",");
        if (hoverData) {
          tooltip.html(`
                <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
                <table class="tooltip-content">
                    <tr>
                        <td><span class="color-legend" style="background-color: #377eb8"
                        )};"></span>Cost</td>
                        <td class="value">$${formatNumber(
                          hoverData["$/MWh"] 
                        )}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: #e41a1c"
                        )};"></span>2030 Goal</td>
                        <td class="value">$30</td>
                    </tr>
                </tr>
                </table>
              `);
  
          mouseG
            .selectAll("circle")
            .attr("cx", x(hoverData.Year))
            .attr("cy", y(hoverData["$/MWh"]))
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
        });
    });
})();
