/*
   _____ 	   |￣￣￣￣￣￣￣￣￣￣￣￣|
/~/~    ~\ 	   |                    |
| |   MY  \ 	| code by Barak Taya |
\ \  SLEEP \	|                    |
 \ \        \	|＿＿＿＿＿＿＿＿＿＿＿＿|
--\ \       .\''          ||
--==\ \     ,,i!!i,	     ||
    ''"'',,}{,,*/
'use strict';

let contentIndex = new carousel();
let projectsShowOff = new projectsCards();
projectsShowOff.execute();

document.getElementById("nextInfo").addEventListener("click", function() {
   contentIndex.next();
});

document.getElementById("prevInfo").addEventListener("click", function() {
   contentIndex.previous();
});

function carouselSetIndex(carouselContentIndex) {
   contentIndex.setAtIndex(carouselContentIndex);
}