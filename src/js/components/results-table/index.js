import gopher from "../gopher.js";

const ElementBase = require("../elementBase");
const dot = require("../../lib/dot");
const template = dot.compile(require("./_results-table.html"));
const { classify, mapToElements, formatAPDate, formatTime, formatComma, winnerIcon } = require("../util");

const headshots = {
  Harris:
    "./assets/synced/kamala-harris.png",
  Trump:
    "https://apps.npr.org/primary-election-results-2024/assets/synced/trump.png",
};

class ResultsTable extends ElementBase {
  constructor() {
    super();
  }

  static get template() {
    return require("./_results-table.html")
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const result = JSON.parse(this.getAttribute("result"));
    const elements = this.illuminate();

    this.removeAttribute("result");

    elements.updated.innerHTML = `${formatAPDate(new Date(result.updated))} at ${formatTime(new Date(result.updated))}`;

    let reportingString;
    if (result.eevp > 0 && result.eevp < 1) {
      reportingString = "<1";
    } else if (result.eevp > 99 && result.eevp < 100) {
      reportingString = ">99";
    } else {
      reportingString = result.eevp.toFixed(0).toString();
    }
    elements.eevp.innerHTML = reportingString;

    if (result.office === "P") {
      elements.wrapper.classList.add("president");
    }

    if (result.office === "H") {
      elements.resultsTableHed.innerHTML = result.seat;
    } else if (result.office === "I") {
      elements.resultsTableHed.innerHTML = result.description;
    } else {
      elements.resultsTableHed.remove();
    }

    const candidates = mapToElements(elements.tbody, result.candidates).filter(d => {
      return !(d[0].last === "Other" && d[0].votes === 0);
    });

    if (candidates.length > 1) {
      elements.uncontestedFootnote.remove();
    }

    if (candidates.some(d => d[0].incumbent) === true) {
      elements.incumbentLegend.style.display = "block";
    }

    candidates.forEach(candidate => {
      let d = candidate[0];
      let el = candidate[1];
      
      el.classList.add("row");
      el.classList.add(classify(d.party));
      if (d.winner === "X") {
        el.classList.add("winner");
      }

      el.innerHTML = `
        <span aria-hidden="true" class="${headshots[d.last] ? 'headshot has-image" style="background-image: url(' + headshots[d.last] + ')"' : 'headshot no-image"'}></span>
        <span class="bar-container">
          <span class="bar" style="width: ${d.percent * 100}%"></span>
        </span>
        <span class="name">
          ${d.first ? d.first + " " : " "}${d.last === "Other" ? "Other candidates" : d.last}${d.incumbent ? "<span class='incumbent-icon'> &#x2022;</span>" : ""}${d.winner === "X" ? winnerIcon : ""}${d.winner === "R" ? "<span class='runoff-indicator'> - runoff</span>" : ""}
        </span>
        <span class="percentage">${(d.percent * 100).toFixed(1)}%</span>
        <span class="votes">${formatComma(d.votes)}</span>
      `
    });
  }
}

customElements.define("results-table", ResultsTable);