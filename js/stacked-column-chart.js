(function() {
    const container = document.getElementById("stacked-column-chart");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const aspectRatio = 0.7; // Example aspect ratio
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,    // 5% of the container height
        right: containerWidth * 0.7,  // 15% of the container width
        bottom: containerHeight * 0.1, // 10% of the container height
        left: containerWidth * 0.05    // 5% of the container width
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3.select("#stacked-column-chart").append("svg")
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .append('g')
        .attr('transform', `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    const colors = ["#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#eff3ff"];

    // Define scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(["Total"]);
        // .padding(0.5);

    const y = d3.scaleLinear()
        .range([height, 0]);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text").remove(); // Remove x-axis labels

    svg.selectAll(".tick line").remove(); // Remove x-axis ticks
    

    const tooltip = d3.select('#tooltip4');

    // Load CSV data and build chart
    d3.csv("./data/graph-4-data.csv", d3.autoType).then(function(data) {

        // Calculate the total BGD for the y-axis domain
        const totalBGD = d3.sum(data, d => d.BGD);
        const maxYValue = Math.ceil(totalBGD / 50) * 50;
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
            .text("BGD");

        // Calculate BGD cumulative values for the stacked chart
        let cumulativeBGD = 0;
        data.forEach(d => {
            d.startBGD = cumulativeBGD;
            cumulativeBGD += d.BGD;
            d.endBGD = cumulativeBGD;
        });

        // Create stacked bars using BGD values
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("fill", (d, i) => colors[i % colors.length])
            .attr("x", x("Total"))
            .attr("y", d => y(d.endBGD))
            .attr("height", d => y(d.startBGD) - y(d.endBGD))
            .attr("width", x.bandwidth())
            .on('mouseover', function(event, d) {
                // Highlight the active bar
                d3.select(this).attr("class", "bar active");

                // Reduce the opacity of the other bars
                svg.selectAll(".bar").filter(e => e !== d).style("opacity", 0.1);

                // Show and populate the tooltip
                tooltip.html(`
                    <div class="tooltip-title">${d.Category}</div>
                    <table class="tooltip-content">
                        <tr>
                        <td>
                            Amount
                        </td>
                        <td class="value">${d.BGD.toFixed(1)} BGD</td>
                        </tr>
                        <tr>
                        <td>
                            Percent
                        </td>
                        <td class="value">${((d.BGD / totalBGD) * 100).toFixed(0)}%</td>
                        </tr>
                    </table>
                `)
                .style('opacity', '0.9')
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`);
            })
            .on('mouseleave', function() {
                // Reset the appearance of the active bar
                d3.select(this).attr("class", "bar");

                // Reset the opacity of the other bars
                svg.selectAll(".bar").style("opacity", 1);

                // Hide the tooltip
                tooltip.style('opacity', '0');
            });

        // Add category labels next to each segment
        svg.selectAll(".category-text")
            .data(data)
            .enter().append("text")
            .attr("class", "chart-labels")
            .attr("x", x("Total") + x.bandwidth() + 10)
            .attr("y", d => y(d.startBGD + (d.endBGD - d.startBGD) / 2) + 5)
            .attr("fill", (d, i) => colors[i % colors.length])
            .text(d => d.Category);
            
    }).catch(function(error){
        console.error('Error loading the CSV file:', error);
    });
})();
