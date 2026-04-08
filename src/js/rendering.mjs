// Generic template loader
export async function insertTemplate(path, parent) {
    if (!parent) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Could not load template: ${path}`);
        
        const html = await response.text();
        parent.innerHTML = html;
    } catch (error) {
        console.error("Template Error:", error);
    }
}

// Loads both header and footer and initializes the search bar
export async function loadHeaderFooter(setupSearchCallback) {
    const headerEl = document.querySelector("#main-header");
    const footerEl = document.querySelector("#main-footer");

    // We use Promise.all to load both at the same time (faster)
    await Promise.all([
        insertTemplate("/partials/header.html", headerEl),
        insertTemplate("/partials/footer.html", footerEl)
    ]);

    if (setupSearchCallback) {
        setupSearchCallback();
    }
}

// Render City Suggestions (Search Bar)
export function renderSuggestions(matches, onSelect) {
    const container = document.getElementById('suggestions-container');
    if (!container) return;

    if (matches.length === 0) {
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    container.style.display = "block";
    container.innerHTML = matches.map(city => `
        <div class="suggestion-item" data-name="${city.name}">
            <strong>${city.name}</strong>, ${city.state ? city.state + ',' : ''} ${city.country}
        </div>
    `).join('');

    // Add click listeners to the new items
    document.querySelectorAll('.suggestion-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            const selectedCity = matches[index].name;
            onSelect(selectedCity);
        });
    });
}

// Clear City Suggestions
export function clearSuggestions() {
    const container = document.getElementById('suggestions-container');
    if (container) {
        container.innerHTML = "";
        container.style.display = "none";
    }
}

// Render Dashboard Suggestions
export function renderDashboard(data, recommendations) {

    const cityName = document.getElementById('city-name');
    const tempDisplay = document.getElementById('current-temp');
    if (cityName) cityName.textContent = data.name;
    if (tempDisplay) tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        // This will show something like "Wednesday, April 8"
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
    const iconElement = document.getElementById('weather-icon');
    if (iconElement) {
        const condition = data.weather[0].main; // e.g., "Clouds"
        
        // Remove existing classes to avoid stacking (like having sun and cloud icons together)
        iconElement.className = 'fa-solid'; 
        
        // Add the correct class based on the API response
        iconElement.classList.add(getWeatherIconClass(condition));
    }

    //Render Suggestions
        const list = document.getElementById('suggestions-list');
    if (list) {
        list.innerHTML = ''; 

        if (recommendations && Array.isArray(recommendations.suggestions)) {
            const html = recommendations.suggestions
                .map(tip => `<li> ${tip}</li>`)
                .join('');
            list.innerHTML = html;
        } else {
            list.innerHTML = '<li><i class="fa-solid fa-circle-info"></i> No suggestions available.</li>';
        }
    }
}

// Function to get the class name for the weather icon
function getWeatherIconClass(condition) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-showers-heavy',
        'Snow': 'fa-snowflake',
        'Thunderstorm': 'fa-bolt',
        'Drizzle': 'fa-cloud-rain',
        'Mist': 'fa-smog',
        'Fog': 'fa-smog'
    };
    return iconMap[condition] || 'fa-cloud'; // Default to cloud if unknown
}

// Render Health/Activities Suggestions
export function renderHealthPage(data, recommendations) {
    // 1. Update the Header Info (The "Wiring")
    const cityNameEl = document.getElementById('city-name');
    const tempEl = document.getElementById('current-temp');
    const dateEl = document.getElementById('date-display');

    if (cityNameEl) cityNameEl.textContent = data.name;
    if (tempEl) tempEl.textContent = `${Math.round(data.main.temp)}°`;
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric' 
    });

    // 2. Your Original Grid Logic (The "Core")
    const activityGrid = document.getElementById('outdoor-grid');
    if (!activityGrid) return;

    const activityIcons = {
        "Fishing": "🎣", "Running": "🏃", "Golf": "⛳",
        "Biking": "🚲", "Beach": "🏖️", "Gardening": "🌱",
        "Hiking": "🥾", "Swimming": "🏊", "Gym": "🏋️", "Walking": "🚶"
    };

    activityGrid.innerHTML = Object.entries(recommendations.activityRatings).map(([name, status]) => {
        const colorClass = status === 'Great' ? 'bar-green' : 
                           (status === 'Good' ? 'bar-yellow' : 'bar-red');
        
        const icon = activityIcons[name] || "📍"; 

        return `
            <div class="activity-card">
                <span class="activity-icon">${icon}</span>
                <p class="activity-name">${name}</p>
                <div class="indicator-bar ${colorClass}"></div>
                <span class="status-text">${status}</span>
            </div>`;
    }).join('');
}

// Render Forecast
export function renderForecast(data, type = 'open-meteo') {
    const container = document.getElementById('forecast-container');
    if (!container) return;

    // Clear the previous city's forecast before rendering the new one
    container.innerHTML = ""; 

    if (type === 'open-meteo') {
        data.time.forEach((date, i) => {
            // Format the date to show a short day name (e.g., Mon, Tue)
            const dayName = new Date(date + "T00:00:00").toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(data.temperature_2m_max[i]);
            const code = data.weather_code[i];
            
            // Inject the generated HTML into the container
            container.insertAdjacentHTML('beforeend', createForecastHTML(dayName, code, temp));
        });
    } else {
        // OpenWeather Fallback Logic
        data.forEach(day => {
            const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(day.main.temp);
            const condition = day.weather[0].main;
            
            container.insertAdjacentHTML('beforeend', createForecastHTML(dayName, condition, temp));
        });
    }
}

// function to create the forecast HTML
function createForecastHTML(day, info, temp) {
    let icon = "fa-sun";
    
    // Si 'info' es un número (Open-Meteo) o una palabra (OpenWeather)
    if (info === "Rain" || info === "Drizzle" || info >= 51) {
        icon = "fa-cloud-showers-heavy";
    } else if (info === "Clouds" || (info >= 1 && info <= 3)) {
        icon = "fa-cloud";
    } else if (info === "Clear" || info === 0) {
        icon = "fa-sun";
    }

    return `
        <div class="forecast-item">
            <span class="day">${day}</span>
            <i class="fa-solid ${icon}"></i>
            <span class="temp">${temp}°</span>
        </div>
    `;
}

