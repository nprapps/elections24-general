import gopher from "../gopher.js";
const ElementBase = require("../elementBase");

import {
  formatters,
  reportingPercentage,
  getParty,
  getPartyPrefix,
  isSameCandidate,
  getCountyCandidates,
} from "../util.js";

class CountyMap extends ElementBase {
  constructor() {
    super();
  }

  static get template() {
    return require("./_county-map.html")
  }

  connectedCallback() {
    this.render();
    let data = this.getAttribute("data");
    console.log(data)
  }

  disconnectedCallback() {
  }

  render() {
    const elements = this.illuminate();

    console.log("elements", elements);
  }

  async loadSVG(svgText) {
    this.svgRef.current.innerHTML = svgText;
    var [svg] = this.svgRef.current.getElementsByTagName("svg");
    this.width = svg.getAttribute("width") * 1;
    this.height = svg.getAttribute("height") * 1;

    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    var paths = svg.querySelectorAll("path");
    paths.forEach((p, i) => {
      p.setAttribute("vector-effect", "non-scaling-stroke");
    });

    svg.addEventListener("mousemove", e => this.onMove(e));
    svg.addEventListener("mouseleave", e => this.onMove(e));

    this.svg = svg;

    this.paint();
    this.updateDimensions();

    return svg;
  }
}

customElements.define("county-map", CountyMap);