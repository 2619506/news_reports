// Define the RSS feeds we want to pull from
const feeds = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'WORLD NEWS' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'ECONOMY' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'SCIENCE' },
    { url: 'https://www.espn.com/espn/rss/news', category: 'SPORTS' }
];

// Array to hold all the processed news items
let newsLibrary = [];
let currentIndex = 0;

// The free proxy that converts complicated RSS XML into simple JSON
const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';

async function fetchAllNews() {
    try {
        let allArticles = [];

        // Loop through our feeds and fetch data
        for (let feed of feeds) {
            const response = await fetch(rss2jsonProxy + encodeURIComponent(feed.url));
            const data = await response.json();
            
            if (data.status === 'ok') {
                // Grab the top 5 articles from each category
                const articles = data.items.slice(0, 5).map(item => ({
                    title: item.title,
                    category: feed.category,
                    date: new Date(item.pubDate)
                }));
                allArticles = allArticles.concat(articles);
            }
        }

        // Shuffle the array so the broadcast mixes topics naturally
        newsLibrary = allArticles.sort(() => Math.random() - 0.5);
        
        // Setup the ticker tape at the bottom
        setupTicker(newsLibrary);

        // Start the broadcast loop
        startBroadcast();

    } catch (error) {
        console.error("Broadcast interruption:", error);
        document.getElementById('news-headline').innerText = "BROADCAST SIGNAL LOST. RETRYING...";
    }
}

function setupTicker(articles) {
    // Take a bunch of headlines, join them with // dividers for the scrolling ticker
    const tickerContent = articles.map(a => a.title).join('  //  ');
    document.getElementById('ticker-text').innerText = `LIVE UPDATES: ${tickerContent}`;
}

function updateScreen() {
    if (newsLibrary.length === 0) return;

    // Get current article
    const article = newsLibrary[currentIndex];

    // Update DOM elements
    document.getElementById('news-category').innerText = article.category;
    document.getElementById('news-headline').innerText = article.title;
    
    // Format time (e.g. 14:30)
    const timeString = article.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('news-time').innerText = timeString;

    // Move to next article, loop back to zero if at the end
    currentIndex = (currentIndex + 1) % newsLibrary.length;
}

function startBroadcast() {
    // Show the first article immediately
    updateScreen();
    
    // Cycle to a new article every 10 seconds (10000 milliseconds)
    setInterval(updateScreen, 10000);
}

// Boot up the system when the page loads
fetchAllNews();
