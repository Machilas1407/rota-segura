<template>
  <v-container>
    <v-row class="additional-cards" dense>
      <v-col cols="12" sm="6" md="6">
        <v-card class="info-card" outlined @click="showAlert('Rotas Alternativas')">
          <v-img src="@/assets/img/bifurcation.jpg" class="card-image" alt="Rotas Alternativas" cover></v-img>
          <div class="card-overlay">
            <v-card-title class="card-title">Rotas Alternativas</v-card-title>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="6">
        <v-card class="info-card" outlined @click="showAlert('Dicas para uma viagem segura')">
          <v-img src="@/assets/img/safeTravel.jpeg" class="card-image" alt="Dicas para uma viagem segura" cover></v-img>
          <div class="card-overlay">
            <v-card-title class="card-title">Dicas para uma viagem segura</v-card-title>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  methods: {
    showAlert(message) {
      alert(message);
    },
  },
};
</script>

<style scoped>
.additional-cards {
  margin-top: 16px;
}

.info-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  height: 300px;
}

.info-card:hover {
  transform: scale(1.03);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.card-title {
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7);
}
</style>
