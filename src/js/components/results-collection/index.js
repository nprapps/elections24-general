import gopher from "../gopher.js";
const ElementBase = require("../elementBase");

class ResultsCollection extends ElementBase {
  constructor() {
    super();
    this.loadData = this.loadData.bind(this);
  }

  connectedCallback() {
    this.loadData();
    gopher.watch("./data/states/" + this.getAttribute("state") + ".json", this.loadData);
  }

  disconnectedCallback() {
    gopher.unwatch("./data/states/" + this.getAttribute("state") + ".json", this.loadData);
  }

  async loadData() {
    try {
      const response = await fetch("./data/states/" + this.getAttribute("state") + ".json");
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

    
    const headers = {
      "key-races": "Key races",
      "P": "President",
      "G": "Governor",
      "S": "Senate",
      "H": "House",
      "I": "Ballot measures"
    }
    let template = "";

    let races = this.data.results.filter(d => {
      if (this.hasAttribute("key-races-only")) {
        return (d.state === d.keyRace === true);
      } else {
        return (d.office === this.getAttribute("office"));
      }
    });

    if (this.getAttribute("office") === "key-races") {
      template += `<h3>${headers[this.getAttribute('office')]}</h3>`;
    }

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