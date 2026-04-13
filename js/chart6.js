import {
  chartTheme,
  applyBaseSvgStyle,
  addStandardTitle,
  createTooltip
} from "./chartTheme.js";

export function renderChart6({
  container,
  usAtlas,
  choroplethLookup,
  choroplethColorScale,
  selectedSource,
  selectedYear,
  simpleSourceOrder,
  simpleEnergyColors
}) {
  const width = 1100;
  const height = 720;
  const marginTop = 20; // was 90
  const marginRight = 220;
  const marginBottom = 40;
  const marginLeft = 40;

  const mount = document.querySelector(container);
  if (!mount) return;
  mount.innerHTML = "";

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  applyBaseSvgStyle(svg, chartTheme);

  const tooltip = createTooltip("chart6-tooltip", chartTheme);

  const chartCenterX = (width - marginRight + marginLeft) / 2;

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 20,
    title: `US Net Power Generation by State — ${selectedSource}`,
    subtitle1: `Annual View for ${selectedYear}`,
    subtitle2: "Source: EIA Form 923 Monthly Reports",
    theme: chartTheme
  });

  const states = topojson
    .feature(usAtlas, usAtlas.objects.states)
    .features.filter((d) => +d.id <= 56);

  const nation = topojson.mesh(usAtlas, usAtlas.objects.nation);

  const statemesh = topojson.mesh(
    usAtlas,
    usAtlas.objects.states,
    (a, b) => a !== b
  );

  const projection = d3.geoAlbersUsa().fitExtent(
    [
      [marginLeft, marginTop],
      [width - marginRight, height - marginBottom]
    ],
    { type: "FeatureCollection", features: states }
  );

  const path = d3.geoPath(projection);

  svg
    .append("g")
    .selectAll("path")
    .data(states)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const fips = String(d.id).padStart(2, "0");
      const record = choroplethLookup.get(
        `${fips}-${selectedYear}-${selectedSource}`
      );
      return record
        ? choroplethColorScale(record.net_generation_twh)
        : "#f0f0f0";
    })
    .attr("stroke", "white")
    .attr("stroke-width", 0.8)
    .on("mousemove", function (event, d) {
      const fips = String(d.id).padStart(2, "0");
      const record = choroplethLookup.get(
        `${fips}-${selectedYear}-${selectedSource}`
      );

      const stateName = record?.state_name || "Unknown";
      const value = record?.net_generation_twh ?? 0;

      tooltip
        .html(`
          <div style="font-weight:600; margin-bottom:4px;">
            ${stateName}
          </div>
          <div>Energy Source: ${selectedSource}</div>
          <div>Year: ${selectedYear}</div>
          <div>Generation: ${d3.format(",.1f")(value)} TWh</div>
        `)
        .style("visibility", "visible")
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY + 12}px`);
    })
    .on("mouseleave", function () {
      tooltip.style("visibility", "hidden");
    });

  svg
    .append("path")
    .datum(statemesh)
    .attr("fill", "none")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.8)
    .attr("d", path);

  svg
    .append("path")
    .datum(nation)
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("d", path);

  // Custom threshold legend for choropleth
  const legendX = width - marginRight + 40;
  const legendY = marginTop + 70;
  const swatchWidth = 18;
  const swatchHeight = 18;
  const legendItemGap = 24;

  const legendDomain = choroplethColorScale.domain();
  const binColors = choroplethColorScale.range();
  const binThresholds = choroplethColorScale.thresholds();

  const binEdges = [legendDomain[0], ...binThresholds, legendDomain[1]];

  const legendBins = binColors.map((color, i) => ({
    color,
    start: binEdges[i],
    end: binEdges[i + 1]
  }));

  svg
    .append("text")
    .attr("x", legendX)
    .attr("y", legendY - 18)
    .attr("font-size", chartTheme.axis.labelSize)
    .attr("font-weight", chartTheme.axis.labelWeight)
    .text("Generation (TWh)");

  const legend = svg
    .append("g")
    .attr("transform", `translate(${legendX},${legendY})`);

  const legendItem = legend
    .selectAll("g")
    .data(legendBins)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * legendItemGap})`);

  legendItem
    .append("rect")
    .attr("width", swatchWidth)
    .attr("height", swatchHeight)
    .attr("fill", (d) => d.color)
    .attr("stroke", "#ccc");

  legendItem
    .append("text")
    .attr("x", swatchWidth + 8)
    .attr("y", 13)
    .attr("font-size", chartTheme.legend.textSize)
    .text(
      (d) => `${d3.format(",.0f")(d.start)} – ${d3.format(",.0f")(d.end)}`
    );

  mount.appendChild(svg.node());
}