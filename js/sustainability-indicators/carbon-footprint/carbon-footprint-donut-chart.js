(function() {
    const container = document.getElementById("carbon-footprint-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");
    const aspectRatio = 0.8;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    const dynamicMargin = {
        top: containerHeight * 0.02,
        right: containerWidth * 0.2,
        bottom: containerHeight * 0.02,
        left: containerWidth * 0.2,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
    const radius = Math.min(width, height) / 2.5; // Smaller radius for the pie chart

    const svg = d3.select("#carbon-footprint-chart")
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", `translate(${containerWidth / 2},${containerHeight / 2})`);

    const color = d3.scaleOrdinal()
        .domain(["Meats", "Dairy", "Beverages", "Seafood", "Eggs", "Vegetables", "Grain", "Fruits", "Other"])
        .range(["#1C476D", "#4084BC", "#AEDBED", "#386660", "#E2E27A", "#CE5845", "#ED974A", "#FFCB05", "#D8D8D8"]);

    const pie = d3.pie()
        .sort(null)
        .value(d => d.Percentage);

    const arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(0)
        .padAngle(0.03)
        .cornerRadius(5);

    const outerArc = d3.arc()
        .outerRadius(radius * 0.95)
        .innerRadius(radius * 0.95);
    
    const outerArcForSmallSlice = d3.arc()
        .outerRadius(radius * 1.4)
        .innerRadius(radius * 1.4);
    
    d3.csv(carbonFootprint1).then(function(data) {
        data.forEach(d => {
            d.Percentage = +d.Percentage;
        });

        // Draw the "plate" as a circular background
        svg.append("circle")
            .attr("r", radius * 1.1)
            .attr("fill", "#f7f7f7")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", "5px");

        svg.append("circle")
            .attr("r", radius * 0.87)
            .attr("fill", "white")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", "5px");

        // Draw the pie chart on top of the plate
        const arcs = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.Food))
            .style("opacity", 1) // Default opacity
            .on("mouseover", function(event, d) {
                // Reduce opacity of all other segments
                d3.selectAll(".arc path")
                    .style("opacity", function(p) {
                        return p.data.Food === d.data.Food ? 1 : 0.3; // Full opacity for hovered segment, reduced for others
                    });

                tooltip.style("display", "block");
                tooltip.html(`
                    <div class="tooltip-title">${d.data.Food}</div>
                    <table class="tooltip-content">
                        <tr>
                            <td>Percentage: </td>
                            <td class="value"><strong>${d.data.Percentage}</strong> %</td>
                        </tr>
                    </table>
                `);
            })
            .on("mousemove", function(event) {
                const tooltipX = event.clientX;
                const tooltipY = event.clientY;
                tooltip.style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                    .style("top", `${tooltipY}px`);
            })
            .on("mouseout", function() {
                // Reset opacity of all segments
                d3.selectAll(".arc path")
                    .style("opacity", 1);

                tooltip.style("display", "none");
            });

        // Add lines connecting slices to the text labels
        svg.selectAll("polyline")
            .data(pie(data))
            .enter().append("polyline")
            .attr("points", function(d) {
                const arcToUse = d.data.Percentage < 4.5 ? outerArcForSmallSlice : outerArc;
                const pos = arcToUse.centroid(d);
                pos[0] = radius * 1.15 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), arcToUse.centroid(d), pos];
            })
            .style("opacity", 0.3)
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("fill", "none")
            .attr("pointer-events", "none");

        // Add text labels at the end of the lines
        svg.selectAll(".label")
            .data(pie(data))
            .enter().append("text")
            .attr("transform", function(d) {
                const arcToUse = d.data.Percentage < 4.5 ? outerArcForSmallSlice : outerArc;
                const pos = arcToUse.centroid(d);
                pos[0] = radius * 1.2 * (midAngle(d) < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .attr("dy", "0.35em")
            .style("text-anchor", function(d) {
                return midAngle(d) < Math.PI ? "start" : "end";
            })
            .attr("class", "table-labels")
            .text(d => d.data.Food);

        // Define sizes for fork and spoon dynamically
        const forkSize = {
            width: width * 0.5,
            height: height * 0.5
        };

        const spoonSize = {
            width: width * 0.5,
            height: height * 0.5
        };

        // Add images to the left and right of the pie chart with dynamic sizes
        svg.append("image")
            .attr("xlink:href", "../../images/fork.png") // Path to the fork image
            .attr("width", forkSize.width) // Set dynamic width
            .attr("height", forkSize.height) // Set dynamic height
            .attr("x", -width * 0.7 - forkSize.width / 2) // Position to the left of the pie chart
            .attr("y", -forkSize.height / 2); // Center vertically relative to the pie chart

        svg.append("image")
            .attr("xlink:href", "../../images/spoon.png") // Path to the spoon image
            .attr("width", spoonSize.width) // Set dynamic width
            .attr("height", spoonSize.height) // Set dynamic height
            .attr("x", width * 0.7 - spoonSize.width / 2) // Position to the right of the pie chart
            .attr("y", -spoonSize.height / 2); // Center vertically relative to the pie chart

    }).catch(function(error) {
        console.error('Error loading the CSV file:', error);
    });

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

})();