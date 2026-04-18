import {
  chartTheme,
  applyBaseSvgStyle,
  addStandardTitle,
  createTooltip
} from "./chartTheme.js";

export function renderChart7({
  container,
  usAtlas,
  chart7Data,
  chart7Radius,
  selectedPlantSource,
  selectedPlantYear,
  simpleEnergyColors,
  stateNameLookup
}) {
  const width = 1100;
  const height = 700;
  const marginTop = 30; // was 90
  const marginRight = 220;
  const marginBottom = 30;
  const marginLeft = 30;

  const mount = document.querySelector(container);
  if (!mount) return;
  mount.innerHTML = "";

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  applyBaseSvgStyle(svg, chartTheme);

  const tooltip = createTooltip("chart7-tooltip", chartTheme)
    .style("z-index", "99999")
    .style("position", "fixed");

  const chartCenterX = (width - marginRight + marginLeft) / 2;

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 20,
    title: "US Power Plants by Dominant Energy Source — Solar",
    subtitles: [
      "Annual View for 2024",
      "Dot size reflects total annual generation.",
      "Source: EIA Form 923 / PUDL"
    ],
    theme: chartTheme
  });

  const states = topojson.feature(usAtlas, usAtlas.objects.states);
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
    states
  );

  const path = d3.geoPath(projection);

  svg
    .append("g")
    .selectAll("path")
    .data(states.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "#f7f7f7")
    .attr("stroke", "white")
    .attr("stroke-width", 0.8);

  svg
    .append("path")
    .datum(statemesh)
    .attr("fill", "none")
    .attr("stroke", "#888")
    .attr("stroke-opacity", 0.45)
    .attr("stroke-width", 0.8)
    .attr("d", path);

  svg
    .append("path")
    .datum(nation)
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("d", path);

  const pointColor = simpleEnergyColors[selectedPlantSource] || "#4E79A7";

  const plotted = chart7Data
    .map((d) => {
      const xy = projection([+d.longitude, +d.latitude]);
      return xy ? { ...d, x: xy[0], y: xy[1] } : null;
    })
    .filter(Boolean)
    .sort((a, b) =>
      d3.descending(a.total_generation_mwh, b.total_generation_mwh)
    );

  svg
    .append("g")
    .selectAll("circle")
    .data(plotted)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => chart7Radius(d.total_generation_mwh))
    .attr("fill", pointColor)
    .attr("fill-opacity", 0.65)
    .attr("stroke", "#333")
    .attr("stroke-width", 0.4)
    .on("mousemove", function (event, d) {
      tooltip
        .html(`
          <div style="font-weight:600; margin-bottom:4px;">
            ${d.plant_name_eia || "Unknown Plant"}
          </div>
          <div>State: ${stateNameLookup[d.state] || d.state || "Unknown"}</div>
          <div>Year: ${d.report_year}</div>
          <div>Dominant Source: ${d.dominant_energy_group}</div>
          <div>Total Generation: ${d3.format(",.1f")(
            (d.total_generation_mwh || 0) / 1e6
          )} TWh</div>
          <div>Installed Capacity: ${
            d.installed_capacity_mw != null
              ? `${d3.format(",.0f")(d.installed_capacity_mw)} MW`
              : "N/A"
          }</div>
        `)
        .style("visibility", "visible")
        .style("left", `${event.clientX + 12}px`)
        .style("top", `${event.clientY + 12}px`);
    })
    .on("mouseleave", function () {
      tooltip.style("visibility", "hidden");
    });

  const legendX = width - marginRight + 10; // added + 10
  const legendY = marginTop + 90;

  const legendValues = (() => {
    const maxVal = d3.max(chart7Data, (d) => d.total_generation_mwh) || 1;
    return [maxVal * 0.25, maxVal * 0.6, maxVal].filter((v) => v > 0);
  })();

  const sizeLegendData = [...legendValues]
    .sort((a, b) => d3.descending(a, b))
    .map((value, i) => ({
      value,
      y: i * 55
    }));

  svg
    .append("text")
    .attr("x", legendX)
    .attr("y", legendY - 18)
    .attr("font-size", chartTheme.axis.labelSize)
    .attr("font-weight", chartTheme.axis.labelWeight)
    .text("Annual Generation");

  const sizeLegend = svg
    .append("g")
    .attr("transform", `translate(${legendX + 18}, ${legendY + 25})`);

  sizeLegend
    .selectAll("circle")
    .data(sizeLegendData)
    .join("circle")
    .attr("cx", 0)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => chart7Radius(d.value))
    .attr("fill", pointColor)
    .attr("fill-opacity", 0.65)
    .attr("stroke", "#333")
    .attr("stroke-width", 0.4);

  sizeLegend
    .selectAll("line")
    .data(sizeLegendData)
    .join("line")
    .attr("x1", (d) => chart7Radius(d.value))
    .attr("x2", 60)
    .attr("y1", (d) => d.y)
    .attr("y2", (d) => d.y)
    .attr("stroke", "#666")
    .attr("stroke-dasharray", "2,2");

  sizeLegend
    .selectAll("text")
    .data(sizeLegendData)
    .join("text")
    .attr("x", 65)
    .attr("y", (d) => d.y)
    .attr("dy", "0.35em")
    .attr("font-size", chartTheme.legend.textSize)
    .text((d) => `${d3.format(",.1f")(d.value / 1e6)} TWh`);

  const totalGenerationTwh =
    d3.sum(plotted, (d) => d.total_generation_mwh || 0) / 1e6;

  const legendStats = svg
    .append("text")
    .attr("x", legendX)
    .attr("y", legendY + 230)
    .attr("font-size", chartTheme.legend.textSize);

  legendStats
    .append("tspan")
    .attr("x", legendX)
    .attr("dy", "0em")
    .text(`Plants shown: ${d3.format(",")(plotted.length)}`);

  legendStats
    .append("tspan")
    .attr("x", legendX)
    .attr("dy", "1.4em")
    .text(
      `Net Energy Generated (TWh): ${d3.format(",.1f")(totalGenerationTwh)}`
    );

  mount.appendChild(svg.node());
}