(function() {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
  
    // Get the container and its dimensions
    const container = document.getElementById("greenhouse-gases-bar-chart");
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.1,
      right: containerWidth * 0.05,
      bottom: containerHeight * 0.1,
      left: containerWidth * 0.15,
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

    // Add the title with subscript
    const title = svg.append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "start")
        .attr("transform", `translate(-${dynamicMargin.left}, -${dynamicMargin.top / 2})`);

    // Add the main title text with CO2 subscripted
    title.append("tspan").text("Average Annual C0");
    title.append("tspan")
        .text("2")
        .attr("baseline-shift", "sub")
        .attr("font-size", "60%"); // Adjust the font size for subscript
    title.append("tspan").text(" Emissions by Household Activity in 2020");

  
    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1); // Scale for end-uses
    const xScale = d3.scaleLinear().range([0, width]);
  
    const colorScale = d3.scaleOrdinal().range([
      "#FFCB05", // Yellow for Electricity
      "#3167A4", // Blue for Gas
    ]);
  
    const xAxis = (g) => g.call(d3.axisBottom(xScale));
    const yAxis = (g) =>
      g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));
  
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + dynamicMargin.bottom)
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .text("Annual CO2 Emission (lbs)");
  
    const tooltip = d3.select("#tooltip");
  
    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("./data/greenhouse-gases/greenhouse-gases4.csv", (d) => ({
      Category: d.Category,
      EndUse: d["End Use"],
      CO2Emission: +d["Annual CO2 Emission (lbs)"],
    })).then((data) => {
      // Get unique end uses
      const endUses = [...new Set(data.map((d) => d.EndUse))];
  
      // Update scales
      yScale.domain(endUses);
      xScale.domain([0, Math.ceil(Math.max(...data.map(d => d.CO2Emission)) / 500) * 500]);
  
      // Draw the y-axis
      svg.append("g").call(yAxis).selectAll(".tick text").attr("class", "chart-labels");
  
      // Draw the x-axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("class", "chart-labels");
  
      // Create groups for each end use
      const endUseGroups = svg
        .selectAll(".end-use-group")
        .data(endUses)
        .enter()
        .append("g")
        .attr("class", "end-use-group")
        .attr("transform", (d) => `translate(0, ${yScale(d)})`);
  
      // Draw the bars for each end use
      endUseGroups
        .selectAll(".bar")
        .data((d) => data.filter((item) => item.EndUse === d))
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d, i, nodes) => {
          const numCategories = nodes.length;
          return i * yScale.bandwidth() / numCategories;
        })
        .attr("x", 0)
        .attr("height", yScale.bandwidth() / 2)
        .attr("width", (d) => xScale(d.CO2Emission))
        .attr("fill", (d) => colorScale(d.Category))
        .on("mouseover", function(event, d) {
          d3.select(this).attr("class", "bar active");
  
          // Show and populate the tooltip
          tooltip
            .html(
              `<div class="tooltip-title">${d.EndUse}</div>
                <table class="tooltip-content">
                  <tr>
                    <td><span class="color-legend" style="background-color: ${colorScale(
                            d.Category
                        )};"></span>Emissions:</td>
                    <td class="value"><strong>${d.CO2Emission}</strong> lbs</td>
                  </tr>
                </table>`
            )
            .style("opacity", 0.9)
            .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
            .style("top", `${event.pageY}px`);
        })
        .on("mousemove", function(event) {
          tooltip
            .style("left", (event.pageX + dynamicMargin.left / 4) + "px")
            .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("class", "bar");
          tooltip.style("opacity", 0);
        });
  
      // Adding the legend
      const legendData = [
        { category: 'Electricity', color: '#FFCB05' },
        { category: 'Gas', color: '#3167A4' },
      ];
  
      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 100}, 20)`);
  
      legend
        .selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);
  
      legend
        .selectAll(".legend-item")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d) => d.color);
  
      legend
        .selectAll(".legend-item")
        .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .attr("class", "chart-labels")
        .text((d) => d.category)
        .attr("text-anchor", "start")
        .attr("fill", "#000");
    });
  })();