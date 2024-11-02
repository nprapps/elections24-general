var ElementBase = require("../elementBase");
import gopher from "../gopher.js";
import BalanceOfPowerSenate from "../balance-of-power-senate";
import BalanceOfPowerHouse from "../balance-of-power-house";
import BalanceOfPowerPresident from "../balance-of-power-president";



class BalanceOfPowerCombined extends ElementBase {


    constructor() {
        super();
        this.loadData = this.loadData.bind(this);
        this.checkComponents = this.checkComponents.bind(this);


        this.senate = null;
        this.house = null;
        this.races = [];
        this.isLoading = true;
        this.innerHTML = 'Loading balance of power data....';
        this.style.opacity = '0';
        this.style.transition = 'opacity 0.1s ease-in';
    }

    checkComponents() {
        const components = [
            'balance-of-power-senate',
            'balance-of-power-house', 
            'balance-of-power-president'
        ];
        
        // Cache the selector string outside
        const selector = components.join(',');
        
        return new Promise(resolve => {
            const check = () => {
                const element = document.querySelector(selector);
                
                if (!element) {
                    requestAnimationFrame(check);
                    return;
                }
    
                if (element.innerHTML === 'undefined') {
                    requestAnimationFrame(check);
                } else {
                    resolve();
                }
            };
            check();
        });
    }

    connectedCallback() {
        this.loadData();
        this.illuminate();
        gopher.watch(`./data/bop.json`, this.loadData);

        // Parse the race attribute
        const raceAttr = this.getAttribute('race');
        if (raceAttr) {
            this.races = raceAttr.toLowerCase().split(' ');
        }
    }

    disconnectedCallback() {
        gopher.unwatch(`./data/bop.json`, this.loadData);
    }

    async loadData() {
        this.isLoading = true; 

        try {
            const response = await fetch('./data/bop.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();

            this.senate = this.data.senate;
            this.house = this.data.house;
            this.isLoading = false;
            this.render();
        } catch (error) {
            console.error("Could not load JSON data:", error);
        }
    }

    async render() {
        if (!this.senate || !this.house) {
            return;
        };

        let content = '<main class="embed-bop"><div class="balance-of-power-combined">';

        if (this.races.length === 0 || this.races.includes('senate')) {
            content += `
                <balance-of-power-senate></balance-of-power-senate>
            `;
        }

        if (this.races.length === 0 || this.races.includes('house')) {
            content += `
                <balance-of-power-house></balance-of-power-house>
            `;
        }
        if (this.races.length === 0 || this.races.includes('president')) {
            content += `
                <balance-of-power-president></balance-of-power-president>
            `;
        }

        content += '</div></main>';

        this.innerHTML = content;
        await this.checkComponents();
        this.style.opacity = '1';
    }

    
}

customElements.define('balance-of-power-combined', BalanceOfPowerCombined);
export default BalanceOfPowerCombined;