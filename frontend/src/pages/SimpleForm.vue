<template>
  <v-container class="card-containe">
    <v-card class="blue-card" flat>
      <v-card-text>
        <div class="input-group">
          <div class="input-item">
            <v-icon class="input-icon">mdi-map-marker</v-icon>
            <v-text-field v-model="cityOrigem" label="Origem" outlined dense hide-details class="custom-input"
              @input="fetchCitySuggestions('origem')">
              <template #append>
                <v-btn icon color="secondary" @click="getCurrentLocation('origem')">
                  <v-icon>mdi-crosshairs-gps</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </div>
          <div class="separator"></div>
          <div class="input-item">
            <v-icon class="input-icon">mdi-map-marker-outline</v-icon>
            <v-text-field v-model="cityDestino" label="Destino" outlined dense hide-details class="custom-input"
              @input="fetchCitySuggestions('destino')"></v-text-field>
          </div>
          <div class="separator"></div>
          <div class="input-item">
            <v-icon class="input-icon">mdi-car</v-icon>
            <v-select v-model="selectedTransport" :items="transportOptions" label="Transporte" outlined dense
              hide-details class="custom-input"></v-select>
          </div>
          <div class="separator"></div>
          <div class="input-item">
            <v-icon class="input-icon" size="24">mdi-calendar-clock</v-icon>
            <v-text-field v-model="formattedDateTime" label="Selecione a Data" outlined dense hide-details readonly
              class="custom-input" @click="openDialog"></v-text-field>
            <v-dialog v-model="dialog" max-width="380px">
              <v-card>
                <v-card-text>
                  <v-date-picker v-model="selectedDate" locale="pt-BR"
                    :min="new Date().toISOString().substr(0, 10)"></v-date-picker>
                  <v-divider></v-divider>
                  <v-time-picker v-model="selectedTime" format="24hr"></v-time-picker>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="saveDateTime">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
          <v-btn icon color="primary" class="search-button" @click="goToRotaTracada">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </div>
        <div v-if="suggestionsOrigem.length > 0" class="suggestions">
          <v-list class="suggestion-list">
            <v-list-item v-for="(suggestion, index) in suggestionsOrigem" :key="index"
              @click="selectCity('origem', suggestion)">
              {{ suggestion.display_name }}
            </v-list-item>
          </v-list>
        </div>
        <div v-if="suggestionsDestino.length > 0" class="suggestions">
          <v-list class="suggestion-list">
            <v-list-item v-for="(suggestion, index) in suggestionsDestino" :key="index"
              @click="selectCity('destino', suggestion)">
              {{ suggestion.display_name }}
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>
    <CardsHome />
  </v-container>

</template>

<script>
import CardsHome from '@/components/CardsHome.vue';
export default {
  components: {
    CardsHome,
  },
  data() {
    return {
      cityOrigem: "",
      cityDestino: "",
      selectedTransport: null,
      transportOptions: ["Carro", "Ônibus", "Bicicleta", "Caminhão"],
      suggestionsOrigem: [],
      suggestionsDestino: [],
      coordinatesOrigem: null,
      coordinatesDestino: null,
      dialog: false,
      selectedDate: null,
      selectedTime: null,
      formattedDateTime: "",
    };
  },
  methods: {
    async fetchCitySuggestions(type) {
      const query = type === "origem" ? this.cityOrigem : this.cityDestino;

      if (query.length < 3) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=BR&format=json&limit=5`
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status}`);
        }

        const data = await response.json();

        if (type === "origem") {
          this.suggestionsOrigem = data;
        } else if (type === "destino") {
          this.suggestionsDestino = data;
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        alert("Não foi possível buscar as sugestões no momento. Tente novamente mais tarde.");
      }
    }
    ,
    selectCity(type, suggestion) {
      if (type === "origem") {
        this.cityOrigem = suggestion.display_name;
        this.coordinatesOrigem = { lat: suggestion.lat, lon: suggestion.lon };
        this.suggestionsOrigem = [];
      } else if (type === "destino") {
        this.cityDestino = suggestion.display_name;
        this.coordinatesDestino = { lat: suggestion.lat, lon: suggestion.lon };
        this.suggestionsDestino = [];
      }
    },

    saveDateTime() {
      if (this.selectedDate && this.selectedTime) {
        const [hours, minutes] = this.selectedTime.split(':');
        const date = new Date(this.selectedDate);
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));

        // Formata a data e hora para o formato DD/MM/YYYY HH:mm
        this.formattedDateTime = new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(date);
      } else if (this.selectedDate) {
        // Formata apenas a data se a hora não for selecionada
        const date = new Date(this.selectedDate);
        this.formattedDateTime = new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
        }).format(date);
      }

      this.dialog = false; // Fecha o diálogo
    },

    getCurrentLocation(type) {
      if (!navigator.geolocation) {
        alert("Geolocalização não é suportada pelo seu navegador.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          if (type === "origem") {
            this.coordinatesOrigem = { lat: latitude, lon: longitude };

            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await response.json();
              this.cityOrigem = data.display_name || "Localização Atual";
            } catch (error) {
              console.error("Erro ao buscar nome da cidade:", error);
            }
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível obter sua localização.");
        }
      );
    },
    openDialog() {
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    saveDate(date) {
      this.selectedDate = date;
      this.updateDateTime();
    },
    saveTime(time) {
      this.selectedTime = time;
      this.updateDateTime();
    },
    updateDateTime() {
      if (this.selectedDate && this.selectedTime) {
        this.formattedDateTime = `${this.selectedDate} ${this.selectedTime}`;
      }
    },
    goToRotaTracada() {
      if (!this.cityOrigem || !this.cityDestino || !this.formattedDateTime) {
        alert("Por favor, preencha todos os campos antes de continuar.");
        return;
      }

      this.$router.push({
        name: "rota-tracada",
        query: {
          origem: this.cityOrigem,
          destino: this.cityDestino,
          transporte: this.selectedTransport || "Carro",
          datetime: this.formattedDateTime,
        },
      });
    },
  },
};
</script>

<style scoped>
.blue-card {
  background-color: #002b5c;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-item {
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
}

.custom-input {
  background: white;
  border-radius: 24px;
  padding-left: 40px;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #666;
  pointer-events: none;
  font-size: 24px;
}

.separator {
  width: 1px;
  height: 48px;
  background-color: #ccc;
}

.search-button {
  height: 48px;
  width: 48px;
  border-radius: 50%;
  background-color: white;
  color: #002b5c;
}

.card-containe {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 32px;
}

.cards-section {
  width: 100%;
  margin-top: 24px;
}
</style>
