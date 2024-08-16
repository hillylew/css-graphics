(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("grid-energy-range-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.05,
        bottom: containerHeight * 0.15,
        left: containerWidth * 0.1,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#grid-energy-range-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- X and Y Scales ----------------------- */
    const x = d3.scaleBand().range([0, width]).padding(0.4);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(width / 80).tickFormat(d => `${d}`);

    const colorScale = d3.scaleOrdinal().range(["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"]);

    /* ----------------------- Create Tooltip ----------------------- */
    function onMouseMove(event, d) {

        const tooltipX = event.clientX;
        const tooltipY = event.clientY;
        
        // Position tooltip
        tooltip
            .style("opacity", 0.9)
            .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
            .style("top", `${tooltipY}px`)
            .html(`
                <div class="tooltip-title">${d.Technology}</div>
                <table class="tooltip-content">
                    <tr>
                        <td>Maximum:</td>
                        <td class="value"><strong>${d.val2}</strong></td>
                    </tr>
                    <tr>
                        <td>Minimum:</td>
                        <td class="value"><strong>${d.val1}</strong></td>
                    </tr>
                </table>
            `);
    }

    function onMouseOut() {
        tooltip.style("opacity", 0);
    }

    // Load and process the CSV data
    d3.csv(gridEnergy5).then((data) => {
        // Parse the data
        data.forEach((d) => {
            d.val1 = +d.val1;
            d.val2 = +d.val2;
        });

        // Update the scales' domains
        const maxYValue = Math.ceil(d3.max(data, d => d.val2) / 10) * 10;
        x.domain(data.map(d => d.Technology));
        y.domain([0, maxYValue]);

        // Draw the X-axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .attr("class", "chart-labels-x")
            .selectAll("text")
            .style("text-anchor", "middle"); // Centering the text

        svg.selectAll(".tick line").remove();

        // Draw the Y-axis
        svg
            .append("g")
            .call(yAxis)
            .attr("class", "chart-labels-y");

        // Add Y-axis label
        svg.append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, -${dynamicMargin.top * 0.7})`) // Position above axis
            .attr("x", 0) // Center horizontally
            .style("fill", "#000")
            .text("LCOS (cents/kWh)")
            .each(function() { wrapTextY(d3.select(this), dynamicMargin.left * 2);});

        // Wrap x-axis tick labels
        svg.selectAll(".chart-labels-x .tick text")
            .each(function() { wrapTextX(d3.select(this), x.bandwidth()); });

        // Function to wrap text for x-axis
        function wrapTextX(text, width) {
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

        // Function to wrap text for y-axis (retain original function)
        function wrapTextY(text, width) {
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

        /* ----------------------- Draw the ranges ----------------------- */
        svg
            .selectAll(".range")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "range")
            .attr("x", d => x(d.Technology))
            .attr("y", d => y(d.val2))
            .attr("width", x.bandwidth())
            .attr("height", d => y(d.val1) - y(d.val2))
            .style("fill", "#CE5845") // Solid color
            .style("opacity", 0.7)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOut);
    });
})();