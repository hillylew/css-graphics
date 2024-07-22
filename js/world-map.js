(async () => {
    // Load data from the world atlas package
    const world = await d3.json("https://unpkg.com/world-atlas@2/countries-110m.json");

    // Map country codes to continent
    const countryToContinent = {
        4: 'Asia',       // Afghanistan
        8: 'Europe',     // Albania
        10: 'Antarctica',// Antarctica
        12: 'Africa',    // Algeria
        20: 'Europe',    // Andorra
        24: 'Africa',    // Angola
        28: 'Americas',  // Antigua and Barbuda
        31: 'Asia',      // Azerbaijan
        32: 'Americas',  // Argentina
        36: 'Oceania',   // Australia
        40: 'Europe',    // Austria
        44: 'Americas',  // Bahamas
        48: 'Asia',      // Bahrain
        50: 'Asia',      // Bangladesh
        51: 'Europe',    // Armenia
        52: 'Americas',  // Barbados
        56: 'Europe',    // Belgium
        60: 'Americas',  // Bermuda
        64: 'Asia',      // Bhutan
        68: 'Americas',  // Bolivia
        70: 'Europe',    // Bosnia and Herzegovina
        72: 'Africa',    // Botswana
        76: 'Americas',  // Brazil
        84: 'Americas',  // Belize
        86: 'Asia',      // British Indian Ocean Territory
        90: 'Oceania',   // Solomon Islands
        92: 'Americas',  // British Virgin Islands
        96: 'Asia',      // Brunei
        100: 'Europe',   // Bulgaria
        104: 'Asia',     // Myanmar
        108: 'Africa',   // Burundi
        112: 'Europe',   // Belarus
        116: 'Asia',     // Cambodia
        120: 'Africa',   // Cameroon
        124: 'Americas', // Canada
        132: 'Africa',   // Cape Verde
        136: 'Americas', // Cayman Islands
        140: 'Africa',   // Central African Republic
        144: 'Asia',     // Sri Lanka
        148: 'Africa',   // Chad
        152: 'Americas', // Chile
        156: 'Asia',     // China
        170: 'Americas', // Colombia
        174: 'Africa',   // Comoros
        178: 'Africa',   // Congo
        180: 'Africa',   // Democratic Republic of the Congo
        184: 'Oceania',  // Cook Islands
        188: 'Americas', // Costa Rica
        191: 'Europe',   // Croatia
        192: 'Americas', // Cuba
        196: 'Europe',   // Cyprus
        203: 'Europe',   // Czech Republic
        204: 'Africa',   // Benin
        208: 'Europe',   // Denmark
        212: 'Americas', // Dominica
        214: 'Americas', // Dominican Republic
        218: 'Americas', // Ecuador
        222: 'Americas', // El Salvador
        226: 'Africa',   // Equatorial Guinea
        231: 'Africa',   // Ethiopia
        232: 'Africa',   // Eritrea
        233: 'Europe',   // Estonia
        234: 'Europe',   // Faroe Islands
        238: 'Americas', // Falkland Islands
        239: 'Africa',   // South Georgia and the South Sandwich Islands
        242: 'Oceania',  // Fiji
        246: 'Europe',   // Finland
        250: 'Europe',   // France
        254: 'Americas', // French Guiana
        258: 'Oceania',  // French Polynesia
        262: 'Africa',   // Djibouti
        266: 'Africa',   // Gabon
        268: 'Asia',     // Georgia
        270: 'Africa',   // Gambia
        275: 'Asia',     // Palestine
        276: 'Europe',   // Germany
        288: 'Africa',   // Ghana
        292: 'Europe',   // Gibraltar
        296: 'Oceania',  // Kiribati
        300: 'Europe',   // Greece
        304: 'North America', // Greenland
        308: 'Americas', // Grenada
        312: 'Americas', // Guadeloupe
        316: 'Oceania',  // Guam
        320: 'Americas', // Guatemala
        324: 'Africa',   // Guinea
        328: 'Americas', // Guyana
        332: 'Americas', // Haiti
        340: 'Americas', // Honduras
        344: 'Asia',     // Hong Kong
        348: 'Europe',   // Hungary
        352: 'Europe',   // Iceland
        356: 'Asia',     // India
        360: 'Asia',     // Indonesia
        364: 'Asia',     // Iran
        368: 'Asia',     // Iraq
        372: 'Europe',   // Ireland
        376: 'Asia',     // Israel
        380: 'Europe',   // Italy
        384: 'Africa',   // Ivory Coast
        388: 'Americas', // Jamaica
        392: 'Asia',     // Japan
        398: 'Asia',     // Kazakhstan
        400: 'Asia',     // Jordan
        404: 'Africa',   // Kenya
        408: 'Asia',     // North Korea
        410: 'Asia',     // South Korea
        414: 'Asia',     // Kuwait
        417: 'Asia',     // Kyrgyzstan
        418: 'Asia',     // Laos
        422: 'Asia',     // Lebanon
        426: 'Africa',   // Lesotho
        428: 'Europe',   // Latvia
        430: 'Africa',   // Liberia
        434: 'Africa',   // Libya
        438: 'Europe',   // Liechtenstein
        440: 'Europe',   // Lithuania
        442: 'Europe',   // Luxembourg
        446: 'Asia',     // Macau
        450: 'Africa',   // Madagascar
        454: 'Africa',   // Malawi
        458: 'Asia',     // Malaysia
        462: 'Asia',     // Maldives
        466: 'Africa',   // Mali
        470: 'Europe',   // Malta
        478: 'Africa',   // Mauritania
        480: 'Africa',   // Mauritius
        484: 'Americas', // Mexico
        496: 'Asia',     // Mongolia
        498: 'Europe',   // Moldova
        499: 'Europe',   // Montenegro
        500: 'Americas', // Montserrat
        504: 'Africa',   // Morocco
        508: 'Africa',   // Mozambique
        512: 'Asia',     // Oman
        516: 'Africa',   // Namibia
        520: 'Oceania',  // Nauru
        524: 'Asia',     // Nepal
        528: 'Europe',   // Netherlands
        531: 'Americas', // Curacao
        533: 'Americas', // Aruba
        534: 'Americas', // Sint Maarten
        535: 'Americas', // Bonaire, Saint Eustatius and Saba
        540: 'Oceania',  // New Caledonia
        548: 'Oceania',  // Vanuatu
        554: 'Oceania',  // New Zealand
        558: 'Americas', // Nicaragua
        562: 'Africa',   // Niger
        566: 'Africa',   // Nigeria
        570: 'Oceania',  // Niue
        574: 'Oceania',  // Norfolk Island
        578: 'Europe',   // Norway
        580: 'Oceania',  // Northern Mariana Islands
        581: 'Oceania',  // United States Minor Outlying Islands
        583: 'Oceania',  // Micronesia
        584: 'Oceania',  // Marshall Islands
        585: 'Oceania',  // Palau
        586: 'Asia',     // Pakistan
        591: 'Americas', // Panama
        598: 'Oceania',  // Papua New Guinea
        600: 'Americas', // Paraguay
        604: 'Americas', // Peru
        608: 'Asia',     // Philippines
        612: 'Oceania',  // Pitcairn
        616: 'Europe',   // Poland
        620: 'Europe',   // Portugal
        624: 'Africa',   // Guinea-Bissau
        626: 'Asia',     // Timor-Leste
        630: 'Americas', // Puerto Rico
        634: 'Asia',     // Qatar
        638: 'Africa',   // Réunion
        642: 'Europe',   // Romania
        643: 'Europe',   // Russia
        646: 'Africa',   // Rwanda
        652: 'Americas', // Saint Barthélemy
        654: 'Africa',   // Saint Helena
        659: 'Americas', // Saint Kitts and Nevis
        660: 'Americas', // Anguilla
        662: 'Americas', // Saint Lucia
        663: 'Americas', // Saint Martin
        666: 'Americas', // Saint Pierre and Miquelon
        670: 'Americas', // Saint Vincent and the Grenadines
        674: 'Europe',   // San Marino
        678: 'Africa',   // Sao Tome and Principe
        682: 'Asia',     // Saudi Arabia
        686: 'Africa',   // Senegal
        688: 'Europe',   // Serbia
        690: 'Africa',   // Seychelles
        694: 'Africa',   // Sierra Leone
        702: 'Asia',     // Singapore
        703: 'Europe',   // Slovakia
        704: 'Asia',     // Vietnam
        705: 'Europe',   // Slovenia
        706: 'Africa',   // Somalia
        710: 'Africa',   // South Africa
        716: 'Africa',   // Zimbabwe
        724: 'Europe',   // Spain
        728: 'Africa',   // South Sudan
        729: 'Africa',   // Sudan
        732: 'Africa',   // Western Sahara
        740: 'Americas', // Suriname
        744: 'Europe',   // Svalbard and Jan Mayen
        748: 'Africa',   // Eswatini
        752: 'Europe',   // Sweden
        756: 'Europe',   // Switzerland
        760: 'Asia',     // Syria
        762: 'Asia',     // Tajikistan
        764: 'Asia',     // Thailand
        768: 'Africa',   // Togo
        772: 'Oceania',  // Tokelau
        776: 'Oceania',  // Tonga
        780: 'Americas', // Trinidad and Tobago
        784: 'Asia',     // United Arab Emirates
        788: 'Africa',   // Tunisia
        792: 'Asia',     // Turkey
        795: 'Asia',     // Turkmenistan
        796: 'Americas', // Turks and Caicos Islands
        798: 'Oceania',  // Tuvalu
        800: 'Africa',   // Uganda
        804: 'Europe',   // Ukraine
        807: 'Europe',   // North Macedonia
        818: 'Africa',   // Egypt
        826: 'Europe',   // United Kingdom
        831: 'Europe',   // Guernsey
        832: 'Europe',   // Jersey
        833: 'Europe',   // Isle of Man
        834: 'Africa',   // Tanzania
        840: 'Americas', // United States
        850: 'Americas', // U.S. Virgin Islands
        854: 'Africa',   // Burkina Faso
        858: 'Americas', // Uruguay
        860: 'Asia',     // Uzbekistan
        862: 'Americas', // Venezuela
        876: 'Oceania',  // Wallis and Futuna
        882: 'Oceania',  // Samoa
        887: 'Asia',     // Yemen
        894: 'Africa',    // Zambia

    };

    // Map for associating continents with colors
    const continentColors = {
        Africa: '#ffcc00',
        Americas: '#ff3300',
        Asia: '#009933',
        Europe: '#3366ff',
        Oceania: '#ff66cc',
    };

    const container = d3.select("#environmental-justice-interactive-map2");
    const width = 960;
    const height = 580;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .scale(150);

    const path = d3.geoPath().projection(projection);

    const countries = topojson.feature(world, world.objects.countries).features.filter(d => d.id !== "010");

    // Draw the world map colored by continent
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", d => {
            const continent = countryToContinent[d.id];
            return continent ? continentColors[continent] : "black"; // Default color for countries not found in any continent list
        })
        .style("stroke", "#ffffff")
        .style("stroke-width", 0.5);

    // Legend code
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(20, 20)");

    Object.entries(continentColors).forEach(([continent, color], index) => {
        const legendItem = legend.append("g").attr("transform", `translate(0, ${index * 20})`);

        legendItem.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color);
        
        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(continent);
    });
})();
