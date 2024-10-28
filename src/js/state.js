import { Sidechain } from '@nprapps/sidechain';

import './nav.js';

require("./components/results-collection");
require("./components/results-table");
require("./components/county-map")
require("./components/county-dataviz")
require("./components/county-map")
require("./components/results-table-county")

let section = document.querySelector('input[name="nav"]:checked').value;

let nav = document.querySelector("form");

nav.addEventListener("change", e => {
	const selectedSection = document.querySelector("#" + e.target.value + "-section");
	document.querySelectorAll("section").forEach(section => {
		section.classList.remove("shown");
	});
	selectedSection.classList.add("shown");
})

const offices = {
    "key-races": "key-races",
    "P" : "president",
  	"G" : "governor",
  	"S" : "senate",
  	"H" : "house",
  	"I" : "ballot-measures"
  }

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('embedded')) {
    const isEmbedded = urlParams.get('embedded');

    if (isEmbedded) {
        Sidechain.registerGuest();
    }

	const race = urlParams.get('race')

	const selectedSection = document.querySelector("#" + offices[race] + "-section");

	document.querySelectorAll("section").forEach(section => {
		section.classList.remove("shown");
	});
	selectedSection.classList.add("shown");

	hideHeader = urlParams.get('showHeader')

	console.log(hideHeader)

	if (hideHeader) {

	const headerElement = document.querySelector("header");

	console.log(headerElement)

	headerElement.style.display = "none";
	}


}

document.querySelector("#close-disclaimer").addEventListener("click", () => {
	document.querySelector("#about-box").classList.add("closed");
})
