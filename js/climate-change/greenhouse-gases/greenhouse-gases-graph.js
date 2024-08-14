(() => {
  // Define the data as a constant variable
  const data = [
    {
      Compound: "Carbon dioxide (CO<sub>2</sub>)",
      "Pre-industry Concentration": "278 ppm",
      "concentration in 2019": "417.9 ppm*",
      "Atmospheric Lifetime (years)": "Variable",
      "Main Human Activity Source": "Fossil fuels, cement production, land use change",
      "GWP**": 1,
    },
    {
      Compound: "Methane (CH<sub>4</sub>)",
      "Pre-industry Concentration": "729 ppb",
      "concentration in 2019": "1,923 ppb*",
      "Atmospheric Lifetime (years)": 12,
      "Main Human Activity Source": "Fossil fuels, rice paddies, waste dumps, livestock",
      "GWP**": "30 (fossil fuel), 27 (non-fossil fuel)",
    },
    {
      Compound: "Nitrous Oxide (N<sub>2</sub>O)",
      "Pre-industry Concentration": "270 ppb",
      "concentration in 2019": "335.8 ppb*",
      "Atmospheric Lifetime (years)": 109,
      "Main Human Activity Source": "Fertilizers, combustion industrial processes",
      "GWP**": 273,
    },
    {
      Compound: "HFC-134a (CF<sub>3</sub>CH<sub>2</sub>F)",
      "Pre-industry Concentration": "0 ppt",
      "concentration in 2019": "108 ppt",
      "Atmospheric Lifetime (years)": 14,
      "Main Human Activity Source": "Refrigerant",
      "GWP**": 1526,
    },
    {
      Compound: "HFC-32 (CH<sub>2</sub>F<sub>2</sub>)",
      "Pre-industry Concentration": "0 ppt",
      "concentration in 2019": "20 ppt",
      "Atmospheric Lifetime (years)": 5,
      "Main Human Activity Source": "Refrigerant",
      "GWP**": 771,
    },
    {
      Compound: "CFC-11 (CCl<sub>3</sub>F)",
      "Pre-industry Concentration": "0 ppt",
      "concentration in 2019": "226 ppt",
      "Atmospheric Lifetime (years)": 52,
      "Main Human Activity Source": "Refrigerant",
      "GWP**": 6226,
    },
    {
      Compound: "PFC-14 (CF<sub>4</sub>)",
      "Pre-industry Concentration": "34 ppt",
      "concentration in 2019": "86 ppt",
      "Atmospheric Lifetime (years)": 50000,
      "Main Human Activity Source": "Aluminum production",
      "GWP**": 7380,
    },
    {
      Compound: "SF<sub>6</sub>",
      "Pre-industry Concentration": "0 ppt",
      "concentration in 2019": "9.95 ppt",
      "Atmospheric Lifetime (years)": 3200,
      "Main Human Activity Source": "Electrical insulation",
      "GWP**": 25200,
    },
  ];

  const columns = [
    "Compound",
    "Pre-industry Concentration",
    "concentration in 2019",
    "Atmospheric Lifetime (years)",
    "Main Human Activity Source",
    "GWP**",
  ];

  const container = document.getElementById("greenhouse-gases-graph");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);

  const tooltip = d3.select(container).select("#tooltip");

  const createTable = () => {
    // Clear existing content
    container.innerHTML = '';
    container.appendChild(tooltipDiv);

    const aspectRatio = 0.6;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    const dynamicMargin = {
      top: containerHeight * 0.02,
      right: containerWidth * 0.1,
      bottom: containerHeight * 0.05,
      left: containerWidth * 0.01,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    const table = d3
      .select("#greenhouse-gases-graph")
      .append("table")
      .attr("class", "table-labels styled-table")
      .style("width", `${width}px`)
      .style("height", `${height}px`)
      .style("border-radius", "12px")
      .style("overflow", "hidden");
    
    // Center alignment
    table.style("text-align", "center");

    const thead = table.append("thead").append("tr");
    columns.forEach((column) => {
      thead.append("th").attr("class", "table-labels").style("text-align", "center").html(column);
    });

    const tbody = table.append("tbody");
    data.forEach((rowData) => {
      const row = tbody.append("tr");
      columns.forEach((column) => {
        row.append("td").attr("class", "table-labels").style("padding", "5px").html(rowData[column]);
      });
    });

    d3.select("#greenhouse-gases-graph")
      .append("text")
      .attr("x", 0)
      .attr("y", height + dynamicMargin.bottom * 0.1)
      .attr("class", "table-labels")
      .text("*Concentration in 2022; 1ppm = 1,000 ppb = 1,000,000 ppt; **GWP = 100-year global warming potential");
  };

  // Initial table creation
  createTable();

  // Event listener for window resize
  window.addEventListener('resize', createTable);
})();