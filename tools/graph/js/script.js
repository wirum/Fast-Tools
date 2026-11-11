//dropdowns

const dropdowns = document.querySelectorAll(".datasets, .chart-types, .customization");

dropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    })
});

//modal

const modal = document.querySelector(".dataset-modal");
const newDatasetButton = document.querySelector(".new-dataset");
const cancelbutton = document.querySelector("button[type='button']"); //especifica o botão cancel, porque é o unico type button

newDatasetButton.addEventListener("click", () => { modal.showModal(); });

cancelbutton.addEventListener("click", () => { modal.close(); });

//forms

const datasetForm = modal.querySelector("form");
const datasetInput = modal.querySelector("input");
const datasetList = document.querySelector(".dataset-list");
const emptyState = document.querySelector(".empty-state");

datasetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = datasetInput.value.trim();

    if (!name) {
        return
    }

    const dataset = document.createElement("p");
    dataset.textContent = name;

    datasetList.appendChild(dataset);

    emptyState.style.display = "none";

    datasetForm.reset();
    modal.close();
});