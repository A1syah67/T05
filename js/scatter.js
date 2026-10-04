// Scatter plot: star rating vs energy consumption, one dot per TV model
const drawScatter = (data) => {
  const margin = { top: 20, right: 20, bottom: 55, left: 70 };
  const width = 1000, height = 480;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select("#scatter").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Scatter plot of energy consumption against star rating for TV models");
  const inner = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleLinear().domain([1.5, 8.5]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.energy)]).nice().range([innerHeight, 0]);

  inner.append("g").attr("class", "gridlines")
    .selectAll("line").data(yScale.ticks(6)).join("line")
    .attr("class", "gridline").attr("x1", 0).attr("x2", innerWidth)
    .attr("y1", d => yScale(d)).attr("y2", d => yScale(d));

  inner.append("g").attr("class", "axis").attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).tickValues(d3.range(2, 9)));
  inner.append("g").attr("class", "axis")
    .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(",")));

  svg.append("text").attr("class", "axis-title")
    .attr("x", margin.left + innerWidth / 2).attr("y", height - 12).attr("text-anchor", "middle")
    .text("Star rating (more stars = more efficient)");
  svg.append("text").attr("class", "axis-title")
    .attr("transform", "rotate(-90)").attr("x", -(margin.top + innerHeight / 2)).attr("y", 18)
    .attr("text-anchor", "middle").text("Energy consumption (kWh per year)");

  inner.selectAll("circle").data(data).join("circle")
    .attr("cx", d => xScale(d.stars))
    .attr("cy", d => yScale(d.energy))
    .attr("r", 5)
    .attr("fill", d => techColor(d.tech))
    .attr("fill-opacity", 0.45)
    .attr("stroke", d => techColor(d.tech))
    .attr("stroke-opacity", 0.9)
    .on("mousemove", (event, d) =>
      showTip(event, `<strong>${d.brand}</strong> (${d.tech})<br>${d.size}&Prime; &middot; ${d.stars} stars<br>${d3.format(",.0f")(d.energy)} kWh/year`))
    .on("mouseleave", hideTip);
};
