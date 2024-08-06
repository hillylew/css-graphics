(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("personal-transportation-bar-chart");
  
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
      top: containerHeight * 0.02,
      right: containerWidth * 0.1,
      bottom: containerHeight * 0.15,
      left: containerWidth * 0.15,
    };
  
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    const svg = d3
      .select("#personal-transportation-bar-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1);
    const xScale = d3.scaleLinear().range([0, width]);
    const colorScale = d3.scaleOrdinal().range(["#3167A4"]);
    const formatNumber = d3.format(",");
  
    const xAxis = (g) => g
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d / 1000}`))
      .call(g => g.select(".domain").attr("stroke", "none"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#aaaaaa").attr("stroke-width", "0.2"))
      .call(g => g.selectAll(".tick text").attr("class", "chart-labels").attr("fill", "#000"));
  
    const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));
  
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + dynamicMargin.bottom * 0.7)
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .text("Thousands");
  
    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("../../data/mobility/personal-transportation/personal-transportation3.csv", (d) => ({
      mode: d.Modes,
      quantity: +d["Quantity (thousands)"],
    })).then((data) => {
      yScale.domain(data.map(d => d.mode).reverse());  // Reverse the order of the domains
  
      const maxXValue = Math.ceil(d3.max(data, d => d.quantity) / 20000) * 20000;  // Adjusted for the unit in thousands
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
        .attr("y", d => yScale(d.mode))
        .attr("width", d => xScale(d.quantity))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.mode))
        .on('mouseover', function (event, d) {
          d3.select(this).attr("opacity", 0.5);
          
  
          tooltip.html(`
            <div class="tooltip-title">${d.mode}</div>
            <table class="tooltip-content">
              <tr>
                <td>Quantity:</td>
                <td class="value"><strong>${formatNumber(d.quantity)}</strong> (thousands)</td>
              </tr>
            </table>
          `)
            .style('opacity', '0.9')
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mousemove", function (event) {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style('opacity', '0');
        });
  
    //   svg.selectAll(".label")
    //     .data(data)
    //     .enter().append("text")
    //     .attr("class", "chart-labels")
    //     .attr("x", d => xScale(d.quantity) + 5)
    //     .attr("y", d => yScale(d.mode) + yScale.bandwidth() / 2)
    //     .attr("dy", "0.35em")
    //     .attr("text-anchor", "start")
    //     .text(d => formatDecimal(d.quantity))
    //     .attr("fill", "#000");
    });
  })();