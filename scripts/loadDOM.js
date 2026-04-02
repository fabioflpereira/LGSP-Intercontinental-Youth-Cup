function loadComponent(id, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      if (document.getElementById(id))
        document.getElementById(id).innerHTML = data;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("mainav", "../pages/Components/header.html");
  loadComponent("mainfooter", "../pages/Components/footer.html");
  loadComponent("mainav_en", "../pages/Components/header_en.html");
  loadComponent("mainfooter_en", "../pages/Components/footer_en.html");
});
