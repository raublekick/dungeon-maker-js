<script setup>
import { config, Dungeon } from "../../src/dungeon";
import { ref } from "vue";

// dynamically set size based on viewport
// ratio to divide mapWidth by needs to be calculated https://stackoverflow.com/questions/15574288/pixel-width-of-monospace-character
// add a max fontSize so it doesn't get too big
// add functions to dungeon to calculate based on given height
let viewportHeight = window.innerHeight;
let viewportWidth = window.innerWidth;
let viewportRatio = viewportHeight / viewportWidth;
let mapWidth = null;
// higher than 100 at 1440p maximized Firefox window starts to become incredibly difficult to see, and scales poorly with the ratio
let mapHeight = 100; //Math.floor(mapWidth * viewportRatio);
// reduce to (1/mapHeight) * 100??
let fontSize = ref(
  (viewportHeight / (mapHeight + 1) / viewportHeight) * 100 + "vh"
); // vh
let characterRatio = 0.54;
mapWidth = Math.floor(mapHeight / viewportRatio / characterRatio);
let letterSpacing = ref(fontSize / 2);

config.xLength = mapWidth;
config.yHeight = mapHeight;
const base = Dungeon(config);
const dungeon = ref(base);
console.log(dungeon);
console.log(base);
const map = base.drawHtml();
const dungeonMap = ref(map);
console.log(dungeonMap);
</script>

<template>
  <div>
    <div>
      <div class="map" v-html="dungeonMap"></div>
    </div>
  </div>
</template>

<style scoped>
.map {
  font-family: monospace;
  line-height: v-bind(fontSize);
  font-size: v-bind(fontSize);
  letter-spacing: v-bind(letterSpacing);
  /* line-height: 10px;
  letter-spacing: 1px; */
  color: #999;
  cursor: default;
  border: 1px solid #999;
  display: inline-block;
}
.marker {
  background-clip: content-box;
  margin: 0;
  font-size: 5rem;
}
</style>
