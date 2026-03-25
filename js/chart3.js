export function renderChart3({
  container,
  annualSimpleData,
  cagrSimpleData,
  stackedInputYearlySimple,
  simpleSourceOrder,
  simpleEnergyColors
}) {
  const width = 1400;
  const height = 760;

  const marginTop = 60;
  const marginRight = 210;
  const marginBottom = 70;
  const marginLeft = 110;

  const innerWidth = width - marginLeft - marginRight;

  const topPanelHeight = 350;
  const bottomPanelHeight = 260;
  const panelGap = 16;

  const facetGap = 10;
  const facetWidth =
    (innerWidth - facetGap * (simpleSourceOrder.length - 1)) /
    simpleSourceOrder.length;

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

  d3.selectAll(".chart3-tooltip").remove();

  const tooltip = d3
    .create("div")
    .attr("class", "chart3-tooltip")
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

  const chartCenterX = marginLeft + innerWidth / 2;

  const title = svg
    .append("text")
    .attr("x", chartCenterX)
    .attr("y", 24)
    .attr("text-anchor", "middle");

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "0em")
    .attr("font-size", 16)
    .attr("font-weight", "bold")
    .text(
      "US Net Power Generation by Energy Source - Annual Change in TWh and CAGR"
    );

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "1.4em")
    .attr("font-size", 12)
    .attr("font-weight", "normal")
    .text("Monthly From 2001 to 2024");

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

  const topY = d3
    .scaleLinear()
    .domain([0, d3.max(annualSimpleData, (d) => d.net_generation_mwh)])
    .nice()
    .range([topPanelHeight, 0]);

  const bottomY = d3
    .scaleLinear()
    .domain([-0.05, 0.3])
    .range([bottomPanelHeight, 0]);

  const xGlobal = d3
    .scaleUtc()
    .domain([new Date("2001-01-01"), new Date("2024-12-31")])
    .range([0, facetWidth]);

  const area = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x((d) => xGlobal(d.report_date))
    .y0(topY(0))
    .y1((d) => topY(d.net_generation_mwh));

  const topPanel = plot.append("g");
  const bottomPanel = plot
    .append("g")
    .attr("transform", `translate(0,${topPanelHeight + panelGap})`);

  const topGrid = topPanel.append("g");
  topGrid.call(
    d3
      .axisLeft(topY)
      .ticks(8)
      .tickSize(-innerWidth)
      .tickFormat((d) => d3.format(",.0f")(d / 1e6))
  );

  topGrid.select(".domain").remove();
  topGrid.selectAll(".tick line").attr("stroke-opacity", 0.12);
  topGrid.selectAll(".tick text").attr("font-size", 12);

  const bottomGrid = bottomPanel.append("g");
  bottomGrid.call(
    d3
      .axisLeft(bottomY)
      .tickValues([-0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3])
      .tickSize(-innerWidth)
      .tickFormat(d3.format(".1%"))
  );

  bottomGrid.select(".domain").remove();
  bottomGrid.selectAll(".tick line").attr("stroke-opacity", 0.12);
  bottomGrid.selectAll(".tick text").attr("font-size", 12);

  topPanel
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(topPanelHeight / 2))
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Net Generation (TWh)");

  bottomPanel
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(bottomPanelHeight / 2))
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("CAGR");

  const annualBySource = d3.group(annualSimpleData, (d) => d.source);
  const cagrBySource = new Map(cagrSimpleData.map((d) => [d.source, d]));

  simpleSourceOrder.forEach((source, i) => {
    const facetX = i * (facetWidth + facetGap);
    const sourceAnnual = annualBySource.get(source) || [];
    const sourceCagr = cagrBySource.get(source);

    const facetTop = topPanel
      .append("g")
      .attr("transform", `translate(${facetX},0)`);

    const facetBottom = bottomPanel
      .append("g")
      .attr("transform", `translate(${facetX},0)`);

    facetTop
      .append("text")
      .attr("x", facetWidth / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .text(source);

    facetTop
      .append("path")
      .datum(sourceAnnual)
      .attr("fill", color(source))
      .attr("fill-opacity", 0.7)
      .attr("stroke", color(source))
      .attr("stroke-width", 1.5)
      .attr("d", area);

    facetTop
      .append("line")
      .attr("x1", facetWidth)
      .attr("x2", facetWidth)
      .attr("y1", 0)
      .attr("y2", topPanelHeight)
      .attr("stroke", "#b5b5b5")
      .attr("stroke-width", i < simpleSourceOrder.length - 1 ? 1 : 0);

    const tickValues = [new Date("2001-01-01"), new Date("2024-01-01")];
    const leftDate = +new Date("2001-01-01");

    const xAxis = d3
      .axisBottom(xGlobal)
      .tickValues(tickValues)
      .tickFormat(d3.utcFormat("%Y"));

    facetBottom
      .append("g")
      .attr("transform", `translate(0,${bottomPanelHeight})`)
      .call(xAxis)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick text")
          .attr("font-size", 12)
          .attr("text-anchor", (d) => (+d === leftDate ? "start" : "end"))
          .attr("dx", (d) => (+d === leftDate ? "0.15em" : "-0.15em"))
      );

    const zeroY = bottomY(0);
    facetBottom
      .append("line")
      .attr("x1", 0)
      .attr("x2", facetWidth)
      .attr("y1", zeroY)
      .attr("y2", zeroY)
      .attr("stroke", "#999")
      .attr("stroke-width", 1);

    if (sourceCagr?.cagr != null) {
      const barWidth = facetWidth * 0.86;
      const barX = (facetWidth - barWidth) / 2;
      const barY = Math.min(bottomY(sourceCagr.cagr), bottomY(0));
      const barHeight = Math.abs(bottomY(sourceCagr.cagr) - bottomY(0));

      facetBottom
        .append("rect")
        .attr("x", barX)
        .attr("y", barY)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", color(source))
        .attr("fill-opacity", 0.7)
        .attr("stroke", color(source));

      facetBottom
        .append("line")
        .attr("x1", facetWidth)
        .attr("x2", facetWidth)
        .attr("y1", 0)
        .attr("y2", bottomPanelHeight)
        .attr("stroke", "#b5b5b5")
        .attr("stroke-width", i < simpleSourceOrder.length - 1 ? 1 : 0);

      facetBottom
        .append("text")
        .attr("x", facetWidth / 2)
        .attr("y", bottomPanelHeight + 48)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text("Year");
    }

    const bisect = d3.bisector((d) => d.report_date).center;

    facetTop
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", facetWidth)
      .attr("height", topPanelHeight)
      .attr("fill", "transparent")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const date = xGlobal.invert(mx);
        const idx = bisect(sourceAnnual, date);
        const d = sourceAnnual[idx];
        if (!d) return;

        const yearMatch = stackedInputYearlySimple.find(
          (row) =>
            +d3.utcYear.floor(row.report_date) ===
            +d3.utcYear.floor(d.report_date)
        );

        const total = yearMatch
          ? d3.sum(simpleSourceOrder, (s) => yearMatch[s] || 0)
          : 0;

        const value = d.net_generation_mwh || 0;
        const pct = total > 0 ? (value / total) * 100 : 0;

        tooltip
          .html(
            `
            <div style="font-weight:600; margin-bottom:4px;">${source}</div>
            <div>Year: ${d3.utcFormat("%Y")(d.report_date)}</div>
            <div>Net Generation: ${d3.format(",.1f")(value / 1e6)} TWh</div>
            <div>Percent of Total: ${d3.format(".1f")(pct)}%</div>
          `
          )
          .style("visibility", "visible")
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY + 12}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("visibility", "hidden");
      });

    facetBottom
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", facetWidth)
      .attr("height", bottomPanelHeight)
      .attr("fill", "transparent")
      .on("mousemove", function (event) {
        if (!sourceCagr) return;

        tooltip
          .html(
            `
            <div style="font-weight:600; margin-bottom:4px;">${source}</div>
            <div>CAGR: ${d3.format(".2%")(sourceCagr.cagr)}</div>
            <div>Start: ${d3.format(",.1f")(
              (sourceCagr.start_value_mwh || 0) / 1e6
            )} TWh</div>
            <div>End: ${d3.format(",.1f")(
              (sourceCagr.end_value_mwh || 0) / 1e6
            )} TWh</div>
          `
          )
          .style("visibility", "visible")
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY + 12}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("visibility", "hidden");
      });
  });

  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - marginRight + 24}, ${marginTop})`);

  const legendItem = legend
    .selectAll("g")
    .data(simpleSourceOrder)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 22})`);

  legendItem
    .append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("fill", (d) => color(d))
    .attr("fill-opacity", 0.7);

  legendItem
    .append("text")
    .attr("x", 20)
    .attr("y", 11)
    .attr("font-size", 12)
    .text((d) => d);

  mount.appendChild(svg.node());
}