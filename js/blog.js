'use strict';

const CONFIG = Object.create(null);
CONFIG.repoOwner = "barakadax";
CONFIG.repoName = "blog";
CONFIG.defaultBranch = "Master";
CONFIG.mobileBreakpoint = 768;

const state = Object.create(null);
state.articleMeta = Object.create(null);
state.articleCache = Object.create(null);

const UI = Object.create(null);
UI.sidebar = document.getElementById('blog-sidebar');
UI.toggleBtn = document.getElementById('sidebar-toggle');
UI.backBtn = document.getElementById('back-to-list-btn');
UI.contentInner = document.getElementById('blog-content-inner');
UI.articleList = document.getElementById('article-list');
UI.searchInput = document.getElementById('article-search');
UI.blogContainer = document.getElementById('blog-container');
UI.authorHeader = document.getElementById('author');

const blogController = Object.create(null);

Object.defineProperty(blogController, 'parseMarkdownHeadingArgs', {
    writable: false,
    value: function (arg1, arg2) {
        const isObject = typeof arg1 === 'object' && arg1 !== null;
        return {
            text: isObject ? arg1.text : arg1,
            level: isObject ? arg1.depth : arg2
        };
    }
});

Object.defineProperty(blogController, 'parseMarkdownCodeArgs', {
    writable: false,
    value: function (arg1, arg2) {
        const isObject = typeof arg1 === 'object' && arg1 !== null;
        return {
            code: isObject ? arg1.text : arg1,
            lang: isObject ? arg1.lang : arg2
        };
    }
});

Object.defineProperty(blogController, 'initRenderer', {
    writable: false,
    value: function () {
        try {
            marked.use({
                breaks: true,
                gfm: true,
                renderer: {
                    heading(arg1, arg2) {
                        const { text, level } = blogController.parseMarkdownHeadingArgs(arg1, arg2);
                        const id = typeof text === 'string'
                            ? text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
                            : 'header-' + level;
                        return `<h${level} id="${id}">${text}</h${level}>`;
                    },
                    code(arg1, arg2) {
                        const { code, lang } = blogController.parseMarkdownCodeArgs(arg1, arg2);
                        const copyIcon = `<svg class="copy-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>`;
                        return `<div class="code-block-wrapper">
                        <button class="copy-code-btn" onclick="copyToClipboard(this)" title="Copy to clipboard">${copyIcon}</button>
                        <pre><code class="language-${lang || 'none'}">${code}</code></pre>
                    </div>`;
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
});

Object.defineProperty(blogController, 'collapseSidebarIfMobile', {
    writable: false,
    value: function () {
        if (window.innerWidth <= CONFIG.mobileBreakpoint && UI.sidebar) {
            UI.sidebar.classList.add('collapsed');
        }
    }
});

Object.defineProperty(blogController, 'highlightActiveArticle', {
    writable: false,
    value: function (articleName) {
        document.querySelectorAll('.article-item').forEach(item => {
            item.classList.toggle('active', item.dataset.name === articleName);
        });
    }
});

Object.defineProperty(blogController, 'rebaseRelativeImages', {
    writable: false,
    value: function (container, articleName) {
        container.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('//')) {
                img.src = `https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.defaultBranch}/${articleName}/${src}`;
            }
        });
    }
});

Object.defineProperty(blogController, 'fetchOrThrow', {
    writable: false,
    value: async function (url, options = {}) {
        const response = await fetch(url, options);
        if (response.status === 403 || response.status === 429) {
            throw new Error('RATE_LIMIT');
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response;
    }
});

window.copyToClipboard = async function (btn) {
    const codeBlock = btn.parentElement.querySelector('code');
    if (!codeBlock) return;
    try {
        await navigator.clipboard.writeText(codeBlock.innerText);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="copied-text">Copied!</span>';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
};

Object.defineProperty(blogController, 'renderArticleMetadata', {
    writable: false,
    value: function (articleName) {
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

        const shareBtn = document.getElementById('shareButton');
        if (shareBtn) {
            if (meta.share_text) {
                shareBtn.dataset.shareText = meta.share_text;
            } else {
                delete shareBtn.dataset.shareText;
            }
        }
    }
});

Object.defineProperty(blogController, 'loadArticle', {
    writable: false,
    value: async function (articleName, pushToHistory = true) {
        if (!UI.contentInner) return;

        window.scrollTo({ top: 0, behavior: 'smooth' });
        UI.contentInner.innerHTML = '<div class="loadingText">Loading...</div>';
        UI.backBtn?.classList.remove('visible');

        try {
            let content;
            if (state.articleCache[articleName]) {
                content = state.articleCache[articleName];
            } else {
                const res = await blogController.fetchOrThrow(`https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.defaultBranch}/${articleName}/index.md`);
                content = await res.text();
                state.articleCache[articleName] = content;
            }

            UI.contentInner.innerHTML = marked.parse(content);

            try {
                renderMathInElement(UI.contentInner, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false
                });
            } catch (e) {
                console.warn("KaTeX rendering failed", e);
            }

            blogController.rebaseRelativeImages(UI.contentInner, articleName);
            blogController.renderArticleMetadata(articleName);

            if (pushToHistory && history.pushState) {
                const url = `?article=${encodeURIComponent(articleName)}`;
                if (new URLSearchParams(window.location.search).get('article') !== articleName) {
                    history.pushState({ article: articleName }, "", url);
                }
            }

            blogController.highlightActiveArticle(articleName);
            blogController.collapseSidebarIfMobile();
            UI.backBtn?.classList.add('visible');

        } catch (e) {
            console.error("Error loading article:", e);
            UI.contentInner.innerHTML = "<h1>Error loading article</h1><p>Could not fetch the article. Please try again later.</p>";
        }
    }
});

Object.defineProperty(blogController, 'buildArticleListItem', {
    writable: false,
    value: function (art) {
        state.articleMeta[art.name] = { ...art, tags: [...(art.tags || []), art.name] };
        const li = document.createElement('li');
        li.className = 'article-item';
        li.textContent = art.name;
        li.dataset.name = art.name;
        li.onclick = () => blogController.loadArticle(art.name);
        return li;
    }
});

Object.defineProperty(blogController, 'initArticleList', {
    writable: false,
    value: async function () {
        if (!UI.articleList) return;
        UI.articleList.innerHTML = '<li class="article-item">Loading articles...</li>';

        try {
            const res = await blogController.fetchOrThrow(`https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/git/trees/Master?recursive=1`);
            const data = await res.json();
            const directories = (data.tree || []).filter(item => item.type === "tree" && !item.path.includes('/') && !item.path.includes('conductor'));

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
                UI.articleList.appendChild(blogController.buildArticleListItem(art));
            });

            blogController.filterArticles();
            blogController.loadFromURL();
        } catch (e) {
            if (e.message === 'RATE_LIMIT') {
                UI.articleList.innerHTML = `<li class='article-item' style='color:#ffaa00; padding:10px;'>GitHub rate limit reached. Please try again in an hour.</li>`;
            } else {
                UI.articleList.innerHTML = "<li class='article-item'>Error loading articles</li>";
            }
        }
    }
});

Object.defineProperty(blogController, 'filterArticles', {
    writable: false,
    value: function () {
        if (!UI.searchInput) return;
        const term = UI.searchInput.value.toLowerCase();
        document.querySelectorAll('.article-item').forEach(item => {
            const name = item.dataset.name.toLowerCase();
            const tags = (state.articleMeta[item.dataset.name]?.tags || []).map(t => t.toLowerCase());
            item.style.display = (name.includes(term) || tags.some(t => t.includes(term))) ? '' : 'none';
        });
    }
});

Object.defineProperty(blogController, 'loadFromURL', {
    writable: false,
    value: function () {
        const name = new URLSearchParams(window.location.search).get('article');
        if (name) {
            blogController.loadArticle(name, false);
            if (window.location.hash) {
                setTimeout(() => {
                    const target = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
                    target?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
            }
        }
    }
});

Object.defineProperty(blogController, 'initEvents', {
    writable: false,
    value: function () {
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
                if (artName) blogController.loadArticle(artName);
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

        UI.searchInput?.addEventListener('input', blogController.filterArticles);
        window.addEventListener('popstate', blogController.loadFromURL);
    }
});

blogController.initRenderer();
blogController.initEvents();
blogController.initArticleList();
