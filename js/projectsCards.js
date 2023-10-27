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

function setProjectButton() {
    let pressedButtonTextShadowStyle = "1px 1px 1px white, 0 0 2px white, 0 0 0.2em white";
    let pressedButtonBoxShadowStyle = "1px 1px 1px var(--Red-color), 0 0 2px var(--Red-color), 0 0 0.2em var(--Red-color)";

    document.getElementsByTagName("button")[0].style.boxShadow = pressedButtonBoxShadowStyle;
    document.getElementsByTagName("button")[0].style.textShadow = pressedButtonTextShadowStyle;
    
    Array.prototype.forEach.call(document.getElementsByTagName("button"), cardButton => cardButton.addEventListener("click", function() {
        Array.prototype.forEach.call(document.getElementsByClassName("projectsRow"), projectCard => {
            cardButton.id === "ALL" ? projectCard.style.display = "" : !projectCard.className.includes(cardButton.id) ? projectCard.style.display = "none" : projectCard.style.display = "";
        });

        setButtonsStyle(cardButton);

        function setButtonsStyle(targetButton) {
            for (let buttonIndex = 0; buttonIndex < document.getElementsByTagName("button").length; buttonIndex++)
                setNoStyleToButton(document.getElementsByTagName("button")[buttonIndex]);
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
    }));
}
