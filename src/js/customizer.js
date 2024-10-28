const { race } = require("async");
var $ = require("./lib/qsa");
require("@nprapps/sidechain");

const classify = function (str) {
  return (str + "")
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

const createURL = function (page, params = {}) {
  var prefix = "localhost:8000/";
  var baseURL = prefix + page + ".html";
  const url = new URL(baseURL);

  params["embedded"] = true;
  
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  return url.toString();
};

const getSelectedCheckboxValues = (sectionId) => {
  const section = document.getElementById(sectionId);
  const checkboxes = section.querySelectorAll('input[type="checkbox"]');
  const selectedValues = [];
  
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedValues.push(checkbox.value);
    }
  });
  
  return selectedValues;
};

// Enhanced createEmbed function that handles both president and BOP cases
const createEmbed = function(page, config = {}) {
  const form = $.one("form");
  const preview = $.one("side-chain");
  const embedPym = $.one("textarea#pym");
  const embedSidechain = $.one("textarea#sidechain");
  const prefix = "localhost:8000/";
  
  // Handle checkbox selections based on page type
  if (page === 'presidentMaps') {
    const selectedOptions = getSelectedCheckboxValues('presidentOptions');
    config.options = selectedOptions.join(',');
  } else if (page === 'bop') {
    const selectedRaces = getSelectedCheckboxValues('checkboxSection');
    config.races = selectedRaces.join(',');
    
    // BOP-specific template handling
    let template = '';
    if (!selectedRaces.length) {
      template = `<div class="bop-wrapper">
        <balance-of-power-combined race="senate"></balance-of-power-combined>
      </div>`;
    }
    
    console.log(template);
  }

  // Create URL and embed codes
  const url = createURL(page, config);
  
  // Generate Pym embed code
  const embedPymHTML = `<p
    data-pym-loader
    data-child-src="${url.toString()}"
    id="responsive-embed-${page}">
      Loading...
  </p>
  <script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js"></script>`;
  
  embedPym.innerHTML = embedPymHTML
    .replace(/</g, "&lt;")
    .replace(/[\n\s]+/g, " ");
  
  // Generate Sidechain embed code
  const embedSidechainHTML = `<side-chain src="${url.toString()}"></side-chain>
    <script src="${PROJECT_URL}sidechain.js"></script>`;
  
  embedSidechain.innerHTML = embedSidechainHTML
    .replace(/</g, "&lt;")
    .replace(/[\n\s]+/g, " ");
  
  // Update preview
  preview.setAttribute("src", url.toString().replace(prefix, ""));
  
  // Return template for BOP case
  if (page === 'bop') {
    return template;
  }
};

// Simplified wrapper functions
const createPresidentEmbed = function(config = {}) {
  return createEmbed('presidentMaps', config);
};

const createBOPEmbed = function(config = {}) {
  return createEmbed('bop', config);
};



const updateStateRaces = function (selectedState, stateRaceSelect) {
  fetch("data/states/" + selectedState + ".json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON data
    })
    .then(data => {
      let sections = ["key-races,key-races", "president,P"];

      if (data.results.filter(d => d.office === "G").length > 0) {
        sections.push("governor,G");
      }
      if (data.results.filter(d => d.office === "S").length > 0) {
        sections.push("senate,S");
      }
      if (key != "DC") {
        sections.push("house,H");
      }
      if (data.results.filter(d => d.office === "I").length > 0) {
        sections.push("ballot-measures,I");
      }

      stateRaceSelect.innerHTML = "";

      sections.forEach(section => {
        var sectionItem = document.createElement("option");
        sectionItem.value = section.split(",")[1];
        sectionItem.textContent = section.split(",")[0];

        stateRaceSelect.appendChild(sectionItem);
      })

      handleStateRace(stateRaceSelect.value)
    });
};

window.handleStateHeader = function() {
var options = {"race": stateRaceSelect.value}
showHeader = document.getElementById('stateHeaderTrue').checked;

if (!showHeader) {
  options["showHeader"] = false
}

createEmbed(classify(stateSelect.value.split(",")[1]), options)
}

window.handleStateRace = function (race) {
  state = stateSelect.value.split(",")[1];

  handleStateHeader();
};

window.handleState = function (state = "MO,Missouri") {
  stateSelect.value = state;
  var selectedState = state.split(",")[0];

  updateStateRaces(selectedState, stateRaceSelect);
};

window.handleSelection = function (option) {
  // Show the relevant section based on the selected option
  if (option === "state") {
    stateConfig.classList.remove("hidden");
    checkboxSection.classList.add("hidden");
    presidentOptions.classList.add("hidden");
    handleState("MO,Missouri");
  } else if (option === "bop") {
    checkboxSection.classList.remove("hidden");
    stateConfig.classList.add("hidden");
    presidentOptions.classList.add("hidden");
    createBOPEmbed();
  } else if (option === "presidentMaps") {
    presidentOptions.classList.remove("hidden");
    stateConfig.classList.add("hidden");
    checkboxSection.classList.add("hidden");
    createPresidentEmbed();
  } else {
    presidentOptions.classList.add("hidden");
    stateConfig.classList.add("hidden");
    checkboxSection.classList.add("hidden");
    createEmbed(option);
  }
};

window.onload = function () {
  const dropdownSection = document.getElementById("stateConfig");
  const checkboxSection = document.getElementById("checkboxSection");
  const stateDropdown = document.getElementById("stateSelect");
  const raceDropdown = document.getElementById("stateRaceSelect");
  const presidentOptions = document.getElementById("presidentOptions");
  createEmbed("president");
};