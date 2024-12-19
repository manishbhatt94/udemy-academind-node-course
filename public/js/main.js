function mobileNavMenuHandler() {
  const backdrop = document.querySelector('.backdrop');
  const sideDrawer = document.querySelector('.mobile-nav');
  const menuToggle = document.querySelector('#side-menu-toggle');

  function backdropClickHandler() {
    backdrop.style.display = 'none';
    sideDrawer.classList.remove('open');
  }

  function menuToggleClickHandler() {
    backdrop.style.display = 'block';
    sideDrawer.classList.add('open');
  }

  backdrop.addEventListener('click', backdropClickHandler);
  menuToggle.addEventListener('click', menuToggleClickHandler);
}

function animateInvalidForm() {
  function handleAnimationEnd(e) {
    e.target.classList.remove('attention-please');
    e.target.removeEventListener('animationend', handleAnimationEnd);
  }
  const firstInvalidField = document.querySelector('.form-control.invalid');
  if (firstInvalidField) {
    firstInvalidField.addEventListener('animationend', handleAnimationEnd);
    firstInvalidField.classList.add('attention-please');
  }
}

function main() {
  mobileNavMenuHandler();
  animateInvalidForm();
}

document.addEventListener('DOMContentLoaded', main);
