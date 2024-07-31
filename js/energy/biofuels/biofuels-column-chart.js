(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;

    const container = document.getElementById("biofuels-column-chart");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.1,
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.05,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#biofuels-column-chart")
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- Scales, axes, and color ----------------------- */
    const x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    const x1 = d3.scaleBand()
        .padding(0.05);

    const y = d3.scaleLinear()
        .rangeRound([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Brazil", "USA", "EU", "Indonesia and Malaysia", "China", "Mozambique", "South Africa"])
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        

         

    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("../../data/energy/biofuels/biofuels3.csv", function (d) {
        // This function parses each row of the CSV
        d["Biofuel yield"] = +d["Biofuel yield"]; // Convert yield to number
        return d;
    }).then(function (data) {
        // Data processing happens here

        // Extract categories for the x-axis and subcategories for the x1-axis
        let feedstockNames = [...new Set(data.map(d => d.Feedstock))];
        let regionNames = [...new Set(data.map(d => d.Region))];

        x0.domain(feedstockNames);
        x1.domain(regionNames).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, d => d["Biofuel yield"])]).nice();

        // Append the x-axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0));

        // Append the y-axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("GJ/ha");

        // Group data by feedstock to make the bars grouped
        let groupData = Array.from(d3.group(data, d => d.Feedstock), ([key, value]) => ({ key, value }));

        let feedstockGroup = svg.selectAll(".feedstockGroup")
            .data(groupData)
            .enter().append("g")
            .attr("class", "feedstockGroup")
            .attr("transform", d => `translate(${x0(d.key)},0)`);

        feedstockGroup.each(function (d) {
            const barWidth = x0.bandwidth() / d.value.length; // Calculate width per bar in the group

            d3.select(this).selectAll("rect")
                .data(d.value)
                .enter().append("rect")
                .attr("x", (d, i) => i * barWidth) // Position each bar within the group
                .attr("y", d => y(d["Biofuel yield"]))
                .attr("width", barWidth)
                .attr("height", d => y(0) - y(d["Biofuel yield"]))
                .attr("fill", d => colorScale(d["Region"]));

            // // Add labels for each bar
            // d3.select(this).selectAll(".bar-label")
            //     .data(d.value)
            //     .enter().append("text")
            //     .attr("class", "bar-label")
            //     .attr("x", (d, i) => i * barWidth + barWidth / 2) // Position labels at the center of each bar
            //     .attr("y", d => y(d["Biofuel yield"]) - 5) // Offset the label slightly above the bar
            //     .attr("text-anchor", "middle") // Center-align the text horizontally
            //     .attr("fill", "#000") // Set the text color
            //     .text(d => d["Region"]); // Set the text content to the region name
        });

        // Optional: Add axis labels, legends, tooltips, etc.
    }).catch(function (error) {
        console.log("Error loading the CSV file:", error);
    });
})();
