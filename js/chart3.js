import {
  chartTheme,
  applyBaseSvgStyle,
  addStandardTitle,
  styleBottomAxis,
  addXAxisLabel,
  addYAxisLabel,
  addLegend,
  createTooltip
} from "./chartTheme.js";

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

  const marginTop = 80; // was 100
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
    .attr("height", height);

  applyBaseSvgStyle(svg, chartTheme);

  const tooltip = createTooltip("chart3-tooltip", chartTheme);

  const color = d3
    .scaleOrdinal()
    .domain(simpleSourceOrder)
    .range(simpleSourceOrder.map((d) => simpleEnergyColors[d]));

  const chartCenterX = marginLeft + innerWidth / 2;

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 20,
    title: "US Net Power Generation by Energy Source - Annual Change in TWh and CAGR",
    subtitle1: "Monthly From 2001 to 2024",
    subtitle2: "Source: EIA Form 923 Monthly Reports",
    theme: chartTheme
  });

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

  const topGrid = topPanel.append("g").call(
    d3
      .axisLeft(topY)
      .ticks(8)
      .tickFormat((d) => d3.format(",.0f")(d / 1e6))
  );

  topGrid.selectAll(".tick line").remove();
  topGrid.call((g) =>
    g
      .selectAll(".tick")
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.12)
  );

  topGrid
    .call((g) => g.selectAll(".tick text").style("font-size", `${chartTheme.axis.tickSize}px`))
    .call((g) => g.select(".domain").remove());

  const bottomGrid = bottomPanel.append("g").call(
    d3
      .axisLeft(bottomY)
      .tickValues([-0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3])
      .tickFormat(d3.format(".1%"))
  );

  bottomGrid.selectAll(".tick line").remove();
  bottomGrid.call((g) =>
    g
      .selectAll(".tick")
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.12)
  );

  bottomGrid
    .call((g) => g.selectAll(".tick text").style("font-size", `${chartTheme.axis.tickSize}px`))
    .call((g) => g.select(".domain").remove());

  addYAxisLabel(topPanel, {
    x: -(topPanelHeight / 2),
    y: -70,
    text: "Net Generation (TWh)",
    theme: chartTheme
  });

  addYAxisLabel(bottomPanel, {
    x: -(bottomPanelHeight / 2),
    y: -70,
    text: "CAGR",
    theme: chartTheme
  });

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
      .attr("y", 20) // was 24
      .attr("text-anchor", "middle")
      .attr("font-size", chartTheme.axis.tickSize + 2) // added + 2 to increase font size
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

    const xAxisGroup = facetBottom
      .append("g")
      .attr("transform", `translate(0,${bottomPanelHeight})`)
      .call(xAxis);

    styleBottomAxis(xAxisGroup, chartTheme);

    xAxisGroup.call((g) =>
      g
        .selectAll(".tick text")
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

      addXAxisLabel(facetBottom, {
        x: facetWidth / 2,
        y: bottomPanelHeight + 48,
        text: "Year",
        theme: chartTheme
      });
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
          .html(`
            <div style="font-weight:600; margin-bottom:4px;">${source}</div>
            <div>Year: ${d3.utcFormat("%Y")(d.report_date)}</div>
            <div>Net Generation: ${d3.format(",.1f")(value / 1e6)} TWh</div>
            <div>Percent of Total: ${d3.format(".1f")(pct)}%</div>
          `)
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
          .html(`
            <div style="font-weight:600; margin-bottom:4px;">${source}</div>
            <div>CAGR: ${d3.format(".2%")(sourceCagr.cagr)}</div>
            <div>Start: ${d3.format(",.1f")(
              (sourceCagr.start_value_mwh || 0) / 1e6
            )} TWh</div>
            <div>End: ${d3.format(",.1f")(
              (sourceCagr.end_value_mwh || 0) / 1e6
            )} TWh</div>
          `)
          .style("visibility", "visible")
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY + 12}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("visibility", "hidden");
      });
  });

  addLegend(svg, {
    items: simpleSourceOrder,
    color,
    x: width - marginRight + 24,
    y: marginTop,
    theme: chartTheme
  });

  mount.appendChild(svg.node());
}