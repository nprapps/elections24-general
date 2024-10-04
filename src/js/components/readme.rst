# 2024 Election Page Results Architecture

## Introduction
This document outlines the architecture of our 2024 Election components. It provides an overview of the system's structure, key components, and the methodology used in development, focusing on our use of custom web components.

---------------
## Creating a component

- We use custom web custom components ( [MDN here](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) ) instead of frameworks like React or Preact
- Reasons for this choice:
  - Better performance for our use case
  - More control over the component lifecycle
  - Easier integration with existing systems
  - Reduced dependency on external libraries

### Component Structure
---------------
- Each component has its own subfolder containing its logic, styles, and templates. The entry point for each component is `index.js`
- Thus, for a component named balance-of-power, the structure should look like:
balance-of-power
  - _balance-of-power.html
  - balance-of-power.less
  - index.js
- The components are loaded in the main.js file, at the root level. Nested components do not need to be installed explicitly here, but parent and container components do:
- require("./components/balance-of-power");

### Nested Components
---------------
- Each component has its own subfolder containing its logic, styles, and templates. The entry point for each component is `index.js`
- Thus, for a component named balance-of-power, the structure should look like:
balance-of-power
  - _balance-of-power.html
  - balance-of-power.less
  - index.js
- The components are loaded in the main.js file, at the root level. Nested components do not need to be installed explicitly here, but parent and container components do:
- require("./components/balance-of-power");

### ElementBase
---------------
- All components extend from an `ElementBase` class
- `ElementBase` provides common functionality and lifecycle management, and for some reason, it made the custom components work
- Example usage:
  ```javascript
  var ElementBase = require("../elementBase.js");
  
  class MyComponent extends ElementBase {
    // Component code here
  }
  ```

---------------
## Live updating a component


### Lifecycle Functions - Definitions
---------------
- Similar to React, we custom components have lifecycle methods used to help render them
  - `constructor()`: Initialize the component
  - `connectedCallback()`: Called when the element is added to the DOM
  - `disconnectedCallback()`: Called when the element is removed from the DOM
  - `attributeChangedCallback()`: Called when an attribute is changed (though we are using gopher.js for this, so this might not be needed)


- `connectedCallback()`: Set up event listeners, load initial data
  ```javascript
  connectedCallback() {
    this.loadData();
    gopher.watch("./data/some-data.json", this.loadData);
  }
  ```
- `disconnectedCallback()`: Clean up resources, remove event listeners
  ```javascript
  disconnectedCallback() {
    gopher.unwatch("./data/some-data.json", this.loadData);
  }
  ```

  ### Data Loading and Processing
---------------
- For our custom components, we are trying to limit how often we read from local data files. However, if needed, we have the loadData() method, which reads in local data files and proceeds to call the render function
- Example:
  ```javascript
  async loadData() {
    try {
      const response = await fetch('./data/some-data.json');
      const results = await response.json();
      this.processResults(results);
      this.render();
    } catch (error) {
      console.error("Could not load JSON data:", error);
    }
  }
  ```


### Render Function
---------------
- Each component has a `render()` method
- `render()` is responsible for updating the component's innerHTML, and usually calls on helper functions to help with the render logic
- TODO: we may revisit this, as there are valid concerns about the efficiency of changing the inner HTML on every refresh
- Example:
  ```javascript
  render() {
    if (!this.data) return;
    // Process data
    this.innerHTML = `
      <div>
        <!-- Component HTML structure -->
      </div>
    `;
  }
  ```
