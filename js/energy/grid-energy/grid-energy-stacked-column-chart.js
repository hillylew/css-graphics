(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("grid-energy-stacked-column-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic Dimensions ----------------------- */
    const aspectRatio = 0.7;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    const dynamicMargin = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.2,
        bottom: containerHeight * 0.15,
        left: containerWidth * 0.05,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    const svg = d3.select("#grid-energy-stacked-column-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    const xScale = d3.scaleBand().range([0, width]).padding(0.3);
    const yScale = d3.scaleLinear().range([height, 0]);
    const colorScale = d3.scaleOrdinal().domain(["Non-PHS", "PHS"]).range(["#ED974A", "#FFCB05"]);
    const formatNumber = d3.format(",");

    const xAxis = (g) =>
        g.call(d3.axisBottom(xScale))
        .call(g => g.select(".domain"))
        .call(g => g.selectAll(".tick text")
            .attr("class", "chart-labels")
            .attr("fill", "#000")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end"));

    const yAxis = (g) =>
        g.call(d3.axisLeft(yScale)
            .ticks(Math.ceil(yScale.domain()[1] / 2000))
            .tickFormat((d) => formatNumber(d / 1000)))
        .call(g => g.select(".domain"))
        .call(g => g.selectAll(".tick text").attr("class", "chart-labels").attr("fill", "#000"));


    // Define csv file path if it's not already defined
    if (typeof csvFile === "undefined") {
        var csvFile = "../../data/energy/grid-energy/grid-energy2.csv";
    }

    d3.csv(csvFile).then((data) => {
        data.forEach((d) => {
            for (let prop in d) {
                if (prop !== "State") d[prop] = +d[prop];
            }
        });

        const stack = d3.stack().keys(["Non-PHS", "PHS"]);
        const stackedData = stack(data);

        xScale.domain(data.map((d) => d.State));

        const maxYValue = Math.ceil(d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) / 2000) * 2000;
        yScale.domain([0, maxYValue]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .attr("class", "chart-labels");

        const yAxisGroup = svg
            .append("g")
            .call(yAxis)
            .attr("class", "chart-labels");
      
          // Append y-axis label
          yAxisGroup
            .append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
            .style("fill", "#000")
            .text("GW");

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
            .attr("x", (d) => xScale(d.data.State))
            .attr("y", (d) => yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 0.7);
                const category = d3.select(this.parentNode).datum().key;
                highlightCategory(category);

                const hoveredData = d.data;

                const tooltipX = event.clientX + window.scrollX;
                const tooltipY = event.clientY + window.scrollY;

                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`
                    <div class="tooltip-title">${hoveredData.State}</div>
                    <table class="tooltip-content">
                        <tr>
                            <td><span class="color-legend" style="background-color: ${colorScale("PHS")};"></span>PHS</td>
                            <td class="value">${formatNumber(hoveredData["PHS"])}</td>
                        </tr>
                        <tr>
                            <td><span class="color-legend" style="background-color: ${colorScale("Non-PHS")};"></span>Non-PHS</td>
                            <td class="value">${formatNumber(hoveredData["Non-PHS"])}</td>
                        </tr>
                    </table>
                    <table class="tooltip-total">
                        <tr>
                            <td><strong>Total</strong></td>
                            <td class="value">${formatNumber(hoveredData["Non-PHS"] + hoveredData["PHS"])}</td>
                        </tr>
                    </table>
                `)
                .style("left", `${tooltipX + dynamicMargin.left / 2}px`)
                .style("top", `${tooltipY}px`);
            })
            .on("mouseout", function() {
                d3.select(this).style("opacity", 1);
                resetCategoryHighlight();
                tooltip.transition().duration(500).style("opacity", 0);
            });

        function highlightCategory(category) {
            svg.selectAll(".category-group").style("fill-opacity", 0.2);
            svg.selectAll(".category-group")
                .filter((d) => d.key === category)
                .style("fill-opacity", 1);
        }

        function resetCategoryHighlight() {
            svg.selectAll(".category-group").style("fill-opacity", 1);
        }

        const legend = svg.append("g")
            .attr("transform", `translate(${width - dynamicMargin.right * 0.8}, ${height * 0.05})`);

        const legendData = [
            { label: "PHS", color: "#FFCB05" },
            { label: "Non-PHS", color: "#ED974A" }
        ];

        const legendItemSize = width * 0.04;
        const gap = width * 0.01;

        legendData.forEach((d, i) => {
            const legendItem = legend.append("g")
                .attr("transform", `translate(0, ${i * (legendItemSize + gap)})`)
                .attr("class", "legend-group")
                .on("mouseover", function() {
                    highlightCategory(d.label);
                })
                .on("mouseout", function() {
                    resetCategoryHighlight();
                });

            legendItem.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", legendItemSize)
                .attr("height", legendItemSize)
                .style("fill", d.color)
                .attr("rx", 3)
                .attr("ry", 3);

            legendItem.append("text")
                .attr("x", legendItemSize + gap)
                .attr("y", legendItemSize / 2)
                .attr("alignment-baseline", "middle")
                .attr("class", "chart-labels")
                .text(d.label);
        });

        svg.append("rect")
            .attr("class", "listening-rect")
            .attr("width", width + dynamicMargin.left / 4)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", function(event) {
                const [xPos, yPos] = d3.pointer(event, this);
                const hoveredState = xScale.domain().find((state) => xScale(state) <= xPos && xPos < xScale(state) + xScale.bandwidth());
                const hoverData = data.find((d) => d.State === hoveredState);

                const tooltipX = event.clientX + window.scrollX;
                const tooltipY = event.clientY + window.scrollY;

                if (hoverData) {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`
                        <div class="tooltip-title">${hoverData.State}</div>
                        <table class="tooltip-content">
                            <tr>
                                <td><span class="color-legend" style="background-color: ${colorScale("PHS")};"></span>PHS</td>
                                <td class="value">${formatNumber(hoverData["PHS"])}</td>
                            </tr>
                            <tr>
                                <td><span class="color-legend" style="background-color: ${colorScale("Non-PHS")};"></span>Non-PHS</td>
                                <td class="value">${formatNumber(hoverData["Non-PHS"])}</td>
                            </tr>
                        </table>
                        <table class="tooltip-total">
                            <tr>
                                <td><strong>Total</strong></td>
                                <td class="value">${formatNumber(hoverData["Non-PHS"] + hoverData["PHS"])}</td>
                            </tr>
                        </table>
                    `).style("left", `${tooltipX + dynamicMargin.left / 2}px`)
                    .style("top", `${tooltipY}px`);
                }
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    });
})();