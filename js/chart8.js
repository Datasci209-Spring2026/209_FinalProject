import { applyBaseSvgStyle, addStandardTitle, createTooltip } from "./chartTheme.js";

export function renderChart8({
  container,
  selectedStateFeature,
  selectedCounties,
  selectedCountyMesh,
  statePlantMapData,
  statePlantRadius,
  selectedMapState,
  selectedSTPlantSource,
  selectedSTPlantYear,
  showTopCitiesOn,
  topCitiesInState,
  simpleEnergyColors,
  stateNameLookup
}) {
  const width = 1000;
  const height = 700;
  const marginTop = 90; // was 80
  const marginRight = 220;
  const marginBottom = 30;
  const marginLeft = 30;

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  applyBaseSvgStyle(svg);

  const tooltip = createTooltip("state-plant-map-tooltip")
    .style("z-index", "99999")
    .style("position", "fixed");
  
  const pointColor = simpleEnergyColors[selectedSTPlantSource] || "#555";
  const chartCenterX = (width - marginRight + marginLeft) / 2;

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 20,
    title: `${stateNameLookup[selectedMapState]} Power Plants by Dominant Energy Source — ${selectedSTPlantSource}`,
    subtitles: [
      `Annual View for ${selectedSTPlantYear}`,
      "Dot size reflects total annual generation.",
      "Source: EIA Form 923 / PUDL / simplemaps.com (city data)"
    ]
  });

  const projection = d3.geoMercator().fitExtent(
    [
      [marginLeft, marginTop],
      [width - marginRight, height - marginBottom]
    ],
    selectedStateFeature
  );

  const path = d3.geoPath(projection);

  // State fill
  svg
    .append("path")
    .datum(selectedStateFeature)
    .attr("d", path)
    .attr("fill", "#f7f7f7")
    .attr("stroke", "#666")
    .attr("stroke-width", 1.2);

  // Counties
  svg
    .append("g")
    .selectAll("path")
    .data(selectedCounties)
    .join("path")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#c7c7c7")
    .attr("stroke-width", 0.5);

  // County internal mesh
  svg
    .append("path")
    .datum(selectedCountyMesh)
    .attr("fill", "none")
    .attr("stroke", "#b0b0b0")
    .attr("stroke-opacity", 0.8)
    .attr("stroke-width", 0.5)
    .attr("d", path);

  const plotted = statePlantMapData
    .map((d) => {
      const xy = projection([+d.longitude, +d.latitude]);
      return xy ? { ...d, x: xy[0], y: xy[1] } : null;
    })
    .filter(Boolean)
    .sort((a, b) =>
      d3.descending(a.total_generation_mwh, b.total_generation_mwh)
    );

  // Plant points
  svg
    .append("g")
    .selectAll("circle")
    .data(plotted)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => statePlantRadius(d.total_generation_mwh))
    .attr("fill", pointColor)
    .attr("fill-opacity", 0.68)
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
          <div>Total Generation: ${d3.format(",.2f")(
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

  // Top 10 cities layer, controlled by checkbox
  const plottedCities = showTopCitiesOn
    ? topCitiesInState
        .map((d) => {
          const xy = projection([+d.lng, +d.lat]);
          return xy ? { ...d, x: xy[0], y: xy[1] } : null;
        })
        .filter(Boolean)
    : [];

  const cityLayer = svg.append("g");

  cityLayer
    .selectAll("path.city-marker")
    .data(plottedCities)
    .join("path")
    .attr("class", "city-marker")
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .attr("d", d3.symbol().type(d3.symbolStar).size(110))
    .attr("fill", "#111")
    .attr("stroke", "white")
    .attr("stroke-width", 1.2)
    .on("mousemove", function (event, d) {
      tooltip
        .html(`
          <div style="font-weight:600; margin-bottom:4px;">
            ${d.city}
          </div>
          <div>State: ${stateNameLookup[selectedMapState]}</div>
          <div>Population: ${d3.format(",")(d.population)}</div>
        `)
        .style("visibility", "visible")
        .style("left", `${event.clientX + 12}px`)
        .style("top", `${event.clientY + 12}px`);
    })
    .on("mouseleave", function () {
      tooltip.style("visibility", "hidden");
    });

  // Size legend
  const legendX = width - marginRight + 10;
  const legendY = marginTop + 90;

  const legendValues = (() => {
    const maxVal = d3.max(plotted, (d) => d.total_generation_mwh) || 1;
    return [maxVal * 0.25, maxVal * 0.6, maxVal].filter((v) => v > 0);
  })();

  const sizeLegendData = [...legendValues]
    .sort((a, b) => d3.descending(a, b))
    .map((value, i) => ({
      value,
      y: i * 60
    }));

  svg
    .append("text")
    .attr("x", legendX)
    .attr("y", legendY - 18)
    .attr("font-size", 12)
    .attr("font-weight", "bold")
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
    .attr("r", (d) => statePlantRadius(d.value))
    .attr("fill", pointColor)
    .attr("fill-opacity", 0.68)
    .attr("stroke", "#333")
    .attr("stroke-width", 0.4);

  sizeLegend
    .selectAll("line")
    .data(sizeLegendData)
    .join("line")
    .attr("x1", (d) => statePlantRadius(d.value))
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
    .attr("font-size", 11)
    .text((d) => `${d3.format(",.2f")(d.value / 1e6)} TWh`);

  const totalGenerationTwh =
    d3.sum(plotted, (d) => d.total_generation_mwh || 0) / 1e6;

  const stats = svg
    .append("text")
    .attr("x", legendX)
    .attr("y", legendY + 230)
    .attr("font-size", 12);

  stats
    .append("tspan")
    .attr("x", legendX)
    .attr("dy", "0em")
    .text(`Plants shown: ${d3.format(",")(plotted.length)}`);

  stats
    .append("tspan")
    .attr("x", legendX)
    .attr("dy", "1.4em")
    .text(`Net Energy Generated: ${d3.format(",.2f")(totalGenerationTwh)} TWh`);

  // City legend, only when checkbox is enabled
  if (showTopCitiesOn) {
    const cityLegendY = legendY + 300;

    svg
      .append("path")
      .attr("transform", `translate(${legendX + 10},${cityLegendY})`)
      .attr("d", d3.symbol().type(d3.symbolStar).size(110))
      .attr("fill", "#111")
      .attr("stroke", "white")
      .attr("stroke-width", 1.2);

    svg
      .append("text")
      .attr("x", legendX + 24)
      .attr("y", cityLegendY + 4)
      .attr("font-size", 11)
      .text("Top 10 cities by population");
  }

  d3.select(container).html("").append(() => svg.node());
}