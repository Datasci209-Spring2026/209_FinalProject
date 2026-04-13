// create chartTheme.js file to apply consistent formatting to all d3 charts

export const chartTheme = {
  fontFamily: "sans-serif",
  baseFontSize: 14,

  title: {
    size: 20,
    weight: "bold",
    lineGap: "1.3em"
  },

  subtitle: {
    size: 16,
    weight: "normal",
    lineGap: "1.2em"
  },

  axis: {
    tickSize: 13,
    labelSize: 16,
    labelWeight: "500"
  },

  legend: {
    textSize: 13,
    itemGap: 24,
    swatchSize: 14,
    textOffsetX: 20,
    textOffsetY: 11
  },

  tooltip: {
    font: "12px sans-serif",
    lineHeight: "1.4",
    padding: "8px 10px",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
  }
};

export function applyBaseSvgStyle(svg, theme = chartTheme) {
  return svg
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font", `${theme.baseFontSize}px ${theme.fontFamily}`);
}

export function addStandardTitle(
  svg,
  {
    centerX,
    y = 20,
    title,
    subtitles = null,
    subtitle1,
    subtitle2,
    theme = chartTheme
  }
) {
  const titleNode = svg
    .append("text")
    .attr("x", centerX)
    .attr("y", y)
    .attr("text-anchor", "middle");

  titleNode
    .append("tspan")
    .attr("x", centerX)
    .attr("dy", "0em")
    .attr("font-size", theme.title.size)
    .attr("font-weight", theme.title.weight)
    .text(title);

  // Backward compatibility:
  // If subtitles array is not provided, fall back to subtitle1/subtitle2
  const subtitleLines = Array.isArray(subtitles)
    ? subtitles.filter((d) => d != null && d !== "")
    : [subtitle1, subtitle2].filter((d) => d != null && d !== "");

  subtitleLines.forEach((line, i) => {
    titleNode
      .append("tspan")
      .attr("x", centerX)
      .attr("dy", i === 0 ? theme.title.lineGap : theme.subtitle.lineGap)
      .attr("font-size", theme.subtitle.size)
      .attr("font-weight", theme.subtitle.weight)
      .text(line);
  });

  return titleNode;
}

export function styleBottomAxis(axisGroup, theme = chartTheme) {
  axisGroup
    .call((g) =>
      g.selectAll(".tick text").style("font-size", `${theme.axis.tickSize}px`)
    )
    .call((g) => g.select(".domain").remove());

  return axisGroup;
}

export function styleLeftAxis(
  axisGroup,
  { gridWidth = null, gridOpacity = 0.1, theme = chartTheme } = {}
) {
  axisGroup
    .call((g) =>
      g.selectAll(".tick text").style("font-size", `${theme.axis.tickSize}px`)
    )
    .call((g) => g.select(".domain").remove());

  if (gridWidth != null) {
    axisGroup.call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", gridWidth)
        .attr("stroke-opacity", gridOpacity)
    );
  }

  return axisGroup;
}

export function addXAxisLabel(
  svg,
  {
    x,
    y,
    text,
    theme = chartTheme
  }
) {
  return svg
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .style("font-weight", theme.axis.labelWeight)
    .attr("font-size", theme.axis.labelSize)
    .text(text);
}

export function addYAxisLabel(
  svg,
  {
    x,
    y,
    text,
    theme = chartTheme
  }
) {
  return svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .style("font-weight", theme.axis.labelWeight)
    .attr("font-size", theme.axis.labelSize)
    .text(text);
}

export function addLegend(
  svg,
  {
    items,
    color,
    x,
    y,
    theme = chartTheme
  }
) {
  const legend = svg
    .append("g")
    .attr("transform", `translate(${x}, ${y})`);

  const legendItem = legend
    .selectAll("g")
    .data(items)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * theme.legend.itemGap})`);

  legendItem
    .append("rect")
    .attr("width", theme.legend.swatchSize)
    .attr("height", theme.legend.swatchSize)
    .attr("fill", (d) => color(d));

  legendItem
    .append("text")
    .attr("x", theme.legend.textOffsetX)
    .attr("y", theme.legend.textOffsetY)
    .style("font-size", `${theme.legend.textSize}px`)
    .text((d) => d);

  return legend;
}

export function createTooltip(className, theme = chartTheme) {
  d3.selectAll(`.${className}`).remove();

  const tooltip = d3
    .create("div")
    .attr("class", className)
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", theme.tooltip.background)
    .style("border", theme.tooltip.border)
    .style("border-radius", theme.tooltip.borderRadius)
    .style("padding", theme.tooltip.padding)
    .style("font", theme.tooltip.font)
    .style("line-height", theme.tooltip.lineHeight)
    .style("box-shadow", theme.tooltip.boxShadow)
    .style("visibility", "hidden");

  document.body.appendChild(tooltip.node());
  return tooltip;
}