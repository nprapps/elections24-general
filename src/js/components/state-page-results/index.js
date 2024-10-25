import gopher from "../gopher.js";
const ResultsCollection = require("../results-collection");
const ElementBase = require("../elementBase");

const offices = {
  "key-races": "key-races",
  "president": "P",
  "governor": "G",
  "senate": "S",
  "house": "H",
  "ballot-measures": "I"
}

class StatePageResults extends ElementBase {
  constructor() {
    super();
    this.sections = JSON.parse(this.getAttribute("sections"));
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
    this.removeAttribute("sections");
    const results = this.data.results;
    let template = "";

    let keyRaceCollections = ["president"];
    if (results.filter(d => d.office === "G").length > 0) {
      keyRaceCollections.push("governor");
    }
    if (results.filter(d => d.office === "S").length > 0) {
      keyRaceCollections.push("senate");
    }
    if (results.filter(d => d.office === "H" && d.keyRace === "yes").length > 0) {
      keyRaceCollections.push("house");
    }
    if (results.filter(d => d.office === "I" && d.keyRace === "yes").length > 0) {
      keyRaceCollections.push("ballot-measures");
    }

    this.sections.forEach(section => {
      let sectionHTML = "";

      if (section === "key-races") {
        keyRaceCollections.forEach(office => {
          sectionHTML += `
            <section id="key-races-section" section="key-races" class="shown">
              <results-collection state="${this.getAttribute('state')}" office="${offices[office]}" key-races-only></results-collection>
            </section>
          `
        })
      } else {
        sectionHTML += `
          <section id="${section}-section" section="${section}">
            <results-collection state="${this.getAttribute("state")}" office="${offices[section]}"></results-collection>
          </section>
          `
      }

      template += sectionHTML;
    })

  	this.innerHTML = template;
  }
}

customElements.define("state-page-results", StatePageResults);