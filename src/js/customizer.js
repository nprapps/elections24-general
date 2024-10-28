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
  var url = createURL(page, config);

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
  <script src="${PROJECT_URL}sidechain.js"></script>`;
  embedSidechainHTML = embedSidechainHTML
    .replace(/\</g, "&lt;")
    .replace(/[\n\s]+/g, " ");
  embedSidechain.innerHTML = embedSidechainHTML;

  preview.setAttribute("src", url.toString().replace(prefix, ""));
};


const createBOPEmbed = function(config = {}) {
  var checkboxSection = document.getElementById('checkboxSection');
  var checkboxes = checkboxSection.querySelectorAll('input[type="checkbox"]');
  var selectedRaces = [];
  var components = [];
  
  // Gather all checked values
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedRaces.push(checkbox.value);
    }
  });

  // Add selected races to config
  config.races = selectedRaces.join(',');
  


  // Join all components
  var template = components.join('\n');
  
  // If no checkboxes are selected, default to senate
  if (!template) {
    template = `<div class="bop-wrapper">
      <balance-of-power-combined race="senate"></balance-of-power-combined>
    </div>`;
  }

  // Create the embed code versions
  var embedPym = $.one("textarea#pym");
  var embedSidechain = $.one("textarea#sidechain");
  var preview = $.one("side-chain");

   // Create URL with selected options
   var url = createURL('bop', config);
  
  // Create Pym embed code
  var embedPymHTML = `<p
    data-pym-loader
    data-child-src="${url.toString()}"
    id="responsive-embed-bop">
      Loading...
  </p>
  <script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js"></script>`;
  
  embedPym.innerHTML = embedPymHTML
    .replace(/</g, "&lt;")
    .replace(/[\n\s]+/g, " ");
  
  // Create Sidechain embed code
  var embedSidechainHTML = `<side-chain src="${url.toString()}"></side-chain>
    <script src="${PROJECT_URL}sidechain.js"></script>`;
  
  embedSidechain.innerHTML = embedSidechainHTML
    .replace(/</g, "&lt;")
    .replace(/[\n\s]+/g, " ");
  
  // Update preview
  preview.setAttribute("src", url.toString().replace("localhost:8000/", ""));

  console.log(template)
  
  return template;
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

    handleState("MO,Missouri");
  } else if (option === "bop") {
    checkboxSection.classList.remove("hidden");
    stateConfig.classList.add("hidden");
    createBOPEmbed();
  } else {
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

  createEmbed("president");
};