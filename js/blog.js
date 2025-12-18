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

            // Clear existing list
            articleList.innerHTML = "";

            response.forEach(element => {
                // Assuming directories represent articles
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
                        // On mobile, auto-collapse sidebar after selection
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
    // We might need to scroll the container to top when loading new article
    const scrollContainer = document.getElementById('blog-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;

    // Show loading state
    contentDiv.innerHTML = '<div class="loadingText">Loading...</div>';

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            // Github API returns content base64 encoded
            // But sometimes for large files it might point to a blob, or if we request the raw content directly it's better.
            // Using the /contents API returns JSON with 'content' field in base64.
            // Note: simple atob might fail with UTF-8 characters.

            try {
                // Decode base64 handling UTF-8 correctly
                const binaryString = atob(response.content.replace(/\s/g, ''));
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decodedContent = new TextDecoder().decode(bytes);

                // Render markdown
                contentDiv.innerHTML = marked.parse(decodedContent);

                // Add images support if they are relative paths in the markdown 
                // (This is basic and might need adjustment based on how images are stored in the repo)
                // Assuming images are in the same folder or relative. 
                // We'd need to fix image src to point to raw github user content.
                fixImageLinks(contentDiv, articleName);

            } catch (e) {
                console.error("Error parsing content", e);
                contentDiv.innerHTML = "<h1>Error parsing article content</h1><p>The content encoding might be unsupported.</p>";
            }
        }
        else {
            console.error("Error loading article content.");
            contentDiv.innerHTML = "<h1>Error loading article</h1><p>Could not fetch the article content. Please try again later.</p>";
        }
    }

    // Assumptions: 
    // 1. Each article folder has an index.md
    xhr.open("GET", `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${articleName}/index.md`, true);
    xhr.send();
}

function fixImageLinks(container, articleName) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
            // It's a relative path. Point to raw.githubusercontent.com
            // Format: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
            // Assuming master or main branch. Let's try 'main' first, but if the repo uses 'master' this might break.
            // A safer bet for generic viewing is using the relative path if the site was hosted, 
            // but here we are fetching from another repo.

            // Let's assume 'main' branch for now.
            const newSrc = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${articleName}/${src}`;
            img.src = newSrc;
        }
    });
}

// Initial Load
getAllBlogArticlesNames();
