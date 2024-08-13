(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("energy-system-stacked-column-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const aspectRatio = 0.7; // Example aspect ratio
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,    
        right: containerWidth * 0.7,
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.07
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3.select("#energy-system-stacked-column-chart").append("svg")
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .append('g')
        .attr('transform', `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    const colors = ["#1C476D", "#4084BC", "#8FC8E5", "#386660", "#E2E27A"];

    // Define scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(["2022"]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text").remove(); // Remove x-axis labels

    svg.selectAll(".tick line").remove(); // Remove x-axis ticks

    // Load CSV data and build chart
    d3.csv(energySystem3, d3.autoType).then(function(data) {
        data.forEach(d => {
            d.Value = +d['2022 (Mt CO2e)']; // Convert value to number
        });

        // Calculate the total value for the y-axis domain
        const totalValue = d3.sum(data, d => d.Value);
        const maxYValue = Math.ceil(totalValue / 500) * 500;
        y.domain([0, maxYValue]);

        // Create a group for the y-axis
        const yAxisGroup = svg.append("g").call(d3.axisLeft(y));

        // Add y-axis label
        yAxisGroup
            .append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, ${-dynamicMargin.top / 2})`)
            .style("fill", "#000")
            .text("Mt CO₂e");

        // Calculate values for the stacked chart
        let cumulativeValue = 0;
        data.forEach(d => {
            d.startValue = cumulativeValue;
            cumulativeValue += d.Value;
            d.endValue = cumulativeValue;
        });

        // Create stacked bars
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("fill", (d, i) => colors[i % colors.length])
            .attr("x", x("2022"))
            .attr("y", d => y(d.endValue))
            .attr("height", d => y(d.startValue) - y(d.endValue))
            .attr("width", x.bandwidth())
            .on('mouseover', function(event, d) {
                d3.select(this).attr("class", "bar active");
                svg.selectAll(".bar").filter(e => e !== d).style("opacity", 0.1);

                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                tooltip.html(`
                    <div class="tooltip-title">${d.Data}</div>
                    <table class="tooltip-content">
                        <tr>
                            <td>Amount</td>
                            <td class="value"><strong>${d.Value.toFixed(1)}</strong> Mt CO₂e</td>
                        </tr>
                        <tr>
                            <td>Percent</td>
                            <td class="value"><strong>${((d.Value / totalValue) * 100).toFixed(0)}</strong> %</td>
                        </tr>
                    </table>
                `)
                .style('opacity', '0.9')
                .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                .style("top", `${tooltipY}px`);
            })
            .on("mousemove", function (event, d) {
                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                tooltip
                    .style("left", (tooltipX + dynamicMargin.left / 4) + "px")
                    .style("top", (tooltipY) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("class", "bar");
                svg.selectAll(".bar").style("opacity", 1);
                tooltip.style('opacity', '0');
            });

        svg.selectAll(".category-text")
            .data(data)
            .enter().append("text")
            .attr("class", "chart-labels")
            .attr("x", x("2022") + x.bandwidth() + 10)
            .attr("y", d => y(d.startValue + (d.endValue - d.startValue) / 2) + 5)
            .attr("fill", "black")
            .text(d => d.Data);
    }).catch(function(error){
        console.error('Error loading the CSV file:', error);
    });
})();