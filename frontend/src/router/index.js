import { createRouter, createWebHistory } from 'vue-router';
import SimpleForm from '@/pages/SimpleForm.vue';
import SearchResult from '@/pages/SearchResult.vue';

const routes = [
  { path: '/', name: 'viajar', component: SimpleForm },
  { path: '/rota-tracada', name: 'rota-tracada', component: SearchResult },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
