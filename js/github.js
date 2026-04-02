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

const EXCLUDED_REPOS = new Set(["barakadax", "blog"]);

function getProjectsFromGitHub() {
    console.warn("\"net::ERR_BLOCKED_BY_CLIENT\": your ad blocker blocked something");

    const cardBuilder = Object.create(null);
    const projectsColumn = document.getElementById("projectsColumn");

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

    Object.defineProperty(cardBuilder, 'buildProjectLink', {
        writable: false,
        value: function (element) {
            const link = document.createElement("a");
            link.target = "_blank";
            link.href = element.html_url;
            link.className = cardBuilder.resolveProjectClass(element);
            return link;
        }
    });

    Object.defineProperty(cardBuilder, 'appendProjectImage', {
        writable: false,
        value: function (element, link) {
            const img = document.createElement("img");
            img.className = "projImages";
            img.alt = element.name;
            img.src = "projImg/" + element.name + ".png";
            img.onerror = function () {
                img.src = "projImg/default" + (Math.floor(Math.random() * 3) + 1) + ".jpg";
            };
            link.appendChild(img);
        }
    });

    Object.defineProperty(cardBuilder, 'buildInfoContainer', {
        writable: false,
        value: function (link) {
            const infoDiv = document.createElement("div");
            infoDiv.className = "projectInfo";
            link.appendChild(infoDiv);
            return infoDiv;
        }
    });

    Object.defineProperty(cardBuilder, 'appendProjectTitle', {
        writable: false,
        value: function (element, infoDiv) {
            const titlePrefix = cardBuilder.resolveTitlePrefix(element);
            const titleText = titlePrefix + " - " + element.name;
            const title = document.createElement("h3");
            title.className = "projTitle";
            title.innerHTML = titleText;
            title.setAttribute("data-full-title", titleText);
            title.setAttribute("data-name", element.name);
            infoDiv.appendChild(title);
        }
    });

    Object.defineProperty(cardBuilder, 'appendProjectDescription', {
        writable: false,
        value: function (element, infoDiv) {
            const description = document.createElement("div");
            description.className = "projDescription";
            description.innerHTML = element.description;
            if (Array.isArray(element.topics) && element.topics.length > 0) {
                description.innerHTML += '<br><br><span class="projTags"><u>Tags:</u> ' + element.topics.join(', ') + '</span>';
            }
            infoDiv.appendChild(description);
        }
    });

    Object.defineProperty(cardBuilder, 'buildProjectCard', {
        writable: false,
        value: function (element, categories, tags) {
            const link = cardBuilder.buildProjectLink(element);
            link.className.split(" ").forEach(c => {
                categories.set(c, (categories.get(c) || 0) + 1);
            });
            if (Array.isArray(element.topics)) {
                element.topics.forEach(topic => {
                    tags.set(topic, (tags.get(topic) || 0) + 1);
                    link.classList.add(topic);
                });
            }
            const infoDiv = cardBuilder.buildInfoContainer(link);
            cardBuilder.appendProjectTitle(element, infoDiv);
            cardBuilder.appendProjectDescription(element, infoDiv);
            cardBuilder.appendProjectImage(element, link);
            return link;
        }
    });

    Object.defineProperty(cardBuilder, 'fetchAndRenderProjects', {
        writable: false,
        value: async function () {
            try {
                const response = await fetch("https://api.github.com/users/barakadax/repos?sort=updated&per_page=200");
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const repos = await response.json();
                repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

                const categories = new Map();
                const tags = new Map();

                repos.forEach(element => {
                    if (EXCLUDED_REPOS.has(element.name)) return;
                    const card = cardBuilder.buildProjectCard(element, categories, tags);
                    projectsColumn.appendChild(card);
                });

                projectsColumn.removeChild(projectsColumn.firstElementChild);

                const sortedCategories = Array.from(categories.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(entry => entry[0]);

                const sortedTags = Array.from(tags.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(entry => entry[0]);

                setProjectButton(sortedCategories, sortedTags);
            } catch (e) {
                console.error("Error loading data.", e);
                projectsColumn.firstElementChild.lastElementChild.innerHTML = "Error";
            }
        }
    });

    cardBuilder.fetchAndRenderProjects();
}
