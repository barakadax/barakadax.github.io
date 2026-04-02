'use strict';

const STATUS_VALUES = ["completed", "university-project", "work-in-progress", "dropped"];

const filterState = Object.create(null);
filterState.selectedCategories = new Set();
filterState.selectedTags = new Set();
filterState.selectedStatuses = new Set();

const DISPLAY_LABELS = new Map([
    ["CLang", "C"],
    ["JavaScript", "JS/TS"],
    ["JavaLang", "Java"]
]);

Object.defineProperty(filterState, 'applyFilters', {
    writable: false,
    value: function () {
        const projects = document.getElementsByClassName("projectsRow");
        Array.from(projects).forEach(projectCard => {
            const titleElement = projectCard.querySelector(".projTitle");
            const tagsElement = projectCard.querySelector(".projTags");
            const cardClasses = Array.from(projectCard.classList);

            const matchesCategory = filterState.selectedCategories.size === 0 ||
                cardClasses.some(c => filterState.selectedCategories.has(c));
            const matchesTag = filterState.selectedTags.size === 0 ||
                cardClasses.some(t => filterState.selectedTags.has(t));
            const matchesStatus = filterState.selectedStatuses.size === 0 ||
                cardClasses.some(s => filterState.selectedStatuses.has(s));

            if (matchesCategory && matchesTag && matchesStatus) {
                projectCard.style.display = "";
                if (titleElement) {
                    titleElement.innerHTML = filterState.selectedCategories.size > 0
                        ? titleElement.dataset.name
                        : titleElement.dataset.fullTitle;
                }
                if (tagsElement) {
                    tagsElement.style.display = filterState.selectedTags.size > 0 ? "none" : "";
                }
            } else {
                projectCard.style.display = "none";
            }
        });
    }
});

Object.defineProperty(filterState, 'appendFilterCheckbox', {
    writable: false,
    value: function (id, label, container, isTag = false) {
        const wrapper = document.createElement("label");
        wrapper.className = "filterOption noSelect";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.value = id;

        checkbox.addEventListener("change", (e) => {
            const set = isTag ? filterState.selectedTags : filterState.selectedCategories;
            if (e.target.checked) {
                set.add(id);
            } else {
                set.delete(id);
            }
            filterState.applyFilters();
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(document.createTextNode(label));
        container.appendChild(wrapper);
    }
});

Object.defineProperty(filterState, 'appendStatusCheckbox', {
    writable: false,
    value: function (id, label, container) {
        const wrapper = document.createElement("label");
        wrapper.className = "filterOption noSelect";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.value = id;

        checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
                filterState.selectedStatuses.add(id);
            } else {
                filterState.selectedStatuses.delete(id);
            }
            filterState.applyFilters();
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(document.createTextNode(label));
        container.appendChild(wrapper);
    }
});

Object.defineProperty(filterState, 'initFilterToggle', {
    writable: false,
    value: function (filterToggle, filterMenu) {
        filterToggle.addEventListener("click", () => {
            filterMenu.classList.toggle("hidden");
            filterToggle.classList.toggle("active");
        });
    }
});

function setProjectButton(categories = [], tags = []) {
    const categoryContainer = document.getElementById("categoryFilter");
    const statusContainer = document.getElementById("statusFilter");
    const tagContainer = document.getElementById("tagFilter");
    const filterToggle = document.getElementById("filterToggle");
    const filterMenu = document.getElementById("filterMenu");

    categoryContainer.innerHTML = "";
    statusContainer.innerHTML = "";
    tagContainer.innerHTML = "";

    filterState.initFilterToggle(filterToggle, filterMenu);

    document.querySelectorAll(".filterColumn h3").forEach(h3 => {
        h3.addEventListener("click", () => {
            h3.closest(".filterColumn").classList.toggle("filterColumn--open");
        });
    });

    const uniqueCategories = [...new Set(categories)].filter(c => c !== "projectsRow" && c !== "TypeScript" && c !== "ALL");
    uniqueCategories.forEach(category => {
        if (category) filterState.appendFilterCheckbox(category, DISPLAY_LABELS.get(category) || category, categoryContainer);
    });

    STATUS_VALUES.forEach(status => {
        filterState.appendStatusCheckbox(status, status, statusContainer);
    });

    const uniqueTags = [...new Set(tags)].filter(t => t !== "ALL" && !STATUS_VALUES.includes(t));
    uniqueTags.forEach(tag => {
        if (tag) filterState.appendFilterCheckbox(tag, tag, tagContainer, true);
    });
}
