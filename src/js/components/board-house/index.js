var ElementBase = require("../elementBase");

import gopher from "../gopher.js";
import { getBucket, sumElectoral, groupCalled } from "../util.js";

import ResultBoardDisplay from "../results-board-display";
import ResultBoardKey from "../results-board-key";
import BalanceOfPowerCombined from "../balance-of-power-combined";


class BoardHouse extends ElementBase {
    constructor() {
        super();
        this.state = {};
        this.results = []
        //this.onData = this.onData.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    connectedCallback() {
        this.loadData();
        this.illuminate();
    }

    disconnectedCallback() {
        gopher.unwatch(this.getAttribute("data-file"), this.onData);
    }


    async loadData() {
        let houseDataFile = './data/house.json';
    
        try {
          const houseResponse = await fetch(houseDataFile);
          const houseData = await houseResponse.json();
          this.results = houseData.results || {};
          this.render();
        } catch (error) {
          console.error('Error fetching president data:', error);
        }
    }

    render() {
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

        this.innerHTML = `
        <div class="president board">
          ${test ? '<test-banner></test-banner>' : ''}
        <div class="header">
          <div class="title-wrapper">
            <h1 tabindex="-1">House Results</h1>
          </div>
           <balance-of-power-combined race="house"></balance-of-power-combined>
        </div>
            <results-board-display office="House" split="true" hed="Competitive"></results-board-display>
            <results-board-key race="house"></results-board-key>
          <hr class="divider" />
        </div>
      `;
    }
}

customElements.define('board-house', BoardHouse);
export default BoardHouse;