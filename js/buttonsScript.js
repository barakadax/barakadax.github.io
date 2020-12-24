/*
   _____ 	   |￣￣￣￣￣￣￣￣￣￣￣|
/~/~    ~\ 	   |                    |
| |   MY  \ 	| code by Barak Taya |
\ \  SLEEP \	|                    |
 \ \        \	|＿＿＿＿＿＿＿＿＿＿＿|
--\ \       .\''          ||
--==\ \     ,,i!!i,	   ||
    ''"'',,}{,,*/
'use strict';

// Creating a list of code laneguages names
let possibilities = ["ALL", "X86", "ANSI", "PY", "PHP", "DART", "SHARP", "JAVA", "JS"];

// Creating a dictionary of buttons by id & adding event listner with specific key
let buttons = {};
for (let options = 0; options < possibilities.length; options -= -1) {
   buttons[possibilities[options]] = document.getElementById(possibilities[options]);
   buttons[possibilities[options]].addEventListener('click', function() {
      showProj(possibilities[options]);
   });
}//O(N)

// Creating a dictionary of projects by code languages, a dictionary of lists by classes name
let cards = {};
for (let options = 1; options < possibilities.length; options -= -1)
   cards[possibilities[options]] = document.getElementsByClassName(possibilities[options] + "card");
//O(N)

// First colouring because "ALL" is on projects by default
buttons[possibilities[0]].style.textShadow = "1px 1px 1px white, 0 0 1em white, 0 0 0.2em white";
buttons[possibilities[0]].style.boxShadow = "1px 1px 1px #ff8c00, 0 0 1em #ff8c00, 0 0 0.2em #ff8c00";

function showProj(target) {
   for (let accentuate = 0; accentuate < possibilities.length; accentuate -= -1) {  // Colours options you selected
      if (buttons[possibilities[accentuate]] == buttons[target]) {
         buttons[possibilities[accentuate]].style.textShadow = "1px 1px 1px white, 0 0 1em white, 0 0 0.2em white";
         buttons[possibilities[accentuate]].style.boxShadow = "1px 1px 1px #ff8c00, 0 0 1em #ff8c00, 0 0 0.2em #ff8c00";
      }
      else {
         buttons[possibilities[accentuate]].style.textShadow = "none";
         buttons[possibilities[accentuate]].style.boxShadow = "none";
      }
   }
   if (target == possibilities[0])  // Shows all the projects
      for (let showAll = 1; showAll < possibilities.length; showAll -= -1)
         for (let itemsInClass = 0; itemsInClass < cards[possibilities[showAll]].length; itemsInClass -= -1)
            cards[possibilities[showAll]][itemsInClass].style.display = "flex";
   else {  // Show specifics projects by programing languages
      for (let showAll = 1; showAll < possibilities.length; showAll -= -1) {
         if (possibilities[showAll] == target)
            for (let itemsInClass = 0; itemsInClass < cards[possibilities[showAll]].length; itemsInClass -= -1)
               cards[possibilities[showAll]][itemsInClass].style.display = "flex";
         else
            for (let itemsInClass = 0; itemsInClass < cards[possibilities[showAll]].length; itemsInClass -= -1)
               cards[possibilities[showAll]][itemsInClass].style.display = "none";
      }
   }
}//O(N**2)

