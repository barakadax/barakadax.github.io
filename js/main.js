/*
   _____ 	   |￣￣￣￣￣￣￣￣￣￣￣￣|
/~/~    ~\ 	   |                      |
| |   MY  \ 	|  code by Barak Taya  |
\ \  SLEEP \	|                      |
 \ \        \	|＿＿＿＿＿＿＿＿＿＿＿＿|
--\ \       .\''          ||
--==\ \     ,,i!!i,	     ||
    ''"'',,}{,,*/
'use strict';

getProjectsFromGitHub();

let contentIndex = getCarousel();

document.getElementById("nextInfo").addEventListener("click", function() {
   contentIndex.Next();
});

document.getElementById("prevInfo").addEventListener("click", function() {
   contentIndex.Previous();
});

function carouselSetIndex(carouselContentIndex) {
   contentIndex.SetAtIndex(carouselContentIndex);
};

setProjectButton();
