(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("personal-transportation-bar-chart2");
  
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);
  
    const tooltip = d3.select(container).select("#tooltip");
  
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
  
    const dynamicMargin = {
      top: containerHeight * 0.1,
      right: containerWidth * 0.1,
      bottom: containerHeight * 0.15,
      left: containerWidth * 0.15,
    };
  
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    const svg = d3
      .select("#personal-transportation-bar-chart2")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.05);
    const xScale = d3.scaleLinear().range([0, width]);
    const colorScale = d3.scaleOrdinal().range(["#3167A4"]);
    const formatDecimal = d3.format(".0f");
  
    const xAxis = (g) => g
      .call(d3.axisBottom(xScale).ticks(5))
      .call(g => g.select(".domain").attr("stroke", "none"))  // This removes the x-axis line
      .call(g => g.selectAll(".tick line").attr("stroke", "#aaaaaa").attr("stroke-width", "0.2"))  // Make tick lines light grey
      .call(g => g.selectAll(".tick text").attr("class", "chart-labels").attr("fill", "#000"))
      .append("text")    // Adding x-axis label
      .attr("class", "chart-labels")
      .attr("x", width / 2)
      .attr("y", dynamicMargin.bottom / 1.5)
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .text("Intensity (BTU/passenger-mile)");
  
    const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));
  
    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("../../data/mobility/personal-transportation/personal-transportation4.csv").then((data) => {
      data.forEach(d => {
        d.Intensity = +d["Intensity (BTU/passenger-mile)"];
        d.LoadFactor = +d["Load Factor (persons/vehicle)"];
      });
  
      yScale.domain(data.map(d => d.Mode).reverse());
      const maxXValue = Math.ceil(d3.max(data, d => d.Intensity) / 1000) * 1000;
      xScale.domain([0, maxXValue]);
  
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
  
      svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll(".tick text")
        .attr("class", "chart-labels")
        .style("font-weight", "bold");
  
      // Add vertical grid lines
      svg.selectAll("line.vertical-grid")
        .data(xScale.ticks(5))  // Adjust to match tickValues
        .enter()
        .append("line")
        .attr("class", "vertical-grid")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#aaaaaa")
        .attr("stroke-width", "0.2");
  
      svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.Mode))
        .attr("width", d => xScale(d.Intensity))
        .attr("height", yScale.bandwidth())
        .attr("fill", (d, i) => colorScale(i))
        .on('mouseover', function (event, d) {
          d3.select(this).attr("opacity", 0.5);
  
          tooltip.html(`
            <div class="tooltip-title">${d.Mode}</div>
            <table class="tooltip-content">
              <tr>
                <td>Load Factor:</td>
                <td class="value"><strong>${d.LoadFactor}</strong> persons/vehicle</td>
              </tr>
              <tr>
                <td>Intensity:</td>
                <td class="value"><strong>${d.Intensity}</strong> BTU/passenger-mile</td>
              </tr>
            </table>
          `)
            .style('opacity', '0.9')
            .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
            .style("top", `${event.pageY}px`);
        })
        .on("mousemove", function (event) {
          tooltip.style("left", `${event.pageX + dynamicMargin.left / 4}px`)
            .style("top", `${event.pageY}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style('opacity', '0');
        });
  
      svg.selectAll(".label")
        .data(data)
        .enter().append("text")
        .attr("class", "chart-labels")
        .attr("x", d => xScale(d.Intensity) + 5)
        .attr("y", d => yScale(d.Mode) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(d => d.LoadFactor)
        .attr("fill", "red");  // Make the load factor labels red
  
      // Add a note/label for Load Factor
      svg.append("text")
        .attr("x", width - dynamicMargin.right)
        .attr("y", -dynamicMargin.top / 2)
        .attr("class", "chart-labels")
        .attr("text-anchor", "end")
        .attr("fill", "red")
        .text("Load Factor (persons/vehicle)");
    });
  })();