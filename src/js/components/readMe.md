# 2024 Election Page Results Architecture

This document outlines the architecture of our ([2024 Election components ](https://github.com/nprapps/elections24-general/tree/45-balance-of-power-bar/src/js/components)). The hope is to summarize how the components are structured, how they are pass data through to each other, and how they may be improved in the future. The gist of it:

- We build custom web custom components ( [MDN here](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) )
- Each web component is defined in the html as <NameOfComponent></NameOfComponent>
- Each web component is stored in the src/js/components folder, and has its own file tree
    * `_NameOfComponent.html` - stores the html variable. It can stay empty, or you can use it to set a template
    * `NameOfComponent.less` -  used to define the styles of the component, and is mainly gotten from the ([2020](https://github.com/nprapps/elections20-interactive)) or ([2022](https://github.com/nprapps/elections22)) election pages 
    * `index.js` - where we merge both javascript and html to define the render logic of the component
        - Each index.js has a `render` function that usually sets the innerHTML of its element. When debugging, take a look there.

---------------
## Building a component

### Why custom web components?
- We use custom web custom components ( [MDN here](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) ) instead of frameworks like React or Preact, as we've done in the past. 
- Reasons for this choice:
  - React/Preact create single-page apps, which is not optimal for our SEO needs
  - We wanted to largely maintain functionality from previous election pages, and those pages used a component structure
  - We want more control over the component lifecycle, as these components will be updating often

### How are the components structured?
---------------
- Each web component is defined in the html as <NameOfComponent></NameOfComponent>
  - Thus, for a component named balance-of-power, the structure should look like:
balance-of-power
    - _balance-of-power.html
    - balance-of-power.less
    - index.js
- The components are loaded in the [main.js file](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/js/main.js), at the root level. 
- Components are collected during the `build task` ([line 102](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/tasks/build.js)), processed, then written to the `build` folder. 
- In your [built pages](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/index.html), you simply list out the list of components with the appropriate properties 

### How do I change how a component looks/works?
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

### Special Note: ElementBase
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

### How do I pass data to my components?
---------------
- When placing our components in our web pages, we are mimicing the structure of props/data-attributes. We call the component with certain properties to help it define its render logic
- eg we do this `<balance-of-power race-senate><balance-of-power>` rather than this: `<balance-of-power><balance-of-power>`
- in order to fetch the property, we run `this.PROPNAME = this.getAttribute('PROPNAME') || '';` inside the component's constructor to make it a global variable across the component
  - NOTE: there are some components that pass json through their props. how comfortable are we with storing that info in a component? IDK if this was an issue with react/preact
- Some properties typically have a `race` property pass through them (eg presidential, senate, house, etc)
  - Examples: [balance-of-power-combined](https://github.com/nprapps/elections24-general/tree/45-balance-of-power-bar/src/js/components/balance-of-power-combined), [board-key-display](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/js/components/results-board-display/index.js), [nationalMap](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/js/components/nationalMap/index.js)
- Other properties, mainly on the state level, need specific data points/json to reference
  - [results-table](https://github.com/nprapps/elections24-general/tree/45-balance-of-power-bar/src/js/components/results-table)


### Can I place components inside of each other?
---------------
- It is possible to nest components within each other. 
- A common practice in the ([2020](https://github.com/nprapps/elections20-interactive)) and ([2022](https://github.com/nprapps/elections22)) election pages was to nest components within each other, and have a parent component's render logic determine which components get rendered
  - this works well in some cases, and works poorly in others
- When nesting components, I find that the children components do not need to be installed explicitly in the [main.js](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/js/main.js) file with the rest of the component declarations, but parent and container components do:
  - this is best seen by the balance-of-power-combined component. In its render logic, it houses both the [balance-of-power-house](https://github.com/nprapps/elections24-general/tree/45-balance-of-power-bar/src/js/components/balance-of-power-house) and [balance-of-power-senate](https://github.com/nprapps/elections24-general/tree/45-balance-of-power-bar/src/js/components/balance-of-power-senate) components. But in the main.js file, we only require that balance-of-power-combined.


---------------
## Styling a component
- As mentioned before, each component should have a `NameOfComponent.less` file in its folder
- As of right now, these less files are added to the [project.json](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/project.json) specifically to be processed
  - there's probably a script we can do to make it automatic instead of hardcoding the file names
- Depending on your [page](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/index.html), we can then load in specific css files. 
- Author's note: I believe there is [a way](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/js/components/results-table/_results-table.html) to also include the less import statement inside the component's html file, but I haven't had luck with that. 
- The css is compiled this was to minimize pages loading in unnecessary .less files. 
- Keeping the less files at the component level was also done for readability
- We are not married to this approach

---------------
## Live updating a component
During election night, we expect the components to change, and making sure that the information is accurate and updated is just as, if not more important than making sure the components look good. 


### What's the lifecycle of custom web components?
---------------
- Similar to React, we custom components have lifecycle methods used to help render them
  - `constructor()`: Initialize the component, and fetch any props passed into it
  - `connectedCallback()`: Called when the element is added to the DOM. We usually run our `loadData()` and `loadSVG()` functions here. We also call `gopher.watch()` to check a json file or two for any changes. 
    - If a json file changes, the current plan is to re-call the render function
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


### Special Note: Gopher.js
---------------
- `gopher.js` is another example of a file carried over from past election pages that helps keep the files up to date ([link here](https://github.com/nprapps/elections24-general/blob/45-balance-of-power-bar/src/js/components/gopher.js))
- If you expect your component to be changing views depending on the data, installing gopher is a requirement
  -   
  ```javascript
     import gopher from "../gopher.js";
  ```
- To use gopher, we call its watch() function, which watches for any changes to a given file. In the case of the elections, these files are usually the json files we collect and update regularly throughout the night
- Example usage:
  ```javascript
     gopher.watch("./data/some-data.json", this.loadData);
  ```

  ### Can I load data within a component?
  ---------------
- For our custom components, ideally we would try to limit how often we read from local data files. However, if needed, we have the loadData() method, which reads in local data files and proceeds to call the render function
- Note: as react is able to load in full modules, there can improvements to how some of our components are loading in local files, specifically `states.sheet.json`
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


