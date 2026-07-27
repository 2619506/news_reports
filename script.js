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
    { url: 'https://www.polygon.com/rss/index.xml', category: 'GAMING', source: 'POLYGON' }
];

let newsLibrary = [];
let currentIndex = 0;
let broadcastTimer; // Used to manage auto-playing and pausing
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';
const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

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
                const articles = data.items.slice(0, 8).map(item => {
                    let imgUrl = extractImage(item);
                    let cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();
                    if(cleanDesc.length > 250) cleanDesc = cleanDesc.substring(0, 250) + '...';

                    return {
                        title: item.title,
                        description: cleanDesc || "Full report available on publisher's network.",
                        image: imgUrl,
                        category: feed.category,
                        source: feed.source,
                        date: new Date(item.pubDate),
                        link: item.link // Captures the exact URL to the full news article
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
    const tickerSubset = articles.slice(0, 15);
    const tickerContent = tickerSubset.map(a => `${a.source.toUpperCase()}: ${a.title}`).join('  ///  ');
    document.getElementById('ticker-text').innerText = `LIVE GLOBAL UPDATES ///  ${tickerContent}  ///  PLEASE STAND BY FOR MORE UPDATES`;
}

// Builds the sidebar showing previous, current, and next items
function updateSidebar() {
    const sidebar = document.getElementById('upcoming-list');
    sidebar.innerHTML = ''; 

    // Array containing: [Prev, Current, Next1, Next2, Next3, Next4]
    let indices = [
        (currentIndex - 1 + newsLibrary.length) % newsLibrary.length, // PREV
        currentIndex,                                                 // CURRENT
        (currentIndex + 1) % newsLibrary.length,                      // NEXT 1
        (currentIndex + 2) % newsLibrary.length,                      // NEXT 2
        (currentIndex + 3) % newsLibrary.length,                      // NEXT 3
        (currentIndex + 4) % newsLibrary.length                       // NEXT 4
    ];

    indices.forEach((index, i) => {
        let article = newsLibrary[index];
        let isCurrentClass = (i === 1) ? 'current-active' : '';
        
        let statusText = '';
        if (i === 0) statusText = '<span style="color: #94a3b8;">[PREV]</span> ';
        if (i === 1) statusText = '<span style="color: #00ffcc;">[LIVE]</span> ';

        // Notice the onclick event triggers the jump function!
        sidebar.innerHTML += `
            <div class="upcoming-item ${isCurrentClass}" onclick="jumpToArticle(${index})">
                <div class="up-meta">${statusText}${article.category} | <span>${article.source}</span></div>
                <div class="up-title">${article.title}</div>
            </div>
        `;
    });
}

// Function to update the main screen elements
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

// Controls the automatic rotation
function autoAdvance() {
    currentIndex = (currentIndex + 1) % newsLibrary.length;
    updateScreen();
}

// Called when a user manually clicks an item in the sidebar
window.jumpToArticle = function(index) {
    currentIndex = index;
    updateScreen();
    // Resets the timer so it doesn't instantly jump away while you're reading
    clearInterval(broadcastTimer);
    broadcastTimer = setInterval(autoAdvance, 12000);
}

// Opens the full article in a new tab when the headline is clicked
window.openFullArticle = function() {
    if (newsLibrary.length === 0) return;
    const article = newsLibrary[currentIndex];
    if (article.link) {
        window.open(article.link, '_blank');
    }
}

function startBroadcast() {
    updateScreen();
    broadcastTimer = setInterval(autoAdvance, 12000);
}

fetchAllNews();
