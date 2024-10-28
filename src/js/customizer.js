require("async");
var $ = require("./lib/qsa");
require("@nprapps/sidechain");

let customizerState = {
  page: "governors",
  params: {
    embedded: true,
  },
};
let stateConfigOptions,
  stateSelectDropdown,
  stateRaceDropdown,
  stateHeaderCheckbox;

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

  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  console.log(url.toString());
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

const updateEmbed = function () {
  createEmbed(customizerState["page"], customizerState["params"]);
};

const updateStateRaces = function (selectedState) {
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

      stateRaceDropdown.innerHTML = "";

      sections.forEach(section => {
        var sectionItem = document.createElement("option");
        sectionItem.value = section.split(",")[1];
        sectionItem.textContent = section.split(",")[0];

        stateRaceDropdown.appendChild(sectionItem);
        stateRaceDropdown.addEventListener("change", function () {
          console.log(stateRaceDropdown.value);
          customizerState["params"]["race"] = stateRaceDropdown.value;
          updateEmbed();
        });
      });
    });
};

const handleState = function () {
  updateStateRaces(stateSelectDropdown.value.split(",")[0]);

  stateSelectDropdown.addEventListener("change", function () {
    updateStateRaces(stateSelectDropdown.value.split(",")[0]);
    customizerState["page"] = classify(stateSelectDropdown.value.split(",")[1]);
    updateEmbed();
  });

  stateHeaderCheckbox.addEventListener("change", function () {
    if (!stateHeaderCheckbox.checked) {
      customizerState["params"]["showHeader"] = false;
    } else {
      delete customizerState["params"]["showHeader"];
    }
    updateEmbed();
  });
};

const handleTopLevel = function (embedType) {
  let plainEmbeds = ["president", "governors", "senate", "house"];
  if (plainEmbeds.includes(embedType)) {
    customizerState["page"] = embedType;
    stateConfigOptions.classList.add("hidden");
  } else if (embedType == "state") {
    stateConfigOptions.classList.remove("hidden");
    stateSelectDropdown.value = "MO,Missouri";
    customizerState["page"] = classify(stateSelectDropdown.value.split(",")[1]);
    customizerState["params"]["race"] = "key-races";

    handleState();
  }
};

window.onload = function () {
  const topLevel = $("#topLevel label input");
  stateConfigOptions = $.one("#stateConfig");
  stateSelectDropdown = $.one("#stateSelect");
  stateRaceDropdown = $.one("#stateRaceSelect");
  stateHeaderCheckbox = $.one("#stateHeaderTrue");

  topLevel.forEach(el => {
    el.addEventListener("change", function () {
      handleTopLevel(el.value);
      updateEmbed();
    });
  });

  updateEmbed();
};
