// Best practices for configuration:
// maxTileUsagePercent directly controls how many spaces will be on the map.
// A 10 by 10 map with a 0.6 usage percent results in a map with 60 used tiles and 40 unused.
// When deciding on chanceToBuild values, consider the number of tiles that will be used.
// The map chanceToBuild will control how populated your map is with buildables.
// The buildable chanceToBuild will how likely that buildable is to be used.
//

const defaultConfig = {
  xLength: 10,
  yHeight: 10,
  xStart: 0,
  yStart: 0,
  defaultSpaceValue: "X",
  defaultBuiltSpaceValue: ".",
  playerValue: "@",
  startValue: "S",
  placeholderValue: "!",
  // should this just be an int and enforce that it's < x*y?
  maxTileUsagePercent: 0.6,
  chanceToBuild: 0.5,
  fogRadius: null,
  buildables: {
    goblin: {
      chanceToBuild: 0.1,
      value: "G",
      max: 10,
    },
    imp: {
      chanceToBuild: 0.1,
      value: "I",
      max: 5,
    },
    gold: {
      chanceToBuild: 0.025,
      value: "*",
      max: 5,
    },
  },
};

// var buildables = Object.entries(config.buildables);
// buildables.length;
// Object.entries(config.buildables).forEach((buildable) => {
//   var name = buildable[0] + (buildables.length += 1);
//   buildables[name] = { .. }
// })
// var newMapItem = { }

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// returns a new dungeon object {
//  mapArray
//  config,
//  player: {postion,...}
//  collection: {},
//  generate(),
//  setPlayerPosition(newX, newY, currX, currY)
//  setActorPosition(newX, newY, currX, currY)
// }
// collections will store positions so an implementer can track and change positions of various actors, items, etc

function Dungeon(args) {
  const config = args ?? defaultConfig;
  let array;
  // set starting space based on config or random value within bounds
  const xStart = config.xStart ?? randomIntFromInterval(1, config.xLength - 1);
  const yStart = config.yStart ?? randomIntFromInterval(1, config.yHeight - 1);
  // set the player coordinates and store the previousValue as the start title
  const playerCoords = {
    x: xStart,
    y: yStart,
    previousValue: config.startValue,
  };

  // set coordinates to starting point
  let xCurr = xStart;
  let yCurr = yStart;
  let usedSpaces = 0;
  const targetTotalSpaces =
    config.xLength * config.yHeight * config.maxTileUsagePercent;

  // track which direction we are moving, and try that direction first,
  // i.e. if we hit left, then the order is left, up, right down
  // if we hit up, then the order is up, right, down, left
  let directions = ["left", "up", "right", "down"];
  let currDirection = "left";
  let built;
  let moved;

  const collections = [];

  // Initializes the map to requested size with default space
  function initialize() {
    // create a column with default value
    // TODO: Make sure x and y are correct

    // add that column to each row
    const x = Array.from({ length: config.xLength }, () =>
      Array.from({ length: config.yHeight }, () => config.defaultSpaceValue)
    );
    return x;
  }

  function shiftArray(originalArray) {
    const first = originalArray[0];
    const newArray = originalArray.splice(1, originalArray.length);
    newArray.push(first);
    return newArray;
  }

  // returns coordinates for next space in given direction
  function getSpace(direction) {
    let x;
    let y;
    switch (direction) {
      case "left":
        // check left for OOB
        if (xCurr !== 0) {
          x = xCurr - 1;
          y = yCurr;
        }
        break;
      case "up":
        // check top for OOB
        if (yCurr !== 0) {
          x = xCurr;
          y = yCurr - 1;
        }
        break;
      case "right":
        // check right for OOB
        if (xCurr !== config.xLength - 1) {
          x = xCurr + 1;
          y = yCurr;
        }
        break;
      case "down":
        // check bottom for OOB
        if (yCurr !== config.yHeight - 1) {
          x = xCurr;
          y = yCurr + 1;
        }
        break;
      default:
        break;
    }
    return { x, y };
  }

  // takes a set of coordinates and returns an object describing the tile built
  function getBuild(builder) {
    const space = builder;
    // should we build here?
    if (Math.random() < config.chanceToBuild) {
      // determine what to build and always default to an empty space
      // TODO: iterate collections and set appropriate values
      if (config.collections) {
        const buildables = Object.entries(config.buildables);

        Object.entries(config.buildables).every((buildable) => {
          const key = buildable[0];
          const name = key + (buildables.length += 1);
          const item = buildable[1];

          if (
            collections[key] &&
            Math.random() < item.chanceToBuild &&
            collections[key] &&
            collections[key].length <= item.max
          ) {
            space.spaceValue = item.spaceValue;
            space.collection = collection;
            space.item = item;
            space.built = true;
            space.spaceValue = item.spaceValue;
            space.x = builder.x;
            space.y = builder.y;
            space.built = true;
            space.itemKey = name;
            space.item = item;
            space.built = true;
            return false;
          }
          return true;
        });
      }
      if (!space.built) {
        space.spaceValue = config.defaultBuiltSpaceValue;
        space.collection = null;
        space.item = null;
        space.built = true;
      }
    }

    return space;
  }

  // updates array at index with value
  function updateSpace(x, y, spaceValue) {
    if (y >= 0 && x >= 0 && spaceValue) array[y][x] = spaceValue;
  }

  // update the provided collection with the appropriate item
  function updateCollection(collection, item) {
    if (collection && item) collections[collection].push(item);
  }

  function updateMove(x, y, direction, hasMoved) {
    currDirection = direction;
    xCurr = x;
    yCurr = y;
    moved = hasMoved;
  }

  function updateDungeonState(builder) {
    // update Dungeon state

    // TODO: Fix this incorrectly incrementing all the time
    if (builder.built) {
      xCurr = builder.x;
      yCurr = builder.y;
      usedSpaces += 1;
      // update the array at position with new value
      updateSpace(builder.x, builder.y, builder.spaceValue);
      // update the modified collection (if any) with the item added
      updateCollection(builder.collection, builder.item);
    }
    // usedSpaces += 1; // builder.built ? usedSpaces + 1 : usedSpaces;
    built = builder.built;
    currDirection = builder.direction;
  }

  // try to find the next move based on direction, checking bounds and the default space value
  // returns the updated move
  function tryMove(direction) {
    let x = xCurr;
    let y = yCurr;
    let hasMoved = moved;
    if (!hasMoved) {
      switch (direction) {
        case "left":
          if (
            xCurr !== 0 &&
            array[yCurr][xCurr - 1] !== config.defaultSpaceValue
          ) {
            x -= 1;
            hasMoved = true;
            currDirection = "left";
          }
          break;
        case "up":
          if (
            yCurr !== 0 &&
            array[yCurr - 1][xCurr] !== config.defaultSpaceValue
          ) {
            y -= 1;
            hasMoved = true;
            currDirection = "up";
          }
          break;
        case "right":
          if (
            xCurr !== config.xLength - 1 &&
            array[yCurr][xCurr + 1] !== config.defaultSpaceValue
          ) {
            x += 1;
            hasMoved = true;
            currDirection = "right";
          }
          break;
        case "down":
          if (
            yCurr !== config.yHeight - 1 &&
            array[yCurr + 1][xCurr] !== config.defaultSpaceValue
          ) {
            y += 1;
            hasMoved = true;
            currDirection = "down";
          }
          break;
        default:
          break;
      }
    }
    return { x, y, direction, moved: hasMoved };
  }

  function tryBuildSpace(direction) {
    // initialize builder object
    let builder = {
      direction,
      built: false,
      x: xCurr,
      y: yCurr,
      spaceValue: array[yCurr][xCurr],
      collection: null,
      item: null,
    };
    if (!built) {
      // get coordinates for the next space in current direction.
      // will return null if space would be out of bounds, meaning we can't build there
      const { x, y } = getSpace(direction, xCurr, yCurr);
      // if this space is not already built on, see what we should build
      if (x >= 0 && y >= 0 && array[y][x] === config.defaultSpaceValue) {
        builder.x = x;
        builder.y = y;
        builder = getBuild(builder);
      }
    }
    return builder;
  }

  function drawHtml() {
    let mapString = ""; // "x: " + this.playerCoords.x + " y: " + this.playerCoords.y;
    // iterate rows
    this.mapData.forEach((row, y) => {
      // mapString += "Row " + (i < 10 ? "0" + i : i) + " ";
      row.forEach((col, x) => {
        const pX = this.playerCoords.x;
        const pY = this.playerCoords.y;
        const distanceFromPlayer = Math.sqrt((x - pX) ** 2 + (y - pY) ** 2);
        // TODO: make fog space configurale
        if (this.config.fogRadius) {
          mapString +=
            distanceFromPlayer <= this.config.fogRadius
              ? col
              : "<span style='background-color:#999;color:grey;'>?</span>";
        } else {
          mapString += col;
        }
      });
      mapString += "<br/>";
    });

    return mapString;
  }

  array = initialize();

  // add the player to the starting space
  array[yStart][xStart] = config.playerValue;

  // iterate until we've hit the target
  // TODO: test config.target === dungeon.usedSpaces
  while (usedSpaces <= targetTotalSpaces) {
    built = false;

    // try building in each direction
    directions.every((direction) => {
      const builder = tryBuildSpace(direction);
      updateDungeonState(builder);
      // if nothing built, keep iterating
      return !builder.built;
    });

    if (built) {
      // reset the array so we're focused on the new direction first
      while (currDirection !== directions[0]) {
        directions = shiftArray(directions);
      }
    } else {
      // nothing built, move to first empty space or try again
      // note: at 0,0 gets stuck in a loop moving right and left, just move back to start for now and try it all again
      // if(xCurr === 0 && yCurr === 0) {
      //   xCurr = this.xStart;
      //   yCurr = this.yStart;
      //   continue;
      // }
      moved = false;

      directions.every((direction) => {
        const move = tryMove(direction);
        if (move.moved) {
          updateMove(move.x, move.y, move.direction, move.moved);
          return false;
        }
        return true;
      });

      if (moved) {
        while (currDirection !== directions[0]) {
          directions = shiftArray(directions);
        }
      } else {
        // couldn't move, what do?
        // shuffle directions
        directions = shiftArray(directions);
        xCurr = xStart;
        yCurr = yStart;
      }
    }
  }

  return {
    config,
    mapData: array,
    playerCoords,
    drawHtml,
  };
}

export { defaultConfig as config, Dungeon };
