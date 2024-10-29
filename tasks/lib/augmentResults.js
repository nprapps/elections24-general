/**
 * This function merges in per-county/township census/historical data and flags.
 * You can see the data in `build/data/states` and `build/data/counties` file.
 * 
 * @param
      {[{
        test: boolean,
        id: string,
        office: string,
        type: string,
        winThreshold: number,
        raceCallStatus: string,
        level: string,
        state: string,
        electoral: number,
        updated: number,
        reporting: number,
        precincts: number,
        reportingPercent: number,
        candidates: [{
            first: string,
            last: string,
            party: string,
            id: string,
            votes: number,
            percent: NaN //!LOOK INTO THIS!!
          }]
      } 
 * ]} results - normalized AP data (can be different based on township/county)
 * @param {Object} data  -  json + csv + markdown + archieml
 * @returns
 */
module.exports = function (results, data) {
  // build DB of external flags
  const flagged = {};
  if (data.json.flags)
    data.json.flags.forEach(function (row) {
      if (!flagged[row.raceID]) flagged[row.raceID] = [];
      flagged[row.raceID].push(row);
    });

  // merge in per-county census/historical data and flags
  results.forEach(function (result) {
    // add flags to races that match the filters in the sheet
    if (flagged[result.id]) {
      const matchingFlags = flagged[result.id].filter(function (f) {
        return f.fips
          ? f.fips == result.fips
          : f.state
          ? f.state == result.state
          : true;
      });
      if (matchingFlags.length) {
        result.flags = matchingFlags.map((f) => f.flag);
      }
    }
    const townshipStates = ["CT", "ME", "MA", "NH", "RI", "VT"];

    //merge in the identifier to access unemployment data in the frontend
    if (townshipStates.includes(result.state)) {
      const apReportingUnit = data.csv.identifiers[result.reportingunitID];
      if (apReportingUnit) {
        result.censusID = apReportingUnit["combined"];
        result.townshipName = apReportingUnit["NAME"];
      }
    }

    // Add electoral college winners to states
    // race.id == 0 is usually presidential election
    if (result.id == 0 && result.level == "state") {
      const state20 = data.csv.prior_states
        .filter((s) => s.votes * 1 && s.state == result.state)
        .sort((a, b) => b.votes - a.votes);

      const candidates = state20.map(function (c) {
        return {
          last: c.last,
          party: c.party,
          electoral: c.votes,
        };
      });

      result.president20 = candidates;
      if (candidates.length) {
        result.previousParty = candidates[0].party;
      }
    } else {
      // remaining steps are county/township-specific
      if (!result.fips) return;

      // get the winner margin from the previous presidential election

      const past_margin = {};
      let [top, second] = [];
      if (townshipStates.includes(result.state)) {
        [top, second] = data.csv.townshipAPResults
          .filter((p) => p.reportingunitID == result.reportingunitID)
          .sort((a, b) => b.votepct - a.votepct)
          .slice(0, 2);
      } else {
        [top, second] = data.csv.prior_fips
          .filter((p) => p.fipscode == result.fips)
          .sort((a, b) => b.votepct - a.votepct)
          .slice(0, 2);
      }
      past_margin.party = top ? top.party : "";
      past_margin.margin = top ? top.votepct - second.votepct : "";
      let census;
      let bls;
      let countyName;
      if (townshipStates.includes(result.state)) {
        bls = data.csv.unemployment_township[result.censusID] || {};
        countyName = data.csv.unemployment_township[result.censusID]
          ? data.csv.unemployment_township[result.censusID]["township"]
          : "At large";
        census = data.csv.census_township_data[result.censusID];
      } else {
        const fips = `${result.fips.slice(0, 2)}-${result.fips.slice(2)}`;
        bls = data.csv.unemployment_data[fips] || {};
        countyName = data.csv.county_names[result.fips] || "At large";
        census = data.csv.census_data[result.fips];
      }
      const { unemployment } = bls;

      result.county = {
        past_margin,
        ...census,
        unemployment,
        countyName,
      };
    }
  });

  return results;
};
