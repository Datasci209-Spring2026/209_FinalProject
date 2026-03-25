export function renderChart4({
  container,
  stackedStateData,
  simpleSourceOrder,
  simpleEnergyColors,
  stateNameLookup
}) {
  const width = 1200;
  const height = 900;

  const marginTop = 70;
  const marginRight = 180;
  const marginBottom = 40;
  const marginLeft = 70;

  const cols = 3;
  const rows = 3;

  const facetGapX = 36;
  const facetGapY = 50;

  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const facetWidth = (plotWidth - facetGapX * (cols - 1)) / cols;
  const facetHeight = (plotHeight - facetGapY * (rows - 1)) / rows;

  const mount = document.querySelector(container);
  if (!mount) return;
  mount.innerHTML = "";

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font", "12px sans-serif");

  d3.selectAll(".chart4-tooltip").remove();

  const tooltip = d3
    .create("div")
    .attr("class", "chart4-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(255,255,255,0.96)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("padding", "8px 10px")
    .style("font", "12px sans-serif")
    .style("line-height", "1.4")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
    .style("visibility", "hidden");

  document.body.appendChild(tooltip.node());

  const color = d3
    .scaleOrdinal()
    .domain(simpleSourceOrder)
    .range(simpleSourceOrder.map((d) => simpleEnergyColors[d]));

  const chartCenterX = marginLeft + plotWidth / 2;

  const title = svg
    .append("text")
    .attr("x", chartCenterX)
    .attr("y", 14)
    .attr("text-anchor", "middle");

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "0em")
    .attr("font-size", 16)
    .attr("font-weight", "bold")
    .text(
      "US Net Power Generation by Energy Source — Top 9 States by Power Generation"
    );

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "1.4em")
    .attr("font-size", 12)
    .attr("font-weight", "normal")
    .text("Annual From 2001 to 2024");

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "1.2em")
    .attr("font-size", 12)
    .attr("font-weight", "normal")
    .text("Source: EIA Form 923 Monthly Reports");

  const plot = svg
    .append("g")
    .attr("transform", `translate(${marginLeft},${marginTop})`);

  const x = d3
    .scaleUtc()
    .domain([new Date("2001-01-01"), new Date("2024-12-31")])
    .range([0, facetWidth]);

  const yMax = d3.max(stackedStateData, (stateObj) => {
    const series = d3
      .stack()
      .keys([...simpleSourceOrder].reverse())
      .offset(d3.stackOffsetNone)(stateObj.values);

    return d3.max(series, (s) => d3.max(s, (d) => d[1]));
  });

  const y = d3
    .scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([facetHeight, 0]);

  const area = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x((d) => x(d.data.report_date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  const tickValues = [new Date("2001-01-01"), new Date("2024-01-01")];
  const leftDate = +new Date("2001-01-01");

  stackedStateData.forEach((stateObj, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const gx = col * (facetWidth + facetGapX);
    const gy = row * (facetHeight + facetGapY);

    const g = plot.append("g").attr("transform", `translate(${gx},${gy})`);

    const series = d3
      .stack()
      .keys([...simpleSourceOrder].reverse())
      .offset(d3.stackOffsetNone)(stateObj.values);

    g.append("text")
      .attr("x", facetWidth / 2)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .text(stateNameLookup[stateObj.state] || stateObj.state);

    g.append("g")
      .selectAll("path")
      .data(series)
      .join("path")
      .attr("fill", (d) => color(d.key))
      .attr("stroke", "white")
      .attr("stroke-width", 0.3)
      .attr("d", area);

    g.append("g")
      .attr("transform", `translate(0,${facetHeight})`)
      .call(
        d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.utcFormat("%Y"))
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick text")
          .attr("font-size", 11)
          .attr("text-anchor", (d) => (+d === leftDate ? "start" : "end"))
          .attr("dx", (d) => (+d === leftDate ? "0.15em" : "-0.15em"))
      );

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickFormat((d) => d3.format(",.0f")(d / 1e6))
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", facetWidth)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) => g.selectAll(".tick text").attr("font-size", 11));

    const bisectDate = d3.bisector((d) => d.report_date).center;

    const hoverLine = g
      .append("line")
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", facetHeight)
      .style("visibility", "hidden");

    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", facetWidth)
      .attr("height", facetHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const date = x.invert(mx);

        const idx = bisectDate(stateObj.values, date);
        const d = stateObj.values[idx];
        if (!d) return;

        hoverLine
          .attr("x1", x(d.report_date))
          .attr("x2", x(d.report_date))
          .style("visibility", "visible");

        const total = d3.sum(simpleSourceOrder, (source) => d[source] || 0);

        const rows = simpleSourceOrder.map((source) => {
          const value = d[source] || 0;
          const pct = total > 0 ? (value / total) * 100 : 0;
          return {
            source,
            value,
            pct
          };
        });

        const stateLabel = stateNameLookup[stateObj.state] || stateObj.state;

        const html = `
          <div style="font-weight:600; margin-bottom:4px;">
            ${stateLabel} — ${d3.utcFormat("%Y")(d.report_date)}
          </div>
          <div style="margin-bottom:6px;">
            Total: ${d3.format(",.1f")(total / 1e6)} TWh
          </div>
          ${rows
            .map(
              (r) => `
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="
                display:inline-block;
                width:10px;
                height:10px;
                background:${color(r.source)};
              "></span>
              <span>
                ${r.source}: ${d3.format(",.1f")(r.value / 1e6)} TWh
                (${d3.format(".1f")(r.pct)}%)
              </span>
            </div>
          `
            )
            .join("")}
        `;

        tooltip
          .html(html)
          .style("visibility", "visible")
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY + 12}px`);
      })
      .on("mouseleave", function () {
        hoverLine.style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
      });
  });

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(marginTop + plotHeight / 2))
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Net Generation (TWh)");

  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width - marginRight + 20}, ${marginTop + 20})`
    );

  const legendItem = legend
    .selectAll("g")
    .data(simpleSourceOrder)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 22})`);

  legendItem
    .append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("fill", (d) => color(d));

  legendItem
    .append("text")
    .attr("x", 20)
    .attr("y", 11)
    .attr("font-size", 12)
    .text((d) => d);

  mount.appendChild(svg.node());
}