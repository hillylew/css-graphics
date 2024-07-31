(async () => {
    // Load data from the world atlas package
    const world = await d3.json("https://unpkg.com/world-atlas@2/countries-110m.json");

    // Map container
    const container = d3.select("#environmental-justice-interactive-map2");
    const width = 960;
    const height = 580;

    // Define your e-waste data by continent
    const eWasteByContinent = {
        'Africa': 3.5,
        'Americas': 14.0,
        'Asia': 30.0,
        'Europe': 13.0,
        'Oceania': 0.7
    };

    // Approximate coordinates for continent centers
    const continentCoords = {
        'Africa': [20, 0],
        'Americas': [-80, 0],
        'Asia': [100, 40],
        'Europe': [15, 50],
        'Oceania': [150, -25]
    };

    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .scale(150);

    const path = d3.geoPath().projection(projection);
    
    // Define a scale for bubble size to showcase e-waste data
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(Object.values(eWasteByContinent))])
        .range([0, 50]); // Adjust the range for appropriate sizing on your map.

    // Draw the world map
    const countries = topojson.feature(world, world.objects.countries).features;
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", "lightgrey")
        .style("stroke", "#ffffff")
        .style("stroke-width", 0.5);

    // Add bubbles for e-waste to the map
    Object.entries(eWasteByContinent).forEach(([continent, eWaste]) => {
        const coords = continentCoords[continent];

        svg.append("circle")
            .attr("cx", projection(coords)[0])
            .attr("cy", projection(coords)[1])
            .attr("r", radiusScale(eWaste))
            .style("fill", "rgba(255, 0, 0, 0.5)")
            .style("stroke", "red")
            .style("stroke-width", 1.5);
    });

    // Add a legend for e-waste bubbles here if needed
})();