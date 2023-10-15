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

class carousel{
    constructor() {
        this.skillsAndPersonalityCounter = 0;
        this.visualIndexInGUI = document.getElementsByClassName("index");
        this.allSkillsAndPersonality = document.getElementsByClassName("skillsAndPersonality");
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.Initialize();

        this.carouselElement = document.getElementById("skillsAndPersonalityMiddleCell");
        this.carouselElement.addEventListener("touchstart", (e) => this.TouchStart(e));
        this.carouselElement.addEventListener("touchend", (e) => this.TouchEnd(e));
    }

    Initialize() {
        for (let divIndex = 1; divIndex < this.allSkillsAndPersonality.length; divIndex++)
            this.allSkillsAndPersonality[divIndex].style.display = "none";
        this.changeVisualGUIIndex();
    }

    changeVisualGUIIndex() {
        for (let divIndex = 0; divIndex < this.allSkillsAndPersonality.length; divIndex++)
            this.visualIndexInGUI[divIndex].setAttribute("class", "index");
        this.visualIndexInGUI[this.skillsAndPersonalityCounter].setAttribute("class", "index meInIndex");
    }

    next() {
        this.allSkillsAndPersonality[this.skillsAndPersonalityCounter].style.display = "none";
        this.skillsAndPersonalityCounter = (this.skillsAndPersonalityCounter + 1) % this.allSkillsAndPersonality.length;
        this.allSkillsAndPersonality[this.skillsAndPersonalityCounter].style.display = "";
        this.changeVisualGUIIndex();
    }

    previous() {
        this.allSkillsAndPersonality[this.skillsAndPersonalityCounter].style.display = "none";
        this.skillsAndPersonalityCounter = this.skillsAndPersonalityCounter - 1 < 0 ? this.allSkillsAndPersonality.length - 1 : this.skillsAndPersonalityCounter - 1;
        this.allSkillsAndPersonality[this.skillsAndPersonalityCounter].style.display = "";
        this.changeVisualGUIIndex();
    }

    setAtIndex(targetIndex) {
        this.visualIndexInGUI[this.skillsAndPersonalityCounter].setAttribute("class", "index");
        this.allSkillsAndPersonality[this.skillsAndPersonalityCounter].style.display = "none";
        this.visualIndexInGUI[targetIndex].setAttribute("class", "index meInIndex");
        this.allSkillsAndPersonality[targetIndex].style.display = "";
        this.skillsAndPersonalityCounter = targetIndex;
    }

    TouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
    }

    TouchEnd(event) {
        this.touchEndX = event.changedTouches[0].clientX;
        const touchThreshold = 5;

        if (this.touchStartX - this.touchEndX > touchThreshold) {
            this.next();
        } else if (this.touchEndX - this.touchStartX > touchThreshold) {
            this.previous();
        }
    }
}