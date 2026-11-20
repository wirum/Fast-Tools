//graph

const categoryList = document.querySelector(".category-list");
const chartTypes = document.querySelector(".chart-types");
const customization = document.querySelector(".customization");

const storageErrorModal = document.querySelector(".storage-error-modal");

const storageErrorIcon1 = document.querySelector(".icon1");
const storageErrorIcon2 = document.querySelector(".icon2");

const storageErrorTitle = document.querySelector(".storage-error-title");
const storageErrorDescription = document.querySelector(".storage-error-description");
const storageErrorDetails = document.querySelector(".storage-error-details");
const storageErrorWarning = document.querySelector(".storage-error-warning");
const storageErrorRecommendation = document.querySelector(".storage-error-recommendation");

const exportCorruptedData = document.querySelector(".export-corrupted-data");
const resetGraph = document.querySelector(".restart-graph");

const exportDatasetButton = document.querySelector(".export-dataset");

const renameDatasetInput = document.querySelector(".rename-dataset");

const saveDatasetName = document.querySelector(".save-dataset-name");

const importDatasetButton = document.querySelector(".import-dataset");
const importDatasetInput = document.querySelector(".import-dataset-input");

const nonCrashModal = document.querySelector(".noncrash-modal");
const nonCrashTitle = document.querySelector(".noncrash-title");
const nonCrashDescription = document.querySelector(".noncrash-description");
const nonCrashDetails = document.querySelector(".noncrash-details");
const nonCrashRecommendation = document.querySelector(".noncrash-recommendation");
const nonCrashClose = document.querySelector(".noncrash-close");
const nonCrashRetry = document.querySelector(".noncrash-retry");

let datasets = [];
let storageError = false;
let storageErrorType = null;
let corruptedData = null;
let downloadedData = false;

let savedData = null;


//test area

//

try {
    savedData = localStorage.getItem("datasets");

    datasets = savedData ? JSON.parse(savedData) : []; //if savedData == true -> parseData, else []

    if (!Array.isArray(datasets) || !datasets.every(validateDataset)) {
        throw new Error("Invalid datasets format");
    }
}
catch (error) {
    console.error("Error loading datasets:", error);

    storageError = true;

    if (error instanceof SyntaxError || error.message === "Invalid datasets format") {
        storageErrorType = "corrupted-data";
        corruptedData = savedData;
    } else {
        storageErrorType = "storage-unavailable";
    }

    datasets = [];
}

function validateDataset(dataset) {
    if (!dataset || typeof dataset !== "object" || Array.isArray(dataset)) {
        return false;
    }

    if (
        typeof dataset.id !== "string" ||
        typeof dataset.name !== "string" ||
        !Array.isArray(dataset.graphs)
    ) {
        return false;
    }

    for (const graph of dataset.graphs) {
        if (
            !graph ||
            typeof graph !== "object" ||
            Array.isArray(graph) ||
            typeof graph.id !== "string" ||
            typeof graph.name !== "string" ||
            typeof graph.type !== "string" ||
            !Array.isArray(graph.categories) ||
            !graph.categories.every(category => typeof category === "string") ||
            !Array.isArray(graph.series)
        ) {
            return false;
        }

        for (const serie of graph.series) {
            if (
                !serie ||
                typeof serie !== "object" ||
                Array.isArray(serie) ||
                typeof serie.name !== "string" ||
                !Array.isArray(serie.data) ||
                !serie.data.every(value => typeof value === "number" && Number.isFinite(value))
            ) {
                return false;
            }
        }
    }

    return true;
}

function showStorageError() {
    configureStorageError();

    if (!storageErrorModal.open) {
        storageErrorModal.showModal();
    }
}

function configureStorageError() {
    if (storageErrorType === "corrupted-data") {
        storageErrorIcon1.textContent = "running_with_errors";
        storageErrorIcon2.textContent = "bug_report";

        storageErrorTitle.textContent = "Data error";
        storageErrorDescription.textContent = "Could not load your saved datasets";
        storageErrorDetails.textContent = "Your original data has been preserved";

        storageErrorWarning.textContent = "After clicking RESET your data WILL BE DELETED without ANY WAY to recover it.";
        storageErrorRecommendation.textContent = "We highly recommend exporting your data";

        exportCorruptedData.textContent = "Export preserved data";
        resetGraph.textContent = "Reset";

        exportCorruptedData.hidden = false;
        resetGraph.hidden = false;
    }

    if (storageErrorType === "save-failure") {
        storageErrorIcon1.textContent = "cloud_off";
        storageErrorIcon2.textContent = "save";

        storageErrorTitle.textContent = "Storage failure";
        storageErrorDescription.textContent = "Could not save your changes";
        storageErrorDetails.textContent = "Your latest changes may not have been saved";

        storageErrorWarning.textContent = "After clicking RESET your data WILL BE DELETED without ANY WAY to recover it.";
        storageErrorRecommendation.textContent = "We highly recommend exporting your data";

        exportCorruptedData.textContent = "Export preserved data";
        resetGraph.textContent = "Reset";

        exportCorruptedData.hidden = false;
        resetGraph.hidden = false;
    }

    if (storageErrorType === "storage-unavailable") {
        storageErrorIcon1.textContent = "storage";
        storageErrorIcon2.textContent = "error";

        storageErrorTitle.textContent = "Storage unavailable";
        storageErrorDescription.textContent = "Could not access your local storage";
        storageErrorDetails.textContent = "Graph cannot read or write your saved data"

        storageErrorWarning.textContent = "After clicking RESET your data WILL BE DELETED without ANY WAY to recover it.";
        storageErrorRecommendation.textContent = "We highly recommend exporting your data";

        exportCorruptedData.textContent = "Export preserved data";
        resetGraph.textContent = "Reset";

        exportCorruptedData.hidden = false;
        resetGraph.hidden = false;
    }
}

if (storageErrorType === "storage-unavailable") {
    showNonCrashModal("Storage Unavaliable", "Could not acess your local storage", "Graph cannot read or write your saved data", "Check your browser settings and enable local storage", true)
} else if (storageError) {
    configureStorageError();
    storageErrorModal.showModal();
}

exportCorruptedData.addEventListener("click", () => {
    let dataToExport;

    if (storageErrorType === "corrupted-data") {
        dataToExport = corruptedData;
    } else {
        dataToExport = JSON.stringify(datasets, null, 2)
    }

    console.log({
        errorType: storageErrorType,
        exportedData: dataToExport
    });

    if (dataToExport === null) return;

    const blob = new Blob([dataToExport], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "graph-backup"

    link.click();

    //aqui ele criou o link, jogou o blob nesse link, e clicou nele pra baixar.
    //porém ele não baixa sozinho

    setTimeout(() => { URL.revokeObjectURL(url); }, 1000); //dá um intervalo

    downloadedData = true;
})

resetGraph.addEventListener("click", () => {
    if (!downloadedData) {
        const confirmed = confirm("Are you sure? You have not downloaded your data.");
        if (!confirmed) return;
    }
    localStorage.removeItem("datasets");
    location.reload();
});



let selectedDatasetId = null;
let selectedGraphId = null;

function resetSelection() {
    selectedDatasetId = null;
    selectedGraphId = null;
}

function saveDatasets() {
    if (storageError) return

    try {
        localStorage.setItem("datasets", JSON.stringify(datasets));
        return true;
    }
    catch (error) {
        console.error("Error saving datasets:", error);
        storageError = true;
        storageErrorType = "save-failure"

        showStorageError();

        return false;
    }
}

saveDatasetName.addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();
    if (!selectedDataset) return;

    const newName = renameDatasetInput.value.trim();
    if (!newName) return;

    selectedDataset.name = newName;
    configDatasetName.textContent = newName;
    datasetTitle.textContent = newName;
    saveDatasets();
    renderDatasets();
    configModal.close();
});

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

function showDataset() {
    datasetList.hidden = false;
    newDatasetButton.hidden = false;
    emptyState.hidden = false;

    exportDatasetButton.hidden = true;
    exportDatasetButton.style.display = "none";

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

function showNonCrashModal(title, description, details = "", recommendation = "", showRetry = false) {
    nonCrashTitle.textContent = title;
    nonCrashDescription.textContent = description;
    nonCrashDetails.textContent = details
    nonCrashRecommendation.textContent = recommendation

    nonCrashRetry.hidden = !showRetry; //kkk parece um not gate

    nonCrashModal.showModal();
}

nonCrashClose.addEventListener("click", () => {
    nonCrashModal.close();
});

nonCrashRetry.addEventListener("click", () => {
    location.reload();
})

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

    const selectedGraph = selectedDataset?.graphs.find(graph => graph.id === selectedGraphId); //o ? ali faz sacessar somente se tiver algo, pra nao dar null

    if (!selectedDataset || !selectedGraph) {
        clearChart();
        return;
    }

    chart.updateOptions({
        chart: {
            type: selectedGraph.type
        },
        xaxis: {
            categories: selectedGraph.categories
        },
        series: selectedGraph.series
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
        graphs: [{
            id: crypto.randomUUID(),
            name: "Graph 1",
            type: "bar",
            categories: [],
            series: [{
                name: "Series 1",
                data: []
            }]
        }],
    });

    saveDatasets();
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

    for (const dataset of datasets) {

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

            exportDatasetButton.hidden = false;
            exportDatasetButton.style.display = "flex";

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
    };

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
            renderCategories();
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

importDatasetButton.addEventListener("click", () => {
    importDatasetInput.click();
});

importDatasetInput.addEventListener("change", () => {
    const file = importDatasetInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const parsedData = JSON.parse(reader.result);

            const importedDatasets = Array.isArray(parsedData) ? parsedData : [parsedData];

            if (importedDatasets.length === 0 || !importedDatasets.every(validateDataset)) {
                throw new Error("Invalid dataset format");
            }

            importedDatasets.forEach(dataset => {
                dataset.id = crypto.randomUUID();

                dataset.graphs.forEach(graph => {
                    graph.id = crypto.randomUUID();
                });
            });

            datasets.push(...importedDatasets);

            saveDatasets();
            renderDatasets();
        }

        catch (error) {
            showNonCrashModal("Import error", "Could not import this dataset", "The selected file is either invalid or has an unsupported dataset structure");
            console.log("Import error:", error);
        }
    }

    reader.readAsText(file);

})

exportDatasetButton.addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();
    if (!selectedDataset) return;

    const data = JSON.stringify(selectedDataset, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedDataset.name}.json`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
})

datasetConfig.addEventListener("click", () => {
    const selectedDataset = getSelectedDataset();

    if (!selectedDataset) return;

    configDatasetName.textContent = selectedDataset.name;
    renameDatasetInput.value = selectedDataset.name;

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

    if (!selectedGraph || !selectedDataset) return;

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
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    const newName = categoryNameInput.value.trim();

    if (!newName) return;

    selectedGraph.categories[editingCategoryIndex] = newName;

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
    renderCategories();
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

    const selectedGraph = getSelectedGraph();

    if (!categoryName || !selectedGraph) return;

    selectedGraph.categories.push(categoryName);

    selectedGraph.series.forEach(series => {
        series.data.push(0);
    });

    saveDatasets();
    renderCategories();
    updateChart();
    categoryInput.value = "";
})

function renderCategories() {
    categoryList.innerHTML = "";

    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    if (selectedGraph.series.length === 0) {
        selectedGraph.series.push({
            name: "Series 1",
            data: selectedGraph.categories.map(() => 0)
        });
        saveDatasets();
    }

    selectedGraph.categories.forEach((category, categoryIndex) => {
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
        value.value = selectedGraph.series[0]?.data[categoryIndex] ?? 0;

        value.addEventListener("input", () => {
            if (!selectedGraph.series[0]) return;

            selectedGraph.series[0].data[categoryIndex] = Number(value.value);

            chart.updateSeries(selectedGraph.series);
        })

        value.addEventListener("change", () => {
            saveDatasets();
        })

        const remove = document.createElement("button");
        remove.classList.add("btn-flat");
        remove.innerHTML = '<i class="material-symbols-outlined">delete</i>';

        remove.addEventListener("click", (event) => {
            event.stopPropagation();

            selectedGraph.categories.splice(categoryIndex, 1);

            selectedGraph.series.forEach(series => {
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
        type: "bar",
        categories: [],
        series: [{
            name: "Series 1",
            data: []
        }]
    }

    selectedDataset.graphs.push(graph);

    saveDatasets();

    renderGraphs(selectedDataset);
});




