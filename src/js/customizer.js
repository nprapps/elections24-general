const { race } = require("async");
var $ = require("./lib/qsa");
require("@nprapps/sidechain");

const createEmbed = function (page, config) {
  var form = $.one("form");
  var preview = $.one("side-chain");
  var embedPym = $.one("textarea#pym");
  var embedSidechain = $.one("textarea#sidechain");
  var prefix = "localhost:8000/";
  var formData = {};
  $("select, input", form).forEach(function (input) {
    var name = input.name;
    if (input.type == "checkbox") {
      formData[name] = input.checked;
    } else {
      formData[name] = input.value;
    }
  });
  var url = new URL(`${prefix}${page}.html?embedded=true`);

  var embedPymHTML = `<p
  data-pym-loader
  data-child-src="${url.toString()}"
  id="responsive-embed-${page}">
    Loading...
</p>
<script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js"></script>`;
  var embedPymHTML = embedPymHTML
    .replace(/\</g, "&lt;")
    .replace(/[\n\s]+/g, " ");
  embedPym.innerHTML = embedPymHTML;

  var embedSidechainHTML = `<side-chain src="${url.toString()}"></side-chain>
  <script src="${ PROJECT_URL }sidechain.js"></script>`;
  embedSidechainHTML = embedSidechainHTML.replace(/\</g, "&lt;").replace(/[\n\s]+/g, " ");
  embedSidechain.innerHTML = embedSidechainHTML;

  preview.setAttribute("src", url.toString().replace(prefix, ""));
};

const generateSectionDropdown = function (sections, raceDropdown) {
  raceDropdown.innerHTML = "";

  sections.forEach(section => {
    var sectionItem = document.createElement("option");
    sectionItem.value = section;
    sectionItem.textContent = section;

    raceDropdown.appendChild(sectionItem);
  });
};

const updateStateRaces = function (selectedState, raceDropdown) {
  fetch("data/states/" + selectedState + ".json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON data
    })
    .then(data => {
      const offices = {
        "key-races": "key-races",
        president: "P",
        governor: "G",
        senate: "S",
        house: "H",
        "ballot-measures": "I",
      };

      let sections = ["key-races", "president"];

      if (data.results.filter(d => d.office === "G").length > 0) {
        sections.push("governor");
      }
      if (data.results.filter(d => d.office === "S").length > 0) {
        sections.push("senate");
      }
      if (key != "DC") {
        sections.push("house");
      }
      if (data.results.filter(d => d.office === "I").length > 0) {
        sections.push("ballot-measures");
      }

      generateSectionDropdown(sections, raceDropdown);
    })
    .catch(error => {
      console.error("Error loading JSON:", error);
    });
};

window.handleSelection = function (option) {
  const dropdownSection = document.getElementById("dropdownSection");
  const checkboxSection = document.getElementById("checkboxSection");
  const stateDropdown = document.getElementById("state");
  const raceDropdown = document.getElementById("stateRace");

  // Show the relevant section based on the selected option
  if (option === "state") {
    dropdownSection.classList.remove("hidden");
    checkboxSection.classList.add("hidden");

    stateDropdown.value = "MO,Missouri";
    raceDropdown.value = "president";
    var selectedRace = raceDropdown.value;
    var state = stateDropdown.value.split(",")[0];
    var option = stateDropdown.value.split(",")[1].toLowerCase();
    updateStateRaces(state, raceDropdown);
  } else if (option === "bop") {
    checkboxSection.classList.remove("hidden");
    dropdownSection.classList.add("hidden");
  } else {
    dropdownSection.classList.add("hidden");
    checkboxSection.classList.add("hidden");
  }

  raceDropdown.addEventListener("change", function () {
    selectedRace = raceDropdown.value;
    selectedState = stateDropdown.value.split(",")[1].toLowerCase();

    console.log(selectedState, selectedRace);
    createEmbed(selectedState);
  });

  stateDropdown.addEventListener("change", function () {
    var selectedState = stateDropdown.value.split(",")[0];

    updateStateRaces(selectedState);
  });

  createEmbed(option);
};

window.onload = function () {
  createEmbed("president");
};

// var $ = require("./lib/qsa");

// var strings = require("strings.sheet.json");
// var races = require("races.sheet.json");

// var form = $.one("form");
// var preview = $.one("side-chain");
// var embedPym = $.one("textarea#pym");
// var embedSidechain = $.one("textarea#sidechain");

// var stateSelect = $.one("form .state");
// var raceSelect = $.one(`form [name="race"]`);

// var stateShown = "SC"; // specify a state to be highlighted first

// var states = [...new Set(races.map(r => r.state))].sort();
// states.forEach(function(s) {
//   var full = strings[s];
//   if (!full) return;
//   var option = document.createElement("option");
//   option.value = s;
//   option.innerHTML = full;
//   stateSelect.appendChild(option);
// });

// var onFormChange = function() {
//   console.log("Hello")
//   var prefix = PROJECT_URL;
//   var formData = {};
//   $("select, input", form).forEach(function(input) {
//     var name = input.name;
//     if (input.type == "checkbox") {
//       formData[name] = input.checked;
//     } else {
//       formData[name] = input.value;
//     }

//   });
//   var [race, file, date] = formData.race.split(":");
//   if (race == "P" && formData.party == "GOP") {
//     var delegatesCheckbox = document.getElementById('delegates')
//     delegatesItem.hidden = false;
//   }
//   var url;
//   form.dataset.type = formData.type;
//   if (formData.type == "page") {
//     url = new URL(`${prefix}states/${stateSelect.value}.html?embedded=true`);
//     var hash = new URLSearchParams("");
//     if (date) hash.set("date", date);
//     if (race) {
//       hash.set("office", race == "C" ? "P" : race);
//     }
//     url.hash = hash.toString();
//   } else {
//     if (!race || !file) {
//       preview.setAttribute("src", "");
//       return;
//     }
//     url = new URL(`${prefix}embeds/?live`);
//     url.searchParams.set("race", race);
//     url.searchParams.set("data", file);
//     if (formData.party) {
//       url.searchParams.set("party", formData.party);
//     }
//     if (formData.delegates) {
//       url.searchParams.set("delegates", "");
//     }
//     if (formData.link) {
//       url.searchParams.set("link", `${prefix}states/${stateSelect.value}.html`);
//     }
//     if (formData.district) {
//       url.searchParams.set("district", formData.district);
//     }
//   }
//   var idParts = [stateSelect.value, race, date || "state", formData.district];

//   var embedPymHTML = `<p
//   data-pym-loader
//   data-child-src="${url.toString()}"
//   id="responsive-embed-${idParts.filter(p => p).join("-").replace(/\//g, "-")}">
//     Loading...
// </p>
// <script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js"></script>`;
//   embedPymHTML = embedPymHTML.replace(/\</g, "&lt;").replace(/[\n\s]+/g, " ");
//   embedPym.innerHTML = embedPymHTML;

//   var embedSidechainHTML = `<side-chain src="${url.toString()}"></side-chain>
//   <script src="${ PROJECT_URL }sidechain.js"></script>`;
//   embedSidechainHTML = embedSidechainHTML.replace(/\</g, "&lt;").replace(/[\n\s]+/g, " ");
//   embedSidechain.innerHTML = embedSidechainHTML;

//   preview.setAttribute("src", url.toString().replace(prefix, ""));
// }

// $("select[name], input[name]").forEach(el => {
//   el.addEventListener("change", onFormChange);
//   el.addEventListener("keyup", onFormChange);
// });

// var onStateChange = function() {
//   raceSelect.innerHTML = "";
//   var filtered = races.filter(r => r.state == stateSelect.value);
//   var recent = document.createElement("option");
//   recent.value = "";
//   recent.innerHTML = "Most recent results (state page only)";
//   raceSelect.appendChild(recent);
//   filtered.forEach(function(r) {
//     var option = document.createElement("option");
//     option.value = `${r.caucus ? "C" : r.office}:${r.filename}:${r.date}`;
//     option.innerHTML = `${r.date} - ${strings[r.office]}`;
//     raceSelect.appendChild(option);
//   });

//   onFormChange();
// };
// stateSelect.addEventListener("change", onStateChange);
// onStateChange();

// // default drop-down to a particular state
// if (typeof(stateShown) != "undefined") {
//   stateSelect.value = stateShown;
//   stateSelect.dispatchEvent(new Event('change'));
// }
