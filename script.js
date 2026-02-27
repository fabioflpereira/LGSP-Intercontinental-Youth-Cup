// Get the hamburger menu and the nav
const hamburgerMenu = document.getElementById("hamburger-menu");
const mainNavList = document.getElementById("main-nav-list");

// Toggle the "show-menu" class on click
hamburgerMenu.addEventListener("click", () => {
  mainNavList.classList.toggle("show-menu");
});

// Get the hamburger menu and the nav
const menu1 = document.getElementById("subMenu1");
const menu2 = document.getElementById("subMenu2");
const menu3 = document.getElementById("subMenu3");
const menu4 = document.getElementById("subMenu4");
const menu5 = document.getElementById("subMenu5");
const menu6 = document.getElementById("subMenu6");
const menu7 = document.getElementById("subMenu7");
const menu8 = document.getElementById("subMenu8");
const menu9 = document.getElementById("subMenu9");
const menu10 = document.getElementById("subMenu10");

menu1.addEventListener("click", () => {
  menu2.style.visibility === "visible"
    ? (menu2.style.visibility = "hidden")
    : (menu2.style.visibility = "visible");
});
menu3.addEventListener("click", () => {
  menu4.style.visibility === "visible"
    ? (menu4.style.visibility = "hidden")
    : (menu4.style.visibility = "visible");
});
menu5.addEventListener("click", () => {
  menu6.style.visibility === "visible"
    ? (menu6.style.visibility = "hidden")
    : (menu6.style.visibility = "visible");
});
menu7.addEventListener("click", () => {
  menu8.style.visibility === "visible"
    ? (menu8.style.visibility = "hidden")
    : (menu8.style.visibility = "visible");
});
menu9.addEventListener("click", () => {
  menu10.style.visibility === "visible"
    ? (menu10.style.visibility = "hidden")
    : (menu10.style.visibility = "visible");
});

// Carousel about us page
document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper(".swiper-container", {
    loop: true, // Enable looping
    navigation: {
      nextEl: ".swiper-button-next", // Link the next button
      prevEl: ".swiper-button-prev", // Link the prev button
    },
    autoplay: {
      delay: 2500, // Auto-slide interval
      disableOnInteraction: false, // Continue autoplay after interaction
    },
    speed: 800, // Transition duration in milliseconds (smooth transition)
  });
});

(function () {
  const track = document.querySelector(".rail-track");
  const viewport = document.querySelector(".rail-viewport");
  const items = Array.from(document.querySelectorAll(".rail-item"));
  const prev = document.querySelector(".rail-btn--prev");
  const next = document.querySelector(".rail-btn--next");

  // Read the CSS gap from the track (fallback to 24 if not found)
  function getGap() {
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap || "24");
    return Number.isFinite(gap) ? gap : 24;
  }

  // Measure one step (card width + gap). Uses the first card.
  function getStep() {
    const firstCard = items[0].querySelector(".partner-card");
    const gap = getGap();
    const cardWidth = firstCard.getBoundingClientRect().width;
    return cardWidth + gap;
  }

  // How many items fit in viewport
  function itemsPerView() {
    const step = getStep();
    const vpWidth = viewport.getBoundingClientRect().width;
    // add a tiny epsilon to avoid fencepost issues
    return Math.max(1, Math.floor((vpWidth + 0.5) / step));
  }

  let index = 0;

  function update() {
    const step = getStep();
    const translate = -index * step;
    track.style.transform = `translateX(${translate}px)`;

    const maxIndex = Math.max(0, items.length - itemsPerView());
    prev.disabled = index <= 0;
    next.disabled = index >= maxIndex;
  }

  next.addEventListener("click", () => {
    const maxIndex = Math.max(0, items.length - itemsPerView());
    if (index < maxIndex) {
      index += 1;
      update();
    }
  });

  prev.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      update();
    }
  });

  // Recompute on resize to keep containment
  window.addEventListener("resize", update);
  update();
})();


  const form = document.getElementById('cardForm'); // Selects the form

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevents the default form submission
    const formData = new FormData(form);
    fetch('formProcessingEngine.php', { // Replace with the path to your PHP script
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(result => {
        if (result === 'success') {
          alert("Message sent successfully!"); // Success message
          form.reset(); // Optionally reset the form fields
          setTimeout(() => {
            window.location.href = '/'; // Redirect after a short delay
          }, 2000); // Delay of 2 seconds (2000 milliseconds)
        } else {
          alert("An error occurred while sending the message.");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while sending the message.");
      });
  });
