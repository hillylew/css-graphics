(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("carbon-footprint-donut-chart");

   const tooltipDiv = document.createElement("div");
   tooltipDiv.id = "tooltip";
   tooltipDiv.className = "tooltip";
   container.appendChild(tooltipDiv);
   
   const tooltip = d3.select(container).select("#tooltip");

    // Dynamic dimensions
    const aspectRatio = 1; // Donut chart is usually square

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,
        right: containerWidth * 0.15,
        bottom: containerHeight * 0.05,
        left: containerWidth * 0.1,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
    const radius = Math.min(width, height) / 2;

    // Append SVG object
    const svg = d3
        .select("#carbon-footprint-donut-chart")
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", "translate(" + containerWidth / 2 + "," + containerHeight / 2 + ")");

    // Placeholder for displaying images
    const percentageImg = svg.append('image')
        .attr('class', 'percentage-image')
        .attr('x', -35) // Adjust based on the new image size
        .attr('y', -60) // Adjust this value to position the larger image
        .attr('width', 70) // Set the new width
        .attr('height', 70) // Set the new height
        .style('display', 'none');

    // Placeholder for displaying percentages
    const percentageText = svg.append("text")
        .attr("class", "percentage-text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em") // Adjust this value to move the text closer to the image
        .style("font-size", "1.5em");

    // Load data from CSV
    d3.csv(carbonFootprint1).then((data) => {
        // Convert the Percentage values to numerical format
        data.forEach(d => d.Percentage = +d.Percentage);

        // Set the color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.Food))
            .range([
                "#CECECE",
                "#FED679",
                "#ED974A",
                "#CE5845",
                "#E2E27A",
                "#386660",
                "#8FC8E5",
                "#3167A4",
                "#1C476D",
            ]);

        // Compute the position of each group on the pie:
        const pie = d3.pie()
            .value(d => d.Percentage)
            .sort(null); // Keep the order of the input data

        const pieData = pie(data);

        // Build the pie chart - arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.5) // This is the size of the donut hole
            .outerRadius(radius * 0.8);

        const outerArc = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius);

        // Build the donut chart
        svg
            .selectAll('allSlices')
            .data(pieData)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.Food))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("mouseover", function (event, d) {
                // Highlight the current section
                d3.selectAll('path').style('opacity', 0.3);
                d3.select(this).style('opacity', 1);

                // Create the dynamic image path
                const imagePath = `../../images/${d.data.Food.toLowerCase()}.png`;

                // Show the corresponding image
                percentageImg.attr('href', imagePath)
                    .style('display', 'block');

                // Show the percentage
                percentageText.text(d.data.Percentage + "%");
            })
            .on("mouseout", function (event, d) {
                // Reset the opacity
                d3.selectAll('path').style('opacity', 1);
                // Clear the percentage text
                percentageText.text("");
                // Hide the image
                percentageImg.style('display', 'none');
            });

        // Add the polylines between chart and labels:
        svg
            .selectAll('allPolylines')
            .data(pieData)
            .enter()
            .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', d => {
                const posA = arc.centroid(d); // line insertion in the slice
                const posB = outerArc.centroid(d); // line break position
                const posC = outerArc.centroid(d); // Label position
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = radius * 1.05 * (midangle < Math.PI ? 1 : -1); // Increased separation
                return [posA, posB, posC];
            });

        // Add the labels with percentages
        svg
            .selectAll('allLabels')
            .data(pieData)
            .enter()
            .append('text')
            .attr("class", "chart-labels")
            .text(d => `${d.data.Food}`) 
            .attr('transform', d => {
                const pos = outerArc.centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 1.09 * (midangle < Math.PI ? 1 : -1); // Increased separation
                return `translate(${pos})`;
            })
            .style('text-anchor', d => {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midangle < Math.PI ? 'start' : 'end');
            })
            .attr("dy", "0.35em"); // Adjust this value to vertically center the text

    }).catch(function (error) {
        console.log(error);
    });
})();
