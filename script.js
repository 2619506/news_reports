// Reliable news sources aggregated via rss2json API
const RSS_FEEDS = [
    { name: "BBC News", category: "WORLD", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "The Guardian", category: "GLOBAL", url: "https://www.theguardian.com/world/rss" },
    { name: "TechCrunch", category: "TECH", url: "https://techcrunch.com/feed/" },
    { name: "CNBC", category: "FINANCE", url: "https://search.cnbc.com/rs/search/combinedrender.py?partnerId=2000&keywords=finance&target=all" }
];

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

let newsArticles = [];
let currentIndex = 0;
let cycleTimer = null;
let progressTimer = null;
const CYCLE_INTERVAL = 10000; // 10 seconds per story

// Fallback high-res news placeholders if RSS feed has no image
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'
];

async function loadAllFeeds() {
    let combinedItems = [];

    for (let feed of RSS_FEEDS) {
        try {
            const res = await fetch(RSS2JSON_API + encodeURIComponent(feed.url));
            const data = await res.json();

            if (data.status === 'ok') {
                const parsed = data.items.slice(0, 5).map(item => {
                    // Extract image from thumbnail, enclosure, or regex inside HTML content
                    let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
                    if (!imageUrl && item.description) {
                        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) imageUrl = imgMatch[1];
                    }
                    if (!imageUrl) {
                        imageUrl = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
                    }

                    // Clean raw HTML tags out of snippet for crisp Inshorts summary text
                    let cleanSnippet = item.description ? item.description.replace(/<[^>]*>?/gm, '').trim() : '';
                    if (cleanSnippet.length > 180) {
                        cleanSnippet = cleanSnippet.substring(0, 180) + '...';
                    }

                    return {
                        title: item.title,
                        snippet: cleanSnippet || "Click below to read the full report from source.",
                        link: item.link,
                        source: feed.name,
                        category: feed.category,
                        image: imageUrl,
                        pubDate: new Date(item.pubDate)
                    };
                });
                combinedItems = combinedItems.concat(parsed);
            }
        } catch (err) {
            console.error("Feed error:", err);
        }
    }

    // Shuffle articles for dynamic broadcast feel
    newsArticles = combinedItems.sort(() => Math.random() - 0.5);

    if (newsArticles.length > 0) {
        document.getElementById('feed-count').innerText = `${newsArticles.length} STORIES LIVE`;
        renderSidebarQueue();
        updateTicker();
        selectArticle(0);
    } else {
        document.getElementById('news-title').innerText = "SIGNAL TEMPORARILY LOST";
        document.getElementById('news-snippet').innerText = "Unable to reach satellite RSS relays. Retrying shortly...";
    }
}

function selectArticle(index) {
    currentIndex = index;
    const item = newsArticles[currentIndex];

    // Update main featured display
    document.getElementById('news-image').src = item.image;
    document.getElementById('news-category').innerText = item.category;
    document.getElementById('news-source').innerHTML = `<i class="fa-solid fa-newspaper"></i> ${item.source}`;
    document.getElementById('news-time').innerText = getRelativeTime(item.pubDate);
    document.getElementById('news-title').innerText = item.title;
    document.getElementById('news-snippet').innerText = item.snippet;
    document.getElementById('news-link').href = item.link;

    // Highlight active queue item
    const queueCards = document.querySelectorAll('.queue-item');
    queueCards.forEach((card, idx) => {
        if (idx === currentIndex) {
            card.classList.add('active');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            card.classList.remove('active');
        }
    });

    // Reset progress bar & timer
    resetTimers();
}

function renderSidebarQueue() {
    const list = document.getElementById('queue-list');
    list.innerHTML = '';

    newsArticles.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = `queue-item ${idx === 0 ? 'active' : ''}`;
        div.onclick = () => selectArticle(idx);

        div.innerHTML = `
            <img src="${item.image}" class="queue-thumb" alt="Thumb" />
            <div class="queue-details">
                <span class="queue-source">${item.source} • ${item.category}</span>
                <h4 class="queue-title">${item.title}</h4>
            </div>
        `;
        list.appendChild(div);
    });
}

function updateTicker() {
    const tickerContainer = document.getElementById('ticker-text');
    const tickerText = newsArticles.map(a => `[${a.source}] ${a.title}`).join('   ///   ');
    tickerContainer.innerText = `LIVE BROADCAST: ${tickerText}`;
}

function resetTimers() {
    clearInterval(cycleTimer);
    clearInterval(progressTimer);

    const progressBar = document.getElementById('progress-bar');
    let elapsed = 0;
    progressBar.style.width = '0%';

    progressTimer = setInterval(() => {
        elapsed += 100;
        const pct = (elapsed / CYCLE_INTERVAL) * 100;
        progressBar.style.width = `${pct}%`;
    }, 100);

    cycleTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % newsArticles.length;
        selectArticle(currentIndex);
    }, CYCLE_INTERVAL);
}

function getRelativeTime(date) {
    const diffMins = Math.floor((new Date() - date) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}

// Live Clock
setInterval(() => {
    const now = new Date();
    document.getElementById('live-clock').innerText = now.toUTCString().split(' ')[4] + ' UTC';
}, 1000);

// Boot
loadAllFeeds();
