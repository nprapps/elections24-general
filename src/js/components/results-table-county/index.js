var ElementBase = require("../elementBase");
import {
  reportingPercentage,
  sortByOrder,
  formatters,
  getAvailableMetrics,
  getParty,
  getCountyCandidates,
} from "../util.js";
import track from "../../lib/tracking";
import ResultsRowCounty from "../results-row-county";


const { percentDecimal, voteMargin } = formatters;

class ResultsTableCounty extends ElementBase {
  constructor() {
    super();
    this.state = {
      sortMetric: null,
      displayedMetric: null,
      collapsed: true,
      order: -1,
    };
    
    this.toggleCollapsed = this.toggleCollapsed.bind(this);
    this.updateSort = this.updateSort.bind(this);
  }

  static get observedAttributes() {
    return ['state', 'data', 'sort-order'];
  }

  async connectedCallback() {
    this.availableMetrics = getAvailableMetrics(this.getAttribute('state'));
    this.state.sortMetric = this.availableMetrics.population;
    this.state.displayedMetric = this.availableMetrics.population;

    try {
        const [raceResponse] = await Promise.all([
            fetch(`./data/counties/CA-0.json`),
        ]);

        if (!raceResponse.ok) {
            throw new Error(`HTTP error! race status: ${raceResponse.status}, states status: ${statesResponse.status}`);
        }

        const [raceData] = await Promise.all([
            raceResponse.json()
        ]);
        this.data = raceData.results || [];
        this.render();
    } catch (error) {
        console.error("Could not load JSON data:", error);
        this.render(); // Render to show error state
    }

    this.render();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.querySelectorAll('[data-sort]').forEach(el => {
      el.onclick = () => this.updateSort(el.dataset.sort);
    });

    this.querySelectorAll('[data-sort-metric]').forEach(el => {
      el.onclick = () => this.updateSort(el.dataset.sortMetric, true);
    });

    const toggleButton = this.querySelector('.toggle-table');
    if (toggleButton) {
      toggleButton.onclick = this.toggleCollapsed;
    }
  }

  toggleCollapsed() {
    this.state.collapsed = !this.state.collapsed;
    this.render();
    this.attachEventListeners();
  }

  updateSort(metricName, opt_newMetric = false) {
    const sortMetric = this.availableMetrics[metricName];
    let order = sortMetric.alpha ? 1 : -1;
    if (sortMetric === this.state.sortMetric) {
      order = this.state.order * -1;
      track("county-sort", metricName);
    } else {
      track("county-metric", metricName);
    }
    this.state.sortMetric = sortMetric;
    this.state.order = order;
    if (opt_newMetric) {
      this.state.displayedMetric = this.availableMetrics[metricName];
    }
    this.render();
    this.attachEventListeners();
  }

  getIcon(metric) {
    const sorted = this.state.sortMetric.key === metric;
    return `
      <span>
        <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="10" height="16" viewBox="0 0 320 512">
          <path fill="${sorted && this.state.order < 0 ? '#999' : '#ddd'}" d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
          <path fill="${sorted && this.state.order > 0 ? '#999' : '#ddd'}" d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
        </svg>
      </span>
    `;
  }

  sortCountyResults() {
    const { sortMetric, order } = this.state;

    console.log('these are the county results')
    console.log(this.data)
    console.log(order)
    console.log('//////')

    
    return this.data.sort((a, b) => {
        console.log('we are dooing the sort')
        console.log(a.county)
        console.log(this.data)
        console.log(sortMetric.key)
        console.log('///////////////')

      let sorterA = a.county[sortMetric.key];
      let sorterB = b.county[sortMetric.key];

      if (sortMetric.alpha) {
        return sorterA == sorterB ? 0 : sorterA < sorterB ? order : order * -1;
      } else if (sortMetric.key == "past_margin") {
        // Implement past_margin sorting logic here
        // ...
      }
      return (sorterA - sorterB) * order;
    });
  }

  getSorter() {
    return `
      <ul class="sorter">
        <li class="label">Sort Counties By:</li>
        ${Object.keys(this.availableMetrics)
          .map(m => this.getSorterLi(this.availableMetrics[m]))
          .join('')}
      </ul>
    `;
  }

  getSorterLi(metric) {
    if (metric.hideFromToggle) {
      return '';
    }
    const selected = metric === this.state.displayedMetric ? "selected" : "";
    return `
      <li class="sortButton ${selected}" data-sort-metric="${metric.key}">
        <span class="metric">${metric.name}</span>
        <span class="pipe"> | </span>
      </li>
    `;
  }

  render() {
    const sortedData = this.sortCountyResults();
    console.log(sortedData)
    console.log('/////////')
    const sortOrder = JSON.parse(this.getAttribute('sort-order') || '[]');
    const orderedCandidates = sortOrder.slice(0, 3);
    if (orderedCandidates.length < sortOrder.length) {
      orderedCandidates.push({ last: "Other", party: "Other" });
    }

    this.innerHTML = `
    <div class="results-counties ${this.state.sortMetric.key.split("_").join("-")}">
      <h3>County Results Table</h3>
      ${this.getSorter()}
      <table class="results-table candidates-${orderedCandidates.length}">
        <thead>
          <tr>
            <th class="county sortable" data-sort="countyName">
              <div>
                <span class="county">County</span>
              </div>
            </th>
            <th class="amt precincts" data-sort="countyName">
              <div>${this.getIcon("countyName")}</div>
            </th>
            ${orderedCandidates.map(cand => `
              <th class="vote" key="${cand.party}">
                <div>
                  <span class="title">${cand.last}</span>
                </div>
              </th>
            `).join('')}
            <th class="vote margin">
              <div>
                <span class="title">Vote margin</span>
              </div>
            </th>
            <th class="comparison sortable" data-sort="${this.state.displayedMetric.key}">
              <div>
                <span class="title">${this.state.displayedMetric.name}</span>
                ${this.getIcon(this.state.displayedMetric.key)}
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="${this.state.collapsed ? "collapsed" : ""}">
        </tbody>
      </table>
      <button
        class="toggle-table ${sortedData.length > 10 ? "" : "hidden"}"
        data-more="Show all"
        data-less="Show less">
        ${this.state.collapsed ? "Show all ▼" : "Show less ▲"}
      </button>
    </div>
  `;

   // Now, let's add the county rows programmatically
   const tbody = this.querySelector('tbody');
   sortedData.forEach(c => {
     const rowCounty = document.createElement('results-row-county');
     rowCounty.setAttribute('key', c.fips);
     rowCounty.setAttribute('ordered-candidates', JSON.stringify(orderedCandidates));
     rowCounty.setAttribute('row', JSON.stringify(c));
     rowCounty.setAttribute('metric', JSON.stringify(this.state.displayedMetric));
     tbody.appendChild(rowCounty);
   });
  }
}

customElements.define("results-table-county", ResultsTableCounty);