import { Sidechain } from "@nprapps/sidechain";

import "./nav.js";

require("./components/state-page-results");
require("./components/results-table");
require("./components/county-map");
require("./components/county-dataviz");
require("./components/county-map");
require("./components/results-table-county");

let section = document.querySelector('input[name="nav"]:checked').value;

let nav = document.querySelector("form");

nav.addEventListener("change", e => {
  const selectedSection = document.querySelector(
    "#" + e.target.value + "-section"
  );
  document.querySelectorAll("section").forEach(section => {
    section.classList.remove("shown");
  });
  selectedSection.classList.add("shown");
});

const offices = {
  "key-races": "key-races",
  P: "president",
  G: "governor",
  S: "senate",
  H: "house",
  I: "ballot-measures",
};

const urlParams = new URLSearchParams(window.location.search);

const urlSection = urlParams.get("section");



window.onload = function() {
  const selectedSection = document.querySelector(
    "#" + offices[urlSection] + "-section"
  );
  document.querySelectorAll("section").forEach(section => {
    section.classList.remove("shown");
  });
  selectedSection.classList.add("shown");
  
  if (urlParams.has("embedded")) {
    const isEmbedded = urlParams.get("embedded");
  
    if (isEmbedded) {
      Sidechain.registerGuest();
    }
  
    hideHeader = urlParams.get("showHeader");
  
    if (hideHeader) {
      const headerElement = document.querySelector("header");
  
      headerElement.style.display = "none";
    }
  } else {
    document.querySelector("#close-disclaimer").addEventListener("click", () => {
      document.querySelector("#about-box").classList.add("closed");
    });
  }
}



