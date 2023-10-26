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
            else if (element.language === "HTML"){
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
            else if (element.language === "HTML"){
                newProjectTitle.innerHTML = "JavaScript - " + element.name;
            }
            else if (element.name === "TouchBar") {
                newProjectTitle.innerHTML = "Dart - " + element.name;
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
                let newProjectLink = functions.getProjectLink(element);
                functions.setProjectImage(element, newProjectLink);
                let newProjectInfoDiv = functions.getProjectInfoDiv(newProjectLink);
                functions.setProjectTitle(element, newProjectInfoDiv);
                functions.setProjectDescription(element, newProjectInfoDiv);

                projectsColumn.appendChild(newProjectLink);
            });
        } else {
            console.log("Error loading data.");
        }
    
        xhr.abort();
    };
    
    xhr.open("GET", "https://api.github.com/users/barakadax/repos?sort=updated&direction=desc&type=all", true);
    
    xhr.send();
}



