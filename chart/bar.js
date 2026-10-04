// Bar chart: mean energy consumption by screen technology, 55-inch TVs only
const drawBar = (data) => {
  const margin = { top: 30, right: 20, bottom: 50, left: 70 };
  const width = 640, height = 420;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select("#bar").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Bar chart of mean energy consumption by screen technology for 55 inch TVs");
  const inner = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleBand().domain(data.map(d => d.tech)).range([0, innerWidth]).padding(0.3);
  const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.energy)]).nice().range([innerHeight, 0]);

  inner.append("g").selectAll("line").data(yScale.ticks(5)).join("line")
    .attr("class", "gridline").attr("x1", 0).attr("x2", innerWidth)
    .attr("y1", d => yScale(d)).attr("y2", d => yScale(d));

  inner.append("g").attr("class", "axis").attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).tickSizeOuter(0));
  inner.append("g").attr("class", "axis").call(d3.axisLeft(yScale).ticks(5));

  svg.append("text").attr("class", "axis-title")
    .attr("transform", "rotate(-90)").attr("x", -(margin.top + innerHeight / 2)).attr("y", 18)
    .attr("text-anchor", "middle").text("Mean energy (kWh per year)");

  inner.selectAll("rect").data(data).join("rect")
    .attr("x", d => xScale(d.tech)).attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.energy)).attr("height", d => innerHeight - yScale(d.energy))
    .attr("rx", 3)
    .attr("fill", d => techColor(d.tech))
    .on("mousemove", (event, d) =>
      showTip(event, `<strong>${d.tech}</strong> (55&Prime;)<br>${d3.format(",.0f")(d.energy)} kWh/year (mean)`))
    .on("mouseleave", hideTip);

  // Direct value labels so the chart can be read without the axis
  inner.selectAll(".value-label").data(data).join("text")
    .attr("class", "value-label")
    .attr("x", d => xScale(d.tech) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d.energy) - 8)
    .attr("text-anchor", "middle").style("font-size", "15px").style("font-weight", 600).attr("fill", ink)
    .text(d => d3.format(",.0f")(d.energy));
};