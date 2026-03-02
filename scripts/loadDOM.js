function loadComponent(id, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(id).innerHTML = data;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-placeholder", "../Components/header.html");
  loadComponent("footer-placeholder", "../Components/footer.html");
});
