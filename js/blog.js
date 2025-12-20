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

try {
    marked.use({
        renderer: {
            heading(arg1, arg2) {
                const isObject = typeof arg1 === 'object' && arg1 !== null;
                const text = isObject ? arg1.text : arg1;
                const level = isObject ? arg1.depth : arg2;

                const id = typeof text === 'string'
                    ? text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
                    : 'header-' + level;
                return `<h${level} id="${id}">${text}</h${level}>`;
            }
        }
    });
} catch (e) {
    console.warn("Marked configuration failed, using default renderer", e);
}

const repoOwner = "barakadax";
const repoName = "blog";

const articleMeta = {};
const userCache = {};

const sidebar = document.getElementById('blog-sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}

const backBtn = document.getElementById('back-to-list-btn');
if (backBtn) {
    backBtn.onclick = () => {
        const blogContainer = document.getElementById('blog-container');
        if (blogContainer) {
            blogContainer.scrollIntoView({ behavior: 'smooth' });
        }
        if (sidebar) {
            sidebar.classList.remove('collapsed');
        }
    };
}

async function fetchUserFullName(login) {
    if (userCache[login]) return userCache[login];
    try {
        const response = await fetch(`https://api.github.com/users/${login}`);
        if (response.ok) {
            const data = await response.json();
            userCache[login] = data.name || login;
            return userCache[login];
        }
    } catch (e) {
        console.warn(`Could not fetch full name for ${login}`, e);
    }
    return login;
}

function setActiveArticle(articleName) {
    const items = document.querySelectorAll('.article-item');
    items.forEach(item => {
        if (item.dataset.name === articleName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

async function getAllBlogArticlesNames() {
    const articleList = document.getElementById('article-list');
    articleList.innerHTML = '<li class="article-item">Loading articles...</li>';

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/`);
        if (!response.ok) throw new Error("Failed to fetch article list");

        const contents = await response.json();
        const directories = contents.filter(item => item.type === "dir");

        const articlesWithMeta = await Promise.all(directories.map(async (dir) => {
            try {
                const commitResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?path=${dir.name}/index.md&per_page=1`);
                if (commitResponse.ok) {
                    const commits = await commitResponse.json();
                    if (commits && commits.length > 0) {
                        const commitData = commits[0];
                        const date = new Date(commitData.commit.committer.date);
                        const login = commitData.author ? commitData.author.login : commitData.commit.author.name;
                        const fullName = commitData.author ? await fetchUserFullName(login) : login;

                        return {
                            ...dir,
                            lastCommitDate: date,
                            authorName: fullName
                        };
                    }
                }
            } catch (e) {
                console.warn(`Could not fetch commit meta for ${dir.name}`, e);
            }
            return { ...dir, lastCommitDate: new Date(0), authorName: 'Barak Taya' };
        }));

        articlesWithMeta.sort((a, b) => {
            const dateDiff = b.lastCommitDate - a.lastCommitDate;
            if (dateDiff !== 0) return dateDiff;
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });

        articleList.innerHTML = "";

        articlesWithMeta.forEach(element => {
            articleMeta[element.name] = {
                date: element.lastCommitDate,
                author: element.authorName
            };
            const li = document.createElement('li');
            li.className = 'article-item';
            li.textContent = element.name;
            li.dataset.name = element.name;

            li.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                getArticleContent(element.name);
                setActiveArticle(element.name);
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.add('collapsed');
                }
            });

            articleList.appendChild(li);
        });
    } catch (e) {
        console.error("Error loading article list:", e);
        articleList.innerHTML = "<li class='article-item'>Error loading articles</li>";
    }
}

function getArticleContent(articleName) {
    const xhr = new XMLHttpRequest();
    const contentDiv = document.getElementById('blog-content-inner');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    contentDiv.innerHTML = '<div class="loadingText">Loading...</div>';
    if (backBtn) {
        backBtn.classList.remove('visible');
    }

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            try {
                if (!response.content) {
                    throw new Error("No content found in the response.");
                }
                const binaryString = atob(response.content.replace(/\s/g, ''));
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decodedContent = new TextDecoder().decode(bytes);
                contentDiv.innerHTML = marked.parse(decodedContent);
                fixImageLinks(contentDiv, articleName);

                const h1 = contentDiv.querySelector('h1');
                if (h1) {
                    const metaDiv = document.createElement('div');
                    metaDiv.className = 'article-meta';

                    const authorSpan = document.createElement('span');
                    authorSpan.className = 'article-author';
                    const meta = articleMeta[articleName];
                    authorSpan.textContent = 'By: ' + (meta ? meta.author : 'Barak Taya');

                    const dateSpan = document.createElement('span');
                    dateSpan.className = 'article-date';
                    const date = meta ? meta.date : null;
                    if (date && date.getTime() !== 0) {
                        dateSpan.textContent = `Last updated: ${date.toLocaleDateString()}`;
                    } else {
                        dateSpan.textContent = 'Last updated: ERROR';
                    }

                    metaDiv.appendChild(authorSpan);
                    metaDiv.appendChild(dateSpan);
                    h1.parentNode.insertBefore(metaDiv, h1.nextSibling);

                    const mainAuthorHeader = document.getElementById('author');
                    if (mainAuthorHeader) {
                        mainAuthorHeader.textContent = meta ? meta.author : 'Barak Taya';
                    }
                }

                if (backBtn) {
                    backBtn.classList.add('visible');
                }

            } catch (e) {
                console.error("Detailed parsing error:", e);
                contentDiv.innerHTML = `<h1>Error parsing article content</h1><p>The content encoding might be unsupported or the content is missing.</p><p style="font-size: 0.8rem; color: #888;">Details: ${e.message}</p>`;
            }
        }
        else {
            console.error("Error loading article content.");
            contentDiv.innerHTML = "<h1>Error loading article</h1><p>Could not fetch the article content. Please try again later.</p>";
        }
    }

    xhr.open("GET", `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${articleName}/index.md`, true);
    xhr.send();
}

function fixImageLinks(container, articleName) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
            const newSrc = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${articleName}/${src}`;
            img.src = newSrc;
        }
    });
}

getAllBlogArticlesNames();
