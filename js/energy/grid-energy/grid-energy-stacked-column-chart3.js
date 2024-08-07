(function () {

     /* ----------------------- Create Tooltip ------------------------ */
     const container = document.getElementById("grid-energy-stacked-column-chart3");

     const tooltipDiv = document.createElement("div");
     tooltipDiv.id = "tooltip";
     tooltipDiv.className = "tooltip";
     container.appendChild(tooltipDiv);
     
     const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.4;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.02,
        right: containerWidth * 0.05,
        bottom: containerHeight * 0.2,
        left: containerWidth * 0.25,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#grid-energy-stacked-column-chart3")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- X and Y Scales ----------------------- */
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);

    const xAxis = d3.axisBottom(x).tickFormat(d => d / 1000);
    const yAxis = d3.axisLeft(y);

    const colorScale = d3
        .scaleOrdinal()
        .domain(["Proposed", "Construction", "Operational"])
        .range(["#CE5845", "#ED974A", "#FED679"]);

    /* ----------------------- Load and process the CSV data ----------------------- */
    d3.csv("../../data/energy/grid-energy/grid-energy4.csv").then((data) => {
        // Parse the data
        data.forEach((d) => {
            for (let prop in d) {
                if (prop !== "Technology Type") d[prop] = +d[prop] || 0;
            }
        });

        // Stack the data
        const stack = d3.stack().keys(["Proposed", "Construction", "Operational"]);
        const stackedData = stack(data);

        /* ----------------------- Update the scale domains with the processed data ----------------------- */
        const maxXValue = Math.ceil(
            d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) / 5000
        ) * 5000;
        x.domain([0, maxXValue]);
        y.domain(data.map((d) => d["Technology Type"]));

        // Draw the X-axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll(".tick text")
            .attr("class", "chart-labels");


        // Add x-axis label
        svg.append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + dynamicMargin.bottom * 0.8)
            .text("Rated Power (GW)");

        // Draw the Y-axis
        const yAxisGroup = svg
            .append("g")
            .call(yAxis)
            .attr("class", "chart-labels")
            .style("font-weight", "bold");

        /* ----------------------- Draw the chart ----------------------- */
        // Use categoryGroups instead of bars for the rectangles to capture mouseover with the proper context
        const categoryGroups = svg.selectAll(".category-group")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "category-group")
            .style("fill", (d) => colorScale(d.key));

        categoryGroups.selectAll("rect")
            .data((d) => d)
            .enter()
            .append("rect")
            .attr("y", (d) => y(d.data["Technology Type"]))
            .attr("x", (d) => x(d[0]))
            .attr("width", (d) => x(d[1]) - x(d[0]))
            .attr("height", y.bandwidth());

        /* ----------------------- Highlight ----------------------- */
        function highlightCategory(category) {
            svg.selectAll(".category-group").style("fill-opacity", 0.2); // Mute all other categories
            svg.selectAll(".category-group")
                .filter((d) => d.key === category)
                .style("fill-opacity", 1); // Highlight the current category
        }

        function resetCategoryHighlight() {
            svg.selectAll(".category-group").style("fill-opacity", 1); // Reset opacity to default
        }

        /* ----------------------- Legend ----------------------- */
        const legend = svg.append("g")
            .attr("transform", `translate(${width - dynamicMargin.right * 4}, ${height * 0.6})`);

        const legendData = [
            { label: "Proposed", color: "#CE5845" },
            { label: "Construction", color: "#ED974A" },
            { label: "Operational", color: "#FED679" }
        ];

        const legendItemSize = width * 0.04;
        const gap = width * 0.01;

        legendData.forEach((d, i) => {
            legend
                .append("rect")
                .attr("x", 0)
                .attr("y", i * (legendItemSize + gap))
                .attr("width", legendItemSize)
                .attr("height", legendItemSize)
                .style("fill", d.color)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("class", "legend-rect");

            legend
                .append("text")
                .attr("x", legendItemSize + gap)
                .attr("y", i * (legendItemSize + gap) + legendItemSize / 2)
                .attr("alignment-baseline", "middle")
                .text(d.label)
                .attr("class", "chart-labels");
        });

        // Bind the legend to the same highlight logic
        legend.on("mouseover", function (event, d) {
            highlightCategory(d.label);
        }).on("mouseout", resetCategoryHighlight);

        /* ----------------------- Mouseover event ----------------------- */
        function onMouseMove(event) {
            const [xPos, yPos] = d3.pointer(event, this);
            const hoveredType = y.domain().find((type) => y(type) <= yPos && yPos < y(type) + y.bandwidth());
            const hoverData = data.find((d) => d["Technology Type"] === hoveredType);

            const tooltipX = event.clientX + window.scrollX;
            const tooltipY = event.clientY + window.scrollY;

            // Position tooltip
            tooltip
                .style("opacity", 0.9)
                .style("left", `${tooltipX + dynamicMargin.right / 2}px`)
                .style("top", `${tooltipY}px`);

            const formatNumber = d3.format(",");
            if (hoverData) {
                tooltip.html(`
                    <div class="tooltip-title">${hoverData["Technology Type"]}</div>
                    <table class="tooltip-content">
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale("Proposed")};"></span>Proposed</td>
                        <td class="value">${formatNumber(hoverData.Proposed)}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale("Construction")};"></span>Construction</td>
                        <td class="value">${formatNumber(hoverData.Construction)}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale("Operational")};"></span>Operational</td>
                        <td class="value">${formatNumber(hoverData.Operational)}</td>
                    </tr>
                    </table>
                    <table class="tooltip-total">
                        <tr>
                            <td><strong>Total</strong></td>
                            <td class="value">${formatNumber(hoverData.Proposed + hoverData.Construction + hoverData.Operational)}</td>
                        </tr>
                    </table>
                `);
            }
        }

        // Create a rect for listening to mouse events
        svg
            .append("rect")
            .attr("class", "listening-rect")
            .attr("width", width)
            .attr("height", height + dynamicMargin.top / 4)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", onMouseMove)
            .on("mouseout", () => {
                tooltip.style("opacity", "0");
                resetCategoryHighlight();
            });
    });
})();