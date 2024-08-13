(function() {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("municipal-solid-waste-line-chart");

    // Check if the container exists to prevent errors
    if (!container) {
      console.error("Container with ID 'municipal-solid-waste-line-chart' not found.");
      return;
    }

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    const aspectRatio = 0.6;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.1,  // Increased top margin for more space
        right: containerWidth * 0.3,
        bottom: containerHeight * 0.05,
        left: containerWidth * 0.05,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#municipal-solid-waste-line-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    // X and Y scales
    const x = d3.scaleTime().range([0, width]);
    const yLeft = d3.scaleLinear().range([height, 0]);
    const yRight = d3.scaleLinear().range([height, 0]);

    // Load the CSV file and process it
    d3.csv(msw1).then((data) => { 
        // Parse years and convert string values to numbers
        data.forEach((d) => {
            d.year = new Date(+d.year, 0, 1);
            d.totalMSW = +d.totalMSW;
            d.perCapita = +d.perCapita;
        });

        // Update scale domains
        x.domain(d3.extent(data, (d) => d.year));
        const maxTotalMSW = Math.ceil(d3.max(data, (d) => d.totalMSW) / 50) * 50 + 50;
        const maxPerCapita = Math.ceil(d3.max(data, (d) => d.perCapita) / 500) * 500 + 500;

        yLeft.domain([0, maxTotalMSW]);
        yRight.domain([0, maxPerCapita]);

        // Create X and Y axes
        const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(d3.timeYear.every(10));
        const startYear = d3.min(data, (d) => d.year.getFullYear());
        const endYear = d3.max(data, (d) => d.year.getFullYear());

        const xTickValues = x.ticks(d3.timeYear.every(10));
        if (!xTickValues.some((d) => d.getFullYear() === startYear)) {
            xTickValues.unshift(new Date(startYear, 0, 1));
        }
        if (!xTickValues.some((d) => d.getFullYear() === endYear)) {
            xTickValues.push(new Date(endYear, 0, 1));
        }
        xAxis.tickValues(xTickValues);

        const yAxisLeft = d3.axisLeft(yLeft).ticks(6).tickSize(5).tickPadding(5);
        const yAxisRight = d3.axisRight(yRight).ticks(6).tickSize(5).tickPadding(5);

        // Add X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll(".tick text")
            .attr("class", "chart-labels");

        // Add left Y-axis
        const yAxisGroupLeft = svg.append("g").call(yAxisLeft);
        yAxisGroupLeft.selectAll(".domain")
            .style("stroke", "#CE5845")
            .style("stroke-width", 1);
        yAxisGroupLeft.selectAll(".tick text")
            .style("fill", "#CE5845")
            .attr("class", "chart-labels");

        // Add right Y-axis
        const yAxisGroupRight = svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(yAxisRight);
        yAxisGroupRight.selectAll(".domain")
            .style("stroke", "#3167A4")
            .style("stroke-width", 1);
        yAxisGroupRight.selectAll(".tick text")
            .style("fill", "#3167A4")
            .attr("class", "chart-labels");

        // Define the lines
        const lineTotalMSW = d3.line()
            .x((d) => x(d.year))
            .y((d) => yLeft(d.totalMSW));
        const linePerCapita = d3.line()
            .x((d) => x(d.year))
            .y((d) => yRight(d.perCapita));

        // Add the Total MSW line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#CE5845")
            .attr("stroke-width", 1.5)
            .attr("d", lineTotalMSW)
            .attr("class", "line-path");

        // Add the Per Capita line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#3167A4")
            .attr("stroke-width", 1.5)
            .attr("d", linePerCapita)
            .attr("class", "line-path");

        // Add circles to the lines at each data point
        svg.selectAll(".dot-totalMSW")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-totalMSW")
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => yLeft(d.totalMSW))
            .attr("r", 2)
            .attr("fill", "#CE5845");

        svg.selectAll(".dot-perCapita")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-perCapita")
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => yRight(d.perCapita))
            .attr("r", 2)
            .attr("fill", "#3167A4");

        // Add labels for the left y-axis
        yAxisGroupLeft.append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, -${dynamicMargin.top / 2})`) // Position above axis
            .attr("x", 0) // Center horizontally
            .style("fill", "#CE5845")
            .text("million tons");
            // .each(function() { wrapText(d3.select(this), dynamicMargin.left * 2); });

        // Add labels for the right y-axis
        yAxisGroupRight.append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, -${dynamicMargin.top / 2})`) // Position above axis
            .attr("x", 0) // Center horizontally
            .style("fill", "#3167A4")
            .text("lbs/person");
            // .each(function() { wrapText(d3.select(this), dynamicMargin.right * 2); });

        // Create a rect for listening to mouse events
        svg.append("rect")
            .attr("class", "listening-rect")
            .attr("width", width + dynamicMargin.left / 4)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", onMouseMove)
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
                mouseG.selectAll("circle").style("opacity", "0").attr("r", 3);
                mouseG.select(".mouse-line").style("opacity", "0");
            });

        const mouseG = svg.append("g").attr("class", "mouse-over-effects");

        // Append a line that will follow the mouse cursor
        mouseG.append("path")
            .attr("class", "mouse-line")
            .style("stroke", "#999")
            .style("stroke-width", "0.5px")
            .style("opacity", "0");

        // Append a circle that will follow the mouse cursor
        mouseG.append("circle")
            .attr("class", "mouse-circle")
            .style("opacity", "0");

        // Define legend data
        const legendData = [
            { key: "Total MSW Generation", color: "#CE5845", yScale: yLeft, values: data.map(d => ({ year: d.year, value: d.totalMSW })) },
            { key: "Per Capita Generation", color: "#3167A4", yScale: yRight, values: data.map(d => ({ year: d.year, value: d.perCapita })) }
        ];

        // Add legend
        const legend = svg.selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .on("mouseover", (event, d) => {
                // Highlight the hovered line
                svg.selectAll(".line-path")
                    .style("opacity", lineData => lineData.key === d.key ? 1 : 0.2)
                    .style("stroke-width", lineData => lineData.key === d.key ? 3 : 2); // Adjust stroke-width on hover
            })
            .on("mouseout", () => {
                // Reset style for all lines on mouseout
                svg.selectAll(".line-path")
                    .style("opacity", 1)
                    .style("stroke-width", 2); // Reset stroke-width
            });

        // Append legend text
        legend.each(function (series) {
            const lastDatum = series.values[series.values.length - 1]; // Get the last data point
            const legendItem = d3.select(this);

            legendItem.append("text")
                .datum(lastDatum)
                .attr("transform", function (d) {
                    // Position the text slightly to the right of the last data point of each line
                    return `translate(${width},${series.yScale(d.value)})`;
                })
                .attr("class", "chart-labels")
                .attr("x", 5) // This sets the distance of the text from the end of the line
                .attr("dy", ".35em") // This aligns the text vertically
                // .style("fill", series.color)
                .style("fill", "black")
                .text(series.key);
        });

        const formatNumber = d3.format(".1f"); // Format with one decimal place

        function onMouseMove(event) {
            const [xPos, yPos] = d3.pointer(event, this);
            const date = x.invert(xPos);
            const year = date.getFullYear();
            const hoverData = data.find(d => d.year.getFullYear() === year);

            const tooltipX = event.clientX;
            const tooltipY = event.clientY;

            tooltip.style("opacity", 0.9)
                .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                .style("top", `${tooltipY}px`);

            if (hoverData) {
                tooltip.html(`
                    <div class="tooltip-title">${hoverData.year.getFullYear()}</div>
                    <table class="tooltip-content">
                      <tr>
                        <td><span class="color-legend" style="background-color: ${legendData[1].color};"></span>${legendData[1].key}</td>
                        <td class="value"><strong>${hoverData.perCapita.toFixed(1)}</strong> lbs/person</td>
                      </tr>
                      <tr>
                        <td><span class="color-legend" style="background-color: ${legendData[0].color};"></span>${legendData[0].key}</td>
                        <td class="value"><strong>${hoverData.totalMSW.toFixed(1)}</strong> million tons</td>
                      </tr>
                    </table>
                `);

                const xPosition = x(hoverData.year);

                // Move and show circles and line
                mouseG.select(".mouse-line")
                    .attr("d", `M${xPosition},${height} ${xPosition},0`)
                    .style("opacity", "1");

                mouseG.selectAll("circle").remove();

                // Highlight and enlarge circles at the data point
                mouseG.append("circle")
                    .attr("cx", xPosition)
                    .attr("cy", yLeft(hoverData.totalMSW))
                    .attr("r", 4)
                    .style("fill", "#CE5845")
                    .style("stroke", "white")
                    .style("opacity", "1");

                mouseG.append("circle")
                    .attr("cx", xPosition)
                    .attr("cy", yRight(hoverData.perCapita))
                    .attr("r", 4)
                    .style("fill", "#3167A4")
                    .style("stroke", "white")
                    .style("opacity", "1");
            }
        }
    });

    // Function to wrap text
    function wrapText(text, width) {
        text.each(function() {
            const elem = d3.select(this);
            const words = elem.text().split(/\s+/).reverse();
            let word;
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1; // ems

            const y = elem.attr("y");
            const dy = parseFloat(elem.attr("dy")) || 0;

            let tspan = elem.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = elem.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
                }
            }
        });
    }
  })();