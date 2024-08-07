(function() {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("water-supply-bar-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.6;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.3,
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.1,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#water-supply-bar-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- Scales, axes, and color ----------------------- */
    const xScale = d3.scaleBand().range([0, width]).padding(0.3); // Scale for sources
    const yScale = d3.scaleLinear().range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(['Fresh', 'Saline'])
        .range(["#3167A4", "#8FC8E5"]);

    const xAxis = (g) => g.call(d3.axisBottom(xScale));
    const yAxis = (g) =>
        g.call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => d / 1000));

    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("../../data/water/water-supply/water-supply2.csv", (d) => ({
        Source: d.Source,
        Type: d.Type,
        Amount: +d.Amount,
    })).then((data) => {
        // Get unique water sources
        const sources = [...new Set(data.map((d) => d.Source))];

        // Update scales
        xScale.domain(sources);
        yScale.domain([0, Math.ceil(Math.max(...data.map(d => d.Amount)) / 10000) * 10000]);

        // Draw the x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("class", "chart-labels");

        // Draw the y-axis
        svg.append("g").call(yAxis).selectAll(".tick text").attr("class", "chart-labels");

        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - dynamicMargin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "chart-labels")
            .style("text-anchor", "middle")
            .text("Amount (1000 gallons)");

        // Create groups for each water source
        const sourceGroups = svg
            .selectAll(".source-group")
            .data(sources)
            .enter()
            .append("g")
            .attr("class", "source-group")
            .attr("transform", (d) => `translate(${xScale(d)},0)`);

        // Draw the bars for each water source
        sourceGroups
            .selectAll(".bar")
            .data((d) => data.filter((item) => item.Source === d))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => {
                const typeIndex = d.Type === 'Fresh' ? 0 : 1; // Adjust index for types
                const typeWidth = xScale.bandwidth() / 2; // Half the width of the band
                return typeIndex * typeWidth;
            })
            .attr("y", (d) => yScale(d.Amount))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", (d) => height - yScale(d.Amount))
            .attr("fill", (d) => colorScale(d.Type))
            .on("mouseover", function(event, d) {
                d3.select(this).attr("class", "bar active");

                const tooltipX = event.clientX + window.scrollX;
                const tooltipY = event.clientY + window.scrollY;

                // Show and populate the tooltip
                tooltip
                    .html(
                        `<div class="tooltip-title">${d.Source}</div>
                            <table class="tooltip-content">
                                <tr>
                                    <td><span class="color-legend" style="background-color: ${colorScale(d.Type)};"></span>Amount:</td>
                                    <td class="value"><strong>${d.Amount}</strong> gallons</td>
                                </tr>
                            </table>`
                    )
                    .style("opacity", 0.9)
                    .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                    .style("top", `${tooltipY}px`);
            })
            .on("mousemove", function(event) {
                const tooltipX = event.clientX + window.scrollX;
                const tooltipY = event.clientY + window.scrollY;

                tooltip
                    .style("left", (tooltipX + dynamicMargin.left / 4) + "px")
                    .style("top", (tooltipY) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("class", "bar");
                tooltip.style("opacity", 0);
            });

        // Adding the legend
        const legendData = [
            { type: 'Fresh', color: '#3167A4' },
            { type: 'Saline', color: '#8FC8E5' },
        ];

        const legend = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 100}, 20)`);

        legend
            .selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend
            .selectAll(".legend-item")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d) => d.color)
            .attr("rx", 3) // Rounded corners
            .attr("ry", 3); // Rounded corners

        legend
            .selectAll(".legend-item")
            .append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .attr("class", "chart-labels")
            .text((d) => d.type)
            .attr("text-anchor", "start")
            .attr("fill", "#000");
    });
})();