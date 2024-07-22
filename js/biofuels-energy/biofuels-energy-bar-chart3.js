(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
  
    // Get the container and its dimensions
    const container = document.getElementById("biofuels-energy-bar-chart3");
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.02,
      right: containerWidth * 0.05,
      bottom: containerHeight * 0.1,
      left: containerWidth * 0.05,
    };
  
    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#biofuels-energy-bar-chart3")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    /* ----------------------- Scales, axes, and color ----------------------- */
  
    const x0 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.1);
  
    const x1 = d3.scaleBand()
      .padding(0.05);
  
    const y = d3.scaleLinear()
      .rangeRound([height, 0]);
  
    const color = d3.scaleOrdinal()
        .range(["#1d476d", "#3167a4", "#8fc8e5", "#d8d8d8"]);
        // .range(["#00274c", "#1d476d", "#3167a4", "#386660", "#e2e27a"]);
        // .range(["#1d476d", "#3167a4", "#8fc8e5", "#ffcb03", "#ffd579"]);
  
    const tooltip = d3.select('#tooltip');
  
    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("./data/biofuels-energy/biofuels-energy5.csv").then((data) => {
      // Extract the keys for the sub-groups
      const subgroups = data.columns.slice(1);
  
      // Extract the unique groups (regions)
      const groups = data.map(d => d.Region);
  
      // Set the domains of the scales
      x0.domain(groups);
      x1.domain(subgroups).rangeRound([0, x0.bandwidth()]);
      y.domain([0, d3.max(data, d => d3.max(subgroups, key => +d[key]))]);
  
      // Append the x-axis
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));
  
      // Append the y-axis
      svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));
  
      // Create groups for each region
      const region = svg.selectAll(".region")
        .data(data)
        .enter().append("g")
        .attr("class", "region")
        .attr("transform", d => `translate(${x0(d.Region)},0)`);
  
      // Create bars for each sub-group
      region.selectAll("rect")
        .data(d => subgroups.map(key => ({ key, value: +d[key] })))
        .enter().append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible").text(`${d.key}: ${d.value}`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
  
      // Add legend
    //   const legend = svg.selectAll(".legend")
    //     .data(subgroups)
    //     .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", (d, i) => `translate(0,${i * 20})`);
  
    //   legend.append("rect")
    //     .attr("x", width - 18)
    //     .attr("width", 18)
    //     .attr("height", 18)
    //     .attr("fill", color);
  
    //   legend.append("text")
    //     .attr("x", width - 24)
    //     .attr("y", 9)
    //     .attr("dy", "0.35em")
    //     .attr("text-anchor", "end")
    //     .text(d => d);
    });
  })();
  