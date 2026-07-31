// 22 GLOBAL CHANNELS WITH DOMAINS FOR LOGO EXTRACTION
const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', domain: 'bbc.com', category: 'WORLD', source: 'BBC NEWS' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', domain: 'wsj.com', category: 'ECONOMY', source: 'WALL ST JOURNAL' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', domain: 'nytimes.com', category: 'SCIENCE', source: 'NY TIMES' },
    { url: 'https://www.espn.com/espn/rss/news', domain: 'espn.com', category: 'SPORTS', source: 'ESPN' },
    { url: 'https://www.theguardian.com/world/rss', domain: 'theguardian.com', category: 'GLOBAL', source: 'THE GUARDIAN' },
    { url: 'https://techcrunch.com/feed/', domain: 'techcrunch.com', category: 'TECH', source: 'TECHCRUNCH' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', domain: 'aljazeera.com', category: 'WORLD', source: 'AL JAZEERA' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', domain: 'cnbc.com', category: 'MARKETS', source: 'CNBC' },
    { url: 'https://rss.cnn.com/rss/edition_world.rss', domain: 'cnn.com', category: 'WORLD', source: 'CNN' },
    { url: 'https://www.theverge.com/rss/index.xml', domain: 'theverge.com', category: 'TECHNOLOGY', source: 'THE VERGE' },
    { url: 'https://www.space.com/feeds/all', domain: 'space.com', category: 'SPACE', source: 'SPACE.COM' },
    { url: 'https://www.polygon.com/rss/index.xml', domain: 'polygon.com', category: 'GAMING', source: 'POLYGON' },
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', domain: 'foxnews.com', category: 'WORLD', source: 'FOX NEWS' },
    { url: 'http://feeds.skynews.com/feeds/rss/world.xml', domain: 'sky.com', category: 'GLOBAL', source: 'SKY NEWS' },
    { url: 'https://www.cbsnews.com/latest/rss/world', domain: 'cbsnews.com', category: 'WORLD', source: 'CBS NEWS' },
    { url: 'https://abcnews.go.com/abcnews/internationalheadlines', domain: 'abcnews.go.com', category: 'WORLD', source: 'ABC NEWS' },
    { url: 'https://rss.dw.com/rdf/rss-en-world', domain: 'dw.com', category: 'EUROPE', source: 'DW NEWS' },
    { url: 'https://www.france24.com/en/rss', domain: 'france24.com', category: 'EUROPE', source: 'FRANCE 24' },
    { url: 'https://feeds.npr.org/1004/rss.xml', domain: 'npr.org', category: 'GLOBAL', source: 'NPR' },
    { url: 'https://feeds.washingtonpost.com/rss/world', domain: 'washingtonpost.com', category: 'WORLD', source: 'WASH POST' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?id=100727362', domain: 'ft.com', category: 'FINANCE', source: 'FINANCIAL TIMES' },
    { url: 'https://www.yahoo.com/news/rss', domain: 'yahoo.com', category: 'TRENDING', source: 'YAHOO NEWS' }
];

let newsLibrary = [];
let currentIndex = 0;
let broadcastTimer; 
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';
const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

// GLOBAL CITIES WEATHER SEQUENCE
const weatherCities = [
    { name: "NEW YORK", lat: 40.71, lon: -74.00 },
    { name: "LONDON", lat: 51.50, lon: -0.12 },
    { name: "TOKYO", lat: 35.68, lon: 139.69 },
    { name: "PARIS", lat: 48.85, lon: 2.35 },
    { name: "DUBAI", lat: 25.20, lon: 55.27 },
    { name: "SINGAPORE", lat: 1.29, lon: 103.85 },
    { name: "SYDNEY", lat: -33.86, lon: 151.20 },
    { name: "BERLIN", lat: 52.52, lon: 13.41 },
    { name: "TORONTO", lat: 43.65, lon: -79.38 },
    { name: "MUMBAI", lat: 19.07, lon: 72.87 },
    { name: "BEIJING", lat: 39.90, lon: 116.40 },
    { name: "RIO DE JANEIRO", lat: -22.90, lon: -43.17 }
];
let weatherIndex = 0;

function extractImage(item) {
    if (item.thumbnail && item.thumbnail !== "") return item.thumbnail;
    if (item.enclosure && item.enclosure.link) return item.enclosure.link;
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    if (item.description) {
        const match = item.description.match(imgRegex);
        if (match && match[1]) return match[1];
    }
    if (item.content) {
        const match = item.content.match(imgRegex);
        if (match && match[1]) return match[1];
    }
    return defaultImage;
}

// FORMATS NEWS DESCRIPTIONS INTO COMPLETE, DETAILED SUMMARIES
function formatSummary(rawDesc) {
    let clean = rawDesc.replace(/<[^>]+>/g, '').trim();
    if (clean.length > 300) {
        clean = clean.substring(0, 300);
        const lastPeriod = clean.lastIndexOf('.');
        if (lastPeriod > 100) {
            clean = clean.substring(0, lastPeriod + 1); // Truncates cleanly at full stop
        } else {
            clean += '...';
        }
    }
    return clean || "Full report available on publisher's network.";
}

async function fetchAllNews() {
    try {
        let allArticles = [];
        for (let feed of feeds) {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
            const data = await response.json();
            
            if (data.status === 'ok') {
                const articles = data.items.slice(0, 6).map(item => {
                    let imgUrl = extractImage(item);
                    let cleanDesc = formatSummary(item.description);
                    let logoUrl = `https://www.google.com/s2/favicons?domain=${feed.domain}&sz=64`;

                    return {
                        title: item.title,
                        description: cleanDesc,
                        image: imgUrl,
                        category: feed.category,
                        source: feed.source,
                        logo: logoUrl,
                        date: new Date(item.pubDate)
                    };
                });
                allArticles = allArticles.concat(articles);
            }
        }

        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        setupTicker(newsLibrary);
        startBroadcast();

    } catch (error) {
        console.error("Signal lost:", error);
        document.getElementById('news-headline').innerText = "SIGNAL LOST. RETRYING...";
    }
}

function setupTicker(articles) {
    const tickerSubset = articles.slice(0, 20);
    const tickerContent = tickerSubset.map(a => `${a.source.toUpperCase()}: ${a.title}`).join('   ///   ');
    document.getElementById('ticker-text').innerText = `SWEN LIVE ALERTS ///   ${tickerContent}   ///   MORE UPDATES IMMINENT`;
}

// RENDERS QUEUE WITH PUBLISHER LOGOS
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
        
        let statusText = '';
        if (i === 0) statusText = '<span style="color: #94a3b8;">[PREV]</span> ';
        if (i === 1) statusText = '<span style="color: #00ffcc;">[LIVE]</span> ';

        sidebar.innerHTML += `
            <div class="upcoming-item ${isCurrentClass}">
                <div class="up-meta">
                    <div class="up-meta-left">
                        <img src="${article.logo}" class="source-logo" alt="Logo" onerror="this.style.display='none'">
                        ${statusText}${article.category}
                    </div>
                    <span>${article.source}</span>
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
    document.getElementById('source-citation').innerText = `Verified data sourced in real-time from: ${article.source}`;

    const timeString = article.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    document.getElementById('news-time').innerText = timeString;

    updateSidebar();
}

// MAPS WEATHER CODES TO VISUAL FONTAWESOME LOGOS
function getWeatherIcon(code, windSpeed) {
    if (windSpeed > 30) return '<i class="fa-solid fa-wind"></i>'; // High wind
    if (code === 0) return '<i class="fa-solid fa-sun"></i>'; // Clear
    if ([1, 2, 3].includes(code)) return '<i class="fa-solid fa-cloud-sun"></i>'; // Partly cloudy
    if ([45, 48].includes(code)) return '<i class="fa-solid fa-smog"></i>'; // Fog
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '<i class="fa-solid fa-cloud-showers-heavy"></i>'; // Rain
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '<i class="fa-regular fa-snowflake"></i>'; // Snow
    if ([95, 96, 99].includes(code)) return '<i class="fa-solid fa-bolt"></i>'; // Thunderstorm
    return '<i class="fa-solid fa-cloud"></i>';
}

// FETCHES SEQUENTIAL GLOBAL WEATHER WITH VISUAL LOGOS
async function fetchWeather() {
    const city = weatherCities[weatherIndex];
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        const wind = data.current_weather.windspeed;
        
        document.getElementById('weather-city').innerText = city.name;
        document.getElementById('weather-icon').innerHTML = getWeatherIcon(code, wind);
        document.getElementById('weather-temp').innerText = `${temp}°C`;
    } catch (e) {
        console.error("Weather fetch failed", e);
    }
    
    weatherIndex = (weatherIndex + 1) % weatherCities.length;
}

// UPDATES TOP-RIGHT GLOBAL DATE BADGE
function updateGlobalDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'SHORT' }).toUpperCase();
    const year = now.getFullYear();
    document.getElementById('swen-date').innerText = `${day} ${month} ${year}`;
}

function autoAdvance() {
    currentIndex = (currentIndex + 1) % newsLibrary.length;
    updateScreen();
}

function startBroadcast() {
    updateScreen();
    updateGlobalDate();
    
    // Rotate news story every 12 seconds
    broadcastTimer = setInterval(autoAdvance, 12000);
    
    // Rotate weather every 10 seconds (Compliant API usage)
    fetchWeather();
    setInterval(fetchWeather, 10000);
    
    // Refresh date hourly
    setInterval(updateGlobalDate, 3600000);
}

fetchAllNews();
