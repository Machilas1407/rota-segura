<template>
  <div class="traffic-light">
    <div class="light red" :class="{ active: activeLight === 'red' }"></div>
    <div class="light yellow" :class="{ active: activeLight === 'yellow' }"></div>
    <div class="light green" :class="{ active: activeLight === 'green' }"></div>
  </div>
</template>

<script>
export default {
  name: "TrafficLight",
  props: {
    acidentes: {
      type: Array,
      required: true,
    },
  },
  computed: {
    activeLight() {
      const countGreen = this.acidentes.filter(
        (item) => item.acidentes >= 1 && item.acidentes <= 2
      ).length;
      const countYellow = this.acidentes.filter(
        (item) => item.acidentes >= 3 && item.acidentes <= 5
      ).length;
      const countRed = this.acidentes.filter(
        (item) => item.acidentes >= 6
      ).length;

      if (countRed >= countYellow && countRed >= countGreen) {
        return "red";
      } else if (countYellow >= countGreen) {
        return "yellow";
      } else {
        return "green";
      }
    },
  },

};
</script>

<style scoped>
.traffic-light {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #333;
  padding: 25px;
  border-radius: 100px;
  width: 162px;
  height: 486px;
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.4);
}

.light {
  width: 108px;
  height: 108px;
  margin: 16px 0;
  border-radius: 50%;
  opacity: 0.2;
  /* Luz apagada */
  transition: opacity 0.3s ease;
}

.light.red {
  background-color: red;
}

.light.yellow {
  background-color: yellow;
}

.light.green {
  background-color: rgb(0, 255, 0);
}

.light.active {
  opacity: 1;
  /* Luz acesa */
}
</style>
