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

window.handleStateRace = function (race) {
  state = stateSelect.value.split(",")[1];

  createEmbed(classify(state), { race: race });
};

window.handleState = function (state) {
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
    createEmbed(option);
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