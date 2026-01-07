// Get the hamburger menu and the nav
const hamburgerMenu = document.getElementById('hamburger-menu');
const mainNavList = document.getElementById('main-nav-list');

// Toggle the "show-menu" class on click
hamburgerMenu.addEventListener('click', () => {
    mainNavList.classList.toggle('show-menu');
});

// Get the hamburger menu and the nav
const menu1 = document.getElementById('subMenu1');
const menu2 = document.getElementById('subMenu2');
const menu3 = document.getElementById('subMenu3');
const menu4 = document.getElementById('subMenu4');
const menu5 = document.getElementById('subMenu5');
const menu6 = document.getElementById('subMenu6');
const menu7 = document.getElementById('subMenu7');
const menu8 = document.getElementById('subMenu8');
const menu9 = document.getElementById('subMenu9');
const menu10 = document.getElementById('subMenu10');

menu1.addEventListener('click', () => {
    menu2.classList.toggle('show-menu2');
});
menu3.addEventListener('click', () => {
    menu4.classList.toggle('show-menu2');
});
menu5.addEventListener('click', () => {

    menu6.classList.toggle('show-menu2');
});
menu7.addEventListener('click', () => {
   
    menu8.classList.toggle('show-menu2');
});
menu9.addEventListener('click', () => {
  
    menu10.classList.toggle('show-menu2');
});


// Carousel about us page
document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper('.swiper-container', {
        loop: true, // Enable looping
        navigation: {
            nextEl: '.swiper-button-next', // Link the next button
            prevEl: '.swiper-button-prev', // Link the prev button
        },
        autoplay: {
            delay: 2500, // Auto-slide interval
            disableOnInteraction: false, // Continue autoplay after interaction
        },
        speed: 800, // Transition duration in milliseconds (smooth transition)
    });
});