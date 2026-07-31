// 22 GLOBAL SOURCES
const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'WORLD', source: 'BBC NEWS' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'ECONOMY', source: 'WALL ST JOURNAL' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'SCIENCE', source: 'NY TIMES' },
    { url: 'https://www.espn.com/espn/rss/news', category: 'SPORTS', source: 'ESPN' },
    { url: 'https://www.theguardian.com/world/rss', category: 'GLOBAL', source: 'THE GUARDIAN' },
    { url: 'https://techcrunch.com/feed/', category: 'TECH', source: 'TECHCRUNCH' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'WORLD', source: 'AL JAZEERA' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'MARKETS', source: 'CNBC' },
    { url: 'https://rss.cnn.com/rss/edition_world.rss', category: 'WORLD', source: 'CNN' },
    { url: 'https://www.theverge.com/rss/index.xml', category: 'TECHNOLOGY', source: 'THE VERGE' },
    { url: 'https://www.space.com/feeds/all', category: 'SPACE', source: 'SPACE.COM' },
    { url: 'https://www.polygon.com/rss/index.xml', category: 'GAMING', source: 'POLYGON' },
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'WORLD', source: 'FOX NEWS' },
    { url: 'http://feeds.skynews.com/feeds/rss/world.xml', category: 'GLOBAL', source: 'SKY NEWS' },
    { url: 'https://www.cbsnews.com/latest/rss/world', category: 'WORLD', source: 'CBS NEWS' },
    { url: 'https://abcnews.go.com/abcnews/internationalheadlines', category: 'WORLD', source: 'ABC NEWS' },
    { url: 'https://rss.dw.com/rdf/rss-en-world', category: 'EUROPE', source: 'DW NEWS' },
    { url: 'https://www.france24.com/en/rss', category: 'EUROPE', source: 'FRANCE 24' },
    { url: 'https://feeds.npr.org/1004/rss.xml', category: 'GLOBAL', source: 'NPR' },
    { url: 'https://feeds.washingtonpost.com/rss/world', category: 'WORLD', source: 'WASH POST' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?id=100727362', category: 'FINANCE', source: 'FINANCIAL TIMES' },
    { url: 'https://www.yahoo.com/news/rss', category: 'TRENDING', source: 'YAHOO NEWS' }
];

let newsLibrary = [];
let currentIndex = 0;
let broadcastTimer; 
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';
const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

// GLOBAL WEATHER DATA CONFIGURATION
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

async function fetchAllNews() {
    try {
        let allArticles = [];
        for (let feed of feeds) {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
            const data = await response.json();
            
            if (data.status === 'ok') {
                const articles = data.items.slice(0, 6).map(item => {
                    let imgUrl = extractImage(item);
                    let cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();
                    if(cleanDesc.length > 200) cleanDesc = cleanDesc.substring(0, 200) + '...';

                    return {
                        title: item.title,
                        description: cleanDesc || "Full report available on publisher's network.",
                        image: imgUrl,
                        category: feed.category,
                        source: feed.source,
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
    const tickerContent = tickerSubset.map(a => `${a.source.toUpperCase()}: ${a.title}`).join('  ///  ');
    document.getElementById('ticker-text').innerText = `SWEN LIVE ALERTS ///  ${tickerContent}  ///  MORE UPDATES IMMINENT`;
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
        
        let statusText = '';
        if (i === 0) statusText = '<span style="color: #94a3b8;">[PREV]</span> ';
        if (i === 1) statusText = '<span style="color: #00ffcc;">[LIVE]</span> ';

        sidebar.innerHTML += `
            <div class="upcoming-item ${isCurrentClass}">
                <div class="up-meta">${statusText}${article.category} | <span>${article.source}</span></div>
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

    const timeString = article.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('news-time').innerText = timeString;

    updateSidebar();
}

// FETCH LIVE WEATHER DATA
async function fetchWeather() {
    const city = weatherCities[weatherIndex];
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        
        document.getElementById('weather-city').innerText = city.name;
        document.getElementById('weather-temp').innerText = `${temp}°C`;
    } catch (e) {
        console.error("Weather fetch failed", e);
    }
    
    weatherIndex = (weatherIndex + 1) % weatherCities.length;
}

function autoAdvance() {
    currentIndex = (currentIndex + 1) % newsLibrary.length;
    updateScreen();
}

function startBroadcast() {
    updateScreen();
    // Rotate news story every 12 seconds
    broadcastTimer = setInterval(autoAdvance, 12000);
    
    // Rotate weather every 10 seconds (Compliant with free API daily limits)
    fetchWeather();
    setInterval(fetchWeather, 10000);
}

fetchAllNews();
