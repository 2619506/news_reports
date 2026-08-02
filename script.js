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

function updateGlobalDate() {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
    document.getElementById('global-date').innerText = new Date().toLocaleDateString('en-US', options).toUpperCase();
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
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    if (item.description) {
        const match = item.description.match(imgRegex);
        if (match && match[1]) return match[1];
    }
    return defaultImage;
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
    
    imgEl.style.opacity = 0;

    const virtualImg = new Image();
    virtualImg.onload = () => {
        setTimeout(() => {
            imgEl.src = virtualImg.src;
            document.getElementById('news-category').innerText = article.category;
            document.getElementById('news-source').innerText = article.source;
            document.getElementById('news-headline').innerText = article.title;
            document.getElementById('news-description').innerText = article.description;
            
            updateSidebar(); 
            imgEl.style.opacity = 1; 
        }, 500); 
    };

    virtualImg.onerror = () => { virtualImg.src = defaultImage; };
    virtualImg.src = article.image; 
}

// --- OPTIMIZED FETCH LOGIC (Crash Prevention) ---
async function fetchAllNews() {
    document.getElementById('news-headline').innerText = "CONNECTING TO GLOBAL FEEDS...";
    
    // Grab 8 random feeds to keep memory low
    const shuffledFeeds = feeds.sort(() => 0.5 - Math.random()).slice(0, 8);
    let allArticles = [];

    // CRITICAL FIX: Fetch sequentially to prevent CPU spike and "Page Unresponsive"
    for (const feed of shuffledFeeds) {
        try {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
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
            console.warn(`Skipped feed ${feed.source} due to network timeout.`);
        }
    }

    if (allArticles.length > 0) {
        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        currentIndex = 0; 
        setupTicker(newsLibrary);
        startBroadcast();
    } else {
        document.getElementById('news-headline').innerText = "API LIMIT REACHED. RETRYING IN 30 SECONDS...";
        setTimeout(fetchAllNews, 30000); 
    }
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
        document.getElementById('weather-icon').className = `fa-solid ${getWeatherIcon(code)}`;
    } catch (e) {
        console.warn("Weather fetch skipped");
    }
    weatherIndex = (weatherIndex + 1) % weatherCities.length;
}

// --- BOOT SEQUENCE ---
function autoAdvance() {
    currentIndex = (currentIndex + 1) % newsLibrary.length;
    updateScreen();
}

function startBroadcast() {
    updateScreen();
    if (broadcastTimer) clearInterval(broadcastTimer);
    broadcastTimer = setInterval(autoAdvance, 15000); // 15 seconds allows for smooth reading
}

// Initialize
updateGlobalDate();
fetchWeather();
setInterval(fetchWeather, 600000); 
fetchAllNews();
