
//dropdowns

const dropdowns = document.querySelectorAll(
    ".datasets, .chart-types, .customization"
);

dropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", (event) => {

        if (event.target.closest(".dropdown-content")) {
            return;
        }

        dropdown.classList.toggle("active");
    });
});

//modal

const modal = document.querySelector(".dataset-modal");
const newDatasetButton = document.querySelector(".new-dataset");
const cancelbutton = modal.querySelector("button[type='button']"); //especifica o botão cancel, porque é o unico type button

newDatasetButton.addEventListener("click", () => { modal.showModal(); });

cancelbutton.addEventListener("click", () => { modal.close(); });

//forms
// põe e trás os treco do porão do localstorage

const datasetForm = modal.querySelector("form");
const datasetInput = modal.querySelector("input");
const datasetList = document.querySelector(".dataset-list");
const emptyState = document.querySelector(".empty-state");

datasetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = datasetInput.value.trim();

    if (!name) {
        return;
    }

    datasets.push({
        name: name
    });

    localStorage.setItem("datasets", JSON.stringify(datasets));

    renderDatasets();

    datasetForm.reset();
    modal.close();
});

//localstorage ganggg

let datasets = JSON.parse(localStorage.getItem("datasets")) || [];

function renderDatasets() {
    datasetList.innerHTML = "";

    datasets.forEach(dataset => {
        const item = document.createElement("p");
        item.textContent = dataset.name;

        datasetList.appendChild(item);
    });

    emptyState.style.display = datasets.length ? "none" : "block"; //inverte
}

renderDatasets();



