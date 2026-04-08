export function getRecommendations(data, jsonRules) {
    // 1. Extraemos clima del API
    const temp = data.main.temp;
    const condition = data.weather[0].main; // Ejemplo: "Clouds"

    // 2. EXTRAEMOS EL ARRAY CORRECTAMENTE
    // Tu JSON tiene la llave "weatherRules", así que la buscamos específicamente
    const rulesArray = jsonRules.weatherRules || (Array.isArray(jsonRules) ? jsonRules : []);

    console.log(`Matching: ${condition} at ${temp}°C against ${rulesArray.length} rules.`);

    // 3. BUSQUEDA CON FILTRO DE SEGURIDAD
    let match = rulesArray.find(rule => {
        // Evitamos que elementos vacíos rompan el código
        if (!rule || !rule.condition) return false;
        if (rule.condition === "Default") return false;

        const matchCondition = rule.condition.toLowerCase() === condition.toLowerCase();
        const matchTemp = temp >= rule.minTemp && temp <= rule.maxTemp;
        
        return matchCondition && matchTemp;
    });

    // 4. FALLBACK (Si no hubo match, como pasará con "Clouds")
    if (!match) {
        console.log("No specific match found, using Default rule.");
        match = rulesArray.find(rule => rule.condition === "Default");
    }

    return match;
}