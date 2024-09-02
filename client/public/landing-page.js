// JavaScript for testimonials slideshow
let slideIndex = 0;
showTestimonial();

function showTestimonial() {
    let testimonials = document.getElementsByClassName("testimonial");
    for (let i = 0; i < testimonials.length; i++) {
        testimonials[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > testimonials.length) {
        slideIndex = 1;
    }
    testimonials[slideIndex - 1].style.display = "block";
    setTimeout(showTestimonial, 5000); // Change testimonial every 5 seconds
}


document.addEventListener("DOMContentLoaded", function () {
  const dropdownBtn = document.querySelector('.dropdown-btn');
  const closeBtn = document.querySelector('.close-btn');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const dropdownMenuBtn = document.querySelector('.dropdown-menu-btn');

  dropdownBtn.addEventListener('click', function () {
    dropdownMenu.classList.toggle('show');
    dropdownMenuBtn.classList.toggle('show');
  });

  closeBtn.addEventListener('click', function () {
    dropdownMenu.classList.remove('show');
    dropdownMenuBtn.classList.remove('show');
  });
});
