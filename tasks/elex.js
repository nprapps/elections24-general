/*
--test - Ask the AP for test data
--offline - Use cached data if it exists
*/

const { redeemTicket } = require("./lib/apResults");
const normalize = require("./lib/normalizeResults");
const nullify = require("./lib/nullifyResults");
const augment = require("./lib/augmentResults");
const fs = require("fs").promises;

module.exports = function (grunt) {
  // Grunt doesn't like top-level async, so define this here and call it immediately
  var task = async function () {
    // These are the options we can give while running grunt (i.e grunt --offline)
    const test = grunt.option("APtest");
    const offline = grunt.option("offline");
    const zero = grunt.option("zero");

    // For 24-general, we are getting county level-data for G,S,P for all non-england states
    // We are getting township level data for G,S,P for all the england states and state level data for H,I.
    const tickets = [
      {
        date: "2024-11-05",
        params: {
          officeID: "G,S,P",
          level: "FIPSCode",
        },
      },
      {
        date: "2024-11-05",
        params: {
          officeID: "H,I",
          level: "state",
        },
      },
    ];

    // get results from AP
    const rawResults = [];
    for (let ticket of tickets) {
      const response = await redeemTicket(ticket, { test, offline });
      if (!response) continue;

      //This is a 2024 special CA senate election that we don't want so we are filtering it out
      const filteredResponse = response.races.filter(
        (race) => race.raceID !== "82961"
      );
      response.races = filteredResponse;
      if (zero) nullify(response);
      rawResults.push(response);
    }

    // turn AP into normalized race objects
    const results = normalize(rawResults, grunt.data.json);

    grunt.log.writeln("Merging in external data...");
    augment(results, grunt.data);

    const { longform } = grunt.data.archieml;

    grunt.log.writeln("Generating data files ");
    // ensure the data folder exists
    await fs.mkdir("build/data", { recursive: true });

    // now create slices of various results
    // separate by geography for easier grouping
    const geo = {
      national: results.filter((r) => r.level == "national"),
      state: results.filter((r) => r.level == "state"),
      county: results.filter((r) => r.level == "county"),
    };

    grunt.log.writeln("Geo.national: ");
    grunt.log.writeflags(geo.national);

    // national results
    await fs.writeFile(
      "build/data/national.json",
      serialize({ test, results: geo.national })
    );

    // state-level results
    await fs.mkdir("build/data/states", { recursive: true });
    const states = {};
    geo.state.forEach(function (result) {
      const { state } = result;
      if (!states[state]) states[state] = [];
      states[state].push(result);
    });
    for (let state in states) {
      let stateOutput = {
        test,
        results: states[state],
      };

      const stateChatter = longform.statePages[state.toLowerCase()];
      if (stateChatter) {
        stateOutput.chatter = grunt.template.renderMarkdown(stateChatter);
      }
      await fs.writeFile(
        `build/data/states/${state}.json`,
        serialize(stateOutput)
      );
    }

    // county files
    await fs.mkdir("build/data/counties", { recursive: true });
    const countyRaces = {};
    geo.county.forEach(function (result) {
      const { state, id } = result;
      const key = [state, id].join("-");
      if (!countyRaces[key]) countyRaces[key] = [];
      countyRaces[key].push(result);
    });

    for (let key in countyRaces) {
      await fs.writeFile(
        `build/data/counties/${key}.json`,
        serialize({ test, results: countyRaces[key] })
      );
    }

    // sliced by office
    const byOffice = {
      president: geo.state.filter((r) => r.office == "P"),
      house: geo.state.filter(
        (r) => r.office == "H" && r.id !== "45888" && r.id !== "50068"
      ),
      senate: geo.state.filter((r) => r.office == "S"),
      gov: geo.state.filter((r) => r.office == "G"),
      ballots: geo.state.filter((r) => r.office == "I" && r.featured),
    };

    for (let office in byOffice) {
      const officeOutput = {
        test,
        results: byOffice[office],
      };
      if (longform.chamberAlerts && longform.chamberAlerts[office]) {
        officeOutput.alert = grunt.template.renderMarkdown(
          longform.chamberAlerts[office]
        );
      }
      await fs.writeFile(`build/data/${office}.json`, serialize(officeOutput));
    }

    // create BOP widget output
    const mapBOP = function (r) {
      return {
        id: r.id,
        state: r.state,
        district: r.district,
        winner: r.winnerParty,
        electoral: r.electoral,
        previous: r.previousParty,
      };
    };

    const latest = []
      .concat(geo.national, byOffice.house, byOffice.senate)
      .reduce((t, r) => Math.max(t, r.updated), 0);

    const bop = {
      president: byOffice.president.filter((r) => r.called).map(mapBOP),
      house: byOffice.house
        .filter((r) => r.called && r.id !== "45888" && r.id !== "50068")
        .map(mapBOP),
      senate: byOffice.senate.filter((r) => r.called).map(mapBOP),
      latest,
    };

    await fs.writeFile(`build/data/bop.json`, serialize(bop));
  };

  const serialize = (d) => JSON.stringify(d, null, 2);

  grunt.registerTask("elex", async function () {
    grunt.task.requires("json");
    grunt.task.requires("csv");

    const done = this.async();

    task().then(done);
  });
};
