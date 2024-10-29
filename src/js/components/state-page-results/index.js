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
    this.keyRaceCollections = JSON.parse(this.getAttribute("key-race-collections"));
    this.countyRaces = JSON.parse(this.getAttribute("county-races"));
    this.state = this.getAttribute("state");
    this.loadData = this.loadData.bind(this);
  }

  connectedCallback() {
    this.loadData();
    gopher.watch("./data/states/" + this.state + ".json", this.loadData);
  }

  disconnectedCallback() {
    gopher.unwatch("./data/states/" + this.state + ".json", this.loadData);
  }

  async loadData() {
    try {
      const response = await fetch("./data/states/" + this.state + ".json");
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
    this.removeAttribute("key-race-collections");
    this.removeAttribute("county-races");
    
    const results = this.data.results;
    let template = "";

    this.sections.forEach(section => {
      let sectionHTML = "";

      if (section === "key-races") {
        sectionHTML += '<section id="key-races-section" section="key-races">';
        this.keyRaceCollections.forEach(office => {
          let races = results.filter(d => {
            if (office === "president" && (this.state === "NE" || this.state === "ME")) {
              return d.office === "P" && d.electoral === 2;
            } else if (office === "H" || office === "I") {
              return d.office === offices[office] && d.keyRace === "yes";
            } else {
              return d.office === offices[office];
            }
          });
          sectionHTML += `
            <results-collection state="${this.state}" office="${offices[office]}" races='${JSON.stringify(races).replace(/'/g, "&#39;")}' key-races-only></results-collection>
          `
        });
        sectionHTML += "</section>"
      } else {
        let races = results.filter(d => {
          if (section === "president" && (this.state === "NE" || this.state === "ME")) {
            return d.office === "P" && d.electoral === 2;
          } else {
            return d.office === offices[section];            
          }
        });

        if (section === "president") {
          sectionHTML += `
            <section id="${section}-section" section="${section}">
              <results-collection state="${this.state}" office="${offices[section]}" races='${JSON.stringify(races).replace(/'/g, "&#39;")}'></results-collection>
              <h3 class="section-hed">Presidential results by county</h3>
              <county-map state="${this.state}"></county-map>
              <county-dataviz state="${this.state}"></county-dataviz>
              <results-table-county
                state="${this.state}"
                race-id="0"
                order="1">
              </results-table-county>
            </section>
          `
        } else if (section === "senate" || section === "governor") {
          let countiesHTML = "";
          let countyRaces = this.countyRaces.filter(d => d.office === offices[section]);
          races.forEach(race => {
            const countyHTML = `
              <county-map state="${this.state}" race-id="${this.state}-${race.id}"></county-map>
              <county-dataviz state="${this.state}" race="${this.state}-${race.id}"></county-dataviz>
              <results-table-county
                state="${this.state}"
                race-id="${race.id}"
                order="1">
              </results-table-county>
            `
            countiesHTML += countyHTML;
          });

          sectionHTML += `
            <section id="${section}-section" section="${section}">
              <results-collection state="${this.state}" office="${offices[section]}" races='${JSON.stringify(races).replace(/'/g, "&#39;")}'></results-collection>
              <h3 class="section-hed">${section.charAt(0).toUpperCase() + section.slice(1)} results by county</h3>
          `
          sectionHTML += countiesHTML;
          sectionHTML += "</section>"
        } else {
          sectionHTML += `
            <section id="${section}-section" section="${section}">
              <results-collection state="${this.state}" office="${offices[section]}" races='${JSON.stringify(races).replace(/'/g, "&#39;")}'></results-collection>
            </section>
          `
        }
      }

      template += sectionHTML;
    })

  	this.innerHTML = template;
  }
}

customElements.define("state-page-results", StatePageResults);