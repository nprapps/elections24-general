var ElementBase = require("../elementBase");
import { reportingPercentage, sortByParty, goingToRCVRunOff } from "../util";
import gopher from "../gopher.js";
const { classify } = require("../util");

//import states from "../data/states.sheet.json";


class ResultsBoard extends ElementBase {
    constructor() {
      super();
      this.loadData = this.loadData.bind(this);
      this.races = JSON.parse(this.getAttribute('races') || '[]');
      this.removeAttribute('races');
      this.states = {};
      this.office = this.getAttribute('office') || '';
      this.hed = this.getAttribute('hed') || '';
      this.split = this.getAttribute('split') === 'true';
      this.addClass = this.getAttribute('add-class') || '';
    }

    static get observedAttributes() {
        return ['data-races', 'office', 'split', 'add-class'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'office':
                this.office = newValue;
                break;
            case 'split':
                this.split = newValue === 'true';
                break;
            case 'add-class':
                this.addClass = newValue;
                break;
            case 'hed':
                this.hed = newValue;
                break;
        }
    }

    connectedCallback() {
      this.loadData();
      const filename = this.office.toLowerCase() === 'governor' ? 'gov' : this.office.toLowerCase();
      gopher.watch(`./data/${filename}.json`, this.loadData);    }

    async loadData() {
        this.isLoading = true;

        let statesDataFile = './data/states.sheet.json';

        try {
            const response = await fetch(statesDataFile);
            
            if (!response.ok) {
              throw new Error(`HTTP error! states/districts status: ${response.status}`);
            }
      
            this.states = await response.json() || {};
            this.isLoading = false;
            this.render();
          } catch (error) {
            console.error("Could not load JSON data:", error);
            this.isLoading = false;
            this.render(); // Render to show error state
        }
    }

    CandidateCells(race, winner) {
        var sorted = race.candidates.slice(0, 2).sort(sortByParty);
        var leading = race.candidates[0];
        var reporting = race.eevp;

        var highestPercent = Math.max(...race.candidates.map(c => c.percent));

        return sorted.map(function (c) {        
            var className = ["candidate", c.party];
            
            // Apply 'leading' class to the candidate(s) with the highest percentage
            if (c.percent === highestPercent) className.push("leading");
            
            if (c.winner == "X") className.push("winner");
            if (winner && !c.winner) className.push("loser");
            if (race.runoff) className.push("runoff");
 
            return `
                <td role="cell" class="${className.join(" ")}">
                   ${race.office !== 'P' ? `
                    <div class="name">
                        <div class="last">${c.last}</div>
                        <div class="incumbent">${c.incumbent ? "●" : ""}</div>
                    </div>
                ` : ''}
                  <div class="perc">${Math.round(c.percent * 1000) / 10}%</div> 
                </td>
            `;
        }).join('');
    }


    render() {
    // Pre-compute reused values
    const anyHasResult = this.races.some(r => r.eevp || r.reporting || r.called || r.runoff || r.rcvResult);
    const isPresidential = this.office === 'President';
    
    const tables = this.split 
        ? [
            this.races.slice(0, Math.ceil(this.races.length / 2)),
            this.races.slice(Math.ceil(this.races.length / 2))
          ]
        : [this.races];

    const classNames = [
        "board-wrapper president",
        this.office,
        this.addClass,
        "has-flips" 
    ].filter(Boolean).join(" ");

    // Helper functions for reused templates
    const createHeaderRow = () => `
        <tr>
            ${isPresidential ? `
                <th class="state-hed">State</th>
                <th class="electoral-hed">E.V.</th>
                <th class="party-hed">${anyHasResult ? 'Harris' : ''}</th>
                <th class="party-hed">${anyHasResult ? 'Trump' : ''}</th>
                <th class="reporting-hed">${anyHasResult ? '% in' : ''}</th>
            ` : ''}
            <th></th>
        </tr>
    `;

    const getReportingCell = (reporting) => {
        if (reporting === undefined && reporting !== 0) return '';
        return `<span>${reportingPercentage(reporting)}%<span class="in"> in</span></span>`;
    };

    const getLittleLabel = (r, winner, flipped, showFlip = true) => `
        <td class="little-label ${flipped ? winner.party : ''}" role="cell">
            ${r.rcvResult ? '<span class="rcv-label">RCV</span>' : ''}
            ${r.runoff ? '<span class="runoff-label">R.O.</span>' : ''}
            ${showFlip && flipped ? '<span class="flip-label">Flip</span>' : ''}
        </td>
    `;

    const getSeatLabel = (race) => {
        switch (race.office) {
            case "H": return ` ${race.seatNumber}`;
            case "S": return ' ';
            case "I": return ` ${race.seat}`;
            default: return '';
        }
    };

    const createRaceRow = (r, i) => {
        const hasResult = r.eevp || r.reporting || r.called || r.runoff;
        const [winner] = r.candidates.filter(c => c.winner === "X");
        const flipped = winner && (r.previousParty !== winner.party);
        const stateDetail = this.states[r.state] || {};
        const seatLabel = getSeatLabel(r);

        if (isPresidential) {
            return `
                <tr key="${r.state}${r.district}" role="row" class="${hasResult ? "closed" : "open"} index-${i}">
                    <td role="cell" class="state">
                        <a href="./${classify(r.stateName)}.html?section=${r.office}" target="_top">
                            ${stateDetail.ap} ${r.seat ? r.seatNumber : ""}
                        </a>
                    </td>
                    <td role="cell" class="electoral">${r.electoral}</td>
                    <td role="cell" class="open-label" colspan="3">Last polls close at ${stateDetail.closingTime} ET</td>
                    ${this.CandidateCells(r, winner)}
                    <td role="cell" class="reporting">${getReportingCell(r.eevp)}</td>
                    ${getLittleLabel(r, winner, flipped)}
                </tr>
            `;
        }

        return `
            <tr key="${r.id}" class="tr ${hasResult ? "closed" : "open"} index-${i}" role="row">
                <td class="state" role="cell">
                    <a target="_top" href="./${classify(r.stateName)}.html?section=${r.office}">
                        <span class="not-small">${this.states[r.state].ap}${seatLabel}</span>
                        <span class="x-small">${r.state}${seatLabel}</span>
                    </a>
                </td>
                <td class="open-label" colspan="3" role="cell">Last polls close at ${this.states[r.state].closingTime} ET</td>
                ${this.CandidateCells(r, winner)}
                <td class="reporting" role="cell">${getReportingCell(r.reporting)}</td>
                ${['Senate', 'House', 'governor'].includes(this.office) 
                    ? getLittleLabel(r, winner, flipped, this.office !== 'House')
                    : ''}
            </tr>
        `;
    };

    // Build final HTML
    this.innerHTML = `
        <div class="${classNames}">
            ${this.hed ? `<h3 class="board-hed">${this.hed}</h3>` : ""}
            <div class="board-inner">
                ${tables.map(races => `
                    <table class="${isPresidential ? 'president' : 'named'} results table" role="table">
                        ${createHeaderRow()}
                        ${races.map((r, i) => createRaceRow(r, i)).join('')}
                    </table>
                `).join('')}
            </div>
        </div>
    `;}
}

customElements.define('results-board', ResultsBoard);

export default ResultsBoard;