// Vastly expanded feeds to create a true aggregator
const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'WORLD', source: 'BBC NEWS' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'ECONOMY', source: 'WALL ST JOURNAL' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'SCIENCE', source: 'NY TIMES' },
    { url: 'https://www.espn.com/espn/rss/news', category: 'SPORTS', source: 'ESPN' },
    { url: 'https://www.theguardian.com/world/rss', category: 'GLOBAL', source: 'THE GUARDIAN' },
    { url: 'https://techcrunch.com/feed/', category: 'TECH', source: 'TECHCRUNCH' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'WORLD', source: 'AL JAZEERA' }
];

let newsLibrary = [];
let currentIndex = 0;
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';

const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

async function fetchAllNews() {
    try {
        let allArticles = [];

        for (let feed of feeds) {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
            const data = await response.json();
            
            if (data.status === 'ok') {
                const articles = data.items.slice(0, 5).map(item => {
                    // Extract image safely
                    let imgUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || defaultImage;
                    
                    // Clean description text
                    let cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();
                    if(cleanDesc.length > 250) cleanDesc = cleanDesc.substring(0, 250) + '...';

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

        // Shuffle array so feeds intermix beautifully
        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        
        setupTicker(newsLibrary);
        startBroadcast();

    } catch (error) {
        console.error("Signal lost:", error);
        document.getElementById('news-headline').innerText = "SIGNAL LOST. RETRYING...";
    }
}

function setupTicker(articles) {
    const tickerContent = articles.map(a => `${a.source.toUpperCase()}: ${a.title}`).join('  ///  ');
    document.getElementById('ticker-text').innerText = `LIVE GLOBAL UPDATES ///  ${tickerContent}`;
}

function updateSidebar() {
    const sidebar = document.getElementById('upcoming-list');
    sidebar.innerHTML = ''; 

    for(let i = 1; i <= 4; i++) {
        let nextIndex = (currentIndex + i) % newsLibrary.length;
        let article = newsLibrary[nextIndex];
        
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
        imgEl.style.opacity = 1; // Full brightness now
    }, 500); 

    // Update main text elements
    document.getElementById('news-category').innerText = article.category;
    document.getElementById('news-source').innerText = article.source;
    document.getElementById('news-headline').innerText = article.title;
    document.getElementById('news-description').innerText = article.description;
    
    // Update Corner Citation
    document.getElementById('source-citation').innerText = `Verified data sourced in real-time from: ${article.source}`;

    const timeString = article.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('news-time').innerText = timeString;

    updateSidebar();

    currentIndex = (currentIndex + 1) % newsLibrary.length;
}

function startBroadcast() {
    updateScreen();
    // Keeps a 12 second rotation for the main image
    setInterval(updateScreen, 12000);
}

fetchAllNews();
