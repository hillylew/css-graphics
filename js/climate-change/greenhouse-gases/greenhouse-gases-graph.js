(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("greenhouse-gases-graph");
    
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);
    
    const tooltip = d3.select(container).select("#tooltip");
    
    const aspectRatio = 0.6;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
    
    // Adjust the left margin here
    const dynamicMargin = {
      top: containerHeight * 0.02, // Increased top margin to accommodate wrapped text
      right: containerWidth * 0.1,
      bottom: containerHeight * 0.15, // Increased bottom margin to accommodate footnote
      left: containerWidth * 0.01, // Reduced left margin to shift table left
    };
    
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
    
    // Define the data as a constant variable
    const data = [
      {
        Compound: "Carbon dioxide (CO<sub>2</sub>)",
        "Pre-industry Concentration": "278 ppm",
        "Concentration in 2022": "417.9 ppm",
        "Atmospheric Lifetime (years)": "Variable",
        "Main Human Activity Source": "Fossil fuels, cement production, land use change",
        GWP: 1,
      },
      {
        Compound: "Methane (CH<sub>4</sub>)",
        "Pre-industry Concentration": "729 ppb",
        "Concentration in 2022": "1,923 ppb",
        "Atmospheric Lifetime (years)": 12,
        "Main Human Activity Source": "Fossil fuels, rice paddies, waste dumps, livestock",
        GWP: "30 (fossil fuel), 27 (non fossil fuel)",
      },
      {
        Compound: "Nitrous Oxide (N<sub>2</sub>O)",
        "Pre-industry Concentration": "270 ppb",
        "Concentration in 2022": "335.8 ppb",
        "Atmospheric Lifetime (years)": 109,
        "Main Human Activity Source": "Fertilizers, combustion industrial processes",
        GWP: 273,
      },
      {
        Compound: "HFC-134a (CF<sub>3</sub>CH<sub>2</sub>F)",
        "Pre-industry Concentration": "0 ppt",
        "Concentration in 2022": "108 ppt",
        "Atmospheric Lifetime (years)": 14,
        "Main Human Activity Source": "Refrigerant",
        GWP: 1526,
      },
      {
        Compound: "HFC-32 (CH<sub>2</sub>F<sub>2</sub>)",
        "Pre-industry Concentration": "0 ppt",
        "Concentration in 2022": "20 ppt",
        "Atmospheric Lifetime (years)": 5,
        "Main Human Activity Source": "Refrigerant",
        GWP: 771,
      },
      {
        Compound: "CFC-11 (CCl<sub>3</sub>F)",
        "Pre-industry Concentration": "0 ppt",
        "Concentration in 2022": "226 ppt",
        "Atmospheric Lifetime (years)": 52,
        "Main Human Activity Source": "Refrigerant",
        GWP: 6226,
      },
      {
        Compound: "PFC-14 (CF<sub>4</sub>)",
        "Pre-industry Concentration": "34 ppt",
        "Concentration in 2022": "86 ppt",
        "Atmospheric Lifetime (years)": 50000,
        "Main Human Activity Source": "Aluminum production",
        GWP: 7380,
      },
      {
        Compound: "SF<sub>6</sub>",
        "Pre-industry Concentration": "0 ppt",
        "Concentration in 2022": "9.95 ppt",
        "Atmospheric Lifetime (years)": 3200,
        "Main Human Activity Source": "Electrical insulation",
        GWP: 25200,
      },
    ];
    
    const columns = [
      "Compound",
      "Pre-industry Concentration",
      "Concentration in 2022",
      "Atmospheric Lifetime (years)",
      "Main Human Activity Source",
      "GWP",
    ];
    
    // Create table and append it to the container
    const table = d3
      .select("#greenhouse-gases-graph")
      .append("table")
      .attr("class", "chart-labels styled-table")
      .style("width", `${width}px`)  // Set the width of the table
      .style("height", `${height}px`);  // Set the height of the table
    
    // Apply CSS styles for center alignment and adjust font size
    table.style("text-align", "center"); // Reduce the font size
    
    // Append table header
    const thead = table.append("thead").append("tr");
    columns.forEach((column) => {
      thead.append("th").attr("class", "chart-labels").style("text-align", "center").html(column);
    });
    
    // Append table body and rows
    const tbody = table.append("tbody");
    data.forEach((rowData) => {
      const row = tbody.append("tr");
      columns.forEach((column) => {
        row.append("td").attr("class", "chart-labels").style("padding", "5px").html(rowData[column]); // Reduce padding
      });
    });
    
    // Append the footnote
    d3.select("#greenhouse-gases-graph")
      .append("text")
      .attr("x", 0)
      .attr("y", height + dynamicMargin.bottom * 0.3) // Position below the last row
      .attr("class", "chart-labels")
      .text("*Concentration in 2022, **GWP = 100-year global warming potential.");
  })();