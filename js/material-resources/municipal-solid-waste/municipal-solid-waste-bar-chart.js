(function () {
   /* ----------------------- Create Tooltip ------------------------ */
   const container = document.getElementById("municipal-solid-waste-bar-chart");

   const tooltipDiv = document.createElement("div");
   tooltipDiv.id = "tooltip";
   tooltipDiv.className = "tooltip";
   container.appendChild(tooltipDiv);

   const tooltip = d3.select(container).select("#tooltip");

   /* ----------------------- Dynamic dimensions ----------------------- */
   const aspectRatio = 0.6;

   const containerWidth = container.offsetWidth || 960; // Set a default width if offsetWidth is zero
   const containerHeight = containerWidth * aspectRatio;

   const dynamicMargin = {
      top: containerHeight * 0.02,
      right: containerWidth * 0.1,
      bottom: containerHeight * 0.15,
      left: containerWidth * 0.1,
   };

   const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
   const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

   const svg = d3
      .select("#municipal-solid-waste-bar-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

   const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
   const y = d3.scaleLinear().rangeRound([height, 0]); // Invert y-axis to start from the bottom
   const color = d3.scaleOrdinal().range(["#8FC8E5"]);

   /* ----------------------- Loading and processing data ----------------------- */
   d3.csv("../../data/material-resources/municipal-solid-waste/municipal-solid-waste4.csv").then(data => {

      x.domain(data.map(d => d.Material));
      y.domain([0, d3.max(data, d => +d.Recovered)]).nice();

      svg.append("g")
         .selectAll("rect")
         .data(data)
         .enter().append("rect")
         .attr("x", d => x(d.Material))
         .attr("y", d => y(d.Recovered))
         .attr("width", x.bandwidth())
         .attr("height", d => height - y(d.Recovered)) // Adjust for vertical bars
         .attr("fill", (d, i) => color(i))
         .style("opacity", 1) // Default opacity
         .on("mouseover", function (event, d) {
            d3.select(this)
               .style("opacity", 0.5); // Reduce opacity on hover

            tooltip.style("display", "block");
            tooltip.html(`
               <div class="tooltip-title">${d.Material}</div>
               <table class="tooltip-content">
                  <tr>
                     <td>Recovered: </td>
                     <td class="value">${d.Recovered}%</td>
                  </tr>
               </table>
            `);
         })
         .on("mousemove", function (event) {
            tooltip.style("left", `${event.pageX + dynamicMargin.left / 4}px`)
               .style("top", `${event.pageY}px`);
         })
         .on("mouseout", function () {
            d3.select(this)
               .style("opacity", 1); // Reset opacity on mouse out

            tooltip.style("display", "none");
         });

      // Append x-axis and apply class to tick texts
      svg.append("g")
         .attr("class", "axis")
         .attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(x).tickSizeOuter(0).tickSizeInner(0).tickPadding(10))
         .selectAll(".tick text") // Select all x-axis tick texts
         .attr("class", "chart-labels");

      // Append y-axis and apply class to tick texts
      svg.append("g")
         .attr("class", "axis")
         .call(d3.axisLeft(y)
             .ticks(6)
             .tickFormat(d => d + "%")) // Format ticks as percentages
         .selectAll(".tick text") // Select all y-axis tick texts
         .attr("class", "chart-labels"); // Apply the class
      
      svg.append("text")
         .attr("x", -height / 2)
         .attr("y", -dynamicMargin.left * 0.7)
         .attr("class", "chart-labels")
         .attr("text-anchor", "middle")
         .attr("fill", "#000")
         .attr("transform", "rotate(-90)")
         .text("% Total Waste Generation");
   });
})();