// Stacked bar chart: number (or share) of TV models at each star rating, stacked by screen technology
const drawStackedBars = (tvs) => {
  const keys = techInfo.map(t => t.id);          // ["LCD", "LED", "OLED"]
  const starBins = d3.range(2, 8);               // 2, 3, 4, 5, 6, 7+

  // 1. Format the data: one row per star bin, one column per technology
  //    Star ratings are averages (e.g. 4.5), so they are rounded down to whole stars; 7 and above are merged into "7+"
  const wideData = starBins.map(star => {
    const row = { star };
    keys.forEach(k => (row[k] = 0));
    return row;
  });
  tvs.forEach(d => {
    const bin = Math.min(7, Math.floor(d.stars));
    wideData[bin - 2][d.tech] += d.count;
  });

  const margin = { top: 30, right: 20, bottom: 55, left: 70 };
  const width = 1000, height = 440;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const starLabel = s => (s === 7 ? "7+" : `${s}`);

  const render = (mode) => {
    const isShare = mode === "share";
    d3.select("#stacked").selectAll("*").remove();

    const svg = d3.select("#stacked").append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Stacked bar chart of TV models by star rating and screen technology");
    const inner = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // 2. Stack layout: adds lower (d[0]) and upper (d[1]) boundary for each segment
    const stackGenerator = d3.stack().keys(keys);
    if (isShare) stackGenerator.offset(d3.stackOffsetExpand);   // every bar becomes 0-100%
    const annotatedData = stackGenerator(wideData);

    // 3. Scales
    const xScale = d3.scaleBand().domain(starBins).range([0, innerWidth]).padding(0.2);
    const maxUpper = isShare ? 1 : d3.max(annotatedData[annotatedData.length - 1], d => d[1]);
    const yScale = d3.scaleLinear().domain([0, maxUpper]).range([innerHeight, 0]).nice();

    inner.append("g").selectAll("line").data(yScale.ticks(5)).join("line")
      .attr("class", "gridline").attr("x1", 0).attr("x2", innerWidth)
      .attr("y1", d => yScale(d)).attr("y2", d => yScale(d));

    inner.append("g").attr("class", "axis").attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(starLabel).tickSizeOuter(0));
    inner.append("g").attr("class", "axis")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(isShare ? d3.format(".0%") : d3.format(",")).tickSizeOuter(0));

    svg.append("text").attr("class", "axis-title")
      .attr("x", margin.left + innerWidth / 2).attr("y", height - 12).attr("text-anchor", "middle")
      .text("Star rating (rounded down to whole stars)");
    svg.append("text").attr("class", "axis-title")
      .attr("transform", "rotate(-90)").attr("x", -(margin.top + innerHeight / 2)).attr("y", 18)
      .attr("text-anchor", "middle").text(isShare ? "Share of models" : "Number of models");

    // 4. Draw one set of rectangles per series (technology)
    annotatedData.forEach(series => {
      inner.selectAll(`.bar-${series.key}`)
        .data(series)
        .join("rect")
        .attr("class", `bar-${series.key}`)
        .attr("x", d => xScale(d.data.star))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("fill", techColor(series.key))
        .attr("stroke", "#fff").attr("stroke-width", 1)
        .on("mousemove", (event, d) => {
          const n = d.data[series.key];
          const total = d3.sum(keys, k => d.data[k]);
          showTip(event, `<strong>${series.key}</strong>, ${starLabel(d.data.star)} stars<br>${d3.format(",")(n)} models (${d3.format(".0%")(total ? n / total : 0)} of this rating)`);
        })
        .on("mouseleave", hideTip);
    });

    // Totals above bars (count view only)
    if (!isShare) {
      inner.selectAll(".total-label").data(wideData).join("text")
        .attr("class", "total-label")
        .attr("x", d => xScale(d.star) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d3.sum(keys, k => d[k])) - 8)
        .attr("text-anchor", "middle").style("font-size", "14px").style("font-weight", 600).attr("fill", ink)
        .text(d => d3.format(",")(d3.sum(keys, k => d[k])));
    }
  };

  render("count");

  // Toggle buttons switch between the two views
  d3.selectAll("#stacked-toggle button").on("click", function () {
    d3.selectAll("#stacked-toggle button").classed("active", false).attr("aria-pressed", "false");
    d3.select(this).classed("active", true).attr("aria-pressed", "true");
    render(this.dataset.mode);
  });
};
