//graph

const categoryList = document.querySelector(".category-list");
const options = {
    chart: {
        type: "bar",
        height: "100%",
        width: "100%",
        foreColor: "#E3E2E6",
        fontFamily: "Google Sans Flex, sans-serif"
    },
    series: [{
        name: "teste",
        data: [30, 40, 35, 50]
    }],
    xaxis: {
        categories: ["Jan", "Fev", "Mar", "Abr"]
    }
};

const chart = new ApexCharts(
    document.querySelector(".chart"), options
);

function updateChart() {
    const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

    if (!selectedDataset) return;

    chart.updateOptions({
        xaxis: {
            categories: selectedDataset.categories
        },
        series: selectedDataset.series
    });
}


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
        id: crypto.randomUUID(),
        name: name,
        categories: [],
        series: []
    });

    localStorage.setItem("datasets", JSON.stringify(datasets));

    renderDatasets();

    datasetForm.reset();
    modal.close();
});

//localstorage ganggg
//renderiza e cria os datasets

let datasets = JSON.parse(localStorage.getItem("datasets")) || [];
let selectedDatasetId = null;
const datasetTitle = document.querySelector(".dataset-title");
const datasetConfig = document.querySelector(".dataset-config");
const graphTitle = document.querySelector(".graph-title");

function renderDatasets() {
    datasetList.innerHTML = "";

    datasets.forEach(dataset => {
        if (!dataset.id) {
            dataset.id = crypto.randomUUID();
        }
        const item = document.createElement("div");
        item.classList.add("dataset-item");
        item.dataset.id = dataset.id
        const name = document.createElement("span");
        item.addEventListener("click", () => {
            selectedDatasetId = dataset.id;
            datasetTitle.textContent = dataset.name;

            datasetConfig.hidden = false;
            graphTitle.hidden = false;

            graphTitle.style.display = "flex";
            datasetConfig.style.display = "flex";
            renderCategories();
            updateChart();
        });
        name.textContent = dataset.name;
        item.appendChild(name);
        datasetList.appendChild(item);
    });

    localStorage.setItem("datasets", JSON.stringify(datasets));

    emptyState.style.display = datasets.length ? "none" : "block"; //inverte
}

renderDatasets();

// delete modal

const configModal = document.querySelector(".config-modal");
const configDatasetName = document.querySelector(".config-dataset-name");
const deleteConfirmModal = document.querySelector(".delete-confirm-modal");

const deleteDatasetButton = document.querySelector(".delete-dataset");
const closeConfigButton = document.querySelector(".close-config");
const cancelDeleteButton = document.querySelector(".cancel-delete");
const confirmDeleteButton = document.querySelector(".confirm-delete");

datasetConfig.addEventListener("click", () => {
    const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

    if (!selectedDataset) return;

    configDatasetName.textContent = selectedDataset.name;
    configModal.showModal();
});

closeConfigButton.addEventListener("click", () => {
    configModal.close();
});

deleteDatasetButton.addEventListener("click", () => {
    deleteConfirmModal.showModal();
});

cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmModal.close();
})

confirmDeleteButton.addEventListener("click", () => {
    datasets = datasets.filter(dataset => dataset.id !== selectedDatasetId);

    localStorage.setItem("datasets", JSON.stringify(datasets));

    renderDatasets();

    selectedDatasetId = null;

    datasetTitle.textContent = "Select a dataset";
    datasetConfig.hidden = true;
    graphTitle.hidden = true

    configModal.close();
    deleteConfirmModal.close();
})

chart.render();

// customize

const categoryInput = document.querySelector(".category-input");
const addCategoryButton = document.querySelector(".add-category");

addCategoryButton.addEventListener("click", () => {
    const categoryName = categoryInput.value.trim();

    if (!categoryName || !selectedDatasetId) return;

    const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

    selectedDataset.categories.push(categoryName);

    selectedDataset.series.forEach(series => {
        series.data.push(0);
    })

    localStorage.setItem("datasets", JSON.stringify(datasets));
    renderCategories();
    updateChart();
    categoryInput.value = "";
})

function renderCategories() {
    categoryList.innerHTML = "";

    const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

    if (!selectedDataset) return;

    if (selectedDataset.series.length === 0) {
        selectedDataset.series.push({
            name: "Series 1",
            data: selectedDataset.categories.map(() => 0)
        });
    }

    selectedDataset.categories.forEach(category => {
        const item = document.createElement("div");
        item.classList.add("category-item");

        const name = document.createElement("span");
        name.textContent = category;

        const value = document.createElement("input");
        value.type = "number";

        const categoryIndex = selectedDataset.categories.indexOf(category);
        value.value = selectedDataset.series[0].data[categoryIndex] ?? 0; //selectedDataset.series[0]: pega a primeira série do dataset. | .data: acessa os valores dessa série. | [categoryIndex]: pega o valor na posição da categoria atual. | ?? 0: se esse valor for null ou undefined, usa zero.

        value.addEventListener("input", () => {
            selectedDataset.series[0].data[categoryIndex] = Number(value.value);

            localStorage.setItem("datasets", JSON.stringify(datasets));

            updateChart();
        })

        item.append(name, value);

        categoryList.appendChild(item);
    })
}
