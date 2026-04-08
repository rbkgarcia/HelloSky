import { loadHeaderFooter, renderHealthPage } from './rendering.mjs';
import { getWeatherByCity } from './apiService.mjs';
import { getRecommendations } from './suggestions.mjs'; // Corregido a plural
import { setupSearch } from './searchEngine.mjs'; // Importación necesaria

async function updateHealthUI(city) {
    try {
        const weatherData = await getWeatherByCity(city);
        
        // 1. Cargar las reglas del JSON (igual que en main.js)
        const response = await fetch('../JSON/suggestions.json');
        const rules = await response.json();
        
        // 2. Obtener la recomendación específica (que incluya activityRatings)
        const recommendations = getRecommendations(weatherData, rules);
        
        // 3. Dibujar la página de salud
        renderHealthPage(weatherData, recommendations);
        
        // Guardar para la próxima vez
        localStorage.setItem('lastCity', city);
    } catch (error) {
        console.error("Error loading health data:", error);
    }
}

async function initHealthPage() {
    // Cargar Header y Footer
    await loadHeaderFooter(() => {
        // Configurar el buscador usando el nombre correcto: setupSearch
        setupSearch((city) => {
            updateHealthUI(city);
        });
    });

    // Cargar ciudad inicial
    const lastCity = localStorage.getItem('lastCity') || 'Caracas';
    updateHealthUI(lastCity);
}

// Usar el evento de carga del DOM
document.addEventListener('DOMContentLoaded', initHealthPage);