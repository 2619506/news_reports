// Upgraded feeds with Source Names attached
const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'WORLD', source: 'BBC NEWS' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'ECONOMY', source: 'WALL ST JOURNAL' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'SCIENCE', source: 'NY TIMES' },
    { url: 'https://www.espn.com/espn/rss/news', category: 'SPORTS', source: 'ESPN' }
];

let newsLibrary = [];
let currentIndex = 0;
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Fallback image if a news source doesn't provide one
const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

async function fetchAllNews() {
    try {
        let allArticles = [];

        for (let feed of feeds) {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
            const data = await response.json();
            
            if (data.status === 'ok') {
                const articles = data.items.slice(0, 5).map(item => {
                    // Extract image from RSS data
                    let imgUrl = item.thumbnail || item.enclosure.link || defaultImage;
                    
                    // Clean description text (strip HTML tags)
                    let cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();
                    if(cleanDesc.length > 250) cleanDesc = cleanDesc.substring(0, 250) + '...';

                    return {
                        title: item.title,
                        description: cleanDesc || "No description provided by source.",
                        image: imgUrl,
                        category: feed.category,
                        source: feed.source,
                        date: new Date(item.pubDate)
                    };
                });
                allArticles = allArticles.concat(articles);
            }
        }

        // Shuffle array for variety
        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        
        setupTicker(newsLibrary);
        startBroadcast();

    } catch (error) {
        console.error("Signal lost:", error);
        document.getElementById('news-headline').innerText = "SIGNAL LOST. RETRYING...";
    }
}

function setupTicker(articles) {
    // Join headlines for the slow bottom ticker
    const tickerContent = articles.map(a => `${a.source.toUpperCase()}: ${a.title}`).join('  ///  ');
    document.getElementById('ticker-text').innerText = `LIVE UPDATES ///  ${tickerContent}`;
}

function updateSidebar() {
    const sidebar = document.getElementById('upcoming-list');
    sidebar.innerHTML = ''; // clear current

    // Show the next 4 articles in the queue
    for(let i = 1; i <= 4; i++) {
        let nextIndex = (currentIndex + i) % newsLibrary.length;
        let article = newsLibrary[nextIndex];
        
        // Highlight the immediate next article
        let isNextClass = (i === 1) ? 'next-up' : '';

        sidebar.innerHTML += `
            <div class="upcoming-item ${isNextClass}">
                <div class="up-meta">${article.category} | <span>${article.source}</span></div>
                <div class="up-title">${article.title}</div>
            </div>
        `;
    }
}

function updateScreen() {
    if (newsLibrary.length === 0) return;

    const article = newsLibrary[currentIndex];

    // Fade effect for image transition
    const imgEl = document.getElementById('news-image');
    imgEl.style.opacity = 0;
    
    setTimeout(() => {
        imgEl.src = article.image;
        imgEl.style.opacity = 0.6;
    }, 300); // match CSS transition time

    // Update main text elements
    document.getElementById('news-category').innerText = article.category;
    document.getElementById('news-source').innerText = article.source;
    document.getElementById('news-headline').innerText = article.title;
    document.getElementById('news-description').innerText = article.description;
    
    const timeString = article.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('news-time').innerText = timeString;

    // Update the sidebar queue
    updateSidebar();

    // Move to next article
    currentIndex = (currentIndex + 1) % newsLibrary.length;
}

function startBroadcast() {
    updateScreen();
    // Rotates every 12 seconds
    setInterval(updateScreen, 12000);
}

fetchAllNews();
