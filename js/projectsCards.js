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


let activeCategory = "ALL";
let activeTag = "ALL";

function setProjectButton(categories = [], tags = []) {
    const projectsButtonContainer = document.getElementById("projectsButton");
    const tagsButtonContainer = document.getElementById("tagsButton");
    projectsButtonContainer.innerHTML = "";
    tagsButtonContainer.innerHTML = "";

    const buttonLabels = {
        "ALL": "All",
        "CLang": "C",
        "JavaScript": "JS/TS",
        "JavaLang": "Java"
    };

    const pressedButtonTextShadowStyle = "1px 1px 1px white, 0 0 2px white, 0 0 0.2em white";
    const redPressedShadow = "1px 1px 1px var(--Red-color), 0 0 2px var(--Red-color), 0 0 0.2em var(--Red-color)";
    const bluePressedShadow = "1px 1px 1px var(--Blue-color), 0 0 2px var(--Blue-color), 0 0 0.2em var(--Blue-color)";

    function filterProjects() {
        const projects = document.getElementsByClassName("projectsRow");
        Array.from(projects).forEach(projectCard => {
            const titleElement = projectCard.querySelector(".projTitle");
            const tagsElement = projectCard.querySelector(".projTags");
            const matchesCategory = activeCategory === "ALL" || projectCard.classList.contains(activeCategory);
            const matchesTag = activeTag === "ALL" || projectCard.classList.contains(activeTag);

            if (matchesCategory && matchesTag) {
                projectCard.style.display = "";

                // Title logic
                if (titleElement) {
                    if (activeCategory === "ALL") {
                        titleElement.innerHTML = titleElement.dataset.fullTitle;
                    } else {
                        titleElement.innerHTML = titleElement.dataset.name;
                    }
                }

                // Tags logic
                if (tagsElement) {
                    if (activeTag === "ALL") {
                        tagsElement.style.display = "";
                    } else {
                        tagsElement.style.display = "none";
                    }
                }
            } else {
                projectCard.style.display = "none";
            }
        });
    }

    function createButton(id, label, container, isTag = false) {
        const btn = document.createElement("button");
        btn.id = id;
        btn.textContent = label;
        if (isTag) btn.classList.add("blueButton");

        btn.addEventListener("click", () => {
            if (isTag) {
                activeTag = id;
                updateButtonStyles(tagsButtonContainer, btn, bluePressedShadow);
            } else {
                activeCategory = id;
                updateButtonStyles(projectsButtonContainer, btn, redPressedShadow);
            }
            filterProjects();
        });

        container.appendChild(btn);
        return btn;
    }

    function updateButtonStyles(container, activeBtn, boxShadow) {
        const buttons = container.querySelectorAll("button");
        buttons.forEach(btn => {
            btn.style.boxShadow = "";
            btn.style.textShadow = "";
        });
        activeBtn.style.boxShadow = boxShadow;
        activeBtn.style.textShadow = pressedButtonTextShadowStyle;
    }

    // Category Buttons
    const allCatBtn = createButton("ALL", "All", projectsButtonContainer);
    updateButtonStyles(projectsButtonContainer, allCatBtn, redPressedShadow);

    const uniqueCategories = [...new Set(categories)].filter(c => c !== "projectsRow" && c !== "TypeScript" && c !== "ALL");
    uniqueCategories.forEach(category => {
        if (category) createButton(category, buttonLabels[category] || category, projectsButtonContainer);
    });

    // Tag Buttons
    const allTagBtn = createButton("ALL", "All", tagsButtonContainer, true);
    updateButtonStyles(tagsButtonContainer, allTagBtn, bluePressedShadow);

    const uniqueTags = [...new Set(tags)].filter(t => t !== "ALL");
    uniqueTags.forEach(tag => {
        if (tag) createButton(tag, tag, tagsButtonContainer, true);
    });
}

