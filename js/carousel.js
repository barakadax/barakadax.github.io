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

function getCarousel() {
    let carousel = Object.create(null);
    carousel.skillsAndPersonalityCounter = 0;
    carousel.visualIndexInGUI = document.getElementsByClassName("index");
    carousel.allSkillsAndPersonality = document.getElementsByClassName("skillsAndPersonality");
    carousel.touchStartX = 0;
    carousel.touchEndX = 0;

    Object.defineProperty(carousel, 'ChangeVisualGUIIndex', {
        writable: false,
        value: function() {
            for (let divIndex = 0; divIndex < carousel.allSkillsAndPersonality.length; divIndex++)
                carousel.visualIndexInGUI[divIndex].setAttribute("class", "index");
            carousel.visualIndexInGUI[carousel.skillsAndPersonalityCounter].setAttribute("class", "index meInIndex");
        }
    });

    Object.defineProperty(carousel, 'Initialize', {
        writable: false,
        value: function() {
            for (let divIndex = 1; divIndex < carousel.allSkillsAndPersonality.length; divIndex++)
                carousel.allSkillsAndPersonality[divIndex].style.display = "none";
            carousel.ChangeVisualGUIIndex();
        }
    });

    Object.defineProperty(carousel, 'Next', {
        writable: false,
        value: function() {
            carousel.allSkillsAndPersonality[carousel.skillsAndPersonalityCounter].style.display = "none";
            carousel.skillsAndPersonalityCounter = (carousel.skillsAndPersonalityCounter + 1) % carousel.allSkillsAndPersonality.length;
            carousel.allSkillsAndPersonality[carousel.skillsAndPersonalityCounter].style.display = "";
            carousel.ChangeVisualGUIIndex();
        }
    });

    Object.defineProperty(carousel, 'Previous', {
        writable: false,
        value: function() {
            carousel.allSkillsAndPersonality[carousel.skillsAndPersonalityCounter].style.display = "none";
            carousel.skillsAndPersonalityCounter = carousel.skillsAndPersonalityCounter - 1 < 0 ? carousel.allSkillsAndPersonality.length - 1 : carousel.skillsAndPersonalityCounter - 1;
            carousel.allSkillsAndPersonality[carousel.skillsAndPersonalityCounter].style.display = "";
            carousel.ChangeVisualGUIIndex();
        }
    });

    Object.defineProperty(carousel, 'SetAtIndex', {
        writable: false,
        value: function(targetIndex) {
            carousel.visualIndexInGUI[carousel.skillsAndPersonalityCounter].setAttribute("class", "index");
            carousel.allSkillsAndPersonality[carousel.skillsAndPersonalityCounter].style.display = "none";
            carousel.visualIndexInGUI[targetIndex].setAttribute("class", "index meInIndex");
            carousel.allSkillsAndPersonality[targetIndex].style.display = "";
            carousel.skillsAndPersonalityCounter = targetIndex;
        }
    });

    Object.defineProperty(carousel, 'TouchStart', {
        writable: false,
        value: function(event) {
            carousel.touchStartX = event.touches[0].clientX;
        }
    });

    Object.defineProperty(carousel, 'TouchEnd', {
        writable: false,
        value: function(event) {
            carousel.touchEndX = event.changedTouches[0].clientX;
            const touchThreshold = 10;
    
            if (carousel.touchStartX - carousel.touchEndX > touchThreshold) {
                carousel.Next();
            } else if (carousel.touchEndX - carousel.touchStartX > touchThreshold) {
                carousel.Previous();
            }
        }
    });

    carousel.Initialize();

    carousel.carouselElement = document.getElementById("skillsAndPersonalityMiddleCell");
    carousel.carouselElement.addEventListener("touchstart", (e) => carousel.TouchStart(e));
    carousel.carouselElement.addEventListener("touchend", (e) => carousel.TouchEnd(e));

    return carousel;
}
