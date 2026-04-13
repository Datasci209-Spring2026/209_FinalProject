import {
  chartTheme,
  applyBaseSvgStyle,
  addStandardTitle,
  styleBottomAxis,
  styleLeftAxis,
  addXAxisLabel,
  addYAxisLabel,
  addLegend,
  createTooltip
} from "./chartTheme.js";

export function renderChart5v2({
  container,
  selectedStateLeft,
  selectedStateRight,
  selectedStateAnnualDataLeft,
  selectedStateAnnualDataRight,
  selectedStateSeriesLeft,
  selectedStateSeriesRight,
  statesSorted,
  simpleSourceOrder,
  simpleEnergyColors,
  stateNameLookup
}) {
  const width = 1850;
  const height = 750;
  const marginTop = 120;
  const marginRight = 220;
  const marginBottom = 70;
  const marginLeft = 90;

  const panelGap = 40;
  const plotWidth = width - marginLeft - marginRight;
  const panelWidth = (plotWidth - panelGap) / 2;
  const panelHeight = height - marginTop - marginBottom;

  const facetTitleSize = chartTheme.subtitle.size + 4;
  const tickLabelSize = 18;

  const legendTextSize = 16;
  const legendSwatchSize = 20;
  const legendItemGap = 32;
  const legendTextOffsetX = 28;
  const legendTextOffsetY = 14;

  const axisLabelSize = 16;
  const axisLabelWeight = "500";

  const mount = document.querySelector(container);
  if (!mount) return;
  mount.innerHTML = "";

  const leftState =
    selectedStateLeft && selectedStateLeft !== selectedStateRight
      ? selectedStateLeft
      : statesSorted[0];

  const rightState =
    selectedStateRight && selectedStateRight !== leftState
      ? selectedStateRight
      : statesSorted.find((d) => d !== leftState) || statesSorted[1];

  const leftAnnualData = selectedStateAnnualDataLeft;
  const rightAnnualData = selectedStateAnnualDataRight;
  const leftSeries = selectedStateSeriesLeft;
  const rightSeries = selectedStateSeriesRight;

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  applyBaseSvgStyle(svg, chartTheme);

  const tooltip = createTooltip("chart5-v2-tooltip", chartTheme);

  const x = d3
    .scaleUtc()
    .domain([new Date("2001-01-01"), new Date("2024-01-01")])
    .range([0, panelWidth]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max([...leftSeries, ...rightSeries], (s) => d3.max(s, (d) => d[1]))
    ])
    .nice()
    .range([panelHeight, 0]);

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

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 20,
    title: "Net Power Generation by Energy Source — State Comparison",
    subtitle1: "Annual From 2001 to 2024",
    subtitle2: "Source: EIA Form 923 Monthly Reports",
    theme: chartTheme
  });

  // Local override for title/subtitle sizing on this chart only
  const titleGroup = svg.select("text");
  titleGroup.selectAll("tspan").each(function (_, i) {
    if (i === 0) {
      d3.select(this)
        .attr("font-size", 22)
        .attr("font-weight", "700");
    } else {
      d3.select(this)
        .attr("font-size", 16)
        .attr("font-weight", "400");
    }
  });

  const leftStateLabel = stateNameLookup[leftState] || leftState;
  const rightStateLabel = stateNameLookup[rightState] || rightState;

  function drawPanel({
    xOffset,
    annualData,
    series,
    stateLabel,
    showYAxis = true
  }) {
    const g = svg
      .append("g")
      .attr("transform", `translate(${xOffset},${marginTop})`);

    g.append("text")
      .attr("x", panelWidth / 2)
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .attr("font-size", facetTitleSize)
      .attr("font-weight", "bold")
      .text(stateLabel);

    g.append("g")
      .selectAll("path")
      .data(series)
      .join("path")
      .attr("fill", (d) => color(d.key))
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("d", area);

    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0,${panelHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.utcYear.every(2))
          .tickFormat(d3.utcFormat("%Y"))
      );

    styleBottomAxis(xAxisGroup, chartTheme);

    xAxisGroup.call((axisG) =>
      axisG
        .selectAll(".tick text")
        .attr("font-size", tickLabelSize)
        .attr("transform", "rotate(-35)")
        .attr("text-anchor", "end")
        .attr("dx", "-0.4em")
        .attr("dy", "0.3em")
    );

    const yAxis = g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(8)
        .tickFormat((d) => d3.format(",.0f")(d / 1e6))
    );

    styleLeftAxis(yAxis, {
      gridWidth: panelWidth,
      gridOpacity: 0.1,
      theme: chartTheme
    });

    yAxis.selectAll(".tick text").attr("font-size", tickLabelSize);

    if (!showYAxis) {
      yAxis.selectAll(".tick text").remove();
    }

    const hoverLine = g
      .append("line")
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", panelHeight)
      .style("visibility", "hidden");

    const bisectDate = d3.bisector((d) => d.report_date).center;

    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", panelWidth)
      .attr("height", panelHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const date = x.invert(mx);

        const i = bisectDate(annualData, date);
        const d = annualData[i];
        if (!d) return;

        hoverLine
          .attr("x1", x(d.report_date))
          .attr("x2", x(d.report_date))
          .style("visibility", "visible");

        const total = d3.sum(simpleSourceOrder, (source) => d[source] || 0);

        const rows = simpleSourceOrder.map((source) => {
          const value = d[source] || 0;
          const pct = total > 0 ? (value / total) * 100 : 0;
          return { source, value, pct };
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
  }

  drawPanel({
    xOffset: marginLeft,
    annualData: leftAnnualData,
    series: leftSeries,
    stateLabel: leftStateLabel,
    showYAxis: true
  });

  drawPanel({
    xOffset: marginLeft + panelWidth + panelGap,
    annualData: rightAnnualData,
    series: rightSeries,
    stateLabel: rightStateLabel,
    showYAxis: true
  });

  addXAxisLabel(svg, {
    x: marginLeft + panelWidth / 2,
    y: height - 10,
    text: "Report Date",
    theme: chartTheme
  });

  addXAxisLabel(svg, {
    x: marginLeft + panelWidth + panelGap + panelWidth / 2,
    y: height - 10,
    text: "Report Date",
    theme: chartTheme
  });

  addYAxisLabel(svg, {
    x: -(marginTop + panelHeight / 2),
    y: 40,
    text: "Net Generation (TWh)",
    theme: chartTheme
  });

  // Local override for axis label sizing on this chart only
  svg.selectAll("text")
    .filter(function () {
      const txt = d3.select(this).text();
      return txt === "Report Date" || txt === "Net Generation (TWh)";
    })
    .attr("font-size", axisLabelSize)
    .attr("font-weight", axisLabelWeight);

  const legend = addLegend(svg, {
    items: simpleSourceOrder,
    color,
    x: width - marginRight + 20,
    y: marginTop,
    theme: chartTheme
  });

  // Local override for legend sizing on this chart only
  legend.selectAll("text")
    .attr("font-size", legendTextSize)
    .attr("font-weight", "500")
    .attr("x", legendTextOffsetX)
    .attr("y", legendTextOffsetY);

  legend.selectAll("rect")
    .attr("width", legendSwatchSize)
    .attr("height", legendSwatchSize);

  legend.selectAll("g")
    .attr("transform", (d, i) => `translate(0, ${i * legendItemGap})`);

  mount.appendChild(svg.node());
}