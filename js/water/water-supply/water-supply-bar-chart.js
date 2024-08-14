(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById('water-supply-bar-chart');

    const tooltipDiv = document.createElement('div');
    tooltipDiv.id = 'tooltip';
    tooltipDiv.className = 'tooltip';
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select('#tooltip');

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.35;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,
        right: containerWidth * 0.25,  // Adjusted for horizontal space
        bottom: containerHeight * 0.25,
        left: containerWidth * 0.1,  // Adjusted for vertical labels
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .append('g')
        .attr('transform', `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([0, height]).padding(0.3); // Horizontal scale for sources
    const xScale = d3.scaleLinear().range([0, width]); // Vertical scale for amounts

    const colorScale = d3.scaleOrdinal()
        .domain(['Fresh', 'Saline'])
        .range(['#3167A4', '#AEDBED']);

    const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + dynamicMargin.bottom * 0.8)
        .attr("class", "chart-labels")
        .attr("text-anchor", "middle")
        .attr('fill', '#000')
        .text("Thousand gallons");

    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv(waterSupply2, (d) => ({
        Source: d.Source,
        Type: d.Type,
        Amount: +d.Amount,
    })).then((data) => {
        // Get unique water sources
        const sources = [...new Set(data.map((d) => d.Source))];

        // Pivot the data to get cumulative values
        const pivotedData = sources.map(source => {
            const freshData = data.find(d => d.Source === source && d.Type === 'Fresh') || { Amount: 0 };
            const salineData = data.find(d => d.Source === source && d.Type === 'Saline') || { Amount: 0 };
            return {
                Source: source,
                freshAmount: freshData.Amount,
                salineAmount: salineData.Amount,
                totalAmount: freshData.Amount + salineData.Amount,
            };
        });

        // Calculate the maximum value for the x-axis and adjust it to go up by 50,000 increments up to 250,000
        const maxXValue = Math.ceil(d3.max(pivotedData, d => d.totalAmount) / 50000) * 50000;

        // Update scales
        yScale.domain(sources);
        xScale.domain([0, maxXValue]);

        // Draw the y-axis
        svg.append('g').call(yAxis).selectAll('text').attr('class', 'chart-labels').style("font-weight", "bold");

        // Draw the x-axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(maxXValue / 50000).tickFormat(d => d / 1000))  // Adjust ticks to go up by 50,000
            .call(g => g.select(".domain").attr("stroke", "none"))  // This removes the x-axis line
            .call(g => g.selectAll(".tick line").attr("stroke", "#aaaaaa").attr("stroke-width", "0.2"))  // Make tick lines light grey
            .call(g => g.selectAll(".tick text").attr("class", 'chart-labels').attr('fill', '#000'));  // Make tick texts black

        // Add vertical grid lines
        svg.selectAll("line.vertical-grid")
            .data(xScale.ticks(maxXValue / 50000))  // Adjust to match tickValues
            .enter()
            .append("line")
            .attr("class", "vertical-grid")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#aaaaaa")
            .attr("stroke-width", "0.2");

        // Draw bars for each water source
        const barGroups = svg.selectAll('.bar-group')
            .data(pivotedData)
            .enter()
            .append('g')
            .attr('class', 'bar-group')
            .attr('transform', d => `translate(0,${yScale(d.Source)})`);

        barGroups
            .append('rect')
            .attr('class', 'bar water-bar fresh-bar')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', d => xScale(d.freshAmount))
            .attr('height', yScale.bandwidth())
            .attr('fill', colorScale('Fresh'))
            .on('mouseover', function (event, d) {
                d3.select(this).classed('hovered', true);

                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                tooltip.html(`
                    <div class="tooltip-title">${d.Source}</div>
                    <table class="tooltip-content">
                        <tr>
                            <td><span class="color-legend" style="background-color: ${colorScale('Fresh')};"></span>Fresh Water:</td>
                            <td class="value"><strong>${d.freshAmount}</strong> gallons</td>
                        </tr>
                    </table>
                `)
                .style('opacity', 0.9)
                .style('left', `${tooltipX + dynamicMargin.left / 4}px`)
                .style('top', `${tooltipY}px`);
            })
            .on('mousemove', function (event) {
                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                tooltip
                .style('left', `${tooltipX + dynamicMargin.left / 4}px`)
                .style('top', `${tooltipY}px`);
            })
            .on('mouseout', function () {
                d3.select(this).classed('hovered', false);
                tooltip.style('opacity', 0);
            });

        barGroups
            .append('rect')
            .attr('class', 'bar water-bar saline-bar')
            .attr('x', d => xScale(d.freshAmount))
            .attr('y', 0)
            .attr('width', d => xScale(d.salineAmount))
            .attr('height', yScale.bandwidth())
            .attr('fill', colorScale('Saline'))
            .on('mouseover', function (event, d) {
                d3.select(this).classed('hovered', true);

                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                tooltip.html(`
                    <div class="tooltip-title">${d.Source}</div>
                    <table class="tooltip-content">
                        <tr>
                            <td><span class="color-legend" style="background-color: ${colorScale('Saline')};"></span>Saline Water:</td>
                            <td class="value"><strong>${d.salineAmount}</strong> gallons</td>
                        </tr>
                    </table>
                `)
                .style('opacity', 0.9)
                .style('left', `${tooltipX + 15}px`)
                .style('top', `${tooltipY}px`);
            })
            .on('mousemove', function (event) {
                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                tooltip
                .style('left', `${tooltipX + 15}px`)
                .style('top', `${tooltipY}px`);
            })
            .on('mouseout', function () {
                d3.select(this).classed('hovered', false);
                tooltip.style('opacity', 0);
            });

        // Adding the legend
        const legendData = [
            { type: 'Fresh', color: '#3167A4' },
            { type: 'Saline', color: '#AEDBED' },
        ];

        // Calculate the dimensions for legend items
        const legend = svg.append('g')
            .attr('transform', `translate(${width + dynamicMargin.right * 0.1}, 0)`);

        const legendItemSize = width * 0.04;  // Set the size of the legend items
        const gap = height * 0.04;            // Space between legend items

        legendData.forEach((item, index) => {
            legend.append('rect')
                .attr('x', 0)
                .attr('y', index * (legendItemSize + gap))
                .attr('width', legendItemSize)
                .attr('height', legendItemSize)
                .style('fill', item.color)
                .attr('rx', width * 0.01)
                .attr('ry', width * 0.01)
                .attr('class', `legend-rect legend-${item.type.toLowerCase()}`)
                .on('mouseover', function () {
                    d3.select(this).style('stroke', 'white').style('stroke-width', '2px');
                    d3.selectAll('.water-bar').classed('muted', true); // mute all bars in this chart
                    d3.selectAll(`.water-bar.${item.type.toLowerCase()}-bar`).classed('muted', false); // highlight selected type
                })
                .on('mouseout', function () {
                    d3.select(this).style('stroke', 'none');
                    d3.selectAll('.water-bar').classed('muted', false); // reset muted state for all bars in this chart
                });

            legend.append('text')
                .attr('x', legendItemSize + 10)
                .attr('y', index * (legendItemSize + gap) + legendItemSize / 2)
                .attr('alignment-baseline', 'middle')
                .attr('class', 'chart-labels')
                .text(item.type);
        });

        // Add additional CSS styles for hover and muted states
        d3.select('head').append('style').html(`
            .water-bar {
                transition: opacity 0.3s;
            }

            .water-bar.muted {
                opacity: 0.1;
            }

            .water-bar:not(.muted).hovered {
                opacity: 0.2;
            }
        `);
    });
})();