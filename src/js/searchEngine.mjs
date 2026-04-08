const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
import { renderSuggestions, clearSuggestions } from './rendering.mjs';

// Fetches city matches from OpenWeather Geocoding API
export async function fetchCitySuggestions(query) {
    if (!query) return [];
    try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        
        return data.map(city => ({
            name: city.name,
            state: city.state || '',
            country: city.country,
            lat: city.lat,
            lon: city.lon
        }));
    } catch (error) {
        console.error("Geocoding failed:", error);
        return [];
    }
}

// Function to set up the search bar
export function setupSearch(onCitySelected) {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    let debounceTimer;

    if (!form || !input) return;

    // Listener for real-time typing
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            if (query.length > 2) {
                console.log("Searching for:", query); // Agrega esto para debug
                const matches = await fetchCitySuggestions(query);
                console.log("Matches found:", matches); // Agrega esto para debug
                
                renderSuggestions(matches, (selectedCity) => {
                    input.value = "";
                    clearSuggestions();
                    onCitySelected(selectedCity);
                });
            } else {
                clearSuggestions();
            }
        }, 300); // 300ms Low-pass filter (Debounce)
    });

    // Listener for manual "Enter" or "Submit"
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = input.value.trim();
        if (city) {
            onCitySelected(city);
            input.value = "";
            clearSuggestions();
        }
    });
}