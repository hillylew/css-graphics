(function () {
   /* ----------------------- Create Tooltip ------------------------ */
   const container = document.getElementById("carbon-footprint-bar-chart");

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

  const svg = d3.select("#carbon-footprint-bar-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- Scales, axes, and color ----------------------- */
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleBand().range([height, 0]).padding(0.05);
  const colorScale = d3.scaleOrdinal().range([
      "#CE5845",
  ]);

  const formatDecimal = d3.format(".2f");

  const xAxis = (g) => g
      .call(d3.axisBottom(xScale).ticks(5))
      .call(g => g.select(".domain").attr("stroke", "none"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#aaaaaa").attr("stroke-width", "0.2"))
      .call(g => g.selectAll(".tick text").attr("class", "chart-labels").attr("fill", "#000"));

  const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));

  // svg.append("text")
  //     .attr("x", width / 2)
  //     .attr("y", height + dynamicMargin.bottom * 0.7)
  //     .attr("class", "chart-labels")
  //     .attr("text-anchor", "middle")
  //     .attr("fill", "#000")
  //     .text("Pounds");

  /* ----------------------- Loading and processing data ----------------------- */
  d3.csv("../../data/sustainability-indicators/carbon-footprint/carbon-footprint2.csv", (d) => ({
      food: d.Food,
      pounds: +d.Pounds,
  })).then((data) => {
      data.reverse(); // Reverse the data order for bars

      // xScale.domain([0, d3.max(data, (d) => d.pounds)]);
      xScale.domain([0, Math.ceil(d3.max(data, (d) => d.pounds))]);
      yScale.domain(data.map((d) => d.food));
      colorScale.domain(data.map((d) => d.food));

      svg.append("g")
          .call(yAxis)
          .selectAll(".tick text")
          .attr("class", "chart-labels")
          .style("font-weight", "bold");

      // const xAxisGroup = svg.append("g")
      //     .attr("transform", `translate(0,${height})`)
      //     .call(xAxis);

      // svg.selectAll("line.vertical-grid")
      //     .data(xScale.ticks(5))
      //     .enter()
      //     .append("line")
      //     .attr("class", "vertical-grid")
      //     .attr("x1", d => xScale(d))
      //     .attr("x2", d => xScale(d))
      //     .attr("y1", 0)
      //     .attr("y2", height)
      //     .attr("stroke", "#aaaaaa")
      //     .attr("stroke-width", "0.2");

      /* ----------------------- Drawing bars ----------------------- */
      svg.selectAll(".bar")
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", 0)
          .attr("y", (d) => yScale(d.food))
          .attr("width", (d) => xScale(d.pounds))
          .attr("height", yScale.bandwidth())
          .attr("fill", (d) => colorScale(d.food))
          .on("mouseover", function (event, d) {
              d3.select(this).attr("opacity", 0.5);

              // tooltip.transition()
              //     .duration(200)
              //     .style("opacity", .9);
              // tooltip.html(`
              //     <div class="tooltip-title">${d.food}</div>
              //     <table class="tooltip-content">
              //       <tr>
              //           <td>CO<sub>2</sub>e:</td>
              //           <td class="value"><strong>${formatDecimal(d.pounds)}</strong></td>
              //       </tr>
              //   </table>
              // `)
              //     .style("left", (event.pageX + 10) + "px")
              //     .style("top", (event.pageY - 28) + "px");
          })
          .on("mousemove", function (event) {
              tooltip.style("left", `${event.pageX + dynamicMargin.left / 4}px`)
                .style("top", `${event.pageY}px`);
          })
          .on("mouseout", function () {
              d3.select(this).attr("opacity", 1);
              tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
          });

      /* ----------------------- Adding labels ----------------------- */
      svg.selectAll(".label")
          .data(data)
          .enter()
          .append("text")
          .attr("class", "chart-labels")
          .attr("x", (d) => xScale(d.pounds) + 3)
          .attr("y", (d) => yScale(d.food) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .text((d) => formatDecimal(d.pounds))
          .attr("fill", "#000");
  });
})();