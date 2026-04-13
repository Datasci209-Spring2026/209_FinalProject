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

export function renderChart1({
  container,
  stackedInputYearly,
  sourceOrder,
  energyColors
}) {
  const width = 1100;
  const height = 600;
  const marginTop = 60;
  const marginRight = 220;
  const marginBottom = 50;
  const marginLeft = 90;

  const mount = document.querySelector(container);
  if (!mount) return;
  mount.innerHTML = "";

  const series = d3
    .stack()
    .keys([...sourceOrder].reverse())
    .offset(d3.stackOffsetNone)(stackedInputYearly);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  applyBaseSvgStyle(svg, chartTheme);

  const x = d3
    .scaleUtc()
    .domain(d3.extent(stackedInputYearly, (d) => d.report_date))
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(series, (s) => d3.min(s, (d) => d[0])),
      d3.max(series, (s) => d3.max(s, (d) => d[1]))
    ])
    .nice()
    .range([height - marginBottom, marginTop]);

  const color = d3
    .scaleOrdinal()
    .domain(sourceOrder)
    .range(sourceOrder.map((d) => energyColors[d]));

  const area = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x((d) => x(d.data.report_date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  const tooltip = createTooltip("energy-tooltip", chartTheme);

  const chartCenterX = (marginLeft + (width - marginRight)) / 2;

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 20,
    title: "US Net Power Generation by Energy Source",
    subtitle1: "Monthly From 2001 to 2024",
    subtitle2: "Source: EIA Form 923 Monthly Reports",
    theme: chartTheme
  });

  svg
    .append("g")
    .selectAll("path")
    .data(series)
    .join("path")
    .attr("fill", (d) => color(d.key))
    .attr("stroke", "white")
    .attr("stroke-width", 0.3)
    .attr("d", area)
    .append("title")
    .text((d) => d.key);

  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(
      d3.axisBottom(x).ticks(d3.utcYear.every(1)).tickFormat(d3.utcFormat("%Y"))
    );

  styleBottomAxis(xAxis, chartTheme);

  const yAxis = svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(
      d3.axisLeft(y).ticks(8).tickFormat((d) => d3.format(",.0f")(d / 1e6))
    );

  styleLeftAxis(yAxis, {
    gridWidth: width - marginLeft - marginRight,
    gridOpacity: 0.1,
    theme: chartTheme
  });

  const hoverLine = svg
    .append("line")
    .attr("stroke", "#333")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .attr("y1", marginTop)
    .attr("y2", height - marginBottom)
    .style("visibility", "hidden");

  addXAxisLabel(svg, {
    x: (width - marginRight + marginLeft) / 2,
    y: height - 10,
    text: "Report Date",
    theme: chartTheme
  });

  addYAxisLabel(svg, {
    x: -(height / 2),
    y: 40,
    text: "Net Generation (TWh)",
    theme: chartTheme
  });

  addLegend(svg, {
    items: sourceOrder,
    color,
    x: width - marginRight + 20,
    y: marginTop,
    theme: chartTheme
  });

  const bisectDate = d3.bisector((d) => d.report_date).center;

  svg
    .append("rect")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("width", width - marginLeft - marginRight)
    .attr("height", height - marginTop - marginBottom)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mousemove", function (event) {
      const [mx] = d3.pointer(event, this);
      const date = x.invert(mx);

      const i = bisectDate(stackedInputYearly, date);
      const d = stackedInputYearly[i];
      if (!d) return;

      hoverLine
        .attr("x1", x(d.report_date))
        .attr("x2", x(d.report_date))
        .style("visibility", "visible");

      const total = d3.sum(sourceOrder, (source) => d[source] || 0);

      const rows = sourceOrder.map((source) => {
        const value = d[source] || 0;
        const pct = total > 0 ? (value / total) * 100 : 0;
        return { source, value, pct };
      });

      const html = `
        <div style="font-weight:600; margin-bottom:4px;">
          ${d3.utcFormat("%Y")(d.report_date)}
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