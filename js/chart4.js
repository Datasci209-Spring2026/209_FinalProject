import {
  chartTheme,
  applyBaseSvgStyle,
  addStandardTitle,
  styleBottomAxis,
  styleLeftAxis,
  addYAxisLabel,
  addLegend,
  createTooltip
} from "./chartTheme.js";

export function renderChart4({
  container,
  stackedStateData,
  simpleSourceOrder,
  simpleEnergyColors,
  stateNameLookup
}) {
  const width = 1200;
  const height = 900;

  const marginTop = 100; // was 110
  const marginRight = 220;
  const marginBottom = 40;
  const marginLeft = 90;

  const cols = 3;
  const rows = 3;

  const facetGapX = 36;
  const facetGapY = 70; // was 50

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
    .attr("height", height);

  applyBaseSvgStyle(svg, chartTheme);

  const tooltip = createTooltip("chart4-tooltip", chartTheme)
    .style("z-index", "99999")
    .style("position", "fixed");

  const color = d3
    .scaleOrdinal()
    .domain(simpleSourceOrder)
    .range(simpleSourceOrder.map((d) => simpleEnergyColors[d]));

  const chartCenterX = marginLeft + plotWidth / 2;

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 20,
    title:
      "US Net Power Generation by Energy Source — Top 9 States by Power Generation",
    subtitle1: "Annual From 2001 to 2024",
    subtitle2: "Source: EIA Form 923 Monthly Reports",
    theme: chartTheme
  });

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
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", chartTheme.subtitle.size)
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

    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0,${facetHeight})`)
      .call(
        d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.utcFormat("%Y"))
      );

    styleBottomAxis(xAxisGroup, chartTheme);

    xAxisGroup.call((g) =>
      g
        .selectAll(".tick text")
        .attr("font-size", chartTheme.axis.tickSize)
        .attr("text-anchor", (d) => (+d === leftDate ? "start" : "end"))
        .attr("dx", (d) => (+d === leftDate ? "0.15em" : "-0.15em"))
    );

    const yAxisGroup = g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat((d) => d3.format(",.0f")(d / 1e6))
    );

    styleLeftAxis(yAxisGroup, {
      gridWidth: facetWidth,
      gridOpacity: 0.1,
      theme: chartTheme
    });

    yAxisGroup.call((g) =>
      g.selectAll(".tick text").attr("font-size", chartTheme.axis.tickSize)
    );

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
          return { source, value, pct };
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
          .style("left", `${event.clientX + 12}px`)
          .style("top", `${event.clientY + 12}px`);
      })
      .on("mouseleave", function () {
        hoverLine.style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
      });
  });

  addYAxisLabel(svg, {
    x: -(marginTop + plotHeight / 2),
    y: 28,
    text: "Net Generation (TWh)",
    theme: chartTheme
  });

  addLegend(svg, {
    items: simpleSourceOrder,
    color,
    x: width - marginRight + 30,
    y: marginTop + 20,
    theme: chartTheme
  });

  mount.appendChild(svg.node());
}