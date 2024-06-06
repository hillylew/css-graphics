(function () {
  const aspectRatio = 0.75; // Define an aspect ratio for the chart

  // Get the container and its dimensions
  const container = document.getElementById("interactive-map");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.05, // 5% of the container height
    right: containerWidth * 0.05, // 15% of the container width
    bottom: containerHeight * 0.15, // 10% of the container height
    left: containerWidth * 0.08, // 5% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#column-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    // Define the tooltip
    var tooltip = d3.select("#tooltip3");
  
    // Load the CSV data
    d3.csv("./data/graph-3-data.csv").then(function (data) {
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
        .attr("class", "chart-labels")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
  
      // Add Y axis
      const y = d3
        .scaleLinear()
        .domain([0, 60]) 
        .nice()
        .range([height, 0]);
  
      svg
        .append("g")
        .attr("class", "chart-labels")
        .call(d3.axisLeft(y).tickFormat((d) => `${d}%`).ticks(6)); 
  
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
          .style("opacity", 0.9)
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
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`);
      };
  
      // Tooltip hide function
      var hideGroupTooltip = function () {
        tooltip.style("opacity", 0);
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
        .attr("class", "chart-labels")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + dynamicMargin.bottom / 2)
        .text("System Size (population served)");
  
      // Legend
      const legend = svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "start") 
        .selectAll("g")
        .data(subgroups.slice())
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`); 
  
      legend
        .append("rect")
        .attr("x", width - 150) 
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);
  
      legend
        .append("text")
        .attr("class", "chart-labels")
        .attr("x", width - 120) 
        .attr("y", 10)
        .attr("dy", "0.35em") 
        .text((d) => d);
    });
  })();
  