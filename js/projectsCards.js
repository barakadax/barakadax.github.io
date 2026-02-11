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

let selectedCategories = new Set();
let selectedTags = new Set();

function setProjectButton(categories = [], tags = []) {
    const categoryContainer = document.getElementById("categoryFilter");
    const tagContainer = document.getElementById("tagFilter");
    const filterToggle = document.getElementById("filterToggle");
    const filterMenu = document.getElementById("filterMenu");

    categoryContainer.innerHTML = "";
    tagContainer.innerHTML = "";

    const buttonLabels = {
        "CLang": "C",
        "JavaScript": "JS/TS",
        "JavaLang": "Java"
    };

    filterToggle.addEventListener("click", () => {
        filterMenu.classList.toggle("hidden");
        filterToggle.classList.toggle("active");
    });

    function filterProjects() {
        const projects = document.getElementsByClassName("projectsRow");
        Array.from(projects).forEach(projectCard => {
            const titleElement = projectCard.querySelector(".projTitle");
            const tagsElement = projectCard.querySelector(".projTags");

            const cardClasses = Array.from(projectCard.classList);

            const matchesCategory = selectedCategories.size === 0 ||
                cardClasses.some(c => selectedCategories.has(c));

            const matchesTag = selectedTags.size === 0 ||
                cardClasses.some(t => selectedTags.has(t));

            if (matchesCategory && matchesTag) {
                projectCard.style.display = "";

                if (titleElement) {
                    if (selectedCategories.size > 0) {
                        titleElement.innerHTML = titleElement.dataset.name;
                    } else {
                        titleElement.innerHTML = titleElement.dataset.fullTitle;
                    }
                }

                if (tagsElement) {
                    if (selectedTags.size > 0) {
                        tagsElement.style.display = "none";
                    } else {
                        tagsElement.style.display = "";
                    }
                }
            } else {
                projectCard.style.display = "none";
            }
        });
    }

    function createCheckbox(id, label, container, isTag = false) {
        const wrapper = document.createElement("label");
        wrapper.className = "filterOption noSelect";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.value = id;

        const text = document.createTextNode(label);

        checkbox.addEventListener("change", (e) => {
            const set = isTag ? selectedTags : selectedCategories;
            if (e.target.checked) {
                set.add(id);
            } else {
                set.delete(id);
            }
            filterProjects();
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(text);
        container.appendChild(wrapper);
    }

    const uniqueCategories = [...new Set(categories)].filter(c => c !== "projectsRow" && c !== "TypeScript" && c !== "ALL");
    uniqueCategories.forEach(category => {
        if (category) createCheckbox(category, buttonLabels[category] || category, categoryContainer);
    });

    const uniqueTags = [...new Set(tags)].filter(t => t !== "ALL");
    uniqueTags.forEach(tag => {
        if (tag) createCheckbox(tag, tag, tagContainer, true);
    });
}
