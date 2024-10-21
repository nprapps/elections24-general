var ElementBase = require("../elementBase");

class TestBanner extends ElementBase {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = `
			<span class="test-banner">TEST</span>
		`
	}
}

customElements.define("test-banner", TestBanner);