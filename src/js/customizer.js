require("async");
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

let customizerState = {
  page: "index",
  params: {
    embedded: true,
    stateName: "Missouri",
    stateAbbrev: "MO",
    section: "key-races",
    showHeader: true
  },
};

let embedType,
  stateConfigOptions,
  stateSelectDropdown,
  stateSectionDropdown,
  stateRaceDropdown,
  stateHeaderCheckbox;

const createURL = function (config) {
  var prefix = "localhost:8000/";
  var page = config["page"];

  if (page == "state") {
    page = classify(config["params"]["stateName"]);
  }

  var baseURL = prefix + page + ".html";
  const url = new URL(baseURL);

  var neededParams = ["embedded"];
  if (config["page"] == "state") {
    moreParams = ["section", "showHeader"]
    neededParams.push(...moreParams);
  }
  if (config["page"] == "race-embed") {
    moreParams = ["stateAbbrev", "race", "showHeader"]
    neededParams.push(...moreParams);
  }
  neededParams.forEach(key => {
    url.searchParams.append(key, config["params"][key]);
  });

  return url.toString();
};

const createId = function (config) {
  var id = "";
  if (config["page"] == "state") {
    id =
      config["params"]["stateAbbrev"] +
      "-" +
      config["params"]["section"];
  } else if (config["page"] == "individual") {
    id =
      config["params"]["stateAbbrev"] +
      "-" +
      config["params"]["race"];
  } else {
    id = config["page"];
  }
  return id;
};

const createEmbed = function (config) {
  var form = $.one("form");
  var preview = $.one("side-chain");
  var embedPym = $.one("textarea#pym");
  var embedSidechain = $.one("textarea#sidechain");
  var prefix = "localhost:8000/";

  var url = createURL(config);
  var id = createId(config);

  var embedPymHTML = `<p
  data-pym-loader
  data-child-src="${url.toString()}"
  id="responsive-embed-${id}">
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

const buildSections = function () {
  var state = customizerState["params"]["stateAbbrev"];
  fetch("data/states/" + state + ".json")
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
      if (state != "DC") {
        sections.push("house,H");
      }
      if (data.results.filter(d => d.office === "I").length > 0) {
        sections.push("ballot-measures,I");
      }

      stateSectionDropdown.innerHTML = "";

      sections.forEach(section => {
        var sectionItem = document.createElement("option");
        sectionItem.value = section.split(",")[1];
        sectionItem.textContent = section.split(",")[0];

        stateSectionDropdown.appendChild(sectionItem);
      });
    });
};

const buildRaces = function () {
  var state = customizerState["params"]["stateAbbrev"];
  fetch("data/states/" + state + ".json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON data
    })
    .then(data => {
      const listOfStateRaces = data.results.map(race => ({
        id: race.id,
        office: race.office,
        seat: race.seat,
        keyRace: race.keyRace,
      }));

      const raceTypeLookup = {
        P: "President",
        G: "Governor",
        S: "Senate",
        H: "House",
        I: "Ballot Measure",
      };

      stateRaceDropdown.innerHTML = "";

      listOfStateRaces.forEach(race => {
        raceOffice = raceTypeLookup[race.office];
        raceName = raceOffice;
        if (race.office == "H" || race.office == "I") {
          raceName += " " + race.seat;
        }

        var sectionItem = document.createElement("option");
        sectionItem.value = race.id;
        sectionItem.textContent = raceName;

        stateRaceDropdown.appendChild(sectionItem);
      });
    });
};

const updateView = function () {
  var page = customizerState["page"];
  var params = customizerState["params"];

  if (page == "state") {
    stateConfigOptions.classList.remove("hidden");
    $.one("#stateSectionContain").classList.remove("hidden");
    $.one("#stateRaceContain").classList.add("hidden");
    buildSections();
  } else if (page == "race-embed") {
    stateConfigOptions.classList.remove("hidden");
    $.one("#stateSectionContain").classList.add("hidden");
    $.one("#stateRaceContain").classList.remove("hidden");
    buildRaces();
  } else {
    stateConfigOptions.classList.add("hidden");
  }

  createEmbed(customizerState);
};

window.onload = function () {
  embedType = $("#embedType label input");
  stateConfigOptions = $.one("#stateConfig");
  stateSelectDropdown = $.one("#stateSelect");
  stateSectionDropdown = $.one("#stateSectionSelect");
  stateRaceDropdown = $.one("#stateRaceSelect");
  stateHeaderCheckbox = $.one("#stateHeaderTrue");

  embedType.forEach(el => {
    el.addEventListener("change", () => {
      customizerState["page"] = el.value;
      updateView();
    });
  });

  stateSelectDropdown.addEventListener("change", () => {
    customizerState["params"]["stateName"] = stateSelectDropdown.value.split(",")[1];
    customizerState["params"]["stateAbbrev"] = stateSelectDropdown.value.split(",")[0];
    updateView();
  });

  stateSectionDropdown.addEventListener("change", () => {
    customizerState["params"]["section"] = stateSectionDropdown.value;
    createEmbed(customizerState);
  });

  stateRaceDropdown.addEventListener("change", () => {
    customizerState["params"]["race"] = stateRaceDropdown.value;
    createEmbed(customizerState);
  });

  stateHeaderCheckbox.addEventListener("change", () => {
    customizerState["params"]["showHeader"] = stateHeaderCheckbox.checked;
    createEmbed(customizerState);
  });
};
