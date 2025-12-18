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

const sidebar = document.getElementById('blog-sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
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

function getAllBlogArticlesNames() {
    const xhr = new XMLHttpRequest();
    const articleList = document.getElementById('article-list');

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            articleList.innerHTML = "";

            response.forEach(element => {
                if (element.type === "dir") {
                    const li = document.createElement('li');
                    li.className = 'article-item';
                    li.textContent = element.name;
                    li.dataset.name = element.name;

                    li.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        getArticleContent(element.name);
                        setActiveArticle(element.name);
                        if (window.innerWidth <= 768) {
                            sidebar.classList.add('collapsed');
                        }
                    });

                    articleList.appendChild(li);
                }
            });
        }
        else {
            console.error("Error loading article list.");
            articleList.innerHTML = "<li class='article-item'>Error loading articles</li>";
        }
    }

    xhr.open("GET", `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`, true);
    xhr.send();
}

function getArticleContent(articleName) {
    const xhr = new XMLHttpRequest();
    const contentDiv = document.getElementById('blog-content-inner');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show loading state
    contentDiv.innerHTML = '<div class="loadingText">Loading...</div>';

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
