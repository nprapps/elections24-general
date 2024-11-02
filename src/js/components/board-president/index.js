var ElementBase = require("../elementBase");

import gopher from "../gopher.js";
import { getBucket, sumElectoral, groupCalled } from "../util.js";
import ElectoralBars from "../electoral-bars";
import Leaderboard from "../leader-board";
import ResultBoardDisplay from "../results-board-display";
import ResultBoardKey from "../results-board-key";
import Cartogram from "../cartogram";
import NationalMap from "../nationalMap";
import Tabs from "../tabs";

/**
 * BoardPresident - Custom element for displaying presidential election results
 * Supports multiple visualization modes/sub components: national-map, cartogram-map, and electoral-bubbles, all of which should be imported above
 *
 * @class
 * @extends ElementBase
 
 * The constructor nitializes the component with state management and tab handling
  * @constructor
  * @property {Object} state - Component state
  * @property {PresidentRaceResult[]} results - Election results
  * @property {number} initialSelectedTab - Initial tab selection (0: national, 1: cartogram, 2: bubbles)
  * @property {Object} tabElementMap - Maps tab indices to visualization elements
     */

class BoardPresident extends ElementBase {
  constructor() {
    super();
    this.state = {};
    this.results = []
    //this.onData = this.onData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.renderLoadingState = this.renderLoadingState.bind(this);
    this.checkComponents = this.checkComponents.bind(this);
    this.updateTabSelection = this.updateTabSelection.bind(this);
    this.tabButtons = null;
    this.customElements = null;
    this.tabElementMap = null;
    this.style.opacity = '0';
    this.style.transition = 'opacity 0.1s ease-in';


    let initialSelectedTab = 0; 
    if (this.hasAttribute("data-national")) {
      initialSelectedTab = 0;
  }
  else if (this.hasAttribute("data-cartogram")) {
      initialSelectedTab = 1;
  } 
  else if (this.hasAttribute("data-bubbles")) {
      initialSelectedTab = 2;
  }

    this.initialSelectedTab = initialSelectedTab;

    this.cartogramButton = `
<button role="tab" aria-controls="tab-1" aria-selected="false" data-tab="1">
  <inline-svg alt="" src="./assets/icons/ico-cartogram.svg" class="icon"><div class="inline-svg icon" role="img" alt=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 500">
    <path d="M398 361h42v42h-42zM11 18h24v24H11zM147 308h46v46h-46zM314 322h34v34h-34zM11 234h104v104H11zM198 261h42v42h-42zM634 137h37v37h-37zM580 224h24v24h-24zM551 224h24v24h-24zM470 422h76v76h-76zM445 361h56v56h-56zM11 403h28v28H11zM127 198h28v28h-28zM276 195h63v63h-63zM344 195h46v46h-46zM237 183h34v34h-34zM261 263h34v34h-34zM381 265h40v40h-40zM314 361h40v40h-40z" fill="currentColor"></path>
    <g>
      <path d="M683 18h14v14h-14zM699 18h14v14h-14zM683 34h14v14h-14zM699 34h14v14h-14z" fill="currentColor"></path>
    </g>
    <path d="M528 175h44v44h-44zM634 86h46v46h-46zM365 134h56v56h-56zM227 134h44v44h-44zM359 361h34v34h-34zM314 273h44v44h-44zM144 134h24v24h-24z" fill="currentColor"></path>
    <g>
      <path d="M225 222h14v14h-14zM241 222h14v14h-14zM257 222h14v14h-14zM241 238h14v14h-14zM257 238h14v14h-14z" fill="currentColor"></path>
    </g>
    <path d="M120 269h34v34h-34zM663 53h28v28h-28zM577 167h52v52h-52zM198 308h31v31h-31zM553 86h76v76h-76zM492 279h54v54h-54zM198 134h24v24h-24zM395 195h60v60h-60zM258 302h37v37h-37zM77 189h37v37H77zM460 156h63v63h-63zM676 137h28v28h-28zM445 314h42v42h-42zM198 163h24v24h-24zM375 310h46v46h-46zM222 344h87v87h-87zM159 269h34v34h-34zM634 57h24v24h-24zM496 224h50v50h-50zM66 134h48v48H66zM460 224h31v31h-31zM276 146h44v44h-44zM169 202h24v24h-24z" fill="currentColor"></path>
  </svg></div></inline-svg>
  Electoral
</button>`;

    this.bubblesButton = `
<button role="tab" aria-controls="tab-2" aria-selected="false" data-tab="2">
  <inline-svg alt="" src="./assets/icons/ico-bubbles.svg" class="icon"><div class="inline-svg icon" role="img" alt=""><svg xmlns="http://www.w3.org/2000/svg" width="120" height="100" viewBox="0 0 120 100">
    <circle cx="45" cy="50" r="20" fill="currentColor"></circle>
    <circle cx="70" cy="90" r="4" fill="currentColor"></circle>
    <circle cx="80" cy="20" r="10" fill="currentColor"></circle>
    <circle cx="100" cy="75" r="15" fill="currentColor"></circle>
    <circle cx="84" cy="50" r="4" fill="currentColor"></circle>
    <circle cx="110" cy="30" r="4" fill="currentColor"></circle>
  </svg></div></inline-svg>
  Margins
</button>`;


    this.nationalButton = `
<button role="tab" aria-controls="tab-0" aria-selected="true" data-tab="0">
<inline-svg alt="" src="./assets/icons/ico-geo.svg" class="icon"><div class="inline-svg icon" role="img" alt=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 555">
<g>
<path d="M768 145l2 2-4 1 2-3zm-10-25l1 3 3 2-3 1-1 6 4-1 3 3 2 5 4 1 3-2 2 1-6 3-3 3-1-4-3 3v1l-2 2-2-3-1-1-2-1-1-4-6 2h-2l-13 3-8 2-1-1 1-13 11-2 15-4 5-5h1z" fill="currentColor"></path>
</g>
<g>
<path d="M395 50h26v-7h3l2 1 1 7v2l2 2h3l1 1h5l1 3 4-1 3-2h3l5 2 1 1 2 4 1-1 4-1 1 2 2 1 1 2 4 1 2-1 4-3 2 2h3l5-1 2 2h3l1 1-5 3-5 2-4 2-2 3-7 7-7 7-2 2v11l-1 1-4 3-3 3v3h2l1 2-1 3v5l1 2-1 4 3 2 3 1 1 2h3l2 2 2 3 2 2 3 1 2 2 1 3v5l-22 1h-50l1-34-2-2h-2l-2-4 3-3 1-3v-8l-2-2-1-4V78l-1-3-1-3-2-7v-7l1-2-2-6z" fill="currentColor"></path>
</g>
<g>
<path d="M233 37l21 3 22 2 14 2 18 2-5 57-1 18-21-2-21-2-27-4-25-3-2 9-2-2v-3h-2l-2 3-2-1h-5l-2-1-2 2-5-2-2 1-2-1v-3l-1-4h-2l-2-3 1-1-1-2-2-4v-6l-1-2-3 2-3 1-3-2 2-3-1-1 3-2-1-3 1-4 3-5v-3l-3 1v-2l-4-3 1-1-4-7-1-1-2-1-1-4v-4l-3-7 4-18 19 4 11 2 17 3 11 2 18 3z" fill="currentColor"></path>
</g>
<g>
<path d="M342 48l20 1h14l19 1 2 6-1 2v7l2 7 1 3 1 3v16l1 4 2 2v8h-18l-19-1-19-1-21-1-23-2 5-57 15 1 19 1z" fill="currentColor"></path>
</g>
<g>
<path d="M255 468l5 1 4 4 1 3h1l1 2 2 2-3 3-4 2-1-1-4 3-2 3-1 1-4-2v-6l-2-5-1-2 2-3 2-3-1-2v-3l3 1 2 2zm-23-12h-2v-3l3 1-1 2zm5-5l2 2 4-1 3 3h2v2l-5 2h-2l-1-3-3-1-1-2 1-2zm-11-4l6 1v2l-3-1-4 1 1-3zm-12-7l1 3 4 2-3 1-2-1-3 1-3-4v-2h2l2-2 2 2zm-26-12l2 1-1 4-2 1h-3l-3-2v-1l1-2 3-2 3 1z" fill="currentColor"></path>
</g>
<g>
<path d="M145 20l12 3-4 18 3 7v4l1 4 2 1 1 1 4 7-1 1 4 3v2l3-1v3l-3 5-1 4 1 3-3 2 1 1-2 3 3 2 3-1 3-2 1 2v6l2 4 1 2-1 1 2 3h2l1 4v3l2 1 2-1 5 2 2-2 2 1h5l2 1 2-3h2v3l2 2-7 48-19-4-23-4-23-4-18-4 7-34 4-7-1-2-3-1 1-3 4-5 3-3v-2l2-2 2-3 3-4v-3l-3-2-1-4v-2l1-1-1-4 7-31 4-18z" fill="currentColor"></path>
</g>
<g>
<path d="M73 14l-1 3h-2l2-3h1zm1-12l18 5 24 6 14 4 15 3-4 18-7 31 1 4-1 1v2l-27-6h-2l-6-1-1 1h-4l-4 1-3-1-2-1-4 1h-3l-2-3-7-2-2 1-4 1-6-4 1-6-1-3-3-2h-2l-1-3-3-1h-3v-3l2-2 1-4-2-1 2-4-2-2 1-3-1-3 1-7-2-4 1-5 1-3h2l5 5 4 2 6 2h2l1 2 2 1 1 3 1 1v3h-2l1 4-2 3-4 2 1 2 6-4 1-5v-2l2-3 2-1-1-3v-3l-1-2 2-3V7h-2V2z" fill="currentColor"></path>
</g>
<g>
<path d="M110 336l3-3h3l1-3 1-2-4-2 1-3v-4h2l2-2 1-3v-4l3-3 5-2v-1l-3-3v-2l-1-4-2-3 1-2v-3l1-1 1-3-1-3 1-7v-4l3-1 3 1 1 3h2l2-4 3-14 23 4 19 3 21 3 12 2-15 108-15-2-17-3h-1l-19-11-24-14-13-8z" fill="currentColor"></path>
</g>
<g>
<path d="M56 305l3 2-2 1-1-3zm-20-16v2h-2l-1-2h3zm77 44l-18-2-21-3v-3l-1-1 1-3v-5l-2-4-4-5-2-3-2-2-4-3-1-4-4-1-2-1-4-3v-2l-3-3-2-2h-4l-3-3h-6l-2-4 2-2v-4l1-4-3-3 1-3-2-1-1-4-2-1v-3l-1-2v-2l-5-8 1-3 3-3 1-3-2-3-3-1-2-5 1-3-1-4 1-5h2l-1 5 3 1-1-9 3-1-2-2-2 1-2 5-4-6v-4l-1-4-1-2-2-4-2-4-1-2 1-2v-6l2-3v-6l-2-6-2-4v-4l3-4h1l3-5 1-3 2-4 1-9v-2l22 6 18 5 18 5-15 56 13 19 8 12 9 13 14 21 12 18 7 10-1 2 2 3 1 4v2l3 3v1l-5 2-3 3v4l-1 3-2 2h-2v4l-1 3 4 2-1 2-1 3h-3z" fill="currentColor"></path>
</g>
<g>
<path d="M323 219l-4 58-14-1-20-2-29-3-20-2-22-3 10-76 25 3 27 3 19 2 29 2-1 19z" fill="currentColor"></path>
</g>
<g>
<path d="M116 151l18 4 23 4-18 95-3 14-2 4h-2l-1-3-3-1-3 1v4l-1 7 1 3-1 3-1 1v3l-7-10-12-18-14-21-9-13-8-12-13-19 15-56 18 4 23 6z" fill="currentColor"></path>
</g>
<g>
<path d="M241 371l-28-4-1 9-13-2 15-108 22 3 20 2 29 3 20 2-1 9-1 1-6 85-29-2-29-3v3l2 2z" fill="currentColor"></path>
</g>
<g>
<path d="M134 76l1 4 3 2v3l-3 4-2 3-2 2v2l-3 3-4 5-1 3 3 1 1 2-4 7-7 34-23-6-18-4-18-5-18-5-22-6-1-3v-4l2-5 1-1-1-4 2-3 3-6 2-1 4-8 5-13 1-4 3-5 2-6 2-3v-2l2-6 1-1h5l1 2h3l3 2 1 3-1 6 6 4 4-1 2-1 7 2 2 3h3l4-1 2 1 3 1 4-1h4l1-1 6 1h2l27 6z" fill="currentColor"></path>
</g>
<g>
<path d="M157 159l23 4 19 4-3 19 28 4-10 76-12-2-21-3-19-3-23-4 18-95z" fill="currentColor"></path>
</g>
<g>
<path d="M206 119l2-9 25 3 27 4 21 2 21 2-3 38-4 39-19-2-27-3-25-3-28-4 3-19 7-48z" fill="currentColor"></path>
</g>
<g>
<path d="M507 296l1 1-1 2-3 2 1 4h-2l-1 3v4l-3 3 1 2-3 2-2 4v4l-3 3-1 5h-3l1 4-2 2v1l-1 2 2 1-1 3 1 1 1 3-1 2-12 1-20 1h-14v-10l-4-1-2 1-1-2v-34l-3-21h12l25-1 17-1h14l1 2v2l-4 4v2l10-1z" fill="currentColor"></path>
</g>
<g>
<path d="M404 154h50l22-1 1 2 2 2-1 2 1 5 1 3 5 2 1 2 2 3 1 2 4 3v5l-2 2v3l-5 3h-4l-1 1v4l2 2v3l-2 2-1 3-3 2v4l-4-3-1-1h-3l-16 1-20 1-19-1-1-2v-1l-1-11v-2l-3-2 1-5-2-3-1-2-1-3-1-5-1-1-1-2-1-2 1-2 1-5-1-2v-3l1-3z" fill="currentColor"></path>
</g>
<g>
<path d="M319 277l4-58 18 1 28 1 24 1h28l1 2h3l2 1-2 3-1 3 3 3 1 3 3 2 1 40-28 1-18-1h-17l-25-1-25-1z" fill="currentColor"></path>
</g>
<g>
<path d="M507 296l-10 1v-2l4-4v-2l-1-2h-14l-17 1-25 1h-12v-10l-1-40-3-2-1-3-3-3 1-3 2-3-2-1h-3l-1-2-5-7-2-5 19 1 20-1 16-1h3l1 1 4 3-1 4 1 6 1 3 4 3 1 1 4 3 1 2 1 4 2 2 2-2 4 2v4l-3 7 1 2 4 3 3 1 3 2 2 3 1 2 1 3-1 3 4 5 1-1 2 1v5l-2 3-1-1-1 3h-2v2l-2 3 1 2-1 3z" fill="currentColor"></path>
</g>
<g>
<path d="M305 276l14 1 25 1 25 1h17l18 1 28-1v10l3 21v34l-7-2-1-2-4-2-2 2-3-1-1-1-3 2-2-1-4 2-1 1-4-1-3-2v1h-3l-1-2-2 3h-2v-2l-3 1-3-1-2-2-2 2h-2v-2l-2-1v-2h-4l-3 1-1-1h-2l-4-1-4-1-1-3h-6l-3-4h-2l2-37-28-1-18-2 1-9z" fill="currentColor"></path>
</g>
<g>
<path d="M403 108l-1 3-3 3 2 4h2l2 2-1 34-1 3v3l1 2-1 5-1 2 1 2 1 2h-2l-1-3-2-1-4-1-3-2-5 1-2-1-2 2-4-2-3-2-16-1-26-1-21-2-14-1 3-38 1-18 23 2 21 1 19 1 19 1h18z" fill="currentColor"></path>
</g>
<g>
<path d="M481 422l-4-1 1-2 4 1-1 2zm-39-66h14l20-1 12-1 1 2-1 1v5l1 3 3 2-2 5-3 4-1 1-1 2v3l-2 2 1 1-1 3h-1l1 4-1 1 15-1 16-1-1 7 1 2 2 2 2 4 1 1h-3l-2-1h-3l-1-2h-3l-3 3v1l1 2h5l3-2 1 1v2l2 2 2-2 2-2v4l-3 5v2l6 2h2l3 4-2 2-4-1-1-2-5-2-3-2-3-1 1 3-1 2 1 2-3 1v-3h-6l-2 3-9-2-1-1 1-2-1-1-4-1-1-2-2-2h-3l-2-1-2 1v3l-2 2-7-1-6-3h-12l-1 1-1-2 1-1v-2l1-2v-6l1-4 1-4 1-5-3-5 1-1-3-4v-2l-1-3-3-3v-19z" fill="currentColor"></path>
</g>
<g>
<path d="M393 454l2-4 1 1-3 3zm-47 1l-1-2-2-3-1-2-4-3-1-6-2-4-2-2-1-4-2-3-3-3-1-2h-1l-1-3h-3v-2l-9-2h-3l-3-2-2 3h-4l-2 3-2 4-1 3h-1l-3 4-3-1-3-2v-1l-3-1-1-2-5-1-3-4h-1l-3-3-1-2-1-4v-4l-2-5v-2l-2-3-4-3-2-1-2-3-1-1-3-3-3-4-2-2-2-2-1-3-2-1-2-2v-3l29 3 29 2 6-85 1-1 18 2 28 1-2 37h2l3 4h6l1 3 4 1 4 1h2l1 1 3-1h4v2l2 1v2h2l2-2 2 2 3 1 3-1v2h2l2-3 1 2h3v-1l3 2 4 1 1-1 4-2 2 1 3-2 1 1 3 1 2-2 4 2 1 2 7 2 1 2 2-1 4 1v29l3 3 1 3v2l3 4-1 1 3 5-1 5-1 4-1 4v6l-1 2h-1l-1 4 1 2h-3l-10 4-2-1 1-3-2-2-1 2-2-1v4l2 3-3 3-1 1v2l-4 3-4 2-3 1-7 3-2-1h-4v1l3 3-4 2-2-2-1 3-2 3-1-2-3 1 2 2-2 4-2-1-2 1 2 3-3 7-1-2-2 2v1h3l-1 4-1 1v3l1 1 1 5v2l1 1 1 4 1 3-3 2-5-3-2-1h-7l-2-2-4-2-1 1-3-3-5-1-2-9-4-3 1-3-1-3v-4l-3-2-2-2z" fill="currentColor"></path>
</g>
<g>
<path d="M726 145l8-2 13-3h2l3 9v4h-1l-5 2-7 2-5 3-6 5-1-2 3-3-2-1-2-14z" fill="currentColor"></path>
</g>
<g>
<path d="M738 83l1-5 1-1 3-1 10 32 1 3 2 2 2 3v4h-1l-5 5-15 4-2-3v-8l-1-4v-4l1-2 1-7-1-3 4-4 1-3-2-2 1-4-1-2z" fill="currentColor"></path>
</g>
<g>
<path d="M749 140l6-2 1 4 2 1h-1l-1 4 1 2-1 2-4 2v-4l-3-9z" fill="currentColor"></path>
</g>
<g>
<path d="M714 89l24-6 1 2-1 4 2 2-1 3-4 4 1 3-1 7-1 2v4l1 4v8l2 3-11 2-4-15-3-1 1-2-3-6v-8l-1-2-1-4-1-4z" fill="currentColor"></path>
</g>
<g>
<path d="M572 310l11 38 2 6 3 3v2l1 1-2 3v2l-1 4 2 5v5l2 5-26 3-16 2v2l4 4v4l-3 4-3-1-2-2-1-4h-2v6h-5l-4-29 1-29 1-29-2-2 10-1 13-1 17-1z" fill="currentColor"></path>
</g>
<g>
<path d="M552 398v-3l-4-4v-2l16-2 26-3 3 5h16l27-2 2 3h2v-4l-1-3 2-2 3 1h4l1 1v3l6 13 1 4 6 9 7 7-3 1v-2l-2-1 3 6 1 3 8 11 1 2 4 7 2 3 1 3 1 4v13l-2 5v3l1 2-2 3h-2l-2 2h-3l-4 2-2-2v-3l-4-7-1-1-5-2-3-1-2-7-3-1-1-3v-3l-2-1-1 2h-2l-5-8-1-2-1-2 3-6-4-3v6l-3-2v-7l1-5-1-9-2-2-2-3-3 1-4-4-3-2-1-3h-2l-3-4-6-3-4 1-2 2 1 2h-2l-6 4-7 2-1-4-6-4-1-2-2 1-4-1-5-1 1-3-3 1-3 1h-4l-2-1-2 1-2 3h-2l1-2-1-1z" fill="currentColor"></path>
</g>
<g>
<path d="M590 384l-2-5v-5l-2-5 1-4v-2l2-3-1-1v-2l-3-3-2-6-11-38 20-3 19-2-3 3v3l5 3h3l3 5 3 4 5 3 2 2 4 3v2l2 1 2 3 4 1v2l3 3v3l3 2 2 3v2l2 2 3 1h1l-3 5-2 1-1 3-1 4 2 2-3 6 1 5h-4l-3-1-2 2 1 3v4h-2l-2-3-27 2h-16l-3-5z" fill="currentColor"></path>
</g>
<g>
<path d="M488 354l1-2-1-3-1-1 1-3-2-1 1-2v-1l2-2-1-4h3l1-5 3-3v-4l2-4 3-2-1-2 16-1 17-1 2 2-1 29-1 29 4 29-1 1h-5l-3-2-1 1-5 2-3 3-1-1-2-4-2-2-1-2 1-7-16 1-15 1 1-1-1-4h1l1-3-1-1 2-2v-3l1-2 1-1 3-4 2-5-3-2-1-3v-5l1-1-1-2z" fill="currentColor"></path>
</g>
<g>
<path d="M654 356l-3-1-2-2v-2l-2-3-3-2v-3l-3-3v-2l-4-1-2-3-2-1v-2l-4-3-2-2-5-3-3-4-3-5h-3l-5-3v-3l3-3 8-5 4-1 18-2h3l2 3 1 2 17-2 20 14-2 3-3 3-2 5v4l-3 4-3 1v2l-3 3-2 3-6 4v2l-3 4-3 4z" fill="currentColor"></path>
</g>
<g>
<path d="M477 213v-4l3-2 1-3 2-2v-3l-2-2v-4l1-1h4l5-3v-3l2-2v-5l-4-3-1-2-2-3 27-1 13-1v4l2 4 2 5 1 1 4 46-2 1v3l2 3 1 4-1 2v3l-3 4-2 1 1 2-2 2 1 5-2 3 1 4-5 1v3l1 2-1 2-6-3-2 1-2 3 1 1-2-1-1 1-4-5 1-3-1-3-1-2-2-3-3-2-3-1-4-3-1-2 3-7v-4l-4-2-2 2-2-2-1-4-1-2-4-3-1-1-4-3-1-3-1-6 1-4z" fill="currentColor"></path>
</g>
<g>
<path d="M530 259l-1-5 2-2-1-2 2-1 3-4v-3l1-2-1-4-2-3v-3l2-1-4-46 3 2 4-2 2-1 29-3v1l1 7 5 43 1 3v2l-3 1-3 2-1-1-2 1v3l-2 3-1 2-2 1-1 1v3l-2 2-6-2-1 2v2h-3l-1-1-3 2-1 2-5-2-6 1-2 2h-1z" fill="currentColor"></path>
</g>
<g>
<path d="M511 286l1-3 1 1 2-3v-5l-1-1 2-3 2-1 6 3 1-2-1-2v-3l5-1-1-4 2-3h1l2-2 6-1 5 2 1-2 3-2 1 1h3v-2l1-2 6 2 2-2v-3l1-1 2-1 1-2 2-3v-3l2-1 1 1 3-2 3-1v-2l-1-3h3l2-1 2 1 3 4h5l2 2 3-1 3 1 3-1 1-2h2l1 3h2l2 2 1 3-1 2 7 9 3 2h2l-5 5-4 3-1 3-2 1v2l-3 1v2l-8 4-1 1-21 1-5 1-9 1h-8l-19 2h-4l1 3-21 2z" fill="currentColor"></path>
</g>
<g>
<path d="M714 256h1l-1 1-1-1h1zm-103 49l-19 2v-4l3-1 1-4 1-2 3-1 3-1 6-5h1l2-3 3-3 2 1 2-2 2-2 2 1 2-4 3-2v-4l7-1 17-2 24-4 9-2 28-6 2 3 2 4h-3l-2 2-3 1-1 2h-3v2l5-1 3-2h2l1 2 2-2 2 2 1 4-2 1-3 5-2 1-5-1 2 2v6h3l1 1-2 3-2 2h-4l-4 3-1 1-4 3-2 2-2 4v5l-1 2h-4l-5 1-20-14-17 2-1-2-2-3h-3l-18 2-4 1-8 5z" fill="currentColor"></path>
</g>
<g>
<path d="M575 230l-5-43-1-7 19-3h2l4 1 2 3h2l3-1 1 1 7-3h2l3-1 4-4 4-3 7-4 4 25-2 2 1 2 1 3-2 5 1 2-1 3v3l-5 6-2 1-1-1-1 2-2 3v5h-1l-3-1-2 4-1 7-4 1-2-2h-2l-1-3h-2l-1 2-3 1-3-1-3 1-2-2h-5l-3-4-2-1-2 1h-3z" fill="currentColor"></path>
</g>
<g>
<path d="M499 315l3-3v-4l1-3h2l-1-4 3-2 1-2-1-1 1-3-1-2 2-3v-2h2l21-2-1-3h4l19-2h8l9-1 5-1 21-1 1-1 26-3 4-1v4l-3 2-2 4-2-1-2 2-2 2-2-1-3 3-2 3h-1l-6 5-3 1-3 1-1 2-1 4-3 1v4l-20 3-17 1-13 1-10 1-17 1-16 1z" fill="currentColor"></path>
</g>
<g>
<path d="M713 229l4-2-1 4-4 10-2 1 1-5-1-1 2-3 1-4zm-115 46l8-4v-2l3-1v-2l2-1 1-3 4-3 5-5 1 3 2 1 3 1h1l3-3 2 2 4-2 6-4h1l2-2 1-2-1-1v-3l3-4v-3l2-3 1-6 2 2h4l3-8h2l1-3h1l3-5v-6l8 5 1-4 4 1v2l4 1 3 2 1 4-2 1-1 4 2 3 3-1 3 2h4l2 2 4 2v7l2 1-1 4 2 2 1 3h4l4 7h-1l-1-3h-1l1 3h-1l-28 6-9 2-24 4-17 2-7 1-4 1-26 3z" fill="currentColor"></path>
</g>
<g>
<path d="M531 114v3l-2 7-2-2 2-5 2-3zm-55 39v-5l-1-3-2-2-3-1-2-2-2-3-2-2h-3l-1-2-3-1-3-2 1-4-1-2v-5l1-3-1-2h-2v-3l3-3 4-3 1-1V93l2-2 2 1h2l5-2 2-2 2 1 2-2 3 1-2 2v3l2-1 2 1h2l3 2 2 3 13 3 4 1h4l6 2 1 2 2 1 1 1 1 4-1 2h3l-1 3 2 2v2l-3 1-1 4-1 3 4-2 1-3 2-1 2 1-1 6-1 4 1 1-2 3-1 3 1 4-2 9v5l2 4 1 6-13 1-27 1-1-2-5-2-1-3-1-5 1-2-2-2-1-2z" fill="currentColor"></path>
</g>
<g>
<path d="M621 254h-2l-3-2-7-9 1-2-1-3 4-1 1-7 2-4 3 1h1v-5l2-3 1-2 1 1 2-1 5-6v-3l1-3-1-2 2-5-1-3-1-2 2-2 3 18 15-3 1 10 4-4 1-2h2l3-3h4v-2h2l2-2 6 3 1 3-1 4-8-5v6l-3 5h-1l-1 3h-2l-3 8h-4l-2-2-1 6-2 3v3l-3 4v3l1 1-1 2-2 2h-1l-6 4-4 2-2-2-3 3h-1l-3-1-2-1-1-3z" fill="currentColor"></path>
</g>
<g>
<path d="M708 193l-1 4v3l3 2 2 5 4 4h2l2 6h-1v1l-9 1-6-23 2-3h2z" fill="currentColor"></path>
</g>
<g>
<path d="M688 215v-2l3 2-2 2-1-2z" fill="currentColor"></path>
</g>
<g>
<path d="M717 227l-4 2h-4l1-3-2-2-2 1-3-2-2-2 2-4-3-1 2-3-1-5h-2l1-3h-4v3l2 3-2 5 2 5 2 2v1l2 3-1 1-3-1h-2l-3-1-2-3-3 3-1-3 2-4v-2l2-2-3-2v2l-3-2-4-1v-2l-4-1-1-3-6-3-2 2h-2v2h-4l-3 3h-2l-1 2-4 4-1-10 15-2 13-3 25-5 6 23 9-1v4h-1l-1 5z" fill="currentColor"></path>
</g>
<g>
<path d="M713 188l4-4-8-6-1-3 1-3-1-2 2-4v-2l2-2 13 4-1 6-2 2v3h3l2 2v6h-1l1 6-2 4-3 7-1 3-1 3h-1v-4l-2-1-2 1-7-4v-6l4-3 1-3z" fill="currentColor"></path>
</g>
<g>
<path d="M747 158l-2 2 1 1 3-2 1 1-4 3-2 2h-2l-3 2-4 2-6 4-2-1-2 2-1-1 2-3 4-4 5-1 1-1 5-1 2-1 3-4h1zm-63-52l1-2 5-6 4-4h2l18-5 1 4 1 4 1 2v8l3 6-1 2 3 1 4 15-1 13 1 1 2 14 2 1-3 3 1 2-1 4-2 1v-4l-13-4-1-2-2 1-3-3-1-4-4-2-18 3-21 5-23 4-1-5 4-4 1-1 3-3 3-5-2-3v-2h-2v-3l4-3 4-1 4-1h5l3 1 3-1 5-1 3-1 1-2 3-3 2-1v-2l-2-4 2-1-1-2-3-1 4-4 3-4-1-1z" fill="currentColor"></path>
</g>
<g>
<path d="M633 191l-4-25 2-1 7-6 1 5 23-4 21-5 18-3 4 2 1 4 3 3 2-1 1 2-2 2v2l-2 4 1 2-1 3 1 3 8 6-4 4-1 3-4 2h-2l-2 3-25 5-13 3-15 2-15 3-3-18z" fill="currentColor"></path>
</g>
<g>
<path d="M599 150v8l-3-1-2 3v3l-2 1-1 3v4l-1 1-2 5-19 3v-1l-29 3 3-4 3-6 1-5v-9l-1-3-5-9 1-4v-3l-1-2 1-2 1-4v-6l2-1v-4l3-1 1-2h2l3 2v-3l-1-3 1-1 4-3-1-2v-2l1-2 2-1 5 2h3l2 2 8 2 4 4-2 3 2 1 1 4v7l-2 2-1 4-3 1-1 3 1 3 3 1 5-7 5-3 3 3 1 2 3 10 2 4zm-23-56l1 2-1 1h-3l3-3zm-13-5v-1l5-1-2 3 1 2 3 2v3h-9l-1 3-3-2-5-1h-2l-2 2-8 2-1 3-2 1-3-2-1 3-4 1-2 5-3 5v2l-2-2 1-3h-3l1-2-1-4-1-1-2-1-1-2-6-2h-4l-4-1-13-3-2-3-3-2 6-2 2-3 5-1 4-3h2l1-2 2-2 2 1 3 5 2-1h5l3 2 4 5 5-1 1 1 2-1 2 1 1-2 5-3 3-1h5l4-2h2v4l3 1 2-1 3 1zm-45-14h-2l-4 5-2 4-3-5 2-2 5-3h3l1 1zm-11-13l-2 3-3 1-2 3-2-2 8-5h1z" fill="currentColor"></path>
</g>
<g>
<path d="M22 490l2 3h-4l2-3zm14-4l1 2-6 1 2-3h3zm130-7l1 1v4l-3-1v-4h2zm-10-1h1l1 2 3 1 1 2 2 1 1 3h-3v-1l-3-1v-2l-2-4-1-1zm-2-5l3 1v3h-2l-1-4zm-7-1h2l2 4-1 2-2-2-1-4zm-66 0l2 1-1 4h-2l-3 4-2-2-1-3 4-3 3-1zm64-5l3 1 2 3-5 1-2-2v-2l2-1zm3-2l1 1h2v1l2 3h-3l-2-5zm-65 4l2 2-3 1-2-1 3-2zm-45-22l1 1v3h-3l-3-3 3-1h2zm-10-29l1 2h3l1 5h-1l-3-4-2 1v-2l1-2zm103 38l6 5 1 2 3-3v-3l3-1 2 2 4 3 3 2 5 6 3 3v1l4 2 5 2v2l2 3-1 3-2 1-1-2-1-4-1-1-1-1-2 1-1-2-7-6-1-2-2-2h-1v-2 1l-2-1h-1l-2-3v2l1 2-3-1-2 2-4-1-3-3-8-4-9-2-4 1-3-3h-4l1-1-3-1-1-2-2 1h-3l1 3-2 3h-3l-4 4-5 2v-2l2-1-2-1 2-3 1-4 2-2v-2l-4 2-2 4-2 3-5 4-1 2 3 1-2 2-1 3-3 1-2 2-4 2v1l-4 3-5 1v2l-5 2h-1l-3 2h-3l-1-2-2 3h-4l-1-1 4-3 2-1 5 1 1-3 7-3 3-3 2-1 2-6 2-3-8 2-2-4-2-1-4 1h-1v-3l1-2-2-4h-4l-4-5v-2l2-1-3-6 2-2v-2l3-2 3-4h1l3 2 4-2h3l1-1 1-6-1-2h-2l-2 1-5-2-2 1-3-2-1-4 2-1-3-2-2-1 3-2 8-2h2v4l5 1 2-3-2-4-3-2v-3l-5-7 2-3h5l3-2 1-3 3-3 3 1 4-3h3l4-3 5 4h4v3l1 1 7-1 5 3h3l2 1 4-1 3 1 3 2 7 66h4l3-1v2z" fill="currentColor"></path>
</g>
<g>
<path d="M323 219l1-19-29-2 4-39 14 1 21 2 26 1 16 1 3 2 4 2 2-2 2 1 5-1 3 2 4 1 2 1 1 3h2l1 1 1 5 1 3 1 2 2 3-1 5 3 2v2l1 11v1l1 2 2 5 5 7h-28l-24-1-28-1-18-1z" fill="currentColor"></path>
<path d="M346 180h15v15h-15zM363 180h15v15h-15zM380 180h15v15h-15zM363 197h15v15h-15zM380 197h15v15h-15z" fill="currentColor"></path>
</g>
<g>
<path d="M785 84l-2 2v-4l2 2zm-42-8l1-1 2-3v-2l3-4v-1l1-3-1-3-1-2 1-3 1-2-1-5 6-16 2-1 2 3 2 1 4-4 4-2 3 2 3 2 7 20v5l3 1 3-1v2l1 2v2l3 2 1-1 2 1 3 5-2 4-4 3h-3v4l-3 1v-2l-2 1-4 3 1 1h-3l-2-2-2 2 1 2v5l-2 3-1-1-1 3h-2l-1 3-4-1-2 4 1 2-2 1v3l-1 1-1 6h-1l-2-3-2-2-1-3-10-32z" fill="currentColor"></path>
<path d="M760 30h15v15h-15zM778 30h15v15h-15zM760 47h15v15h-15zM778 47h15v15h-15z" fill="currentColor"></path>
</g>
</svg>
</div></inline-svg>
Geography
</button>`

  }

  /**
    * Sets up data watching and initial render     
    * * Initializes data loading and sets up gopher watchers
    * 
    * @callback connectedCallback
    */
  connectedCallback() {
    this.renderLoadingState();
    this.loadData();
    gopher.watch(`./data/president.json`, this.loadData);
    this.illuminate();
  }


  disconnectedCallback() {
    gopher.unwatch("./data/president.json"), this.loadData;
  }

  checkComponents() {
    return new Promise(resolve => {
        const check = () => {
            
            const components = [
                'results-board-display'
            ];

            // Find any component that exists in the DOM
            const foundComponent = components.find(tag => document.querySelector(tag));
            
            if (!foundComponent) {
                requestAnimationFrame(check);
                return;
            }

            // Check if the found component has undefined content
            const element = document.querySelector(foundComponent);
            const hasUndefinedContent = element.innerHTML === 'undefined' || 
                                      element.innerText === 'undefined' ||
                                      element.innerHTML === 'undefined undefined';

            if (hasUndefinedContent) {
                requestAnimationFrame(check);
            } else {
                resolve();
            }
        };
        check();
    });
}


  /**
     * Configures tab functionality and event listeners
     * Sets up tab buttons and element mapping with 250ms delay to allow for cartogram-map to initLabels()
     * 
     * @function setupTabs
     */
  setupTabs() {
    // Select all tab buttons and custom elements
    setTimeout(() => {
      this.tabButtons = this.querySelectorAll('.tabs [role="tab"]');

      // Create an object to map tab indices to custom elements
      this.tabElementMap = {
        0: this.querySelector('national-map'),
        1: this.querySelector('cartogram-map'),
        2: this.querySelector('electoral-bubbles')
      };

      // Attach click event listeners to all tab buttons
      this.tabButtons.forEach((tab, index) => {
        tab.addEventListener('click', () => this.updateTabSelection(tab));
      });

      // Initialize the selected tab as selected
      if (this.tabButtons.length > 0) {
        this.updateTabSelection(this.tabButtons[this.initialSelectedTab]);
      }
    }, 250);
  }


  /**
     * Handles tab selection changes
     * Updates aria-selected states and element visibility based off of the tab that was clicked

     * @function updateTabSelection
     * @param {HTMLElement} clickedTab - The tab button that was clicked
  */
  updateTabSelection(clickedTab) {


    // Deselect all tabs and hide all elements
    this.tabButtons.forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
      const tabIndex = tab.getAttribute('data-tab');
      if (this.tabElementMap[tabIndex]) {
        this.tabElementMap[tabIndex].style.display = 'none';
      }
    });

    // Select clicked tab and show corresponding element
    clickedTab.setAttribute('aria-selected', 'true');
    const selectedTabIndex = clickedTab.getAttribute('data-tab');
    this.tabElementMap[selectedTabIndex]
    if (this.tabElementMap[selectedTabIndex]) {
      this.tabElementMap[selectedTabIndex].style.display = 'block';
    }
  }


  /**
     * Loads presidential race data
     * @async
     * @function loadData
     * Fetches and processes president.json data
    * The data it fetches should look like this
    * @typedef {Object} PresidentResult
    * @property {boolean} test - Test data indicator
    * @property {string} id - Race identifier
    * @property {string} office - Office type ("P")
    * @property {number} eevp - Expected election vote percentage
    * @property {string} type - Election type
    * @property {number} winThreshold - Percentage needed to win
    * @property {boolean} rankedChoice - Ranked choice voting indicator
    * @property {string} raceCallStatus - Race call status
    * @property {string} level - Geographic level
    * @property {string} state - State abbreviation
    * @property {number} electoral - Electoral votes
    * @property {number} updated - Last update timestamp
    * @property {number} reporting - Precincts reporting count
    * @property {number} precincts - Total precincts
    * @property {string} reportingunitID - Reporting unit identifier
    * @property {number} reportingPercent - Percentage of precincts reporting
    * @property {string} stateName - Full state name
    * @property {string} stateAP - AP style state name
    * @property {string} rating - Race rating (e.g., "likely-r")
    * @property {Object[]} candidates - Array of candidate information

    * 
      @typedef {Object} Candidate - stored in the candidates property of the Results object
    * @property {string} first - First name
    * @property {string} last - Last name
    * @property {string} party - Political party ("Dem", "GOP", "Other")
    * @property {string} id - Candidate identifier
    * @property {number} votes - Vote count
    * @property {number|null} percent - Vote percentage
        */
  async loadData() {
    let presidentDataFile = './data/president.json';

    try {
      const presidentResponse = await fetch(presidentDataFile);
      const presidentData = await presidentResponse.json();
      this.results = presidentData.results || {};
      this.render();
    } catch (error) {
      console.error('Error fetching president data:', error);
    }
  }

  renderLoadingState() {
    this.innerHTML = `
        <div class="board-wrapper loading">
            <span>Loading presidential results data...</span>
        </div>
    `;
}

  /**
     * Renders the presidential board interface
     * Creates electoral bars, leaderboard, maps, and results display
     * Handles conditional rendering based on data attributes
     * @function render
     * @property {Object} buckets - Groups races by rating (likelyD, tossup, likelyR)
     */
  async render() {
    const { results = [], test, latest } = this.state;

    var buckets = {
      likelyD: [],
      tossup: [],
      likelyR: [],
    };

    results.forEach(function (r) {
      r.districtDisplay = (r.district !== "AL") ? r.district : "";
    });

    var sorted = results.slice().sort(function (a, b) {
      if (a.stateName > b.stateName) return 1;
      if (a.stateName < b.stateName) return -1;
      if (a.districtDisplay > b.districtDisplay) return 1;
      if (a.districtDisplay < b.districtDisplay) return -1;
      return 0;
    });

    sorted.forEach(function (r) {
      var bucketRating = getBucket(r.rating);
      if (bucketRating) buckets[bucketRating].push(r);
    }, this);

    var called = groupCalled(this.results);

    const hasAnyDataAttribute = ['data-cartogram', 'data-national', 'data-bubbles']
    .some(attr => this.getAttribute(attr) !== null);

    let hideResultsBoard = hasAnyDataAttribute ?
      this.getAttribute("data-hide-results") !== null :
      false;

      var updated = Math.max(...this.results.map(r => r.updated));
      const date = new Date(updated);
      const time = `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
      const fullDate = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;

    this.innerHTML = `
      <div class="president board">
        <electoral-bars called='${JSON.stringify(called)}'></electoral-bars>
        <h1 tabindex="-1">Presidential Results</h1>       
        <leader-board called='${JSON.stringify(called)}'></leader-board>
        <div role="tablist" class="tabs">
          ${this.nationalButton}
          ${this.cartogramButton}
          ${this.bubblesButton}
        </div>
        <results-board-key race="president" simple="true"></results-board-key>
        <national-map races="{results}"></national-map>
        <cartogram-map races="{results}"></cartogram-map>
        <electoral-bubbles results="{results}" races="{results}"></electoral-bubbles>
        ${!hideResultsBoard ? `<results-board-display office="president" split="true" hed="Competitive"></results-board-display>` : ''}
      </div>
        ${!hideResultsBoard ? `<results-board-key race="president"></results-board-key> ` : ''}
        <div class="board source-footnote">Last updated ${fullDate} at ${time}</div>`;
    this.setupTabs();
    await this.checkComponents();
    this.style.opacity = '1';
  }
}

customElements.define('board-president', BoardPresident);
export default BoardPresident;