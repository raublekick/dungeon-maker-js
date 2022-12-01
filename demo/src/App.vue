<script setup>
import { config, Dungeon } from "../../src/dungeon";
import { ref } from "vue";

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
  font-family: "Courier New", Courier, monospace;
  line-height: 10px;
  letter-spacing: 1px;
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
