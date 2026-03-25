export function renderChart5({
  container,
  selectedState,
  selectedStateAnnualData,
  simpleSourceOrder,
  simpleEnergyColors,
  stateNameLookup
}) {
  const width = 1100;
  const height = 620;
  const marginTop = 70;
  const marginRight = 220;
  const marginBottom = 50;
  const marginLeft = 90;

  const mount = document.querySelector(container);
  if (!mount) return;
  mount.innerHTML = "";

  const selectedStateSeries = d3
    .stack()
    .keys([...simpleSourceOrder].reverse())
    .offset(d3.stackOffsetNone)(selectedStateAnnualData);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font", "12px sans-serif");

  d3.selectAll(".chart5-tooltip").remove();

  const tooltip = d3
    .create("div")
    .attr("class", "chart5-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(255,255,255,0.95)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("padding", "8px 10px")
    .style("font", "12px sans-serif")
    .style("line-height", "1.4")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
    .style("visibility", "hidden");

  document.body.appendChild(tooltip.node());

  const x = d3
    .scaleUtc()
    .domain([new Date("2001-01-01"), new Date("2024-01-01")])
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(selectedStateSeries, (s) => d3.max(s, (d) => d[1]))])
    .nice()
    .range([height - marginBottom, marginTop]);

  const color = d3
    .scaleOrdinal()
    .domain(simpleSourceOrder)
    .range(simpleSourceOrder.map((d) => simpleEnergyColors[d]));

  const area = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x((d) => x(d.data.report_date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  const chartCenterX = (marginLeft + (width - marginRight)) / 2;
  const stateLabel = stateNameLookup[selectedState] || selectedState;

  const title = svg
    .append("text")
    .attr("x", chartCenterX)
    .attr("y", 20)
    .attr("text-anchor", "middle");

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "0em")
    .attr("font-size", 16)
    .attr("font-weight", "bold")
    .text(`Net Power Generation by Energy Source — ${stateLabel}`);

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

  svg
    .append("g")
    .selectAll("path")
    .data(selectedStateSeries)
    .join("path")
    .attr("fill", (d) => color(d.key))
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .attr("d", area);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(
      d3.axisBottom(x).ticks(d3.utcYear.every(1)).tickFormat(d3.utcFormat("%Y"))
    )
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll(".tick text").attr("font-size", 12));

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(8)
        .tickFormat((d) => d3.format(",.0f")(d / 1e6))
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1)
    )
    .call((g) => g.selectAll(".tick text").attr("font-size", 12));

  const hoverLine = svg
    .append("line")
    .attr("stroke", "#333")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .attr("y1", marginTop)
    .attr("y2", height - marginBottom)
    .style("visibility", "hidden");

  svg
    .append("text")
    .attr("x", (width - marginRight + marginLeft) / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Report Date");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", 42)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Net Generation (TWh)");

  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - marginRight + 20}, ${marginTop})`);

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

  const bisectDate = d3.bisector((d) => d.report_date).center;

  svg
    .append("rect")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("width", width - marginLeft - marginRight)
    .attr("height", height - marginTop - marginBottom)
    .attr("fill", "transparent")
    .style("cursor", "crosshair")
    .on("mousemove", function (event) {
      const [mx] = d3.pointer(event, this);
      const date = x.invert(mx);

      const i = bisectDate(selectedStateAnnualData, date);
      const d = selectedStateAnnualData[i];
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

  mount.appendChild(svg.node());
}