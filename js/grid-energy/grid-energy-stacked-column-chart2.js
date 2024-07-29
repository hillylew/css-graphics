(function () {
    /* ----------------------- Dynamic Dimensions ----------------------- */
    const aspectRatio = 0.7;

    // Get the container and its dimensions
    const container = document.getElementById("grid-energy-stacked-column-chart2");
    const containerWidth = container.offsetWidth; // Full element width
    const containerHeight = containerWidth * aspectRatio; // Height based on aspect ratio

    // Calculate dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,
        right: containerWidth * 0.17,
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.06,
    };

    // Inner drawing area dimensions
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3.select("#grid-energy-stacked-column-chart2")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- X and Y Scales ----------------------- */
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).tickFormat(d => d);

    const colorScale = d3.scaleOrdinal()
        .domain(["Proposed", "Construction", "Operational"])
        .range(["#1d476d", "#3167a4", "#8cc9f2"]);

    // Create Tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    /* ----------------------- Load and Process Data ----------------------- */
    d3.csv("./data/grid-energy/grid-energy3.csv").then(data => {
        // Parse data
        data.forEach(d => {
            for (let prop in d) {
                if (prop !== "Technology Type") d[prop] = +d[prop] || 0;
            }
        });

        // Stack the data
        const stack = d3.stack().keys(["Proposed", "Construction", "Operational"]);
        const stackedData = stack(data);

        /* ----------------------- Update Scale Domains ----------------------- */
        x.domain(data.map(d => d["Technology Type"]));
        const maxYValue = Math.ceil(
            d3.max(stackedData, layer => d3.max(layer, d => d[1])) / 200
        ) * 200;
        y.domain([0, maxYValue]);

        // Draw X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll(".tick text")
            .attr("class", "chart-labels");

        // Draw Y-axis
        const yAxisGroup = svg.append("g")
            .call(yAxis)
            .attr("class", "chart-labels");

        /* ----------------------- Draw the Chart ----------------------- */
        // Category groups for rects
        const categoryGroups = svg.selectAll(".category-group")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "category-group")
            .style("fill", d => colorScale(d.key));

        categoryGroups.selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data["Technology Type"]))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        /* ----------------------- Highlight ----------------------- */
        function highlightCategory(category) {
            svg.selectAll(".category-group").style("fill-opacity", 0.2); // Mute others
            svg.selectAll(".category-group")
                .filter(d => d.key === category)
                .style("fill-opacity", 1); // Highlight
        }

        function resetCategoryHighlight() {
            svg.selectAll(".category-group").style("fill-opacity", 1); // Reset opacity
        }

        /* ----------------------- Legend & Hover Effect ----------------------- */
        const legend = svg.selectAll(".legend")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("transform", d => {
                const lastPoint = d[d.length - 1];
                const yPosition = y(lastPoint[0]) + (y(lastPoint[1]) - y(lastPoint[0])) / 2;
                return `translate(${width},${yPosition})`;
            });

        legend.append("text")
            .attr("class", "chart-labels")
            .attr("x", 5)
            .attr("y", 0)
            .style("text-anchor", "start")
            .style("alignment-baseline", "middle")
            .style("fill", d => colorScale(d.key))
            .text(d => d.key);

        // Bind highlight logic to legend
        legend.on("mouseover", function(event, d) {
            highlightCategory(d.key);
        }).on("mouseout", resetCategoryHighlight);

        /* ----------------------- Mouseover Event ----------------------- */
        function onMouseMove(event) {
            const [xPos, yPos] = d3.pointer(event, this);
            const hoveredType = x.domain().find(type => x(type) <= xPos && xPos < x(type) + x.bandwidth());
            const hoverData = data.find(d => d["Technology Type"] === hoveredType);

            // Position tooltip
            tooltip
                .style("opacity", 0.9)
                .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
                .style("top", `${event.pageY}px`);

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

        // Rect for mouse events
        svg.append("rect")
            .attr("class", "listening-rect")
            .attr("width", width + dynamicMargin.left / 4)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", onMouseMove)
            .on("mouseout", () => {
                tooltip.style("opacity", "0");
                resetCategoryHighlight(); 
            });
    });
})();
