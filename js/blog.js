/*
   _____ 	    |￣￣￣￣￣￣￣￣￣￣￣￣|
/~/~    ~\ 	    |                      |
| |   MY  \ 	|  code by Barak Taya  |
\ \  SLEEP \	|                      |
 \ \        \	|＿＿＿＿＿＿＿＿＿＿＿＿|
--\ \       .\''          ||
--==\ \     ,,i!!i,	      ||
    ''"'',,}{,,*/
'use strict';

// --- Configuration & State ---
const CONFIG = {
    repoOwner: "barakadax",
    repoName: "blog",
    defaultBranch: "Master",
    mobileBreakpoint: 768
};

const state = {
    articleMeta: {},
    articleCache: {}
};

// --- DOM Cache ---
const UI = {
    sidebar: document.getElementById('blog-sidebar'),
    toggleBtn: document.getElementById('sidebar-toggle'),
    backBtn: document.getElementById('back-to-list-btn'),
    contentInner: document.getElementById('blog-content-inner'),
    articleList: document.getElementById('article-list'),
    searchInput: document.getElementById('article-search'),
    blogContainer: document.getElementById('blog-container'),
    authorHeader: document.getElementById('author')
};

// --- Marked Configuration ---
function initMarked() {
    try {
        marked.use({
            breaks: true,
            gfm: true,
            renderer: {
                heading(arg1, arg2) {
                    const isObject = typeof arg1 === 'object' && arg1 !== null;
                    const text = isObject ? arg1.text : arg1;
                    const level = isObject ? arg1.depth : arg2;
                    const id = typeof text === 'string'
                        ? text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
                        : 'header-' + level;
                    return `<h${level} id="${id}">${text}</h${level}>`;
                },
                link(href, title, text) {
                    if (typeof href === 'object' && href !== null) ({ href, title, text } = href);
                    const titleAttr = title ? ` title="${title}"` : '';

                    if (href?.startsWith('#')) {
                        return `<a href="${href}"${titleAttr} class="anchor-link">${text}</a>`;
                    }
                    if (href?.includes('article=')) {
                        return `<a href="${href}"${titleAttr} class="internal-blog-link">${text}</a>`;
                    }
                    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
                }
            }
        });
    } catch (e) {
        console.warn("Marked configuration failed", e);
    }
}

// --- Helpers ---
function collapseSidebarOnMobile() {
    if (window.innerWidth <= CONFIG.mobileBreakpoint && UI.sidebar) {
        UI.sidebar.classList.add('collapsed');
    }
}

function setActiveArticleUI(articleName) {
    document.querySelectorAll('.article-item').forEach(item => {
        item.classList.toggle('active', item.dataset.name === articleName);
    });
}

function fixImageLinks(container, articleName) {
    container.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
            img.src = `https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.defaultBranch}/${articleName}/${src}`;
        }
    });
}

// --- Logic ---
async function fetchWithTimeout(url, options = {}) {
    const response = await fetch(url, options);
    if (response.status === 403 || response.status === 429) {
        throw new Error('RATE_LIMIT');
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
}

async function loadArticle(articleName, pushToHistory = true) {
    if (!UI.contentInner) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    UI.contentInner.innerHTML = '<div class="loadingText">Loading...</div>';
    UI.backBtn?.classList.remove('visible');

    try {
        let content;
        if (state.articleCache[articleName]) {
            content = state.articleCache[articleName];
        } else {
            const res = await fetchWithTimeout(`https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.defaultBranch}/${articleName}/index.md`);
            content = await res.text();
            state.articleCache[articleName] = content;
        }

        UI.contentInner.innerHTML = marked.parse(content);
        fixImageLinks(UI.contentInner, articleName);
        renderMetadata(articleName);

        if (pushToHistory && history.pushState) {
            const url = `?article=${encodeURIComponent(articleName)}`;
            if (new URLSearchParams(window.location.search).get('article') !== articleName) {
                history.pushState({ article: articleName }, "", url);
            }
        }

        setActiveArticleUI(articleName);
        collapseSidebarOnMobile();
        UI.backBtn?.classList.add('visible');

    } catch (e) {
        console.error("Error loading article:", e);
        UI.contentInner.innerHTML = "<h1>Error loading article</h1><p>Could not fetch the article. Please try again later.</p>";
    }
}

function renderMetadata(articleName) {
    const h1 = UI.contentInner.querySelector('h1');
    if (!h1) return;

    const meta = state.articleMeta[articleName] || { author: 'Barak Taya', level: 'Unknown', date: null };

    const metaHtml = `
        <div class="article-meta">
            <div class="article-meta-top">
                <span class="article-author">By: ${meta.author}</span>
                <span class="article-date">Published: ${meta.date && meta.date.getTime() !== 0 ? meta.date.toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="article-level-row">Level: ${meta.level}</div>
        </div>
    `;
    h1.insertAdjacentHTML('afterend', metaHtml);

    if (UI.authorHeader) UI.authorHeader.textContent = meta.author;
}

async function initArticleList() {
    if (!UI.articleList) return;
    UI.articleList.innerHTML = '<li class="article-item">Loading articles...</li>';

    try {
        const res = await fetchWithTimeout(`https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/git/trees/Master?recursive=1`);
        const data = await res.json();
        const directories = (data.tree || []).filter(item => item.type === "tree" && !item.path.includes('/'));

        const articles = await Promise.all(directories.map(async (dir) => {
            try {
                const metaRes = await fetch(`https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.defaultBranch}/${dir.path}/metadata.json`);
                if (metaRes.ok) {
                    const meta = await metaRes.json();
                    return { name: dir.path, ...meta, date: new Date(meta.date) };
                }
            } catch (e) { }
            return { name: dir.path, author: 'Barak Taya', date: new Date(0), level: 'Beginner', tags: [] };
        }));

        articles.sort((a, b) => b.date - a.date || a.name.localeCompare(b.name));

        UI.articleList.innerHTML = "";
        articles.forEach(art => {
            state.articleMeta[art.name] = { ...art, tags: [...(art.tags || []), art.name] };
            const li = document.createElement('li');
            li.className = 'article-item';
            li.textContent = art.name;
            li.dataset.name = art.name;
            li.onclick = () => loadArticle(art.name);
            UI.articleList.appendChild(li);
        });

        filterArticles();
        handleInitialURL();
    } catch (e) {
        if (e.message === 'RATE_LIMIT') {
            UI.articleList.innerHTML = `<li class='article-item' style='color:#ffaa00; padding:10px;'>GitHub rate limit reached. Please try again in an hour.</li>`;
        } else {
            UI.articleList.innerHTML = "<li class='article-item'>Error loading articles</li>";
        }
    }
}

function filterArticles() {
    if (!UI.searchInput) return;
    const term = UI.searchInput.value.toLowerCase();
    document.querySelectorAll('.article-item').forEach(item => {
        const name = item.dataset.name.toLowerCase();
        const tags = (state.articleMeta[item.dataset.name]?.tags || []).map(t => t.toLowerCase());
        item.style.display = (name.includes(term) || tags.some(t => t.includes(term))) ? '' : 'none';
    });
}

function handleInitialURL() {
    const name = new URLSearchParams(window.location.search).get('article');
    if (name) {
        loadArticle(name, false);
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
                target?.scrollIntoView({ behavior: 'smooth' });
            }, 200);
        }
    }
}

// --- Events ---
function initEvents() {
    UI.toggleBtn?.addEventListener('click', () => UI.sidebar?.classList.toggle('collapsed'));

    UI.backBtn?.addEventListener('click', () => {
        UI.blogContainer?.scrollIntoView({ behavior: 'smooth' });
        UI.sidebar?.classList.remove('collapsed');
    });

    UI.contentInner?.addEventListener('click', (e) => {
        const internalLink = e.target.closest('a.internal-blog-link');
        const anchorLink = e.target.closest('a.anchor-link');

        if (internalLink) {
            e.preventDefault();
            const artName = new URL(internalLink.getAttribute('href'), window.location.href).searchParams.get('article');
            if (artName) loadArticle(artName);
        } else if (anchorLink) {
            e.preventDefault();
            const id = anchorLink.getAttribute('href').substring(1);
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, null, `#${id}`);
            }
        }
    });

    UI.searchInput?.addEventListener('input', filterArticles);
    window.addEventListener('popstate', handleInitialURL);
}

// --- Start ---
initMarked();
initEvents();
initArticleList();
