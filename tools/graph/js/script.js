//dropdowns

const dropdowns = document.querySelectorAll(".datasets, .chart-types, .customization");

dropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    })
})

//modal

const modal = document.querySelector(".dataset-modal");
const newDatasetButton = document.querySelector(".new-dataset");
const cancelbutton = document.querySelector("button[type='button']"); //especifica o botão cancel, porque é o unico type button

newDatasetButton.addEventListener("click", () => { modal.showModal(); });

cancelbutton.addEventListener("click", () => { modal.close(); });