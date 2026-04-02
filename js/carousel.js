'use strict';

const SWIPE_THRESHOLD = 40;

function getCarousel() {
    const carousel = Object.create(null);
    carousel.currentIndex = 0;
    carousel.slides = document.getElementsByClassName("skillsAndPersonality");
    carousel.swipeStartX = 0;
    carousel.swipeEndX = 0;
    carousel.indicatorDots = null;

    Object.defineProperty(carousel, 'buildDotIndicators', {
        writable: false,
        value: function () {
            const counter = document.getElementById("counter");
            if (!counter) return;
            counter.innerHTML = '';
            for (let i = 0; i < carousel.slides.length; i++) {
                const dot = document.createElement("div");
                dot.className = "index";
                dot.onclick = () => carouselSetIndex(i);
                counter.appendChild(dot);
            }
        }
    });

    Object.defineProperty(carousel, 'syncDotIndicators', {
        writable: false,
        value: function () {
            for (let i = 0; i < carousel.slides.length; i++) {
                carousel.indicatorDots[i].setAttribute("class", "index");
            }
            carousel.indicatorDots[carousel.currentIndex].setAttribute("class", "index meInIndex");
        }
    });

    Object.defineProperty(carousel, 'initialize', {
        writable: false,
        value: function () {
            carousel.buildDotIndicators();
            carousel.indicatorDots = document.getElementsByClassName("index");
            for (let i = 1; i < carousel.slides.length; i++) {
                carousel.slides[i].style.display = "none";
            }
            carousel.syncDotIndicators();
        }
    });

    Object.defineProperty(carousel, 'showNext', {
        writable: false,
        value: function () {
            carousel.slides[carousel.currentIndex].style.display = "none";
            carousel.currentIndex = (carousel.currentIndex + 1) % carousel.slides.length;
            carousel.slides[carousel.currentIndex].style.display = "";
            carousel.syncDotIndicators();
        }
    });

    Object.defineProperty(carousel, 'showPrevious', {
        writable: false,
        value: function () {
            carousel.slides[carousel.currentIndex].style.display = "none";
            carousel.currentIndex = carousel.currentIndex - 1 < 0 ? carousel.slides.length - 1 : carousel.currentIndex - 1;
            carousel.slides[carousel.currentIndex].style.display = "";
            carousel.syncDotIndicators();
        }
    });

    Object.defineProperty(carousel, 'showAtIndex', {
        writable: false,
        value: function (targetIndex) {
            carousel.indicatorDots[carousel.currentIndex].setAttribute("class", "index");
            carousel.slides[carousel.currentIndex].style.display = "none";
            carousel.indicatorDots[targetIndex].setAttribute("class", "index meInIndex");
            carousel.slides[targetIndex].style.display = "";
            carousel.currentIndex = targetIndex;
        }
    });

    Object.defineProperty(carousel, 'recordSwipeStart', {
        writable: false,
        value: function (event) {
            carousel.swipeStartX = event.touches[0].clientX;
        }
    });

    Object.defineProperty(carousel, 'handleSwipeEnd', {
        writable: false,
        value: function (event) {
            carousel.swipeEndX = event.changedTouches[0].clientX;
            if (carousel.swipeStartX - carousel.swipeEndX > SWIPE_THRESHOLD) {
                carousel.showNext();
            } else if (carousel.swipeEndX - carousel.swipeStartX > SWIPE_THRESHOLD) {
                carousel.showPrevious();
            }
        }
    });

    carousel.initialize();

    carousel.carouselElement = document.getElementById("skillsAndPersonalityMiddleCell");
    carousel.carouselElement.addEventListener("touchstart", (e) => carousel.recordSwipeStart(e), { passive: true });
    carousel.carouselElement.addEventListener("touchend", (e) => carousel.handleSwipeEnd(e));

    return carousel;
}
