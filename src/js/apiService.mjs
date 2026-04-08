const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

// Fetch current weather data by city name (OpenWeather)
export async function getWeatherByCity(city) {
    const res = await fetch(`${BASE_URL}weather?q=${city}&units=metric&appid=${API_KEY}`);
    if (!res.ok) throw new Error("City not found");
    return await res.json();
}

// Fetch current weather data by geographical coordinates (OpenWeather)
export async function getWeatherByLocation(lat, lon) {
    const res = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    if (!res.ok) throw new Error("Location not found");
    return await res.json();
}

// Fetch 7-day forecast (Open-Meteo)
export async function get7DayForecast(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max&timezone=auto`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error("Open-Meteo request failed");
    
    const data = await res.json();
    // Returning only .daily ensures the UI receives the specific arrays it needs
    return data.daily; 
}

// Fetch 5-day forecast by city name (OpenWeather)
export async function getOpenWeatherForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    
    // Crucial: check status before filtering to avoid crashing on errors
    if (!res.ok) throw new Error("OpenWeather fallback forecast failed");
    
    const data = await res.json();
    
    // Filter to get only mid-day readings (12:00 PM) to simulate a daily view
    return data.list.filter(item => item.dt_txt.includes("12:00:00"));
}


