(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
    
    // Get the container and its dimensions
    const container = document.getElementById("greenhouse-gases-bar-chart");
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
    
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.02,
      right: containerWidth * 0.15,
      bottom: containerHeight * 0.1,
      left: containerWidth * 0.12,
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
    
    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1); // Scale for categories
    const subYScale = d3.scaleBand().padding(0.05); // Scale for end-uses within categories
    const xScale = d3.scaleLinear().range([0, width]);
    
    const colorScale = d3
      .scaleOrdinal()
      .range([
        "#1d476d",
        "#3167a4",
        "#8fc8e5",
        "#386660",
        "#ffcb03",
        "#ce5845",
        "#ed974a",
      ]);
    
    const xAxis = (g) => g.call(d3.axisBottom(xScale));
    const yAxis = (g) =>
      g
        .call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));
    
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
      // Nest data by category
      const nestedData = d3.group(data, d => d.Category);

      // Get unique categories and end uses
      const categories = [...nestedData.keys()];
      const endUses = [...new Set(data.map((d) => d.EndUse))];
      
      // Update scales
      yScale.domain(categories);
      xScale.domain([0, Math.max(...data.map(d => d.CO2Emission))]);
      subYScale.domain(endUses).range([0, yScale.bandwidth()]);
      
      // Draw the y-axis
      svg.append("g").call(yAxis).selectAll(".tick text").attr("class", "chart-labels");
      
      // Draw the x-axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("class", "chart-labels");
      
      // Create groups for each category
      const categoryGroups = svg
        .selectAll(".category-group")
        .data(categories)
        .enter()
        .append("g")
        .attr("class", "category-group")
        .attr("transform", (d) => `translate(0, ${yScale(d)})`);
      
      // Draw the bars for each end use within categories
      categoryGroups
        .selectAll(".bar")
        .data((d) => nestedData.get(d))
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => subYScale(d.EndUse))
        .attr("x", 0)
        .attr("height", subYScale.bandwidth())
        .attr("width", (d) => xScale(d.CO2Emission))
        .attr("fill", (d) => colorScale(d.Category))
        .on("mouseover", function (event, d) {
          d3.select(this).attr("class", "bar active");
          
          // Show and populate the tooltip
          tooltip
            .html(
              `<div class="tooltip-title">${d.EndUse}</div>
              <table class="tooltip-content">
                <tr>
                  <td>Category:</td>
                  <td class="value"><strong>${d.Category}</strong></td>
                </tr>
                <tr>
                  <td>Emission:</td>
                  <td class="value"><strong>${d.CO2Emission}</strong> lbs</td>
                </tr>
              </table>`
            )
            .style("opacity", 0.9)
            .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
            .style("top", `${event.pageY}px`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", (event.pageX + dynamicMargin.left / 4) + "px")
            .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("class", "bar");
          tooltip.style("opacity", 0);
        });
      
      /* ----------------------- Adding labels ----------------------- */
      categoryGroups
        .selectAll(".label")
        .data((d) => nestedData.get(d))
        .enter()
        .append("text")
        .attr("class", "chart-labels")
        .attr("x", (d) => xScale(d.CO2Emission) + 5)
        .attr("y", (d) => subYScale(d.EndUse) + subYScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text((d) => d.EndUse)
        .attr("fill", "#000");
    });
  })();