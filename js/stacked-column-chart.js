(function() {
    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 150, bottom: 50, left: 60 }; 
    const width = 850 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#stacked-column-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const colors = ["#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#eff3ff"];

    // Define scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(["Total"])
        .padding(0.5);

    const y = d3.scaleLinear()
        .range([height, 0]);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text").remove(); // Remove x-axis labels

    svg.selectAll(".tick line").remove(); // Remove x-axis ticks

    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip');

    // Load CSV data and build chart
    d3.csv("./data/graph-4-data.csv", d3.autoType).then(function(data) {

        // Calculate the total BGD for the y-axis domain
        const totalBGD = d3.sum(data, d => d.BGD);
        const maxYValue = Math.ceil(totalBGD / 50) * 50; // Round up to the nearest multiple of 50
        y.domain([0, maxYValue]);

        // Create a group for the y-axis
        const yAxisGroup = svg.append("g").call(d3.axisLeft(y));

        // Add y-axis label
        yAxisGroup
            .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, ${-margin.top / 2})`)
            .style("fill", "#000")
            .style("font-size", "12px")
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
                .style('visibility', 'visible')
                .style('top', (event.pageY - 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseleave', function() {
                // Reset the appearance of the active bar
                d3.select(this).attr("class", "bar");

                // Reset the opacity of the other bars
                svg.selectAll(".bar").style("opacity", 1);

                // Hide the tooltip
                tooltip.style('visibility', 'hidden');
            });

        // Add category labels next to each segment
        svg.selectAll(".category-text")
            .data(data)
            .enter().append("text")
            .attr("class", "category-text")
            .style("font-size", "12px")
            .attr("x", x("Total") + x.bandwidth() + 10)
            .attr("y", d => y(d.startBGD + (d.endBGD - d.startBGD) / 2) + 5)
            .attr("fill", (d, i) => colors[i % colors.length])
            .text(d => d.Category);
            
    }).catch(function(error){
        console.error('Error loading the CSV file:', error);
    });
})();


