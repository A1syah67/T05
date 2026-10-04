// Donut chart: mean energy consumption by screen technology (all sizes)
const drawDonut = (data) => {
  const size = 420;
  const svg = d3.select("#donut").append("svg")
    .attr("viewBox", `0 0 ${size} ${size}`)
    .attr("role", "img")
    .attr("aria-label", "Donut chart of mean energy consumption by screen technology");
  const inner = svg.append("g").attr("transform", `translate(${size / 2}, ${size / 2})`);

  const pieGenerator = d3.pie().value(d => d.energy).sort(null);
  const annotatedData = pieGenerator(data);

  const arcGenerator = d3.arc()
    .innerRadius(100).outerRadius(190).padAngle(0.02).cornerRadius(4);

  const arcs = inner.selectAll(".arc").data(annotatedData).join("g").attr("class", "arc");

  arcs.append("path")
    .attr("d", arcGenerator)
    .attr("fill", d => techColor(d.data.tech))
    .on("mousemove", (event, d) =>
      showTip(event, `<strong>${d.data.tech}</strong><br>${d3.format(",.0f")(d.data.energy)} kWh/year (mean)<br>${d3.format(".0%")((d.endAngle - d.startAngle) / (2 * Math.PI))} of the three means combined`))
    .on("mouseleave", hideTip);

  // Labels at each arc's centroid: technology name + value
  const labels = arcs.append("text")
    .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
    .attr("text-anchor", "middle").attr("fill", "#fff").style("pointer-events", "none");
  labels.append("tspan").attr("x", 0).attr("dy", "-0.1em").style("font-size", "17px").style("font-weight", 600)
    .text(d => d.data.tech);
  labels.append("tspan").attr("x", 0).attr("dy", "1.25em").style("font-size", "15px")
    .text(d => d3.format(",.0f")(d.data.energy));

  // Centre text
  inner.append("text").attr("text-anchor", "middle").attr("dy", "-0.2em")
    .style("font-size", "16px").attr("fill", ink).text("Mean kWh");
  inner.append("text").attr("text-anchor", "middle").attr("dy", "1.2em")
    .style("font-size", "16px").attr("fill", ink).text("per year");
};