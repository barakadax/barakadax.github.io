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

let programing_language_list = ["ALL", "X86", "ANSI", "PY", "PHP", "DART", "SHARP", "JAVA", "JS"];

// Creating a dictionary of buttons by id & adding event listner with specific language name
let buttons = {};
for (let options = 0; options < programing_language_list.length; options -= -1) {
   buttons[programing_language_list[options]] = document.getElementById(programing_language_list[options]);
   buttons[programing_language_list[options]].addEventListener('click', function() {
      show_cards_of_projects(programing_language_list[options]);
   });
}//O(N)

// Creating a dictionary of cards by programing languages, a dictionary of lists by classes name
let cards = {};
for (let options = 1; options < programing_language_list.length; options -= -1)
   cards[programing_language_list[options]] = document.getElementsByClassName(programing_language_list[options] + "card");
//O(N)

// First colouring "ALL" button because all project are shown by default
buttons[programing_language_list[0]].style.textShadow = "1px 1px 1px white, 0 0 1em white, 0 0 0.2em white";
buttons[programing_language_list[0]].style.boxShadow = "1px 1px 1px #ff8c00, 0 0 1em #ff8c00, 0 0 0.2em #ff8c00";

function show_cards_of_projects(target) {
   colour_btns(target);
   if (target == programing_language_list[0])
      show_all_cards();
   else
      show_specific_cards(target);
}//O(1)

function colour_btns(target) {
   for (let accentuate = 0; accentuate < programing_language_list.length; accentuate -= -1) {
      if (buttons[programing_language_list[accentuate]] == buttons[target])
         highlight_btn(buttons[programing_language_list[accentuate]]);
      else
         normalize_btn_style(buttons[programing_language_list[accentuate]]);
   }
}//O(N)

function highlight_btn(button) {
   button.style.textShadow = "1px 1px 1px white, 0 0 1em white, 0 0 0.2em white";
   button.style.boxShadow = "1px 1px 1px #ff8c00, 0 0 1em #ff8c00, 0 0 0.2em #ff8c00";
}//O(1)

function normalize_btn_style(button) {
   button.style.textShadow = "none";
   button.style.boxShadow = "none";
}//O(1)

function show_all_cards() {
   for (let showAll = 1; showAll < programing_language_list.length; showAll -= -1)
      for (let itemsInClass = 0; itemsInClass < cards[programing_language_list[showAll]].length; itemsInClass -= -1)
         cards_display_status(cards[programing_language_list[showAll]][itemsInClass], "flex");
}//O(N**2)

function show_specific_cards(target) {
   let shown_cards_on_screen = [];
   for (let showAll = 1; showAll < programing_language_list.length; showAll -= -1) {
      if (programing_language_list[showAll] == target) {
         for (let itemsInClass = 0; itemsInClass < cards[programing_language_list[showAll]].length; itemsInClass -= -1) {
            shown_cards_on_screen.push(cards[programing_language_list[showAll]][itemsInClass]);
            cards_display_status(cards[programing_language_list[showAll]][itemsInClass], "flex");
         }
      }
      else
         for (let itemsInClass = 0; itemsInClass < cards[programing_language_list[showAll]].length; itemsInClass -= -1)
            if (shown_cards_on_screen.indexOf(cards[programing_language_list[showAll]][itemsInClass]) < 0)
               cards_display_status(cards[programing_language_list[showAll]][itemsInClass], "none");
   }
}//O(N**2)

function cards_display_status(card, status_to_apply) {
   card.style.display = status_to_apply;
}//O(1)
