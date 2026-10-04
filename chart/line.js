// Line chart: wholesale spot electricity prices 1998-2024 (average + each state)
const stateKeys = ["Queensland", "New South Wales", "Victoria", "South Australia", "Tasmania"];

const drawLineChart = (data) => {
  const margin = { top: 20, right: 140, bottom: 45, left: 70 };
  const width = 1000, height = 480;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const highlight = "#B5179E";

  const svg = d3.select("#line").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Line chart of average and state electricity spot prices from 1998 to 2024");
  const inner = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleLinear().domain([1998, 2024]).range([0, innerWidth]);
  const maxPrice = d3.max(data, d => d3.max(stateKeys, k => d[k]));
  const yScale = d3.scaleLinear().domain([0, maxPrice]).nice().range([innerHeight, 0]);

  inner.append("g").selectAll("line").data(yScale.ticks(6)).join("line")
    .attr("class", "gridline").attr("x1", 0).attr("x2", innerWidth)
    .attr("y1", d => yScale(d)).attr("y2", d => yScale(d));
  inner.append("g").attr("class", "axis").attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).tickValues(d3.range(1998, 2025, 2)).tickFormat(d3.format("d")));
  inner.append("g").attr("class", "axis").call(d3.axisLeft(yScale).ticks(6));

  svg.append("text").attr("class", "axis-title")
    .attr("transform", "rotate(-90)").attr("x", -(margin.top + innerHeight / 2)).attr("y", 18)
    .attr("text-anchor", "middle").text("Spot price ($ per megawatt hour)");

  // d3.line skips gaps (Tasmania has no data before 2005) via defined()
  const lineGenerator = d3.line()
    .defined(d => d.value !== null)
    .x(d => xScale(d.year)).y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const seriesOf = key => data.map(d => ({ year: d.year, value: d[key] }));

  // State lines (de-emphasised), then the average on top
  inner.selectAll(".state-line").data(stateKeys).join("path")
    .attr("class", "state-line").attr("fill", "none")
    .attr("stroke", "#9aa5b1").attr("stroke-width", 1.5).attr("stroke-opacity", 0.8)
    .attr("d", key => lineGenerator(seriesOf(key)));
  inner.append("path").attr("fill", "none")
    .attr("stroke", highlight).attr("stroke-width", 3.5)
    .attr("d", lineGenerator(seriesOf("Average")));

  // End-of-line labels, nudged apart so they don't overlap
  const last = data[data.length - 1];
  const labelData = [...stateKeys, "Average"]
    .map(key => ({ key, y: yScale(last[key]) }))
    .sort((a, b) => a.y - b.y);
  const minGap = 15;
  labelData.forEach((d, i) => { if (i > 0 && d.y - labelData[i - 1].y < minGap) d.y = labelData[i - 1].y + minGap; });

  inner.selectAll(".end-label").data(labelData).join("text")
    .attr("class", "end-label")
    .attr("x", innerWidth + 8).attr("y", d => d.y).attr("dominant-baseline", "middle")
    .style("font-size", "13px")
    .style("font-weight", d => (d.key === "Average" ? 700 : 400))
    .attr("fill", d => (d.key === "Average" ? highlight : muted))
    .text(d => (d.key === "Average" ? "Average" : d.key));

  // Hover: vertical guide + tooltip listing every series for the nearest year
  const guide = inner.append("line").attr("y1", 0).attr("y2", innerHeight)
    .attr("stroke", ink).attr("stroke-opacity", 0.4).attr("stroke-dasharray", "4 3").style("opacity", 0);
  const dot = inner.append("circle").attr("r", 5.5).attr("fill", highlight).attr("stroke", "#fff").attr("stroke-width", 2).style("opacity", 0);

  inner.append("rect").attr("width", innerWidth).attr("height", innerHeight).attr("fill", "transparent")
    .on("mousemove", function (event) {
      const [mx] = d3.pointer(event, this);
      const year = Math.max(1998, Math.min(2024, Math.round(xScale.invert(mx))));
      const row = data.find(d => d.year === year);
      guide.attr("x1", xScale(year)).attr("x2", xScale(year)).style("opacity", 1);
      dot.attr("cx", xScale(year)).attr("cy", yScale(row.Average)).style("opacity", 1);
      const rows = stateKeys.filter(k => row[k] !== null).map(k => `${k}: $${row[k]}`).join("<br>");
      showTip(event, `<strong>${year}</strong><br><span style="color:#f2b8ea">Average: $${d3.format(".1f")(row.Average)}</span><br>${rows}`);
    })
    .on("mouseleave", () => { guide.style("opacity", 0); dot.style("opacity", 0); hideTip(); });
};