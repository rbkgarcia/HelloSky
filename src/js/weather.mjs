import { get7DayForecast, getOpenWeatherForecast, getWeatherByCity, getWeatherByLocation } from './apiService.mjs';
import { renderForecast, renderDashboard } from './rendering.mjs';
import { getRecommendations } from './suggestions.mjs';

let weatherRules = []; // Aquí se guardarán cuando lleguen

export function setWeatherRules(data) {
    console.log("📥 Raw data received in setWeatherRules:", data);
    
    weatherRules = data.weatherRules || data.rules || data;
    
    console.log("💾 Final weatherRules state:", weatherRules);
}

// Process the weather data
export async function processWeatherData(weatherData) {
    console.log("🔍 Checking rules before matching:", weatherRules);

    // Pasamos la variable global 'weatherRules'
    const recommendations = getRecommendations(weatherData, weatherRules);
    
    renderDashboard(weatherData, recommendations);
}
// Update the forecast UI
export async function updateForecastUI(city, lat, lon) {
    try {
        // 1. Primary Attempt: Open-Meteo (Uses lat/lon)
        console.log("Attempting Open-Meteo...");
        const forecastData = await get7DayForecast(lat, lon);
        
        // Render specifically as 'open-meteo' so the UI knows how to read the data
        renderForecast(forecastData, 'open-meteo');

    } catch (error) {
        // 2. The Fallback: If Step 1 fails, we enter the CATCH block
        console.warn("Open-Meteo failed, switching to OpenWeather fallback:", error.message);
        
        try {
            const fallbackData = await getOpenWeatherForecast(city);
            
            // Render specifically as 'open-weather'
            renderForecast(fallbackData, 'open-weather');
        } catch (fallbackError) {
            // 3. Critical Failure: If both fail, log the error
            console.error("Both weather services failed", fallbackError);
            
            const container = document.getElementById('forecast-container');
            if (container) {
                container.innerHTML = `<p class="error">Forecast data currently unavailable.</p>`;
            }
        }
    }
}

// Update the UI
export async function updateUIByCoords(lat, lon) {
    try {
        const weatherData = await getWeatherByLocation(lat, lon);
        await processWeatherData(weatherData); 
        await updateForecastUI(weatherData.name, lat, lon); 
    } catch (err) {
        console.error("Error updating by coordinates:", err);
    }
}

export async function updateUIByCity(city) {
    try {
        const weatherData = await getWeatherByCity(city);
        await processWeatherData(weatherData);        
        await updateForecastUI(city, weatherData.coord.lat, weatherData.coord.lon);
    } catch (err) {
        console.error("Error updating by city:", err);
    }
}
