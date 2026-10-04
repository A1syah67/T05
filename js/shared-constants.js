// Colour-blind-friendly palette, one colour per screen technology (used in every TV chart)
const techInfo = [
  { id: "LCD",  label: "LCD",  color: "#0072B2" },
  { id: "LED",  label: "LED (LCD with LED backlight)", color: "#D55E00" },
  { id: "OLED", label: "OLED", color: "#009E73" }
];
const techColor = d3.scaleOrdinal()
  .domain(techInfo.map(t => t.id))
  .range(techInfo.map(t => t.color));

// The main TV file calls LED TVs "LCD (LED)"; the summary files call them "LED". Make them match.
const normaliseTech = t => (t === "LCD (LED)" ? "LED" : t);

const ink = "#1f2933";
const muted = "#5f6c7b";

// Shared tooltip
const tooltip = d3.select("#tooltip");
const showTip = (event, html) => {
  tooltip.html(html).style("opacity", 1)
    .style("left", `${Math.min(event.clientX + 14, window.innerWidth - 250)}px`)
    .style("top", `${event.clientY + 14}px`);
};
const hideTip = () => tooltip.style("opacity", 0);
