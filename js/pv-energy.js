(function () {
    const aspectRatio = 0.7; // Define an aspect ratio for the chart
  
    // Get the container and its dimensions
    const container = document.getElementById("pv-chart");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.1, // 10% of the container height
      right: containerWidth * 0.15, // 15% of the container width
      bottom: containerHeight * 0.1, // 10% of the container height
      left: containerWidth * 0.07, // 7% of the container width
    };
  
    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#pv-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    // Data
    const data = [
      {
        technology: "Crystalline single crystalline silicon (Si)",
        cellEfficiency: 27.6,
        moduleEfficiency: 24.9,
      },
      {
        technology: "Crystalline Multicrystalline Si",
        cellEfficiency: 23.3,
        moduleEfficiency: 20.4,
      },
      {
        technology: "Crystalline Multi-junction Gallium arsenide (GaAs)",
        cellEfficiency: 47.6,
        moduleEfficiency: 38.9,
      },
      {
        technology: "Thin film Cadmium telluride (CdTe)",
        cellEfficiency: 22.6,
        moduleEfficiency: 19.5,
      },
      {
        technology: "Thin film CIGS",
        cellEfficiency: 23.6,
        moduleEfficiency: 19.9,
      },
      {
        technology: "Emerging Perovskite/Si tandem",
        cellEfficiency: 33.9,
        moduleEfficiency: 0, // Assuming no module efficiency data for this technology
      },
      {
        technology: "Emerging Perovskite",
        cellEfficiency: 26.1,
        moduleEfficiency: 19.2,
      },
      {
        technology: "Emerging Organic",
        cellEfficiency: 19.2,
        moduleEfficiency: 14.5,
      },
    ];
  
    // X and Y scales
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);
  
    // X domain is the PV technologies
    x.domain(data.map((d) => d.technology));
    // Y domain is the maximum of cell and module efficiencies
    y.domain([0, d3.max(data, (d) => Math.max(d.cellEfficiency, d.moduleEfficiency))]);
  
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dy", "0.5em")
      .style("text-anchor", "end");
  
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("dy", "-0.5em")
      .style("text-anchor", "end");
  
    // Bars for cell efficiency
    svg.selectAll(".cell-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell-bar")
      .attr("x", (d) => x(d.technology))
      .attr("y", (d) => y(d.cellEfficiency))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - y(d.cellEfficiency))
      .attr("fill", "steelblue");
  
    // Bars for module efficiency
    svg.selectAll(".module-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "module-bar")
      .attr("x", (d) => x(d.technology) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.moduleEfficiency))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => height - y(d.moduleEfficiency))
      .attr("fill", "orange");
  
    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 120},${-dynamicMargin.top / 2})`);
  
    legend.append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", "steelblue");
  
    legend.append("text")
      .attr("x", 30)
      .attr("y", 20)
      .attr("dy", "0.5em")
      .text("Cell Efficiency");
  
    legend.append("rect")
      .attr("x", 10)
      .attr("y", 30)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", "orange");
  
    legend.append("text")
      .attr("x", 30)
      .attr("y", 40)
      .attr("dy", "0.5em")
      .text("Module Efficiency");
  
  })();
  