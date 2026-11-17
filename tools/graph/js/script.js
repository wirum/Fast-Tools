//graph

const categoryList = document.querySelector(".category-list");
const chartTypes = document.querySelector(".chart-types");
const customization = document.querySelector(".customization");


let datasets = [];

try {
    datasets = JSON.parse(localStorage.getItem("datasets")) || [];
}
catch (error) {
    console.error("Error loading datasets:", error);
}

if (!Array.isArray(datasets)) {
    console.error("Invalid datasets format.");
    datasets = [];
}

let selectedDatasetId = null;
let selectedGraphId = null;

function resetSelection() {
    selectedDatasetId = null;
    selectedGraphId = null;
}

function saveDatasets() {
    localStorage.setItem("datasets", JSON.stringify(datasets));
}

function getSelectedDataset() {
    return datasets.find(dataset => dataset.id === selectedDatasetId);
}

function getSelectedGraph() {
    const selectedDataset = getSelectedDataset();

    return selectedDataset?.graphs.find(graph => graph.id === selectedGraphId); //o ? ali faz sacessar somente se tiver algo, pra nao dar null
}

function clearChart() {
    chart.updateOptions({
        xaxis: {
            categories: []
        },
        series: []
    });
}

function createElement(tag, className) {
    const element = document.createElement(tag);
    element.classList.add(className);

    return element;
}

function showDataset(type) {
    datasetList.hidden = false;
    newDatasetButton.hidden = false;
    emptyState.hidden = false;

    graphList.hidden = true;
    newGraph.hidden = true;
    backDatasets.hidden = true;

    datasetConfig.hidden = true;
    graphTitle.hidden = true;
    graphConfig.hidden = true;

    graphConfig.style.display = "none";
    datasetConfig.style.display = "none";
    graphTitle.style.display = "none";

    datasetTitle.textContent = "Select a dataset";
    graphTitle.textContent = "Select a graph";
    categoryList.innerHTML = "";

    hideGraphControls();
}

const chart = new ApexCharts(
    document.querySelector(".chart"),
    {
        chart: {
            type: "bar",
            height: "100%",
            width: "100%",
            foreColor: "#E3E2E6",
            fontFamily: "Google Sans Flex, sans-serif"
        },
        series: [],
        xaxis: {
            categories: []
        }

    }
);

function updateChart() {
    const selectedDataset = getSelectedDataset();

    const selectedGraph = getSelectedGraph();

    if (!selectedDataset || !selectedGraph) {
        clearChart();
        return;
    }

    chart.updateOptions({
        xaxis: {
            categories: selectedDataset.categories
        },
        series: selectedDataset.series
    });
}

function hideGraphControls() {
    chartTypes.hidden = true;
    customization.hidden = true;
}

function showGraphControls() {
    chartTypes.hidden = false;
    customization.hidden = false;
}

//graph config

const graphConfig = document.querySelector(".graph-config");

const graphConfigModal = document.querySelector(".graph-config-modal");
const graphNameInput = document.querySelector(".graph-name-input");

const graphDeleteModal = document.querySelector(".delete-graph-confirm-modal");
const cancelGraphDelete = document.querySelector(".cancel-delete-graph");
const confirmGraphDelete = document.querySelector(".confirm-delete-graph");
const deleteGraphButton = document.querySelector(".delete-graph");

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

// alternando entre dataset e charts

const graphList = document.querySelector(".graph-list");
const backDatasets = document.querySelector(".back-datasets");
const newGraph = document.querySelector(".new-graph");

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
        series: [],
        graphs: [{
            id: crypto.randomUUID(),
            name: "Graph 1",
            type: "bar"
        }],
    });

    renderDatasets();

    datasetForm.reset();
    modal.close();
});

//localstorage ganggg
//renderiza e cria os datasets

const datasetTitle = document.querySelector(".dataset-title");
const datasetConfig = document.querySelector(".dataset-config");
const graphTitle = document.querySelector(".graph-title");

function renderDatasets() {
    datasetList.innerHTML = "";
    let updatedIds = false;

    datasets.forEach(dataset => {

        if (!dataset.id) {
            dataset.id = crypto.randomUUID();
            updatedIds = true;
        }
        const item = createElement("div", "dataset-item");
        item.dataset.id = dataset.id
        const name = document.createElement("span");
        item.addEventListener("click", () => {
            selectedGraphId = null;
            graphTitle.textContent = "Select a graph";

            graphConfig.style.display = "none";

            hideGraphControls();

            selectedDatasetId = dataset.id;
            datasetTitle.textContent = dataset.name;

            datasetList.hidden = true;
            emptyState.hidden = true;
            newDatasetButton.hidden = true;

            graphList.hidden = false;
            newGraph.hidden = false;
            backDatasets.hidden = false;

            datasetConfig.hidden = false;
            graphTitle.hidden = false;

            graphTitle.style.display = "flex";
            datasetConfig.style.display = "flex";

            renderGraphs(dataset);

            renderCategories();
            updateChart();
        });

        name.textContent = dataset.name;
        item.appendChild(name);
        datasetList.appendChild(item);
    });

    if (updatedIds) {
        saveDatasets();
    }

    emptyState.style.display = datasets.length ? "none" : "block"; //inverte
}

function renderGraphs(dataset) {
    graphList.innerHTML = "";

    dataset.graphs.forEach(graph => {
        const item = createElement("div", "graph-item");

        const name = document.createElement("span");
        name.textContent = graph.name;

        item.appendChild(name);

        item.addEventListener("click", () => {
            selectedGraphId = graph.id;
            graphTitle.textContent = graph.name;
            graphConfig.hidden = false;
            graphConfig.style.display = "flex";
            showGraphControls();

            updateChart();
        })
        graphList.appendChild(item);
    })
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

//category edit modal

const categoryEditModal = document.querySelector(".category-edit-modal");
const categoryNameInput = document.querySelector(".category-name-input");
const closeCategoryEdit = document.querySelector(".close-category-edit");
const saveCategoryEdit = document.querySelector(".save-category-edit");
let editingCategoryIndex = null;

datasetConfig.addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();

    if (!selectedDataset) return;

    configDatasetName.textContent = selectedDataset.name;
    configModal.showModal();
});

graphConfig.addEventListener("click", () => {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    graphNameInput.value = selectedGraph.name;
    graphConfigModal.showModal();
});

document.querySelector(".save-graph-name").addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    const newName = graphNameInput.value.trim();

    if (!newName) return;

    selectedGraph.name = newName;

    saveDatasets();
    graphTitle.textContent = newName;

    renderGraphs(selectedDataset);
    graphConfigModal.close();
});

const closeGraphConfig = document.querySelector(".close-graph-config");

closeGraphConfig.addEventListener("click", () => {
    graphConfigModal.close();
})

deleteGraphButton.addEventListener("click", () => {
    graphConfigModal.close();
    graphDeleteModal.showModal();
})

cancelGraphDelete.addEventListener("click", () => {
    graphDeleteModal.close();
})

closeConfigButton.addEventListener("click", () => {
    configModal.close();
});

deleteDatasetButton.addEventListener("click", () => {
    deleteConfirmModal.showModal();
});

cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmModal.close();
});

closeCategoryEdit.addEventListener("click", () => {
    categoryEditModal.close();
})

saveCategoryEdit.addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();

    if (!selectedDataset) return;

    const newName = categoryNameInput.value.trim();

    if (!newName) return;

    selectedDataset.categories[editingCategoryIndex] = newName;

    saveDatasets();

    renderCategories();
    updateChart();

    categoryEditModal.close();
})

confirmGraphDelete.addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();

    if (!selectedDataset) return

    selectedDataset.graphs = selectedDataset.graphs.filter(graph => graph.id !== selectedGraphId);

    selectedGraphId = null;
    graphTitle.textContent = "Select a graph";
    graphConfig.hidden = true;

    saveDatasets();

    renderGraphs(selectedDataset);
    updateChart();

    graphConfig.style.display = "none";


    hideGraphControls();

    graphDeleteModal.close();
});

confirmDeleteButton.addEventListener("click", () => {
    datasets = datasets.filter(dataset => dataset.id !== selectedDatasetId);

    resetSelection();

    saveDatasets();

    renderDatasets();

    showDataset();

    configModal.close();
    deleteConfirmModal.close();
});

chart.render();

// customize

const categoryInput = document.querySelector(".category-input");
const addCategoryButton = document.querySelector(".add-category");

addCategoryButton.addEventListener("click", () => {
    const categoryName = categoryInput.value.trim();

    if (!categoryName || !selectedDatasetId) return;

    const selectedDataset = getSelectedDataset();

    selectedDataset.categories.push(categoryName);

    selectedDataset.series.forEach(series => {
        series.data.push(0);
    })

    saveDatasets();
    renderCategories();
    updateChart();
    categoryInput.value = "";
})

function renderCategories() {
    categoryList.innerHTML = "";

    const selectedDataset = getSelectedDataset();

    if (!selectedDataset) return;

    if (selectedDataset.series.length === 0) {
        selectedDataset.series.push({
            name: "Series 1",
            data: selectedDataset.categories.map(() => 0)
        });
    }

    selectedDataset.categories.forEach((category, categoryIndex) => {
        const item = createElement("div", "category-item");

        const name = document.createElement("span");
        name.textContent = category;

        const edit = document.createElement("button");

        edit.addEventListener("click", (event) => {
            event.stopPropagation(); //previne o caos

            editingCategoryIndex = categoryIndex;
            categoryNameInput.value = category;

            categoryEditModal.showModal();
        });

        edit.classList.add("btn-flat");
        edit.innerHTML = '<i class="material-symbols-outlined">edit</i>';

        const value = document.createElement("input");
        value.type = "number";
        value.value = selectedDataset.series[0].data[categoryIndex] ?? 0; //selectedDataset.series[0]: pega a primeira série do dataset. | .data: acessa os valores dessa série. | [categoryIndex]: pega o valor na posição da categoria atual. | ?? 0: se esse valor for null ou undefined, usa zero.

        value.addEventListener("input", () => {
            selectedDataset.series[0].data[categoryIndex] = Number(value.value);

            saveDatasets();

            updateChart();
        })



        const remove = document.createElement("button");
        remove.classList.add("btn-flat");
        remove.innerHTML = '<i class="material-symbols-outlined">delete</i>';

        remove.addEventListener("click", (event) => {
            event.stopPropagation();
            selectedDataset.categories.splice(categoryIndex, 1);

            selectedDataset.series.forEach(series => {
                series.data.splice(categoryIndex, 1);
            });

            saveDatasets();

            renderCategories();
            updateChart();
        });

        item.append(name, edit, value, remove);
        categoryList.appendChild(item);
    })
}

// alternando entre dataset e charts

backDatasets.addEventListener("click", () => {
    resetSelection();
    showDataset();

    clearChart();
});

newGraph.addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();

    if (!selectedDataset) return;

    const graphNumber = selectedDataset.graphs.length + 1;

    const graph = {
        id: crypto.randomUUID(),
        name: `Graph ${graphNumber}`,
        type: "bar"
    }

    selectedDataset.graphs.push(graph);

    saveDatasets();

    renderGraphs(selectedDataset);
});




