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


function setProjectButton(categories = []) {
    const projectsButtonContainer = document.getElementById("projectsButton");
    projectsButtonContainer.innerHTML = ""; // Clear existing buttons

    const buttonLabels = {
        "ALL": "All",
        "CLang": "C",
        "JavaScript": "JS/TS",
        "JavaLang": "Java"
    };

    // Add "All" button first
    const allButton = document.createElement("button");
    allButton.id = "ALL";
    allButton.textContent = "All";
    projectsButtonContainer.appendChild(allButton);

    // Filter out duplicates and "projectsRow" class, and explicitly exclude "TypeScript"
    const uniqueCategories = [...new Set(categories)].filter(c => c !== "projectsRow" && c !== "TypeScript");

    uniqueCategories.forEach(category => {
        if (!category) return;

        const btn = document.createElement("button");
        btn.id = category;
        btn.textContent = buttonLabels[category] || category;
        projectsButtonContainer.appendChild(btn);
    });


    let pressedButtonTextShadowStyle = "1px 1px 1px white, 0 0 2px white, 0 0 0.2em white";
    let pressedButtonBoxShadowStyle = "1px 1px 1px var(--Red-color), 0 0 2px var(--Red-color), 0 0 0.2em var(--Red-color)";

    // Set initial style for ALL button
    allButton.style.boxShadow = pressedButtonBoxShadowStyle;
    allButton.style.textShadow = pressedButtonTextShadowStyle;

    const allButtons = projectsButtonContainer.querySelectorAll("button");

    allButtons.forEach(cardButton => cardButton.addEventListener("click", function () {
        Array.prototype.forEach.call(document.getElementsByClassName("projectsRow"), projectCard => {
            if (cardButton.id === "ALL") {
                projectCard.style.display = "";
            } else {
                if (projectCard.classList.contains(cardButton.id)) {
                    projectCard.style.display = "";
                } else {
                    projectCard.style.display = "none";
                }
            }
        });

        setButtonsStyle(cardButton);
    }));

    function setButtonsStyle(targetButton) {
        allButtons.forEach(btn => setNoStyleToButton(btn));
        setStyleToButton(targetButton);
    }

    function setNoStyleToButton(button) {
        button.style.boxShadow = "";
        button.style.textShadow = "";
    }

    function setStyleToButton(button) {
        button.style.boxShadow = pressedButtonBoxShadowStyle;
        button.style.textShadow = pressedButtonTextShadowStyle;
    }
}

