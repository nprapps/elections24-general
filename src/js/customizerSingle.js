import gopher from "./components/gopher.js";


var $ = require("./lib/qsa");
require("./components/results-collection");
require("./analytics");

const urlParams = new URLSearchParams(window.location.search);

const raceId = urlParams.get("race");
const state = urlParams.get("state");

// connectedCallback() {
//   this.loadData();
//   gopher.watch("./data/states/" + state + ".json", this.loadData);
// }

// disconnectedCallback() {
//   gopher.unwatch("./data/states/" + state + ".json", this.loadData);
// }

// async loadData() {
//   try {
//     const response = await fetch("./data/states/" + state + ".json");
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     this.data = await response.json();
//     this.render();
//   } catch (error) {
//     console.error("Could not load JSON data:", error);
//   }
// }

// render() {
//   if (!this.data) return;

//   const headers = {
//     "key-races": "Key races",
//     "P": "President",
//     "G": "Governor",
//     "S": "Senate",
//     "H": "House",
//     "I": "Ballot measures"
//   }
//   let template = "";

//   let races = this.data.results.filter(d => { 
//     d.id == raceID;
//   });

//   template += `<h3 class="section-hed dotted-line"><span>${headers[this.getAttribute('office')]}</span></h3>`;

//   races.forEach(race => {
//     let table = `
//       <results-table state="${this.getAttribute("state")}" result='${JSON.stringify(race).replace(/'/g, "&#39;")}'></results-table>
//     `
//     template += table;
//   });

//   this.innerHTML = template;
// }
// }


const resultComponent = $.one("results-table");

// result.setAttribute("data-file", "./data/states/" + state + ".json"),
resultComponent.setAttribute("state", state);
resultComponent.setAttribute("office", "P");
