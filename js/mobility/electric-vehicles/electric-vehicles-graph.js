(function () {
    const aspectRatio = 0.7;
    const data = {
        "Internal Combustion Engine": {
            Pickup: { efficiency: 100, ghg: "543-573" },
            SUV: { efficiency: 82, ghg: "435-485" },
            Sedan: { efficiency: 71, ghg: "373-420" }
        },
        "Hybrid Electric Vehicle": {
            Pickup: { efficiency: 72, ghg: "388-410" },
            SUV: { efficiency: 59, ghg: "317-345" },
            Sedan: { efficiency: 49, ghg: "262-287" }
        },
        "Battery Electric Vehicle": {
            Pickup: { efficiency: 35, ghg: "182-207" },
            SUV: { efficiency: 31, ghg: "162-170" },
            Sedan: { efficiency: 24, ghg: "129-136" }
        }
    };

    let selections = {
        car1: { type: null, ev: null },
        car2: { type: null, ev: null }
    };

    const container = d3.select("#electric-vehicles-graph");

    function renderDiagram() {
        // Clear existing content
        container.selectAll('*').remove();

        // Get dimensions
        const containerWidth = container.node().offsetWidth;
        const containerHeight = containerWidth * aspectRatio;

        // Calculate the dynamic margins
        const dynamicMargin = {
            top: containerHeight * 0.05,
            right: containerWidth * 0.01,
            bottom: containerHeight * 0.02, 
            left: containerWidth * 0.01,
        };

        // Calculate the width and height for the inner drawing area
        const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
        const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

        // Append SVG object
        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .append("g")
            .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

        const gridContainer = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const carTypes = ["Pickup", "SUV", "Sedan"];
        const carEvs = ["Internal Combustion Engine", "Hybrid Electric Vehicle", "Battery Electric Vehicle"];

        appendOptions(gridContainer, carTypes, carEvs, 1);
        appendResult(gridContainer);
        appendOptions(gridContainer, carTypes, carEvs, 2);
        appendRangeData(gridContainer);
        appendResetButton(gridContainer);

        // Add event listeners
        d3.selectAll('.grid-item').on("click", function () {
            const item = d3.select(this);
            const car = item.attr("data-car");
            const category = item.attr("data-category");
            const value = item.attr("data-value");

            selections[`car${car}`][category] = value;

            // Remove the selected class from other items in the same category and car
            d3.selectAll(`.grid-item[data-car="${car}"][data-category="${category}"]`)
                .classed('selected', false)
                .style("stroke", "white");  // Reset stroke for non-selected items

            // Add the selected class to the clicked item and update its border
            item.classed('selected', true)
                .style("stroke", "red")
                .style("stroke-width", 1);

            // Update button colors based on selections
            updateButtonColors();

            // Update results
            compareResults();
        });

        function appendOptions(parent, types, evs, carId) {
            const boxWidth = width * 0.17; // Increase button width
            const boxHeight = height * 0.12; // Increase button height
            const spacing = boxHeight * 1.5;
            const offsetX = carId === 1 ? -width * 0.5 : 0; // Adjust based on center line

            types.forEach((type, index) => {
                const row = spacing * (index + 1) - height * 0.5; // Adjust based on center line
                parent.append("rect")
                    .attr("class", "grid-item")
                    .attr("x", offsetX)
                    .attr("y", row)
                    .attr("width", boxWidth)
                    .attr("height", boxHeight)
                    .attr("data-car", carId)
                    .attr("data-category", "type")
                    .attr("data-value", type)
                    .style("fill", "#CECECE")
                    .style("stroke", "white")
                    .attr("rx", 3) // Rounded corners
                    .attr("ry", 3); // Rounded corners

                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", offsetX + boxWidth / 2)
                    .attr("y", row + boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(type);
            });

            evs.forEach((ev, index) => {
                const row = spacing * (index + 1) - height * 0.5; // Adjust based on center line
                const col = offsetX + width * 0.2;
                parent.append("rect")
                    .attr("class", "grid-item")
                    .attr("x", col)
                    .attr("y", row)
                    .attr("width", boxWidth)
                    .attr("height", boxHeight)
                    .attr("data-car", carId)
                    .attr("data-category", "ev")
                    .attr("data-value", ev)
                    .style("fill", "#CECECE")
                    .style("stroke", "white")
                    .attr("rx", 3) // Rounded corners
                    .attr("ry", 3); // Rounded corners

                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", col + boxWidth / 2)
                    .attr("y", row + boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(ev);
            });
        }

        function appendResult(parent) {
            parent.append("text")
                .attr("id", "result")
                .attr("x", 0)
                .attr("y", -height * 0.4)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .attr("class", "diagram-labels")
                .text("Select Options to Compare");
        }

        function appendRangeData(parent) {
            parent.append("text")
                .attr("class", "range-data")
                .attr("id", "range-data-car1")
                .attr("x", -width * 0.25)
                .attr("y", height * 0.4)
                .attr("text-anchor", "middle")
                .text("Car 1 Range");

            parent.append("text")
                .attr("class", "range-data")
                .attr("id", "range-data-car2")
                .attr("x", width * 0.25)
                .attr("y", height * 0.4)
                .attr("text-anchor", "middle")
                .text("Car 2 Range");
        }

        function appendResetButton(parent) {
            const buttonWidth = width * 0.2;
            const buttonHeight = height * 0.08;
            const buttonX = -buttonWidth / 2;
            const buttonY = height * 0.45;

            const button = parent.append("rect")
                .attr("id", "reset-button")
                .attr("x", buttonX)
                .attr("y", buttonY)
                .attr("width", buttonWidth)
                .attr("height", buttonHeight)
                .style("fill", "#CECECE")
                .style("stroke", "white")
                .style("cursor", "pointer")
                .attr("rx", 3) // Rounded corners
                .attr("ry", 3); // Rounded corners

            const buttonText = parent.append("text")
                .attr("id", "reset-button-text")
                .attr("x", 0)
                .attr("y", buttonY + buttonHeight / 2)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .text("Reset");

            // Add click event to reset button
            button.on("click", resetSelections);
        }

        function resetSelections() {
            selections = {
                car1: { type: null, ev: null },
                car2: { type: null, ev: null }
            };
        
            d3.selectAll('.grid-item').classed('selected', false);
        
            d3.selectAll('.grid-item').style('fill', '#CECECE');
        
            d3.selectAll('.grid-item').style('stroke', 'white').style('stroke-width', 1);
        
            d3.select('#result').text("Select Options to Compare").style('fill', 'black');
            d3.select('#range-data-car1').text("Car 1 Range").style('fill', 'black');
            d3.select('#range-data-car2').text("Car 2 Range").style('fill', 'black');
        }

        function updateButtonColors() {
            if (selections.car1.type) {
                d3.selectAll('.grid-item[data-car="1"][data-category="type"]')
                  .style('fill', '#FED679');
            }

            if (selections.car1.ev) {
                d3.selectAll('.grid-item[data-car="1"][data-category="ev"]')
                  .style('fill', '#FED679');
            }

            if (selections.car2.type) {
                d3.selectAll('.grid-item[data-car="2"][data-category="type"]')
                  .style('fill', '#FED679');
            }

            if (selections.car2.ev) {
                d3.selectAll('.grid-item[data-car="2"][data-category="ev"]')
                  .style('fill', '#FED679');
            }
        }

        function compareResults() {
            const { car1, car2 } = selections;
            if (car1.type && car1.ev && car2.type && car2.ev) {
                const result1 = data[car1.ev][car1.type].efficiency;
                const result2 = data[car2.ev][car2.type].efficiency;
                let difference = (result2 - result1);
                const range1 = data[car1.ev][car1.type].ghg;
                const range2 = data[car2.ev][car2.type].ghg;

                difference = difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2);

                d3.select('#result').text(`Change in Emissions: ${difference}%`);
                d3.select('#range-data-car1').text(`GHG Emissions Range: ${range1}`);
                d3.select('#range-data-car2').text(`GHG Emissions Range: ${range2}`);

                let resultColor;
                if (difference === "0.00") {
                    resultColor = 'gray';
                } else {
                    resultColor = parseFloat(difference) < 0 ? 'green' : 'red';
                }
                d3.select('#result').style('fill', resultColor);

                const ghg1 = parseInt(data[car1.ev][car1.type].ghg.split('-')[0]);
                const ghg2 = parseInt(data[car2.ev][car2.type].ghg.split('-')[0]);

                const color1 = calculateColor(ghg1);
                const color2 = calculateColor(ghg2);

                d3.select('#range-data-car1').style('fill', color1);
                d3.select('#range-data-car2').style('fill', color2);
            }
        }

        function calculateColor(value, minVal = 129, maxVal = 550) {
            const normalized = (value - minVal) / (maxVal - minVal);

            let red = 0, green = 0, blue = 0;

            if (normalized < 0.5) {
                green = 255;
                red = Math.round(2 * normalized * 255);
            } else {
                green = Math.round((1 - 2 * (normalized - 0.5)) * 255);
                red = 255;
            }

            const opacity = 0.5;

            return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        }
    }

    renderDiagram();
    window.addEventListener('resize', renderDiagram);

})();