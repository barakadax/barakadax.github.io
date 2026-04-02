'use strict';

const SMALL_SCREEN_BREAKPOINT = 1070;
const WIDE_SCREEN_BREAKPOINT = 2000;
const GRID_UNIT = 64;
const BASE_GRID_UNITS = 40;
const PIXEL_PER_UNIT = 15;
const BONUS_PER_THOUSAND = 50;
const UNIT_ADJUSTMENT = 10;
const SMALL_TOP_OFFSET = 10;
const STANDARD_TOP_OFFSET = 20;
const SHARE_SMALL_TOP = 75;
const SHARE_STANDARD_TOP = 85;
const MIN_SWIPE_DISTANCE = 40;

const menuController = Object.create(null);
menuController.menu = document.getElementById('menu');
menuController.menu.classList.add('right');
menuController.menuScreen = document.getElementById('menuScreen');
menuController.shareButton = document.getElementById('shareButton');
menuController.touchstartX = 0;
menuController.touchendX = 0;
menuController.mouseDown = false;
menuController.mouseStartX = 0;
menuController.mouseEndX = 0;

Object.defineProperty(menuController, 'syncShareButtonSide', {
    writable: false,
    value: function (toLeft) {
        if (!menuController.shareButton) return;
        if (toLeft) {
            menuController.shareButton.style.left = menuController.menu.style.left;
            menuController.shareButton.style.right = 'auto';
            menuController.shareButton.classList.remove('right');
            menuController.shareButton.classList.add('left');
        } else {
            menuController.shareButton.style.right = menuController.menu.style.right;
            menuController.shareButton.style.left = 'auto';
            menuController.shareButton.classList.remove('left');
            menuController.shareButton.classList.add('right');
        }
    }
});

Object.defineProperty(menuController, 'swipeToLeft', {
    writable: false,
    value: function () {
        const menuRight = window.getComputedStyle(menuController.menu).getPropertyValue('right');
        if (menuController.touchendX < menuController.touchstartX - MIN_SWIPE_DISTANCE && menuController.menu.style.right !== 'auto') {
            if (menuRight === 'auto' || parseInt(menuRight) > 0) {
                menuController.menu.style.left = menuController.menu.style.right;
                menuController.menu.style.right = 'auto';
                menuController.menu.classList.remove('right');
                menuController.menu.classList.add('left');
                menuController.syncShareButtonSide(true);
            }
        }
    }
});

Object.defineProperty(menuController, 'swipeToRight', {
    writable: false,
    value: function () {
        const menuLeft = window.getComputedStyle(menuController.menu).getPropertyValue('left');
        if (menuController.touchendX > menuController.touchstartX + MIN_SWIPE_DISTANCE && menuController.menu.style.right === 'auto') {
            if (menuLeft === 'auto' || parseInt(menuLeft) > 0) {
                menuController.menu.style.right = menuController.menu.style.left;
                menuController.menu.style.left = 'auto';
                menuController.menu.classList.remove('left');
                menuController.menu.classList.add('right');
                menuController.syncShareButtonSide(false);
            }
        }
    }
});

Object.defineProperty(menuController, 'handleSwipe', {
    writable: false,
    value: function () {
        menuController.swipeToLeft();
        menuController.swipeToRight();
    }
});

Object.defineProperty(menuController, 'calculateWideScreenOffset', {
    writable: false,
    value: function (bodyWidth) {
        const quotient = Math.ceil(bodyWidth / GRID_UNIT);
        const excessIncrements = quotient - BASE_GRID_UNITS;
        let extraWidth = quotient * PIXEL_PER_UNIT;
        if (excessIncrements <= 0) {
            extraWidth += (excessIncrements * PIXEL_PER_UNIT) + (excessIncrements * UNIT_ADJUSTMENT);
        } else {
            extraWidth += excessIncrements * PIXEL_PER_UNIT;
            extraWidth += parseInt(extraWidth / 1000) * BONUS_PER_THOUSAND;
        }
        return extraWidth;
    }
});

Object.defineProperty(menuController, 'applyRightPosition', {
    writable: false,
    value: function (rightValue) {
        menuController.menu.style.right = `${rightValue}px`;
        menuController.menu.style.left = 'auto';
        menuController.menu.classList.remove('left');
        menuController.menu.classList.add('right');
        if (menuController.shareButton) {
            menuController.shareButton.style.right = `${rightValue}px`;
            menuController.shareButton.style.left = 'auto';
            menuController.shareButton.classList.remove('left');
            menuController.shareButton.classList.add('right');
        }
    }
});

Object.defineProperty(menuController, 'adjustMenuPosition', {
    writable: false,
    value: function () {
        const bodyWidth = document.body.scrollWidth;

        if (bodyWidth <= SMALL_SCREEN_BREAKPOINT) {
            menuController.menu.style.top = `${SMALL_TOP_OFFSET}px`;
            menuController.menu.style.right = `${SMALL_TOP_OFFSET}px`;
            if (menuController.shareButton) {
                menuController.shareButton.style.top = `${SHARE_SMALL_TOP}px`;
                menuController.shareButton.style.right = `${SMALL_TOP_OFFSET}px`;
            }
        } else if (bodyWidth > WIDE_SCREEN_BREAKPOINT) {
            menuController.menu.style.top = `${STANDARD_TOP_OFFSET}px`;
            if (menuController.shareButton) {
                menuController.shareButton.style.top = `${SHARE_STANDARD_TOP}px`;
            }
            if (window.getComputedStyle(menuController.menu).getPropertyValue('right') !== 'auto') {
                menuController.applyRightPosition(menuController.calculateWideScreenOffset(bodyWidth));
            }
        } else {
            menuController.menu.style.top = `${STANDARD_TOP_OFFSET}px`;
            if (menuController.shareButton) {
                menuController.shareButton.style.top = `${SHARE_STANDARD_TOP}px`;
            }
            if (window.getComputedStyle(menuController.menu).getPropertyValue('right') !== 'auto') {
                menuController.applyRightPosition(STANDARD_TOP_OFFSET);
            }
        }
    }
});

menuController.menu.addEventListener('touchstart', (event) => {
    menuController.touchstartX = event.changedTouches[0].screenX;
}, { passive: true });

menuController.menu.addEventListener('touchend', (event) => {
    menuController.touchendX = event.changedTouches[0].screenX;
    menuController.handleSwipe();
});

menuController.menu.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    menuController.mouseDown = true;
    menuController.mouseStartX = event.screenX;
    menuController.mouseEndX = event.screenX;

    const onMouseMove = (moveEvent) => {
        if (!menuController.mouseDown) return;
        menuController.mouseEndX = moveEvent.screenX;
    };

    const onMouseUp = (upEvent) => {
        if (!menuController.mouseDown) return;
        menuController.mouseDown = false;
        menuController.mouseEndX = upEvent.screenX;
        menuController.touchstartX = menuController.mouseStartX;
        menuController.touchendX = menuController.mouseEndX;
        menuController.handleSwipe();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

menuController.menu.addEventListener('click', () => {
    menuController.menu.classList.toggle('open');
    const isOpen = menuController.menu.classList.contains('open');
    menuController.menuScreen.style.display = isOpen ? "flex" : "none";
    document.body.classList.toggle('no-scroll', isOpen);
    if (menuController.shareButton) {
        menuController.shareButton.style.display = isOpen ? "none" : "flex";
    }
});

if (menuController.shareButton) {
    menuController.shareButton.addEventListener('click', async () => {
        const shareData = {
            title: document.title,
            text: menuController.shareButton.dataset.shareText || 'Check out this article!',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    });
}

window.addEventListener('load', menuController.adjustMenuPosition);
window.addEventListener('resize', menuController.adjustMenuPosition);
