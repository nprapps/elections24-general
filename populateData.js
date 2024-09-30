let { Parser } = require("@json2csv/plainjs");
const fs = require("fs");
const axios = require("axios");

async function extractData(type) {
  const baseURL = "https://api.ap.org/v3/elections/2024-11-05?format=JSON";
  const results = [];

  let officeID;

  if (type === "senate") {
    officeID = "S";
  }
  if (type === "house") {
    officeID = "H";
  }
  if (type === "governor") {
    officeID = "G";
  }

  const apiData = await axios({
    url: baseURL + `&officeID=${officeID}`,
    headers: { "x-api-key": process.env.AP_API_KEY },
  });
  const races = apiData.data.races;

  if (type === "senate") {
    races.map((race) => {
      results.push({
        key: race.raceID,
        party: race.incumbents[0].party,
        state: race.reportingUnits[0].statePostal,
      });
    });
    const parser = new Parser({});
    const csv = parser.parse(results);
    fs.writeFileSync("senate.csv", csv);
  }

  if (type === "house") {
    const obj = {};

    races.map((race) => {
      const state = race.reportingUnits[0].statePostal;
      const seat = race.seatNum;
      const isParty = race.reportingUnits[0].candidates.filter(
        (candidate) => candidate.incumbent
      );
      const party = isParty.length ? isParty[0]["party"] : "";

      console.log({ party });

      if (obj[state]) {
        obj[state] = obj[state] + 1;
      } else {
        obj[state] = 1;
      }
      results.push({
        key: race.raceID,
        party,
        state,
        seat,
        rating: "toss-up",
        nonvoting: "",
        key_race: "",
        edit_notes: "",
        composte: `${state}${seat}`,
      });
    });

    const parser = new Parser({});
    const csv = parser.parse(results);
    fs.writeFileSync("house.csv", csv);
  }

  if (type === "governor") {
    races.map((race) => {
      results.push({
        key: race.raceID,
        party: race.incumbents[0].party,
        state: race.reportingUnits[0].statePostal,
        rating: "toss-up",
        key_race: "",
        edit_notes: "",
      });
    });
    const parser = new Parser({});
    const csv = parser.parse(results);
    fs.writeFileSync("governor.csv", csv);
  }
}

// extractData("senate");
extractData("house");
// extractData("governor");
