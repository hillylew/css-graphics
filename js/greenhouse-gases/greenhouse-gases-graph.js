(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.8;
  
    // Get the container and its dimensions
    const container = document.getElementById("greenhouse-gases-graph");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.05,
      right: containerWidth * 0.05,
      bottom: containerHeight * 0.3,
      left: containerWidth * 0.1,
    };
  
    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#greenhouse-gases-graph")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    /* ----------------------- X and Y Scales ----------------------- */
    const x = d3.scaleBand().range([0, width]).padding(0.1);
  
    const y = d3.scaleLinear().range([height, 0]);
  
    // Load and process the CSV data
    d3.csv("./data/greenhouse-gases/greenhouse-gases1.csv").then((data) => {
      // Convert numeric fields from string to numeric
      data.forEach((d) => {
        d["GWP"] = +d["GWP"];
      });
  
      // Set domain for x and y scales
      x.domain(data.map((d) => d["Compound"]));
      y.domain([0, Math.ceil(d3.max(data, (d) => d["GWP"]) / 2000) * 2000]);
  
      // Append x-axis
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll(".tick text")
        .call(wrapText1, x.bandwidth());
  
      // Remove x-axis tick marks
      svg.selectAll(".x-axis .tick line").attr("stroke", "none");
  
      // Append y-axis
      svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

        // Add y-axis label
        svg.append("text")
        .attr("class", "chart-labels")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -dynamicMargin.left/1.5)
        .attr("x", 0)
        .text("100 Year Global Warming Potential");
  
      // Append bars
      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d["Compound"]))
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d["GWP"]))
        .attr("height", (d) => height - y(d["GWP"]))
        .attr("fill", "#3167a4");
  
      // Function to wrap text for x-axis labels
      function wrapText1(text) {
        text.each(function () {
          const text = d3.select(this);
          const words = text.text().split(/\(|\)/).filter(Boolean);
          text.text(null);
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", "0.5em")  // Adjust the padding here
            .text(words[0].trim());
          if (words.length > 1) {
            text.append("tspan")
              .attr("x", 0)
              .attr("dy", "1.1em")
              .text("(" + words[1].trim() + ")");
          }
        });
      }
  
      // After the existing chart rendering code, append a "g" element that will contain the table rows
      const table = svg.append("g")
        .attr("class", "table")
        .attr("transform", `translate(0, ${height + 50})`); // Position the table below the bar chart
  
      // Define the vertical positions for each row based on your needs
      const rows = [
        { label: "Percent Change", y: 0 },
        // { label: "Atmospheric Lifetime", y: 20 },
        // { label: "Main Human Activity Source", y: 40 }
      ];
  
      // Create a group for each row
      const tableRows = table.selectAll(".table-row")
        .data(rows)
        .enter()
        .append("g")
        .attr("transform", d => `translate(0, ${d.y})`);
  
      // Function to wrap text with a given width
      function wrapText(selection, width) {
        selection.each(function () {
          var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
  
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });
      }
  
      // Existing code: (do not touch this part)
      tableRows.each(function (rowData) {
        const row = d3.select(this);
  
        row.selectAll("text")
          .data(data)
          .enter()
          .append("text")
          .attr("x", d => x(d["Compound"]) + x.bandwidth() / 2) // Center the text under each bar
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .text(d => {
            switch (rowData.label) {
              case "Percent Change":
                const percentChange = ((d["Concentration in 2022"] - d["Pre-industry Concentration"]) / d["Pre-industry Concentration"]) * 100;
                return percentChange.toFixed(2) + "%";
              case "Atmospheric Lifetime":
                return d["Atmospheric Lifetime"];
              case "Main Human Activity Source":
                // Initially set the text and then call the wrapText function only for this case
                return d["Main Human Activity Source"];
              default:
                return "";
            }
          })
          // Here we apply the wrapping only to the Main Human Activity Source column after setting its text
          .each(function (d, i) {
            if (rowData.label === "Main Human Activity Source") {
              d3.select(this).call(wrapText, x.bandwidth()); // you can adjust the width as needed
            }
          });
      });
  
    });
  })();
  

  function createBarChart(compoundName, preIndustryConc, conc2022) {

    // const percentChange = ((conc2022 - preIndustryConc) / preIndustryConc) * 100;
  
    // Data for the bars
    const data = [
        { name: 'Pre-industry', value: preIndustryConc },
        { name: 'Concentration in 2022', value: conc2022 }
    ];
  
    const margin = { top: 20, right: 0, bottom: 0, left: 0 };
    const width = 60 - margin.left - margin.right;
    const height = 80 - margin.top - margin.bottom;
  
    // Append SVG object with proper margin
    const svg = d3.select('#greenhouse-gases-graph').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'change-chart')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // X scale
    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .padding(0.4);
  
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, Math.max(preIndustryConc, conc2022)])
        .range([height, 0]);
  
    // Bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', '#69b3a2');

    // Add text labels on top of each bar
    svg.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'chart-labels')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5) // Adjust position for better visibility
        .attr('text-anchor', 'middle')
        .text(d => d.value.toFixed(0)); // Display values with two decimal places
}
  
  // Example call for each compound
  createBarChart('Carbon dioxide (CO2)', 278, 417);
  createBarChart('Methane (CH4)', 729, 1923);
  createBarChart('Nitrous Oxide (N2O)', 270, 335.8);
  createBarChart('HFC-32 (CH2F2)', 0, 20);
  createBarChart('HFC-134a (CF3CH2F)', 0, 108);
  createBarChart('CFC-11 (CCl3F)', 0, 226);
  createBarChart('PFC-14 (CF4)', 34, 86);
  createBarChart('SF6', 0, 9.95);
  