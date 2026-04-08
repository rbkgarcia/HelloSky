import { setupSearch } from './searchEngine.mjs';
import { updateUIByCity, updateUIByCoords, setWeatherRules } from './weather.mjs';
import { loadHeaderFooter } from './rendering.mjs';

// Global variable to store lifestyle rules
let weatherRules = [];

async function init() {

    const response = await fetch('./JSON/suggestions.json');
    const data = await response.json();
    
    setWeatherRules(data);

    // Load UI Components
    await loadHeaderFooter(() => {
        setupSearch((city) => updateUIByCity(city));
    });

    // Check if the browser supports geolocation and ask for weather
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                // This now happens AFTER rules are loaded
                await updateUIByCoords(pos.coords.latitude, pos.coords.longitude);
            },
            async () => {
                await updateUIByCity("Idaho");
            }
        );
    } else {
        await updateUIByCity("Idaho");
    }
}

await init();