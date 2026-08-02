const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'WORLD', source: 'BBC' },
    { url: 'https://www.theguardian.com/world/rss', category: 'GLOBAL', source: 'THE GUARDIAN' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'WORLD', source: 'AL JAZEERA' },
    { url: 'https://rss.cnn.com/rss/edition_world.rss', category: 'WORLD', source: 'CNN' },
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'WORLD', source: 'FOX NEWS' },
    { url: 'https://www.cbsnews.com/latest/rss/world', category: 'WORLD', source: 'CBS NEWS' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'ECONOMY', source: 'WALL ST JOURNAL' },
    { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', category: 'FINANCE', source: 'CNBC MARKETS' },
    { url: 'http://feeds.marketwatch.com/marketwatch/topstories/', category: 'MARKETS', source: 'MARKETWATCH' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'SCIENCE', source: 'NY TIMES' },
    { url: 'https://www.wired.com/feed/category/science/latest/rss', category: 'RESEARCH', source: 'WIRED SCIENCE' },
    { url: 'https://www.nasa.gov/feeds/iotd-feed/', category: 'SPACE', source: 'NASA' },
    { url: 'https://techcrunch.com/feed/', category: 'TECH', source: 'TECHCRUNCH' },
    { url: 'https://www.theverge.com/rss/index.xml', category: 'TECHNOLOGY', source: 'THE VERGE' },
    { url: 'https://www.polygon.com/rss/index.xml', category: 'GAMING', source: 'POLYGON' }
];

let newsLibrary = [];
let currentIndex = 0;
let broadcastTimer; 
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';
const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

const weatherCities = [
    { name: "KABUL", lat: 34.5281, lon: 69.1171 }, { name: "HERAT", lat: 34.3419, lon: 62.2031 },
    { name: "TOKYO", lat: 35.68, lon: 139.69 }, { name: "DUBAI", lat: 25.20, lon: 55.27 },
    { name: "LONDON", lat: 51.50, lon: -0.12 }, { name: "PARIS", lat: 48.85, lon: 2.35 },
    { name: "NEW YORK", lat: 40.71, lon: -74.00 }, { name: "SYDNEY", lat: -33.8688, lon: 151.2093 }
];
weatherCities.sort(() => Math.random() - 0.5);
let weatherIndex = 0;

// Safe Update: Prevents script crash if #global-date is missing
function updateGlobalDate() {
    const el = document.getElementById('global-date');
    if (!el) return; 
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
    el.innerText = new Date().toLocaleDateString('en-US', options).toUpperCase();
}

function getWeatherIcon(code) {
    if (code === 0) return 'fa-sun'; 
    if (code >= 1 && code <= 3) return 'fa-cloud-sun'; 
    if (code >= 51 && code <= 65) return 'fa-cloud-rain'; 
    if (code >= 71 && code <= 77) return 'fa-snowflake'; 
    if (code >= 95) return 'fa-cloud-bolt'; 
    return 'fa-cloud'; 
}

function extractImage(item) {
    if (item.thumbnail && item.thumbnail !== "") return item.thumbnail;
    if (item.enclosure && item.enclosure.link) return item.enclosure.link;
    const imgRegex = /<img[^>]+src="([^">]+" )/;
    if (item.description) {
        const match = item.description.match(imgRegex);
        if (match && match[1]) return match[1];
    }
    return defaultImage;
}

// Timeout Fetch Wrapper: Aborts after 5 seconds to prevent hanging
async function fetchWithTimeout(resource, options = { timeout: 5000 }) {
    const { timeout = 5000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// --- DATA FLIP TICKER LOGIC ---
let tickerItems = [];
let currentTickerIndex = 0;
let tickerRotationTimer;

function setupTicker(articles) {
    tickerItems = articles.slice(0, 25).map(a => `${a.source.toUpperCase()}: ${a.title}`);
    if (tickerRotationTimer) clearInterval(tickerRotationTimer);
    currentTickerIndex = 0;
    rotateTicker(); 
    tickerRotationTimer = setInterval(rotateTicker, 5000); 
}

function rotateTicker() {
    if (tickerItems.length === 0) return;
    const tickerEl = document.getElementById('ticker-text');
    if (!tickerEl) return;
    
    tickerEl.classList.add('hide-headline');
    
    setTimeout(() => {
        tickerEl.innerHTML = `BREAKING &nbsp;|&nbsp; ${tickerItems[currentTickerIndex]} &nbsp;|&nbsp; STAND BY`;
        tickerEl.classList.remove('hide-headline');
        currentTickerIndex = (currentTickerIndex + 1) % tickerItems.length;
    }, 300); 
}

// --- MAIN STORY & SIDEBAR LOGIC ---
function updateSidebar() {
    const sidebar = document.getElementById('upcoming-list');
    if (!sidebar) return;
    let sidebarHTML = ''; 
    const len = newsLibrary.length;

    let indices = [
        (currentIndex - 1 + len) % len,
        currentIndex,                                 
        (currentIndex + 1) % len,                     
        (currentIndex + 2) % len,                     
        (currentIndex + 3) % len,
        (currentIndex + 4) % len
    ];

    indices.forEach((index, i) => {
        let article = newsLibrary[index];
        let isCurrentClass = (i === 1) ? 'current-active' : '';
        let statusText = (i === 1) ? '<span style="color: #cc0000; font-weight: 900;">[LIVE]</span> ' : '';

        sidebarHTML += `
            <div class="upcoming-item ${isCurrentClass}">
                <div class="up-meta">
                    <span>${statusText}${article.category}</span>
                    <span class="source-name">${article.source}</span>
                </div>
                <div class="up-title">${article.title}</div>
            </div>
        `;
    });
    sidebar.innerHTML = sidebarHTML; 
}

function updateScreen() {
    if (newsLibrary.length === 0) return;

    const article = newsLibrary[currentIndex];
    const imgEl = document.getElementById('news-image');
    const catEl = document.getElementById('news-category');
    const srcEl = document.getElementById('news-source');
    const headEl = document.getElementById('news-headline');
    const descEl = document.getElementById('news-description');

    if (catEl) catEl.innerText = article.category;
    if (srcEl) srcEl.innerText = article.source;
    if (headEl) headEl.innerText = article.title;
    if (descEl) descEl.innerText = article.description;
    
    updateSidebar();

    if (imgEl) {
        imgEl.style.opacity = 0;
        const virtualImg = new Image();
        virtualImg.onload = () => {
            setTimeout(() => {
                imgEl.src = virtualImg.src;
                imgEl.style.opacity = 1; 
            }, 300); 
        };
        virtualImg.onerror = () => { 
            imgEl.src = defaultImage; 
            imgEl.style.opacity = 1;
        };
        virtualImg.src = article.image; 
    }
}

// --- OPTIMIZED FETCH LOGIC ---
async function fetchAllNews() {
    const headEl = document.getElementById('news-headline');
    if (headEl && newsLibrary.length === 0) {
        headEl.innerText = "CONNECTING TO GLOBAL FEEDS...";
    }
    
    const shuffledFeeds = feeds.sort(() => 0.5 - Math.random()).slice(0, 8);
    let allArticles = [];

    for (const feed of shuffledFeeds) {
        try {
            const response = await fetchWithTimeout(rss2jsonProxy + encodeURIComponent(feed.url), { timeout: 5000 });
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok') {
                    const items = data.items.slice(0, 4).map(item => {
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
                    allArticles.push(...items);
                }
            }
        } catch (error) {
            console.warn(`Skipped feed ${feed.source} due to network timeout or error.`);
        }
    }

    if (allArticles.length > 0) {
        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        currentIndex = 0; 
        setupTicker(newsLibrary);
        startBroadcast();
    } else if (newsLibrary.length === 0) {
        if (headEl) headEl.innerText = "API LIMIT REACHED. RETRYING IN 30 SECONDS...";
        setTimeout(fetchAllNews, 30000); 
    }
}

async function fetchWeather() {
    const city = weatherCities[weatherIndex];
    try {
        const res = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`, { timeout: 4000 });
        if (!res.ok) throw new Error("Weather unavailable");
        
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode; 
        
        const cityEl = document.getElementById('weather-city');
        const tempEl = document.getElementById('weather-temp');
        const iconEl = document.getElementById('weather-icon');

        if (cityEl) cityEl.innerText = city.name;
        if (tempEl) tempEl.innerText = `${temp}°C`;
        if (iconEl) iconEl.className = `fa-solid ${getWeatherIcon(code)}`;
    } catch (e) {
        console.warn("Weather fetch skipped");
    }
    weatherIndex = (weatherIndex + 1) % weatherCities.length;
}

// --- BOOT SEQUENCE ---
function autoAdvance() {
    if (newsLibrary.length === 0) return;
    currentIndex = (currentIndex + 1) % newsLibrary.length;
    updateScreen();
}

function startBroadcast() {
    updateScreen();
    if (broadcastTimer) clearInterval(broadcastTimer);
    broadcastTimer = setInterval(autoAdvance, 15000); 
}

// Initialize
updateGlobalDate();
fetchWeather();
setInterval(fetchWeather, 600000); // Refresh weather every 10 mins
setInterval(fetchAllNews, 1800000); // Fetch new stories every 30 mins
fetchAllNews();
