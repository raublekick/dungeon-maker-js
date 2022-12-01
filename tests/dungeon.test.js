const { config, Dungeon } = require("../src/dungeon");
// import { Config, Dungeon } from "../src/index.js";

test("Dungeon initializes with default rows", () => {
  // let c = new Config();
  const d = Dungeon();
  expect(d.mapData.length).toBe(10);
});

test("Dungeon initializes with default columns", () => {
  // let c = new Config();
  const d = new Dungeon();

  let hasCorrectRows = true;
  d.mapArray.forEach((x) => {
    if (x.length !== 10) {
      hasCorrectRows = false;
    }
  });
  expect(hasCorrectRows).toBe(true);
});

test("Dungeon initializes with custom config", () => {
  config.xLength = 20;
  config.yHeight = 10;
  const d = new Dungeon();
  expect(d.mapArray.length).toBe(config.xLength);

  let hasCorrectRows = true;
  d.mapArray.forEach((x) => {
    if (x.length !== config.yHeight) {
      hasCorrectRows = false;
    }
  });
  expect(hasCorrectRows).toBe(true);
});
