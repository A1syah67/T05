const addLegend = () => {
  const items = d3.select(".legend-container")
    .selectAll(".legend-item")
    .data(techInfo)
    .join("span")
    .attr("class", "legend-item");
  items.append("span").attr("class", "legend-swatch").style("background", d => d.color);
  items.append("span").text(d => d.label);
};
