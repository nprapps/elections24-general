import gopher from "../gopher.js";
const ElementBase = require("../elementBase");

class ResultsCollection extends ElementBase {
  constructor() {
    super();
    this.loadData = this.loadData.bind(this);
  }

  connectedCallback() {
    this.loadData();
    gopher.watch("./data/" + this.getAttribute("type") + ".json", this.loadData);
  }

  disconnectedCallback() {
    gopher.unwatch("./data/" + this.getAttribute("type") + ".json", this.loadData);
  }

  async loadData() {
    try {
      const response = await fetch("./data/" + this.getAttribute("type") + ".json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
      this.render();
    } catch (error) {
      console.error("Could not load JSON data:", error);
    }
  }

  render() {
    if (!this.data) return;

    let template = `
      <h3>${this.getAttribute("type")}</h3>
    `;
    let races = this.data.results.filter(d => {
      if (this.hasAttribute("key-races-only")) {
        return (d.state === this.getAttribute("state") && d.keyRace === true);
      } else {
        return (d.state === this.getAttribute("state"));
      }
    });

    races.forEach(race => {
      let table = `
        <results-table state="${this.getAttribute("state")}" result='${JSON.stringify(race)}'></results-table>
      `
      template += table;
    });

    this.innerHTML = template;
  }
}

customElements.define("results-collection", ResultsCollection);