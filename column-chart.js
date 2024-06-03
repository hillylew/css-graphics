(function () {
    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 150, bottom: 50, left: 60 },
      width = 850 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#column-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Define the tooltip
    var tooltip = d3.select("#tooltip2");
  
    // Load the CSV data
    d3.csv("graph-3-data.csv").then(function (data) {
      // Process the data
      data.forEach((d) => {
        d.Population = +d.Population;
        d["Percent of Population"] = +d["Percent of Population"];
        d["Number of CWSs"] = +d["Number of CWSs"];
        d["Percent of CWSs"] = +d["Percent of CWSs"];
      });
  
      // List of subgroups (header of the CSV)
      const subgroups = ["Percent of Population", "Percent of CWSs"];
  
      // List of groups
      const groups = data.map((d) => d["System Size"]);
  
      // Add X axis
      const x = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
  
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .style("font-size", "12px")
        .call(d3.axisBottom(x));
  
      // Add Y axis
      const y = d3
        .scaleLinear()
        .domain([0, 60]) // Set the maximum y-axis value to 60%
        .nice()
        .range([height, 0]);
  
      svg
        .append("g")
        .style("font-size", "12px")
        .call(d3.axisLeft(y).tickFormat((d) => `${d}%`).ticks(6)); // Adjust ticks to have 6 increments
  
      // Another scale for subgroup position
      const xSubgroup = d3
        .scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding(0.05);
  
      // Color palette
      const color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(["#f16248", "#32a28d"]);
  
      const formatNumber = d3.format(",");
  
      // Tooltip show function
      var showGroupTooltip = function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(`
          <div class="tooltip-title">${d["System Size"]}</div>
          <table class="tooltip-content">
              <tr>
              <td>
                  <span class="color-legend" style="background-color: ${color(
                    "Percent of Population"
                  )};"></span>
                  Population Served (in millions)
              </td>
              <td class="value">${d.Population}</td>
              </tr>
              <tr>
              <td>
                  <span class="color-legend" style="background-color: ${color(
                    "Percent of CWSs"
                  )};"></span>
                  Number of CWSs
              </td>
              <td class="value">${formatNumber(d["Number of CWSs"])}</td>
              </tr>
          </table>
      `)
  
          .style(
            "left",
            `${d3.pointer(event, svg.node())[0] + margin.left}px`
          )
          .style(
            "top",
            `${d3.pointer(event, svg.node())[1] + margin.top}px`
          );
      };
  
      // Tooltip hide function
      var hideGroupTooltip = function () {
        tooltip.style("opacity", 0);
        // Optionally reset the bar opacities
        // d3.selectAll(".bar-group rect").style("opacity", 0.8);
      };
  
      // Grouped bar chart code
      svg
        .append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", (d) => `translate(${x(d["System Size"])},0)`)
        .on("mouseover", showGroupTooltip)
        .on("mouseout", hideGroupTooltip)
        .selectAll("rect")
        .data((d) =>
          subgroups.map((key) => ({ key: key, value: d[key] }))
        )
        .enter()
        .append("rect")
        .attr("x", (d) => xSubgroup(d.key))
        .attr("y", (d) => y(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", (d) => height - y(d.value))
        .attr("fill", (d) => color(d.key));
  
      // Add x-axis label
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 2 + 10)
        .style("font-size", "12px")
        .text("System Size (population served)");
  
      // Legend
      const legend = svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "start") // Changed from "end" to "start"
        .selectAll("g")
        .data(subgroups.slice())
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`); // Adjusted the position to the top right
  
      legend
        .append("rect")
        .attr("x", width - 150) // Position the rect closer to the right edge
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);
  
      legend
        .append("text")
        .attr("x", width - 120) // Position the text to the right of the rect
        .attr("y", 10)
        .style("font-size", "12px")
        .attr("dy", "0.35em") // Adjust vertical alignment if necessary
        .text((d) => d);
    });
  })();
  