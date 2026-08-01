const feeds = [
    // --- GENERAL NEWS ---
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'WORLD', source: 'BBC' },
    { url: 'https://www.theguardian.com/world/rss', category: 'GLOBAL', source: 'THE GUARDIAN' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'WORLD', source: 'AL JAZEERA' },
    { url: 'https://rss.cnn.com/rss/edition_world.rss', category: 'WORLD', source: 'CNN' },
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'WORLD', source: 'FOX NEWS' },
    { url: 'https://www.cbsnews.com/latest/rss/world', category: 'WORLD', source: 'CBS NEWS' },
    { url: 'https://abcnews.go.com/abcnews/internationalheadlines', category: 'WORLD', source: 'ABC NEWS' },
    
    // --- ECONOMIC / FINANCE ---
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'ECONOMY', source: 'WALL ST JOURNAL' },
    { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', category: 'FINANCE', source: 'CNBC MARKETS' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?id=100727362', category: 'ECONOMY', source: 'FINANCIAL TIMES' },
    { url: 'http://feeds.marketwatch.com/marketwatch/topstories/', category: 'MARKETS', source: 'MARKETWATCH' },
    { url: 'https://www.economist.com/finance-and-economics/rss.xml', category: 'ECONOMY', source: 'THE ECONOMIST' },
    { url: 'http://rss.cnn.com/rss/money_latest.rss', category: 'FINANCE', source: 'CNN BUSINESS' },
    { url: 'https://fortune.com/feed/', category: 'BUSINESS', source: 'FORTUNE' },
    { url: 'https://www.forbes.com/business/feed/', category: 'BUSINESS', source: 'FORBES' },
    { url: 'http://feeds.foxbusiness.com/foxbusiness/latest', category: 'MARKETS', source: 'FOX BUSINESS' },
    { url: 'https://www.entrepreneur.com/latest.rss', category: 'STARTUPS', source: 'ENTREPRENEUR' },

    // --- SCIENCE ---
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'SCIENCE', source: 'NY TIMES' },
    { url: 'https://www.sciencedaily.com/rss/top/science.xml', category: 'SCIENCE', source: 'SCIENCE DAILY' },
    { url: 'https://www.wired.com/feed/category/science/latest/rss', category: 'RESEARCH', source: 'WIRED SCIENCE' },
    { url: 'https://phys.org/rss-feed/', category: 'PHYSICS', source: 'PHYS.ORG' },
    { url: 'https://www.nasa.gov/feeds/iotd-feed/', category: 'SPACE', source: 'NASA' },

    // --- TECH & GAMING ---
    { url: 'https://techcrunch.com/feed/', category: 'TECH', source: 'TECHCRUNCH' },
    { url: 'https://www.theverge.com/rss/index.xml', category: 'TECHNOLOGY', source: 'THE VERGE' },
    { url: 'https://www.polygon.com/rss/index.xml', category: 'GAMING', source: 'POLYGON' },
    { url: 'https://www.espn.com/espn/rss/news', category: 'SPORTS', source: 'ESPN' }
];

let newsLibrary = [];
let currentIndex = 0;
let broadcastTimer; 
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';
const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

// 75 GLOBAL WEATHER CITIES (Including Afghanistan)
const weatherCities = [
    // Afghanistan
    { name: "KABUL", lat: 34.5281, lon: 69.1171 },
    { name: "HERAT", lat: 34.3419, lon: 62.2031 },
    { name: "BALKH", lat: 36.7581, lon: 66.8989 },
    // Asia & Middle East
    { name: "TOKYO", lat: 35.68, lon: 139.69 },
    { name: "DUBAI", lat: 25.20, lon: 55.27 },
    { name: "SINGAPORE", lat: 1.29, lon: 103.85 },
    { name: "BEIJING", lat: 39.9042, lon: 116.4074 },
    { name: "MUMBAI", lat: 19.0760, lon: 72.8777 },
    { name: "SEOUL", lat: 37.5665, lon: 126.9780 },
    { name: "BANGKOK", lat: 13.7563, lon: 100.5018 },
    { name: "JAKARTA", lat: -6.2088, lon: 106.8456 },
    { name: "RIYADH", lat: 24.7136, lon: 46.6753 },
    { name: "TEHRAN", lat: 35.6892, lon: 51.3890 },
    { name: "DOHA", lat: 25.2854, lon: 51.5310 },
    { name: "MANILA", lat: 14.5995, lon: 120.9842 },
    { name: "TAIPEI", lat: 25.0330, lon: 121.5654 },
    { name: "KUALA LUMPUR", lat: 3.1390, lon: 101.6869 },
    // Europe
    { name: "LONDON", lat: 51.50, lon: -0.12 },
    { name: "PARIS", lat: 48.85, lon: 2.35 },
    { name: "BERLIN", lat: 52.52, lon: 13.41 },
    { name: "ROME", lat: 41.9028, lon: 12.4964 },
    { name: "MADRID", lat: 40.4168, lon: -3.7038 },
    { name: "MOSCOW", lat: 55.7558, lon: 37.6173 },
    { name: "KYIV", lat: 50.4501, lon: 30.5234 },
    { name: "ISTANBUL", lat: 41.0082, lon: 28.9784 },
    { name: "AMSTERDAM", lat: 52.3676, lon: 4.9041 },
    { name: "VIENNA", lat: 48.2082, lon: 16.3738 },
    { name: "STOCKHOLM", lat: 59.3293, lon: 18.0686 },
    { name: "ATHENS", lat: 37.9838, lon: 23.7275 },
    { name: "WARSAW", lat: 52.2297, lon: 21.0122 },
    { name: "DUBLIN", lat: 53.3498, lon: -6.2603 },
    { name: "LISBON", lat: 38.7223, lon: -9.1393 },
    { name: "BRUSSELS", lat: 50.8503, lon: 4.3517 },
    { name: "PRAGUE", lat: 50.0755, lon: 14.4378 },
    { name: "OSLO", lat: 59.9139, lon: 10.7522 },
    // North America
    { name: "NEW YORK", lat: 40.71, lon: -74.00 },
    { name: "LOS ANGELES", lat: 34.0522, lon: -118.2437 },
    { name: "CHICAGO", lat: 41.8781, lon: -87.6298 },
    { name: "TORONTO", lat: 43.6510, lon: -79.3470 },
    { name: "VANCOUVER", lat: 49.2827, lon: -123.1207 },
    { name: "MEXICO CITY", lat: 19.4326, lon: -99.1332 },
    { name: "MIAMI", lat: 25.7617, lon: -80.1918 },
    { name: "WASHINGTON DC", lat: 38.9072, lon: -77.0369 },
    { name: "HOUSTON", lat: 29.7604, lon: -95.3698 },
    { name: "MONTREAL", lat: 45.5017, lon: -73.5673 },
    // South America
    { name: "SAO PAULO", lat: -23.5505, lon: -46.6333 },
    { name: "RIO DE JANEIRO", lat: -22.9068, lon: -43.1729 },
    { name: "BUENOS AIRES", lat: -34.6037, lon: -58.3816 },
    { name: "LIMA", lat: -12.0464, lon: -77.0428 },
    { name: "BOGOTA", lat: 4.7110, lon: -74.0721 },
    { name: "SANTIAGO", lat: -33.4489, lon: -70.6693 },
    { name: "CARACAS", lat: 10.4806, lon: -66.9036 },
    // Africa
    { name: "CAIRO", lat: 30.0444, lon: 31.2357 },
    { name: "CAPE TOWN", lat: -33.9249, lon: 18.4241 },
    { name: "JOHANNESBURG", lat: -26.2041, lon: 28.0473 },
    { name: "NAIROBI", lat: -1.2864, lon: 36.8172 },
    { name: "LAGOS", lat: 6.5244, lon: 3.3792 },
    { name: "CASABLANCA", lat: 33.5731, lon: -7.5898 },
    { name: "ALGIERS", lat: 36.7538, lon: 3.0588 },
    { name: "ADDIS ABABA", lat: 9.0320, lon: 38.7482 },
    { name: "ACCRA", lat: 5.6037, lon: -0.1870 },
    // Oceania
    { name: "SYDNEY", lat: -33.8688, lon: 151.2093 },
    { name: "MELBOURNE", lat: -37.8136, lon: 144.9631 },
    { name: "AUCKLAND", lat: -36.8485, lon: 174.7633 },
    { name: "WELLINGTON", lat: -41.2865, lon: 174.7762 },
    { name: "PERTH", lat: -31.9505, lon: 115.8605 }
];
// Shuffle cities so it's a random global mix each time the page loads
weatherCities.sort(() => Math.random() - 0.5);
let weatherIndex = 0;

function getWeatherIcon(code) {
    if (code === 0) return 'fa-sun'; 
    if (code === 1 || code === 2 || code === 3) return 'fa-cloud-sun'; 
    if (code === 45 || code === 48) return 'fa-smog'; 
    if (code >= 51 && code <= 55) return 'fa-cloud-rain'; 
    if (code >= 61 && code <= 65) return 'fa-cloud-showers-heavy'; 
    if (code >= 71 && code <= 77) return 'fa-snowflake'; 
    if (code >= 80 && code <= 82) return 'fa-cloud-showers-water'; 
    if (code >= 95 && code <= 99) return 'fa-cloud-bolt'; 
    return 'fa-cloud'; 
}

function extractImage(item) {
    if (item.thumbnail && item.thumbnail !== "") return item.thumbnail;
    if (item.enclosure && item.enclosure.link) return item.enclosure.link;
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    if (item.description) {
        const match = item.description.match(imgRegex);
        if (match && match[1]) return match[1];
    }
    return defaultImage;
}

// 🟢 PROFESSIONAL FIX: Lock clock to UTC (Global Standard Time)
function startLiveClock() {
    const updateTime = () => {
        const now = new Date();
        // Force the clock to render in UTC time, and add " UTC" text
        document.getElementById('global-clock').innerText = now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false }) + ' UTC';
    };
    updateTime(); 
    setInterval(updateTime, 1000);
}

// 🟢 PROFESSIONAL FIX: Lock date to UTC as well
function updateGlobalDate() {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
    const today = new Date();
    document.getElementById('global-date').innerText = today.toLocaleDateString('en-US', options).toUpperCase();
}

async function fetchAllNews() {
    document.getElementById('news-headline').innerText = "CONNECTING TO GLOBAL FEEDS...";
    
    // SMART BATCHING: Grab 10 random feeds
    const shuffledFeeds = feeds.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    // PARALLEL PROCESSING
    const fetchPromises = shuffledFeeds.map(async (feed) => {
        try {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
            if (!response.ok) return []; 
            const data = await response.json();
            
            if (data.status === 'ok') {
                return data.items.slice(0, 4).map(item => {
                    let imgUrl = extractImage(item);
                    let cleanDesc = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : "";
                    if(cleanDesc.length > 300) cleanDesc = cleanDesc.substring(0, 300) + '...';

                    return {
                        title: item.title,
                        description: cleanDesc || "Detailed report available on the official network site.",
                        image: imgUrl,
                        category: feed.category,
                        source: feed.source
                    };
                });
            }
            return [];
        } catch (error) {
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    let allArticles = results.flat();

    if (allArticles.length > 0) {
        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        currentIndex = 0; 
        setupTicker(newsLibrary);
        startBroadcast();
    } else {
        document.getElementById('news-headline').innerText = "API LIMIT REACHED. RETRYING IN 10 SECONDS...";
        setTimeout(fetchAllNews, 10000); 
    }
}

function setupTicker(articles) {
    const tickerSubset = articles.slice(0, 25);
    const tickerContent = tickerSubset.map(a => `${a.source.toUpperCase()}: ${a.title}`).join(' &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ');
    document.getElementById('ticker-text').innerHTML = `SWEN LIVE ALERTS &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${tickerContent} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; STAND BY FOR UPDATES`;
}

function updateSidebar() {
    const sidebar = document.getElementById('upcoming-list');
    sidebar.innerHTML = ''; 

    let indices = [
        (currentIndex - 1 + newsLibrary.length) % newsLibrary.length,
        currentIndex,                                                
        (currentIndex + 1) % newsLibrary.length,                     
        (currentIndex + 2) % newsLibrary.length,                     
        (currentIndex + 3) % newsLibrary.length,
        (currentIndex + 4) % newsLibrary.length
    ];

    indices.forEach((index, i) => {
        let article = newsLibrary[index];
        let isCurrentClass = (i === 1) ? 'current-active' : '';
        let statusText = (i === 1) ? '<span style="color: #cc0000; font-weight: 900;">[LIVE]</span> ' : '';

        sidebar.innerHTML += `
            <div class="upcoming-item ${isCurrentClass}">
                <div class="up-meta">
                    <span>${statusText}${article.category}</span>
                    <span class="source-name">${article.source}</span>
                </div>
                <div class="up-title">${article.title}</div>
            </div>
        `;
    });
}

function updateScreen() {
    if (newsLibrary.length === 0) return;

    const article = newsLibrary[currentIndex];
    const imgEl = document.getElementById('news-image');
    
    imgEl.style.opacity = 0;
    setTimeout(() => {
        imgEl.src = article.image;
        imgEl.style.opacity = 1; 
    }, 500); 

    document.getElementById('news-category').innerText = article.category;
    document.getElementById('news-source').innerText = article.source;
    document.getElementById('news-headline').innerText = article.title;
    document.getElementById('news-description').innerText = article.description;

    updateSidebar();
}

async function fetchWeather() {
    const city = weatherCities[weatherIndex];
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
        if (!res.ok) throw new Error("Weather unavailable");
        
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode; 
        
        document.getElementById('weather-city').innerText = city.name;
        document.getElementById('weather-temp').innerText = `${temp}°C`;
        
        const iconClass = getWeatherIcon(code);
        const iconEl = document.getElementById('weather-icon');
        iconEl.className = `fa-solid ${iconClass}`;
        
    } catch (e) {
        console.warn("Weather fetch skipped", e);
    }
    
    weatherIndex = (weatherIndex + 1) % weatherCities.length;
}

function autoAdvance() {
    currentIndex = (currentIndex + 1) % newsLibrary.length;
    updateScreen();
}

function startBroadcast() {
    updateScreen();
    if (broadcastTimer) clearInterval(broadcastTimer);
    broadcastTimer = setInterval(autoAdvance, 12000);
}

// INITIALIZE SYSTEM
startLiveClock();
updateGlobalDate();
fetchWeather();
setInterval(fetchWeather, 10000); // Cycles a new city every 10 seconds
fetchAllNews();
