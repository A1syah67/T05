// Loads every CSV once, converts types, then draws each chart
const energyCol = "Mean(Labelled energy consumption (kWh/year))";
const summaryRow = d => ({ tech: d.Screen_Tech, energy: +d[energyCol] });

// Spot prices: blank cells (e.g. Tasmania before 2005) must become null, not 0
const priceRow = d => {
  const row = { year: +d.Year };
  Object.entries(d).forEach(([col, v]) => {
    if (col === "Year") return;
    const name = col.replace(" ($ per megawatt hour)", "").replace("Average Price (notTas-Snowy)", "Average");
    row[name] = v === "" ? null : +v;
  });
  return row;
};

Promise.all([
  d3.csv("data/Ex5_TV_energy.csv", d => ({
    brand: d.brand, tech: normaliseTech(d.screen_tech),
    size: +d.screensize, energy: +d.energy_consumpt, stars: +d.star2, count: +d.count
  })),
  d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv", summaryRow),
  d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv", summaryRow),
  d3.csv("data/Ex5_ARE_Spot_Prices.csv", priceRow)
]).then(([tvs, allSizes, tv55, prices]) => {
  console.log("tvs", tvs, "allSizes", allSizes, "55 inch", tv55, "prices", prices);
  addLegend();
  drawScatter(tvs);
  drawDonut(allSizes);
  drawBar(tv55);
  drawStackedBars(tvs);
  drawLineChart(prices);
}).catch(err => console.error("Data failed to load (are you running a local web server?)", err));
