(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("us-cities-bar-chart");
  
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);
  
    const tooltip = d3.select(container).select("#tooltip");
  
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 1;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
  
    const dynamicMargin = {
      top: containerHeight * 0.05,
      right: containerWidth * 0.1,
      bottom: containerHeight * 0.1,
      left: containerWidth * 0.37,
    };
  
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    const svg = d3
      .select("#us-cities-bar-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.05);
    const xScale = d3.scaleLinear().range([0, width]);
    const colorScale = d3.scaleOrdinal().range(["#1d476d", "#ffcb03"]);
    const formatDecimal = d3.format(".0f");
  
    const xAxis = (g) =>
      g.call(d3.axisBottom(xScale).tickValues(d3.range(0, 101, 20)).tickFormat((d) => `${d}%`));
    const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));
  
    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv(uscities3, (d) => ({
      category: d.Category,
      subcategory: d.Subcategory,
      underway: +d["Underway"],
      considering: +d["Considering"],
    })).then((data) => {
      const categories = [...new Set(data.map((d) => d.category))];
      const subcategories = [];
  
      // Add separator subcategories to create a gap
      categories.forEach((category) => {
        const subcat = data.filter((d) => d.category === category).map((d) => d.subcategory);
        subcategories.push(...subcat, `${category}_separator`);
      });
  
      yScale.domain(subcategories.reverse());
      xScale.domain([0, 100]);
  
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("class", "chart-labels");
  
      const barGroups = svg
        .selectAll(".bar-group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", (d) => `translate(0, ${yScale(d.subcategory)})`);
  
      const barHeight = yScale.bandwidth();
  
      barGroups
        .append("rect")
        .attr("class", "bar underway")
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", barHeight)
        .attr("width", (d) => xScale(d.underway))
        .attr("fill", colorScale(0))
        .on("mouseover", function (event, d) {
            const hoveredKey = "underway";
            const tooltipX = event.clientX;
            const tooltipY = event.clientY;
  
          tooltip
            .html(
              `<div class="tooltip-title">${d.subcategory}</div>
               <table class="tooltip-content">
                 <tr style="opacity: ${hoveredKey === "underway" ? 1 : 0.5}; font-weight: ${
                hoveredKey === "underway" ? "bold" : "normal"
              };">
                   <td><span class="color-legend" style="background-color: ${colorScale(0)};"></span>Underway:</td>
                   <td class="value">${formatDecimal(d.underway)}%</td>
                 </tr>
                 <tr style="opacity: ${hoveredKey === "considering" ? 1 : 0.5}; font-weight: ${
                hoveredKey === "considering" ? "bold" : "normal"
              };">
                   <td><span class="color-legend" style="background-color: ${colorScale(1)};"></span>Considering:</td>
                   <td class="value">${formatDecimal(d.considering)}%</td>
                 </tr>
               </table>`
            )
            .style("opacity", "0.9")
            .style("left", `${tooltipX + dynamicMargin.right / 4}px`)
            .style("top", `${tooltipY}px`);
  
          d3.select(this).attr("opacity", 0.5);
        })
        .on("mousemove", function (event) {
            const tooltipX = event.clientX;
            const tooltipY = event.clientY;
  
          tooltip
            .style("left", `${tooltipX + dynamicMargin.right / 4}px`)
            .style("top", `${tooltipY}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style("opacity", "0");
        });
  
      barGroups
        .append("rect")
        .attr("class", "bar considering")
        .attr("y", 0)
        .attr("x", (d) => xScale(d.underway))
        .attr("height", barHeight)
        .attr("width", (d) => xScale(d.considering))
        .attr("fill", colorScale(1))
        .on("mouseover", function (event, d) {
            const hoveredKey = "considering";
            const tooltipX = event.clientX;
            const tooltipY = event.clientY;
  
          tooltip
            .html(
              `<div class="tooltip-title">${d.subcategory}</div>
               <table class="tooltip-content">
                 <tr style="opacity: ${hoveredKey === "underway" ? 1 : 0.5}; font-weight: ${
                hoveredKey === "underway" ? "bold" : "normal"
              };">
                   <td><span class="color-legend" style="background-color: ${colorScale(0)};"></span>Underway:</td>
                   <td class="value">${formatDecimal(d.underway)}%</td>
                 </tr>
                 <tr style="opacity: ${hoveredKey === "considering" ? 1 : 0.5}; font-weight: ${
                hoveredKey === "considering" ? "bold" : "normal"
              };">
                   <td><span class="color-legend" style="background-color: ${colorScale(1)};"></span>Considering:</td>
                   <td class="value">${formatDecimal(d.considering)}%</td>
                 </tr>
               </table>`
            )
            .style("opacity", "0.9")
            .style("left", `${tooltipX + dynamicMargin.right / 4}px`)
            .style("top", `${tooltipY}px`);
  
          d3.select(this).attr("opacity", 0.5);
        })
        .on("mousemove", function (event) {
            const tooltipX = event.clientX;
            const tooltipY = event.clientY;
  
          tooltip
            .style("left", `${tooltipX + dynamicMargin.right / 4}px`)
            .style("top", `${tooltipY}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style("opacity", "0");
        });
  
      // Wrap function for text wrapping
      function wrapText(text, width) {
        text.each(function () {
          const elem = d3.select(this);
          const words = elem.text().split(/\s+/).reverse();
          let word;
          let line = [];
          let lineNumber = 0;
          const lineHeight = 1; // ems
  
          const x = elem.attr("x");
          const y = elem.attr("y");
          let dy = parseFloat(elem.attr("dy"));
  
          let tspan = elem.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
  
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = elem
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", `${++lineNumber * lineHeight + dy}em`)
                .text(word);
            }
          }
        });
      }
  
      barGroups
        .append("text")
        .attr("x", -dynamicMargin.left * 0.03)
        .attr("y", barHeight * 0.35)
        .attr("dy", ".35em")
        .attr("class", "chart-labels")
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .text((d) => d.subcategory)
        .each(function () {
          wrapText(d3.select(this), containerWidth * 0.35);
        });
  
      categories.forEach((category) => {
        const subcategoryData = data.filter((d) => d.category === category);
        svg
          .append("text")
          .attr("x", -dynamicMargin.left * 0.03)
          .attr("y", yScale(subcategoryData[0].subcategory) - barHeight * 0.5)
          .attr("class", "chart-labels")
          .attr("text-anchor", "end")
          .attr("fill", "#000")
          .style("font-weight", "bold")
          .text(category);
      });
  
      /* ----------------------- Legend ----------------------- */
      const legend = svg
        .append("g")
        .attr("transform", `translate(0, -${dynamicMargin.top * 0.8})`); // Adjust this value to move legend to the top
  
      const legendData = [
        { key: "Underway", color: "#1d476d" },
        { key: "Considering", color: "#ffcb03" },
      ];
  
      // Calculate the dimensions for legend items
      const legendWidth = width; // Full width for the legends
      const totalGap = legendWidth / (legendData.length + 1); // Gaps between legend items, including space at start and end
      const legendItemSize = legendWidth * 0.04; // Set the width and height to be 3% of the width for the legend items
      const textSpacing = legendItemSize + (totalGap * 0.07); // Space between the legend rectangle and text
  
      const legendGroups = legend
        .selectAll(".legend-group")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-group")
        .attr("transform", (d, i) => `translate(${(i + 1) * totalGap}, 0)`); // Spread items horizontally
  
      legendGroups
        .append("rect")
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .style("fill", (d) => d.color)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("class", "legend-rect");
  
      legendGroups
        .append("text")
        .attr("x", textSpacing)
        .attr("y", legendItemSize / 2)
        .attr("alignment-baseline", "middle")
        .attr("class", "chart-labels")
        .text((d) => d.key);
    });
  })();