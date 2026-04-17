'use strict';

const LANGUAGE_CLASS_OVERRIDE = new Map([
    ["XSLT", "Scala"],
    ["HTML", "JavaScript"],
    ["CSS", "JavaScript"],
    ["C", "CLang"],
    ["Java", "JavaLang"],
]);

const LANGUAGE_APPENDS_JS = new Set(["PHP", "TypeScript"]);

const NAME_CLASS_OVERRIDE = new Map([
    ["TouchBar", "Dart"],
    ["SerialCommunication", "Python C++ Rust"],
    ["Wordle", "Python Rust"],
]);

const NAME_APPENDS_CLASS = new Map([
    ["SilentMessaging", "PHP"],
    ["keychron-optical-keyboard", "Hardware"],
]);

const LANGUAGE_TITLE_PREFIX = new Map([
    ["XSLT", "Scala"],
    ["HTML", "JS"],
    ["JavaScript", "JS"],
    ["CSS", "JS"],
    ["TypeScript", "TS"],
]);

const NAME_TITLE_PREFIX = new Map([
    ["TouchBar", "Dart"],
    ["keychron-optical-keyboard", "Hardware"],
]);

const LANGUAGE_DISPLAY_LABELS = new Map([
    ["CLang", "C"],
    ["JavaScript", "JS/TS"],
    ["JavaLang", "Java"],
]);

const EXCLUDED_REPOS = new Set(["barakadax", "blog"]);

function getProjectsFromGitHub(options) {
    const opts = options || {};
    const containerId = opts.container || "projectsGrid";
    const isFeatured = opts.featured === true;
    const featuredNames = Array.isArray(opts.featuredNames) ? opts.featuredNames : [];

    const FETCH_TIMEOUT_MS = 10000;

    const cardBuilder = Object.create(null);
    const container = document.getElementById(containerId);

    Object.defineProperty(cardBuilder, 'resolveProjectClass', {
        writable: false,
        value: function (element) {
            if (LANGUAGE_CLASS_OVERRIDE.has(element.language)) {
                return "projectsRow " + LANGUAGE_CLASS_OVERRIDE.get(element.language);
            }
            if (NAME_CLASS_OVERRIDE.has(element.name)) {
                return "projectsRow " + NAME_CLASS_OVERRIDE.get(element.name);
            }
            if (LANGUAGE_APPENDS_JS.has(element.language)) {
                return "projectsRow " + element.language + " JavaScript";
            }
            if (NAME_APPENDS_CLASS.has(element.name)) {
                return "projectsRow " + element.language + " " + NAME_APPENDS_CLASS.get(element.name);
            }
            return "projectsRow " + element.language;
        }
    });

    Object.defineProperty(cardBuilder, 'resolveTitlePrefix', {
        writable: false,
        value: function (element) {
            if (LANGUAGE_TITLE_PREFIX.has(element.language)) {
                return LANGUAGE_TITLE_PREFIX.get(element.language);
            }
            if (NAME_TITLE_PREFIX.has(element.name)) {
                return NAME_TITLE_PREFIX.get(element.name);
            }
            return element.language;
        }
    });

    Object.defineProperty(cardBuilder, 'displayLabel', {
        writable: false,
        value: function (token) {
            return LANGUAGE_DISPLAY_LABELS.get(token) || token;
        }
    });

    Object.defineProperty(cardBuilder, 'buildProjectLink', {
        writable: false,
        value: function (element) {
            const link = document.createElement("a");
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.href = element.html_url;
            const resolvedClass = cardBuilder.resolveProjectClass(element);
            link.className = "projectCard " + resolvedClass;
            if (isFeatured) {
                link.classList.add("projectCard--featured");
            }
            return link;
        }
    });

    Object.defineProperty(cardBuilder, 'buildImageWrap', {
        writable: false,
        value: function (element, link) {
            const wrap = document.createElement("div");
            wrap.className = "projectCardImageWrap";
            const img = document.createElement("img");
            img.className = "projectCardImage";
            img.alt = element.name;
            img.loading = "lazy";
            img.decoding = "async";
            img.src = "projImg/" + element.name + ".png";
            img.onerror = function () {
                img.src = "projImg/default" + (Math.floor(Math.random() * 3) + 1) + ".jpg";
            };
            wrap.appendChild(img);
            link.appendChild(wrap);
        }
    });

    Object.defineProperty(cardBuilder, 'buildBody', {
        writable: false,
        value: function (link) {
            const body = document.createElement("div");
            body.className = "projectCardBody";
            link.appendChild(body);
            return body;
        }
    });

    Object.defineProperty(cardBuilder, 'appendProjectTitle', {
        writable: false,
        value: function (element, body) {
            const title = document.createElement("h3");
            title.className = "projectCardTitle projTitle";
            title.textContent = element.name;
            title.setAttribute("data-full-title", element.name);
            title.setAttribute("data-name", element.name);
            body.appendChild(title);
        }
    });

    Object.defineProperty(cardBuilder, 'appendProjectDescription', {
        writable: false,
        value: function (element, body) {
            const description = document.createElement("div");
            description.className = "projectCardDescription projDescription";
            description.textContent = element.description || "";
            body.appendChild(description);
        }
    });

    Object.defineProperty(cardBuilder, 'appendProjectLanguages', {
        writable: false,
        value: function (resolvedClass, body) {
            const tokens = resolvedClass.split(" ").filter(t => t && t !== "projectsRow");
            if (tokens.length === 0) return;
            const wrap = document.createElement("div");
            wrap.className = "projectCardLanguages";
            tokens.forEach((token, i) => {
                const pill = document.createElement("span");
                pill.className = "langPill " + (i === 0 ? "langPill--main" : "langPill--extra");
                pill.textContent = cardBuilder.displayLabel(token);
                wrap.appendChild(pill);
            });
            body.appendChild(wrap);
        }
    });

    Object.defineProperty(cardBuilder, 'appendProjectTags', {
        writable: false,
        value: function (element, body) {
            const topics = Array.isArray(element.topics) ? element.topics : [];
            const wrap = document.createElement("div");
            wrap.className = "projectCardTags projTags";
            topics.forEach(topic => {
                const pill = document.createElement("span");
                pill.className = "tagPill";
                pill.textContent = topic;
                wrap.appendChild(pill);
            });
            body.appendChild(wrap);
        }
    });

    Object.defineProperty(cardBuilder, 'buildProjectCard', {
        writable: false,
        value: function (element, categories, tags) {
            const link = cardBuilder.buildProjectLink(element);
            const resolvedClass = link.className.split(" ").filter(c => c !== "projectCard" && c !== "projectCard--featured").join(" ");
            resolvedClass.split(" ").forEach(c => {
                if (c) categories.set(c, (categories.get(c) || 0) + 1);
            });
            if (Array.isArray(element.topics)) {
                element.topics.forEach(topic => {
                    tags.set(topic, (tags.get(topic) || 0) + 1);
                    link.classList.add(topic);
                });
            }
            cardBuilder.buildImageWrap(element, link);
            const body = cardBuilder.buildBody(link);
            cardBuilder.appendProjectTitle(element, body);
            cardBuilder.appendProjectDescription(element, body);
            cardBuilder.appendProjectLanguages(resolvedClass, body);
            cardBuilder.appendProjectTags(element, body);
            return link;
        }
    });

    Object.defineProperty(cardBuilder, 'fetchAndRenderProjects', {
        writable: false,
        value: async function () {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
            try {
                const response = await fetch("https://api.github.com/users/barakadax/repos?sort=updated&per_page=200", { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                let repos = await response.json();
                repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

                if (isFeatured) {
                    const byName = new Map(repos.map(r => [r.name, r]));
                    repos = featuredNames
                        .map(name => byName.get(name))
                        .filter(Boolean);
                }

                const categories = new Map();
                const tags = new Map();

                container.innerHTML = "";

                repos.forEach((element, index) => {
                    if (!isFeatured && EXCLUDED_REPOS.has(element.name)) return;
                    const card = cardBuilder.buildProjectCard(element, categories, tags);
                    card.style.animationDelay = (index * 40) + "ms";
                    container.appendChild(card);
                });

                if (!isFeatured) {
                    const sortedCategories = Array.from(categories.entries())
                        .sort((a, b) => b[1] - a[1])
                        .map(entry => entry[0]);

                    const sortedTags = Array.from(tags.entries())
                        .sort((a, b) => b[1] - a[1])
                        .map(entry => entry[0]);

                    setProjectButton(sortedCategories, sortedTags);
                }
            } catch (e) {
                console.error("Error loading data.", e);
                const wasTimeout = e && e.name === "AbortError";
                const message = wasTimeout
                    ? "Loading projects timed out."
                    : "Couldn't load projects from GitHub right now.";
                container.innerHTML = '<div class="loadError">' + message +
                    ' View them directly on <a href="https://github.com/barakadax?tab=repositories" target="_blank" rel="noopener noreferrer">github.com/barakadax</a>.</div>';
            } finally {
                clearTimeout(timeoutId);
            }
        }
    });

    cardBuilder.fetchAndRenderProjects();
}
