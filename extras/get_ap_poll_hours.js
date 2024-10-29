const states = require("../data/states.sheet.json");
const fs = require("fs");
const { Parser } = require("json2csv");

async function getData() {
  const url =
    "https://api.ap.org/v3/reports/PollHours-PollHours2024-Live?format=json";
  const headers = { "x-api-key": process.env.AP_API_KEY };
  try {
    const response = await fetch(url, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    // {
    //     statePostal: 'WV',
    //     stateTimeZones: 'ET',
    //     pollOpeningLocal: '6:30 AM',
    //     pollOpeningET: '6:30 AM',
    //     pollClosingLocal: '7:30 PM',
    //     pollClosingET: '7:30 PM',
    //     lastPollClosingET: '7:30 PM',
    //     firstResultsAvailableET: '7:30 PM'
    //   },

    const json = await response.json();
    const pollHours = json["APPollHoursReport"]["StatePollingHours"];

    for (let i = 0; i < pollHours.length; i++) {
      const statePostal = pollHours[i].statePostal;
      const lastPollClosingET = pollHours[i].lastPollClosingET;
      if (statePostal == "NE") {
        states["NE-1"].closingTime = lastPollClosingET;
        states["NE-2"].closingTime = lastPollClosingET;
        states["NE-3"].closingTime = lastPollClosingET;
      }
      if (statePostal == "ME") {
        states["ME-1"].closingTime = lastPollClosingET;
        states["ME-2"].closingTime = lastPollClosingET;
      }
      states[statePostal].notes = pollHours[i].notes ? pollHours[i].notes : "";
      states[statePostal].closingTime = lastPollClosingET;
    }
    // const json2csvParser = new Parser();
    // const csv = json2csvParser.parse(states);

    // fs.writeFileSync("./extras/states.json", csv);
    // console.log({ states });
    let result = [];

    for (var i in states) result.push([states[i]]);
    // const arrayString = JSON.stringify(dataToAddToTheSheets);
    let dataToAddToTheSheets = [];
    result.map((data, i) => {
      dataToAddToTheSheets.push([
        data.key,
        data.name,
        data.ap,
        data.closingTime,
        data.rating,
        data.electoral,
        data.district,
        data.geo_offset_x,
        data.geo_offset_y,
        data.swingState,
      ]);
    });
    writeElexDataToSheets(states);
    // fs.writeFileSync("./extras/states.csv", arrayString);
    // console.log(dataToAddToTheSheets);
  } catch (error) {
    console.error(error.message);
  }
}
getData();
