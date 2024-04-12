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

function getProjectsFromGitHub() {
    console.warn("\"net::ERR_BLOCKED_BY_CLIENT\": your ad blocker blocked something");
    const xhr = new XMLHttpRequest();

    let functions = Object.create(null);
    let projectsColumn = document.getElementById("projectsColumn");

    Object.defineProperty(functions, 'getProjectLink', {
        writable: false,
        value: function(element) {
            let newProjectLink = document.createElement("a");

            newProjectLink.target = "_blank";
            newProjectLink.href = element.html_url;

            if (element.language === "XSLT") {
                newProjectLink.className = "projectsRow " + "Scala";
            }
            else if (element.language === "HTML" || element.language === "CSS"){
                newProjectLink.className = "projectsRow " + "JavaScript";
            }
            else if (element.name === "TouchBar") {
                newProjectLink.className = "projectsRow " + "Dart";
            }
            else if (element.language === "C") {
                newProjectLink.className = "projectsRow " + "CLang";
            }
            else if (element.language === "Java") {
                newProjectLink.className = "projectsRow " + "JavaLang";
            }
            else if (element.language === "PHP") {
                newProjectLink.className = "projectsRow " + element.language + " JavaScript";
            }
            else if (element.language === "TypeScript") {
                newProjectLink.className = "projectsRow " + element.language + " JavaScript";
            }
            else if (element.name === "SilentMessaging") {
                newProjectLink.className = "projectsRow " + element.language + " PHP";
            }
            else if (element.name === "Wordle") {
                newProjectLink.className = "projectsRow " + "Python" + " Rust";
            }
            else {
                newProjectLink.className = "projectsRow " + element.language;
            }

            return newProjectLink;
        }
    });

    Object.defineProperty(functions, 'setProjectImage', {
        writable: false,
        value: function(element, newProjectLink) {
            let newProjectImage = document.createElement("img");
            newProjectImage.className = "projImages";
            newProjectImage.alt = element.name;
            newProjectImage.src="projImg/" + element.name + ".png";

            newProjectImage.onerror = function () {
                newProjectImage.src = "projImg/default" + (Math.floor(Math.random() * 3) + 1) + ".jpg";
            };

            newProjectLink.appendChild(newProjectImage);
        }
    });

    Object.defineProperty(functions, 'getProjectInfoDiv', {
        writable: false,
        value: function(newProjectLink) {
            let newProjectInfoDiv = document.createElement("div");
            newProjectInfoDiv.className = "projectInfo";

            newProjectLink.appendChild(newProjectInfoDiv);

            return newProjectInfoDiv;
        }
    });

    Object.defineProperty(functions, 'setProjectTitle', {
        writable: false,
        value: function(element, newProjectInfoDiv) {
            let newProjectTitle = document.createElement("h3");
            newProjectTitle.className = "projTitle";

            if (element.language === "XSLT") {
                newProjectTitle.innerHTML = "Scala - " + element.name;
            }
            else if (element.language === "HTML" || element.language === "JavaScript" || element.language === "CSS") {
                newProjectTitle.innerHTML = "JS - " + element.name;
            }
            else if (element.name === "TouchBar") {
                newProjectTitle.innerHTML = "Dart - " + element.name;
            }
            else if (element.language === "TypeScript") {
                newProjectTitle.innerHTML = "TS - " + element.name;
            }
            else {
                newProjectTitle.innerHTML = element.language + " - " + element.name;
            }

            newProjectInfoDiv.appendChild(newProjectTitle);
        }
    });

    Object.defineProperty(functions, 'setProjectDescription', {
        writable: false,
        value: function(element, newProjectInfoDiv) {
            let newProjectDescription = document.createElement("div");
            newProjectDescription.className = "projDescription";
            newProjectDescription.innerHTML = element.description;

            newProjectInfoDiv.appendChild(newProjectDescription);
        }
    });

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            response.forEach((element, _) => {
                if (element.name === "barakadax") {
                    return;
                }
                
                let newProjectLink = functions.getProjectLink(element);
                
                let newProjectInfoDiv = functions.getProjectInfoDiv(newProjectLink);
                functions.setProjectTitle(element, newProjectInfoDiv);
                functions.setProjectDescription(element, newProjectInfoDiv);
                functions.setProjectImage(element, newProjectLink);

                projectsColumn.appendChild(newProjectLink);
            });
            projectsColumn.removeChild(projectsColumn.firstElementChild);
        } else {
            console.log("Error loading data.");
            projectsColumn.firstElementChild.lastElementChild.innerHTML = "Error";
        }
    
        xhr.abort();
    };
    
    xhr.open("GET", "https://api.github.com/users/barakadax/repos?sort=updated&per_page=100", true);
    
    xhr.send();
}
