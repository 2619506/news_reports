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

const weatherCities = [
    { name: "NEW YORK", lat: 40.71, lon: -74.00 },
    { name: "LONDON", lat: 51.50, lon: -0.12 },
    { name: "TOKYO", lat: 35.68, lon: 139.69 },
    { name: "DUBAI", lat: 25.20, lon: 55.27 },
    { name: "PARIS", lat: 48.85, lon: 2.35 },
    { name: "SYDNEY", lat: -33.86, lon: 151.20 },
    { name: "SINGAPORE", lat: 1.29, lon: 103.85 },
    { name: "BERLIN", lat: 52.52, lon: 13.41 }
];
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

// START CLOCK IMMEDIATELY
function startLiveClock() {
    const updateTime = () => {
        const now = new Date();
        document.getElementById('global-clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });
    };
    updateTime(); // Run once instantly
    setInterval(updateTime, 1000);
}

// START DATE IMMEDIATELY
function updateGlobalDate() {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const today = new Date();
    document.getElementById('global-date').innerText = today.toLocaleDateString('en-US', options).toUpperCase();
}

async function fetchAllNews() {
    let allArticles = [];
    document.getElementById('news-headline').innerText = "CONNECTING TO GLOBAL FEEDS...";
    
    for (let feed of feeds) {
        // ERROR ISOLATION: Inner try-catch protects the loop
        try {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
            if (!response.ok) continue; // If network fails, skip to next feed

            const data = await response.json();
            
            if (data.status === 'ok') {
                const articles = data.items.slice(0, 5).map(item => {
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
                allArticles = allArticles.concat(articles);
            }
        } catch (error) {
            console.warn(`Skipping dead feed: ${feed.source}`);
            // Does not crash script, simply moves to next feed
        }
    }

    if (allArticles.length > 0) {
        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        setupTicker(newsLibrary);
        startBroadcast();
    } else {
        document.getElementById('news-headline').innerText = "NETWORK ERROR. RETRYING IN 30 SECONDS...";
        setTimeout(fetchAllNews, 30000);
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

// INITIALIZATION: Start UI immediately, fetch news in background
startLiveClock();
updateGlobalDate();
fetchWeather();
setInterval(fetchWeather, 10000);
fetchAllNews();
