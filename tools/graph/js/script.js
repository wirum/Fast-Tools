const dropdowns = document.querySelectorAll(".datasets, .chart-types, .customization");

dropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    })
})

