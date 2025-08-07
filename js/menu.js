'use strict';

const menuController = Object.create(null);
menuController.menu = document.getElementById('menu');
menuController.menu.classList.add('right');
menuController.menuScreen = document.getElementById('menuScreen');
menuController.touchstartX = 0;
menuController.touchendX = 0;
menuController.minSwipeDistance = 40;
menuController.mouseDown = false;
menuController.mouseStartX = 0;
menuController.mouseEndX = 0;

Object.defineProperty(menuController, 'handleSwipe', {
    writable: false,
    value: function() {
      const menuLeft = window.getComputedStyle(menuController.menu).getPropertyValue('left');
      const menuRight = window.getComputedStyle(menuController.menu).getPropertyValue('right');

      if (menuController.touchendX < menuController.touchstartX - menuController.minSwipeDistance && menuController.menu.style.right !== 'auto') {
        if (menuRight === 'auto' || parseInt(menuRight) > 0) {
          menuController.menu.style.left = menuController.menu.style.right;
          menuController.menu.style.right = 'auto';
          menuController.menu.classList.remove('right');
          menuController.menu.classList.add('left');
        }
      }

      if (menuController.touchendX > menuController.touchstartX + menuController.minSwipeDistance && menuController.menu.style.right === 'auto') {
        if (menuLeft === 'auto' || parseInt(menuLeft) > 0) {
          menuController.menu.style.right = menuController.menu.style.left;
          menuController.menu.style.left = 'auto';
          menuController.menu.classList.remove('left');
          menuController.menu.classList.add('right');
        }
      }
    }
  }
);

menuController.menu.addEventListener('touchstart', (event) => {
  menuController.touchstartX = event.changedTouches[0].screenX;
});

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
});

Object.defineProperty(menuController, 'adjustMenuPosition', {
    writable: false,
    value: function() {
      const bodyWidth = document.body.scrollWidth;

      if (bodyWidth <= 1070) {
        menuController.menu.style.top = '10px';
        menuController.menu.style.right = '10px';
      } else if (bodyWidth > 2000) {
        const quotient = Math.ceil(bodyWidth / 64);
        const excessIncrements = quotient - 40;

        let extraWidth = (quotient * 15);
        if (excessIncrements <= 0) {
          extraWidth += (excessIncrements * 15) + (excessIncrements * 10);
        } else {
          extraWidth += (excessIncrements * 15);
          extraWidth += parseInt(extraWidth / 1000) * 50;
        }

        if (window.getComputedStyle(menuController.menu).getPropertyValue('right') !== 'auto') {
          menuController.menu.style.right = `${extraWidth}px`;
          menuController.menu.style.left = 'auto';
          menuController.menu.classList.remove('left');
          menuController.menu.classList.add('right');
        }
      } else {
        if (window.getComputedStyle(menuController.menu).getPropertyValue('right') !== 'auto') {
          menuController.menu.style.right = '20px';
          menuController.menu.style.left = 'auto';
          menuController.menu.classList.remove('left');
          menuController.menu.classList.add('right');
        }
      }
    }
  }
);

window.addEventListener('load', menuController.adjustMenuPosition);
window.addEventListener('resize', menuController.adjustMenuPosition);
