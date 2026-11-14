//graph

const categoryList = document.querySelector(".category-list");


let datasets = [];

try {
    datasets = JSON.parse(localStorage.getItem("datasets")) || [];
}
catch (error) {
    console.error("Error loading datasets:", error);
}

if (!Array.isArray(datasets)) {
    console.error("Invalid datasets format.");
}
let selectedDatasetId = null;
let selectedGraphId = null;

datasets.forEach(dataset => {
    if (!dataset.graphs || dataset.graphs.length === 0) {
        dataset.graphs = [{
            id: crypto.randomUUID(),
            name: "Graph 1",
            type: "bar"
        }]
    }
});

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
        series: [],
        graphs: [{
            id: crypto.randomUUID(),
            name: "Graph 1",
            type: "bar"
        }],
    });

    localStorage.setItem("datasets", JSON.stringify(datasets));

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

    datasets.forEach(dataset => {

        if (!dataset.id) {
            dataset.id = crypto.randomUUID();
        }
        const item = document.createElement("div");
        item.classList.add("dataset-item");
        item.dataset.id = dataset.id
        const name = document.createElement("span");
        item.addEventListener("click", () => {
            selectedGraphId = null;
            graphTitle.textContent = "Select a graph";

            document.querySelector(".chart-types").hidden = true;
            document.querySelector(".customization").hidden = true;

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

    localStorage.setItem("datasets", JSON.stringify(datasets));

    emptyState.style.display = datasets.length ? "none" : "block"; //inverte
}

function renderGraphs(dataset) {
    graphList.innerHTML = "";

    dataset.graphs.forEach(graph => {
        const item = document.createElement("div");
        item.classList.add("graph-item");

        const name = document.createElement("span");
        name.textContent = graph.name;

        item.appendChild(name);

        item.addEventListener("click", () => {
            selectedGraphId = graph.id;
            graphTitle.textContent = graph.name;
            document.querySelector(".chart-types").hidden = false;
            document.querySelector(".customization").hidden = false;

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

    selectedDataset.categories.forEach((category, categoryIndex) => {
        const item = document.createElement("div");
        item.classList.add("category-item");

        const name = document.createElement("span");
        name.textContent = category;

        const value = document.createElement("input");
        value.type = "number";
        c
        onst categoryIndex = selectedDataset.categories.indexOf(category);
        value.value = selectedDataset.series[0].data[categoryIndex] ?? 0; //selectedDataset.series[0]: pega a primeira série do dataset. | .data: acessa os valores dessa série. | [categoryIndex]: pega o valor na posição da categoria atual. | ?? 0: se esse valor for null ou undefined, usa zero.

        value.addEventListener("input", () => {
            selectedDataset.series[0].data[categoryIndex] = Number(value.value);

            localStorage.setItem("datasets", JSON.stringify(datasets));

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

            localStorage.setItem("datasets", JSON.stringify(datasets));

            renderCategories();
            updateChart();
        });

        item.append(name, value, remove);
        categoryList.appendChild(item);
    })
}

// alternando entre dataset e charts

const graphList = document.querySelector(".graph-list");
const backDatasets = document.querySelector(".back-datasets");
const newGraph = document.querySelector(".new-graph");

backDatasets.addEventListener("click", () => {
    selectedDatasetId = null;
    selectedGraphId = null;

    datasetTitle.textContent = "Select a dataset";
    graphTitle.textContent = "Select a graph";

    datasetList.hidden = false;
    newDatasetButton.hidden = false;
    emptyState.hidden = false;

    graphList.hidden = true;
    newGraph.hidden = true;
    backDatasets.hidden = true;

    datasetConfig.hidden = true;
    graphTitle.hidden = true;

    categoryList.innerHTML = "";

    document.querySelector("chart-types").hidden = true;
    document.querySelector("customization").hidden = true;

    chart.updateOptions({
        xaxis: {
            categories: []
        },
        series: []
    });
});

newGraph.addEventListener("click", () => {
    const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

    if (!selectedDataset) return;

    const graphNumber = selectedDataset.graphs.length + 1;

    const graph = {
        id: crypto.randomUUID(),
        name: `Graph ${graphNumber}`,
        type: "bar"
    }

    selectedDataset.graphs.push(graph);

    localStorage.setItem("datasets", JSON.stringify(datasets));

    renderGraphs(selectedDataset);
});