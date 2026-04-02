'use strict';

getProjectsFromGitHub();

let contentIndex = getCarousel();

document.getElementById("nextInfo").addEventListener("click", function () {
    contentIndex.showNext();
});

document.getElementById("prevInfo").addEventListener("click", function () {
    contentIndex.showPrevious();
});

function carouselSetIndex(carouselContentIndex) {
    contentIndex.showAtIndex(carouselContentIndex);
}
