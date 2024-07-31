(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.8;

    // Get the container and its dimensions
    const container = document.getElementById("grid-energy-stacked-column-chart");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.17,
        bottom: containerHeight * 0.2,
        left: containerWidth * 0.05,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#grid-energy-stacked-column-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- X and Y Scales ----------------------- */
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).tickFormat((d) => d / 1000);

    const colorScale = d3
        .scaleOrdinal()
        .domain(["Non-PHS", "PHS"])
        .range(["#1d476d", "#ffcb03"]);

    // Create Tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    /* ----------------------- Load and process the CSV data ----------------------- */
    d3.csv("../../data/energy/grid-energy/grid-energy2.csv").then((data) => {
        // Parse data and convert string values to numbers
        data.forEach((d) => {
            for (let prop in d) {
                if (prop !== "State") d[prop] = +d[prop];
            }
        });

        // Stack the data
        const stack = d3.stack().keys(["Non-PHS", "PHS"]);
        const stackedData = stack(data);

        /* ----------------------- Update the scale domains with the processed data ----------------------- */
        x.domain(data.map((d) => d.State));
        const maxYValue =
            Math.ceil(
                d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) / 2000
            ) * 2000;
        y.domain([0, maxYValue]);

        // Draw the X-axis
        const xTickValues = x.domain();
        xAxis.tickValues(xTickValues);

        const xAxisGroup = svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        xAxisGroup
            .selectAll(".tick text")
            .attr("class", "chart-labels")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)")
            .attr("dy", ".35em")
            .attr("dx", "-.8em");  // Adjust this value to fine-tune the centering

        // Draw the Y-axis
        const yAxisGroup = svg
            .append("g")
            .call(yAxis)
            .attr("class", "chart-labels");

        // y-axis label
        yAxisGroup
            .append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
            .style("fill", "#000")
            .text("GW");

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
            .attr("x", (d) => x(d.data.State))
            .attr("y", (d) => y(d[1]))
            .attr("height", (d) => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .on("mouseover", function (event, d) {
                // Highlight all bars in this category
                highlightCategory(d3.select(this.parentNode).datum().key);
            })
            .on("mouseout", resetCategoryHighlight);

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

        /* ----------------------- Legend & hover effect ----------------------- */
        const legend = svg
            .selectAll(".legend")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("transform", (d) => {
                const lastPoint = d[d.length - 1];
                const yPosition =
                    y(lastPoint[0]) + (y(lastPoint[1]) - y(lastPoint[0])) / 2;
                return `translate(${width},${yPosition})`;
            });

        legend
            .append("text")
            .attr("class", "chart-labels")
            .attr("x", 5)
            .attr("y", 0)
            .style("text-anchor", "start")
            .style("alignment-baseline", "middle")
            .style("fill", (d) => colorScale(d.key))
            .text((d) => d.key);

        // Bind the legend to the same highlight logic
        legend.on("mouseover", function (event, d) {
            highlightCategory(d.key);
        }).on("mouseout", resetCategoryHighlight);

        /* ----------------------- Mouseover event ----------------------- */
        function onMouseMove(event) {
            const [xPos, yPos] = d3.pointer(event, this);
            const hoveredState = x.domain().find((state) => x(state) <= xPos && xPos < x(state) + x.bandwidth());
            const hoverData = data.find((d) => d.State === hoveredState);

            // Position tooltip
            tooltip
                .style("opacity", 0.9)
                .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
                .style("top", `${event.pageY}px`);

            const formatNumber = d3.format(",");
            if (hoverData) {
                tooltip.html(`
                    <div class="tooltip-title">${hoverData.State}</div>
                    <table class="tooltip-content">  
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale("Non-PHS")};"></span>Non-PHS</td>
                        <td class="value">${formatNumber(hoverData["Non-PHS"])}</td>
                    </tr>
                    <tr>
                        <td><span class="color-legend" style="background-color: ${colorScale("PHS")};"></span>PHS</td>
                        <td class="value">${formatNumber(hoverData.PHS)}</td>
                    </tr>
                    </table>
                    <table class="tooltip-total">
                        <tr>
                            <td><strong>Total</strong></td>
                            <td class="value">${formatNumber(hoverData["Non-PHS"] + hoverData.PHS)}</td>
                        </tr>
                    </table>
                `);
            }
        }

        // Create a rect for listening to mouse events
        svg
            .append("rect")
            .attr("class", "listening-rect")
            .attr("width", width + dynamicMargin.left / 4)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", onMouseMove)
            .on("mouseover", function () {
                tooltip.style("opacity", 0.9);
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });

    });
})();
