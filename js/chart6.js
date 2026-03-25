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
  const marginTop = 70;
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
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font", "12px sans-serif");

  d3.selectAll(".chart6-tooltip").remove();

  const tooltip = d3
    .create("div")
    .attr("class", "chart6-tooltip")
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

  const chartCenterX = (width - marginRight + marginLeft) / 2;

  const title = svg
    .append("text")
    .attr("x", chartCenterX)
    .attr("y", 22)
    .attr("text-anchor", "middle");

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "0em")
    .attr("font-size", 16)
    .attr("font-weight", "bold")
    .text(`US Net Power Generation by State — ${selectedSource}`);

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "1.4em")
    .attr("font-size", 12)
    .attr("font-weight", "normal")
    .text(`Annual View for ${selectedYear}`);

  title
    .append("tspan")
    .attr("x", chartCenterX)
    .attr("dy", "1.2em")
    .attr("font-size", 12)
    .attr("font-weight", "normal")
    .text("Source: EIA Form 923 Monthly Reports");

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
        .html(
          `
          <div style="font-weight:600; margin-bottom:4px;">
            ${stateName}
          </div>
          <div>Energy Source: ${selectedSource}</div>
          <div>Year: ${selectedYear}</div>
          <div>Generation: ${d3.format(",.1f")(value)} TWh</div>
        `
        )
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

  const legendX = width - marginRight + 40;
  const legendY = marginTop + 60;
  const swatchWidth = 18;
  const swatchHeight = 22;

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
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .text("Generation (TWh)");

  const legend = svg
    .append("g")
    .attr("transform", `translate(${legendX},${legendY})`);

  const legendItem = legend
    .selectAll("g")
    .data(legendBins)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 24})`);

  legendItem
    .append("rect")
    .attr("width", swatchWidth)
    .attr("height", swatchHeight - 4)
    .attr("fill", (d) => d.color)
    .attr("stroke", "#ccc");

  legendItem
    .append("text")
    .attr("x", swatchWidth + 8)
    .attr("y", 13)
    .attr("font-size", 11)
    .text(
      (d) => `${d3.format(",.0f")(d.start)} – ${d3.format(",.0f")(d.end)}`
    );

  mount.appendChild(svg.node());
}