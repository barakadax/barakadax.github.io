'use strict';

const CONFIG = Object.create(null);
CONFIG.repoOwner = "barakadax";
CONFIG.repoName = "blog";
CONFIG.defaultBranch = "Master";
CONFIG.mobileBreakpoint = 768;

const state = Object.create(null);
state.articleMeta = Object.create(null);
state.articleCache = Object.create(null);
state.articles = [];
state.activeArticleName = null;

const UI = Object.create(null);
UI.contentInner = document.getElementById('blog-content-inner');
UI.blogContainer = document.getElementById('blog-container');
UI.authorHeader = document.getElementById('author');
UI.paletteBackdrop = document.getElementById('command-palette-backdrop');
UI.paletteModal = document.getElementById('command-palette');
UI.paletteInput = document.getElementById('palette-search-input');
UI.paletteList = document.getElementById('palette-results-list');
UI.paletteCloseBtn = document.getElementById('palette-close-btn');
UI.paletteHudBtn = document.getElementById('palette-hud-btn');
UI.backToTopBtn = document.getElementById('back-to-top-btn');

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
                            ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-').replace(/^-+|-+$/g, '')
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

Object.defineProperty(blogController, 'highlightActiveArticle', {
    writable: false,
    value: function (articleName) {
        state.activeArticleName = articleName;
        document.querySelectorAll('.palette-item').forEach(item => {
            const isActive = item.dataset.name === articleName;
            item.classList.toggle('active-article', isActive);
            item.classList.toggle('selected', isActive);
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

        const meta = state.articleMeta[articleName] || { author: 'Barak Taya', level: 'Unknown', date: null, tags: [] };
        const dateStr = meta.date && meta.date.getTime() !== 0 ? meta.date.toISOString().split('T')[0] : 'N/A';
        const levelClass = meta.level ? `level-${meta.level.toLowerCase()}` : '';

        const metaHtml = `
        <div class="article-meta">
            <div class="article-meta-top">
                <span class="article-author">By: ${meta.author}</span>
                <span class="article-date">Published: ${dateStr}</span>
            </div>
            <div class="article-level-row">Level: <span class="level-badge ${levelClass}">${meta.level || 'Unknown'}</span></div>
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
        UI.contentInner.innerHTML = `
<div class="skeletonArticle" aria-busy="true" aria-label="Loading article">
  <div class="skeletonArticle__h1 skeleton"></div>
  <div class="skeletonArticle__meta skeleton"></div>
  <div class="skeletonArticle__para skeleton"></div>
  <div class="skeletonArticle__para skeleton"></div>
  <div class="skeletonArticle__para skeletonArticle__para--short skeleton"></div>
  <div class="skeletonArticle__para skeleton"></div>
  <div class="skeletonArticle__para skeleton"></div>
  <div class="skeletonArticle__para skeletonArticle__para--short skeleton"></div>
  <div class="skeletonArticle__para skeleton"></div>
  <div class="skeletonArticle__para skeleton"></div>
</div>`;

        try {
            let content;
            if (state.articleCache[articleName]) {
                content = state.articleCache[articleName];
            } else {
                const res = await blogController.fetchOrThrow(`https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.defaultBranch}/${articleName}/index.md`);
                content = await res.text();
                state.articleCache[articleName] = content;
            }

            const processedContent = content.replace(/<!--([\s\S]*?)-->/g, '');

            UI.contentInner.innerHTML = marked.parse(processedContent);

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

            UI.contentInner.querySelectorAll('p').forEach(p => {
                const images = p.querySelectorAll('img');
                if (images.length >= 2) {
                    const carousel = document.createElement('div');
                    carousel.className = 'main-carousel';
                    images.forEach(img => {
                        const cell = document.createElement('div');
                        cell.className = 'carousel-cell';
                        cell.appendChild(img);
                        carousel.appendChild(cell);
                    });

                    const hasText = p.textContent.trim().length > 0;
                    if (hasText) {
                        while (p.lastChild) {
                            const last = p.lastChild;
                            if (last.nodeType === 3 && !last.textContent.trim()) {
                                p.removeChild(last);
                            } else if (last.nodeName === 'BR') {
                                p.removeChild(last);
                            } else {
                                break;
                            }
                        }
                        p.after(carousel);
                    } else {
                        p.replaceWith(carousel);
                    }

                    new Flickity(carousel, {
                        wrapAround: true,
                        pageDots: false,
                        prevNextButtons: false,
                        adaptiveHeight: true,
                        selectedAttraction: 0.2,
                        friction: 0.8,
                        accessibility: true
                    });
                }
            });

            blogController.renderArticleMetadata(articleName);

            if (pushToHistory && history.pushState) {
                const url = `?article=${encodeURIComponent(articleName)}`;
                if (new URLSearchParams(window.location.search).get('article') !== articleName) {
                    history.pushState({ article: articleName }, "", url);
                }
            }

            blogController.highlightActiveArticle(articleName);

        } catch (e) {
            console.error("Error loading article:", e);
            UI.contentInner.innerHTML = "<h1>Error loading article</h1><p>Could not fetch the article. Please try again later.</p>";
        }
    }
});

Object.defineProperty(blogController, 'buildPaletteItem', {
    writable: false,
    value: function (art, index) {
        state.articleMeta[art.name] = { ...art, tags: [...(art.tags || []), art.name] };
        const dateStr = art.date && art.date.getTime() !== 0 ? art.date.toISOString().split('T')[0] : 'N/A';
        const levelClass = art.level ? `level-${art.level.toLowerCase()}` : '';
        const shareTextHtml = art.share_text ? `<div class="palette-desc">${art.share_text}</div>` : '';

        const li = document.createElement('li');
        const isActive = state.activeArticleName && art.name === state.activeArticleName;
        li.className = 'palette-item' + (isActive ? ' selected active-article' : '');
        li.setAttribute('role', 'option');
        li.dataset.name = art.name;
        li.innerHTML = `
            <div class="palette-item-header">
                <span class="level-badge ${levelClass}">${art.level || 'Unknown'}</span>
                <span class="palette-date">${dateStr}</span>
            </div>
            <div class="palette-title">${art.name}</div>
            ${shareTextHtml}
        `;

        li.addEventListener('click', () => {
            blogController.loadArticle(art.name);
            blogController.closePalette();
        });

        return li;
    }
});

Object.defineProperty(blogController, 'openPalette', {
    writable: false,
    value: function () {
        if (!UI.paletteBackdrop) return;
        UI.paletteBackdrop.classList.remove('palette-hidden');
        UI.paletteBackdrop.setAttribute('aria-hidden', 'false');
        if (UI.paletteInput) {
            UI.paletteInput.value = '';
            UI.paletteInput.focus();
        }
        blogController.filterPalette();
        const target = UI.paletteList?.querySelector('.palette-item.selected') || UI.paletteList?.querySelector('.palette-item.active-article');
        if (target) {
            target.scrollIntoView({ block: 'nearest' });
        }
    }
});

Object.defineProperty(blogController, 'closePalette', {
    writable: false,
    value: function () {
        if (!UI.paletteBackdrop) return;
        UI.paletteBackdrop.classList.add('palette-hidden');
        UI.paletteBackdrop.setAttribute('aria-hidden', 'true');
    }
});

Object.defineProperty(blogController, 'filterPalette', {
    writable: false,
    value: function () {
        if (!UI.paletteList) return;
        const term = (UI.paletteInput?.value || '').trim().toLowerCase();
        const items = UI.paletteList.querySelectorAll('.palette-item');
        let firstMatch = null;
        let visibleCount = 0;

        items.forEach(item => {
            const name = item.dataset.name.toLowerCase();
            const meta = state.articleMeta[item.dataset.name] || {};
            const tags = (meta.tags || []).map(t => t.toLowerCase());
            const level = (meta.level || '').toLowerCase();
            const shareText = (meta.share_text || '').toLowerCase();

            const isMatch = !term || name.includes(term) || tags.some(t => t.includes(term)) || level.includes(term) || shareText.includes(term);

            if (isMatch) {
                item.style.display = '';
                visibleCount++;
                if (!firstMatch) firstMatch = item;
            } else {
                item.style.display = 'none';
            }
            item.classList.remove('selected');
        });

        let targetSelect = null;
        if (!term && state.activeArticleName) {
            targetSelect = Array.from(items).find(item => item.dataset.name === state.activeArticleName && item.style.display !== 'none');
        }
        if (!targetSelect) {
            targetSelect = firstMatch;
        }

        if (targetSelect) {
            targetSelect.classList.add('selected');
        }

        let emptyMsg = UI.paletteList.querySelector('.palette-empty');
        if (visibleCount === 0) {
            if (!emptyMsg) {
                emptyMsg = document.createElement('div');
                emptyMsg.className = 'palette-empty';
                emptyMsg.textContent = 'No matching articles found.';
                UI.paletteList.appendChild(emptyMsg);
            }
            emptyMsg.style.display = '';
        } else if (emptyMsg) {
            emptyMsg.style.display = 'none';
        }
    }
});

Object.defineProperty(blogController, 'handlePaletteKeyNav', {
    writable: false,
    value: function (e) {
        if (!UI.paletteBackdrop || UI.paletteBackdrop.classList.contains('palette-hidden')) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                blogController.openPalette();
            } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                blogController.openPalette();
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            blogController.closePalette();
            return;
        }

        const visibleItems = Array.from(UI.paletteList?.querySelectorAll('.palette-item') || []).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) return;

        let currentIndex = visibleItems.findIndex(item => item.classList.contains('selected'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex >= 0) visibleItems[currentIndex].classList.remove('selected');
            const nextIndex = (currentIndex + 1) % visibleItems.length;
            visibleItems[nextIndex].classList.add('selected');
            visibleItems[nextIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex >= 0) visibleItems[currentIndex].classList.remove('selected');
            const prevIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
            visibleItems[prevIndex].classList.add('selected');
            visibleItems[prevIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex >= 0 && visibleItems[currentIndex]) {
                visibleItems[currentIndex].click();
            }
        }
    }
});

Object.defineProperty(blogController, 'initArticleList', {
    writable: false,
    value: async function () {
        if (!UI.paletteList) return;
        UI.paletteList.innerHTML = `<li class="palette-empty">Loading articles...</li>`;

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
            state.articles = articles;

            UI.paletteList.innerHTML = "";
            articles.forEach((art, index) => {
                UI.paletteList.appendChild(blogController.buildPaletteItem(art, index));
            });

            const urlArticle = new URLSearchParams(window.location.search).get('article');
            if (urlArticle) {
                blogController.loadArticle(urlArticle, false);
            } else if (articles.length > 0) {
                blogController.loadArticle(articles[0].name, false);
            }

            if (window.location.hash) {
                setTimeout(() => {
                    const target = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
                    target?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        } catch (e) {
            console.error("Error initializing articles:", e);
            if (e.message === 'RATE_LIMIT') {
                UI.paletteList.innerHTML = `<li class='palette-empty' style='color:#ffaa00;'>GitHub rate limit reached. Please try again in an hour.</li>`;
            } else {
                UI.paletteList.innerHTML = "<li class='palette-empty'>Error loading articles</li>";
            }
        }
    }
});

Object.defineProperty(blogController, 'loadFromURL', {
    writable: false,
    value: function () {
        const name = new URLSearchParams(window.location.search).get('article');
        if (name && name !== state.activeArticleName) {
            blogController.loadArticle(name, false);
        }
    }
});

Object.defineProperty(blogController, 'initEvents', {
    writable: false,
    value: function () {
        UI.paletteHudBtn?.addEventListener('click', blogController.openPalette);
        UI.paletteCloseBtn?.addEventListener('click', blogController.closePalette);
        UI.backToTopBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        UI.paletteBackdrop?.addEventListener('click', (e) => {
            if (e.target === UI.paletteBackdrop) {
                blogController.closePalette();
            }
        });

        UI.paletteInput?.addEventListener('input', blogController.filterPalette);
        window.addEventListener('keydown', blogController.handlePaletteKeyNav);

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

        window.addEventListener('popstate', blogController.loadFromURL);

        // Set OS-appropriate shortcut label on the HUD pill
        const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        const kbdEl = document.querySelector('.hud-kbd');
        if (kbdEl && isMac) {
            kbdEl.textContent = '⌘K';
        }
    }
});

blogController.initRenderer();
blogController.initEvents();
blogController.initArticleList();
