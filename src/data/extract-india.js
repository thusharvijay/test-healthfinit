// extract-india.js
// Node 18+ recommended (fetch available natively)
import fs from "fs/promises";
import fetch from "node-fetch"; // if node <18, install node-fetch and uncomment this line

async function main() {
  // 1) Download the full countries+states+cities JSON from the dr5hn repo
  // (raw GitHub URL to the JSON export)
  const rawUrl = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries+states+cities.json";

  console.log("Downloading full dataset (this may take a moment)...");
  const resp = await fetch(rawUrl);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status} ${resp.statusText}`);
  const all = await resp.json();

  // 2) Find India entry (country name or iso2 = "IN")
  const indiaEntry = all.find(
    (c) =>
      (c.name && c.name.toLowerCase() === "india") ||
      (c.iso2 && c.iso2.toLowerCase() === "in")
  );
  if (!indiaEntry) throw new Error("India not found in dataset");

  // 3) Convert to a simple mapping: { "State/UT": [ "City1", "City2", ... ], ... }
  const mapping = {};
  if (Array.isArray(indiaEntry.states)) {
    for (const state of indiaEntry.states) {
      const stateName = state.name;
      const cityNames =
        Array.isArray(state.cities) && state.cities.length
          ? state.cities.map((city) => (city.name ? city.name : city)).filter(Boolean)
          : [];
      mapping[stateName] = cityNames;
    }
  } else {
    throw new Error("India entry does not include states in expected format");
  }

  // 4) Save to file
  await fs.writeFile("india-states-cities.json", JSON.stringify(mapping, null, 2), "utf8");
  console.log("Saved india-states-cities.json (states -> [cities])");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
