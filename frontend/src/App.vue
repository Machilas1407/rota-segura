<template>
  <v-app>
    <!-- Barra de Navegação -->
    <v-app-bar color="#0E4F81" app>
      <!-- Botão com Logo -->
      <v-btn class="logo-btn" elevation="0" rounded>
        <img src="@/assets/DALL_E-2024-09-13-13.15-removebg-preview.png" alt="Logo" class="logo-img" />
      </v-btn>

      <!-- Botões de Navegação -->
      <v-btn text class="ml-2 custom-btn" @click="navigateTo('viajar')">Viajar</v-btn>
      <v-btn text class="custom-btn" @click="navigateTo('rota-tracada')">Rota Traçada</v-btn>

      <v-spacer></v-spacer>

      <!-- Botão de Logout -->
      <v-btn text class="custom-btn">Logout</v-btn>
    </v-app-bar>

    <!-- Conteúdo Principal -->
    <v-main>
      <v-container class="card-container fill-height" fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>


<script>
export default {
  methods: {
    // Função para navegação
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
    },
  },
};
</script>
<style scoped>
.card-container {
  background-color: #DDDFE2;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  /* Centraliza horizontalmente */
  display: flex;
  align-items: flex-start;
  /* Alinha o conteúdo no topo */
  justify-content: center;
  height: calc(100vh - 64px);
  /* Altura total menos o app-bar */
  width: 100%;
  /* Garante que o contêiner ocupe toda a largura */
}

.logo-btn {
  padding: 0 !important;
  background: transparent !important;
  height: 40px;
  width: auto;
}

.logo-img {
  height: 40px;
  width: auto;
  display: block;
}

.custom-btn {
  text-transform: none !important;
  font-size: 16px;
}

.fill-height {
  height: 100%;
}
</style>
