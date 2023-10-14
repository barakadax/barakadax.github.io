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

class projectsCards{
    constructor() {
        document.getElementsByTagName("button")[0].style.textShadow = "1px 1px 1px white, 0 0 1em white, 0 0 0.2em white";
        document.getElementsByTagName("button")[0].style.boxShadow = "1px 1px 1px var(--Red-color), 0 0 1em var(--Red-color), 0 0 0.2em var(--Red-color)";
    }

    execute() {
        Array.prototype.forEach.call(document.getElementsByTagName("button"), cardButton => cardButton.addEventListener("click", function() {
            let pressedButtonTextShadowStyle = "1px 1px 1px white, 0 0 1em white, 0 0 0.2em white";
            let pressedButtonBoxShadowStyle = "1px 1px 1px var(--Red-color), 0 0 1em var(--Red-color), 0 0 0.2em var(--Red-color)";
            
            Array.prototype.forEach.call(document.getElementsByClassName("card"), projectCard => {
                cardButton.id === "ALL" ? projectCard.style.display = "" :!projectCard.className.includes(cardButton.id) ? projectCard.style.display = "none" : projectCard.style.display = "";
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
}