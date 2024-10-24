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

    // Add electoral college winners to states
    if (
      (result.state === "ME" || result.state === "NE") &&
      result.office == "P" &&
      result.level == "state"
    ) {
      let state20 = data.csv.prior_states
        .filter((s) => {
          if (result.seat) {
            return (
              s.votes * 1 &&
              s.statePostal.split("-")[1] == result.seat &&
              s.statePostal.split("-")[0] === result.state
            );
          } else {
            return s.votes * 1 && s.statePostal == result.state;
          }
        })
        .sort((a, b) => b.votes - a.votes);

      const candidates = state20.map(function (c) {
        return {
          last: c.last,
          party: c.party,
          electoral: c.votes,
          state: c.statePostal,
        };
      });

      result.president20 = candidates;
      if (candidates.length) {
        result.previousParty = candidates[0].party;
      }
    }

    // race.id == 0 is usually presidential election
    if (
      (result.id == 0 && result.level == "state") ||
      result.level == "district"
    ) {
      let state20 = data.csv.prior_states
        .filter((s) => s.votes * 1 && s.statePostal == result.state)
        .sort((a, b) => b.votes - a.votes);

      const candidates = state20.map(function (c) {
        return {
          last: c.last,
          party: c.party,
          electoral: c.votes,
          state: c.statePostal,
        };
      });

      result.president20 = candidates;
      if (candidates.length) {
        result.previousParty = candidates[0].party;
      }
    } else {
      // remaining steps are county-specific
      if (!result.fips) return;

      // get the winner margin from the previous presidential election
      const past_margin = {};
      const [top, second] = data.csv.prior_fips
        .filter((p) => p.fipscode == result.fips)
        .sort((a, b) => b.votepct - a.votepct)
        .slice(0, 2);
      past_margin.party = top ? top.party : "";
      past_margin.margin = top ? top.votepct - second.votepct : "";

      const census = data.csv.census_data[result.fips];
      const bls = data.csv.unemployment_data[result.fips] || {};
      const { unemployment } = bls;

      const countyName = data.csv.county_names[result.fips] || "At large";

      result.county = { past_margin, ...census, unemployment, countyName };
    }
  });

  return results;
};
