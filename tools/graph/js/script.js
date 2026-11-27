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

const chartTypeSelect = document.querySelector(".chart-type-select");
const allowedChartTypes = ["bar", "line", "area", "pie", "donut"];

const seriesSelect = document.querySelector(".series-select");
const colorSelector = document.querySelector(".color-selector");

const seriesCreateModal = document.querySelector(".series-create-modal");
const seriesNameInput = document.querySelector(".series-name-input");
const closeSeriesCreate = document.querySelector(".close-series-create");
const saveSeriesCreate = document.querySelector(".save-series-create");

const editSeriesButton = document.querySelector(".edit-series");
const seriesEditModal = document.querySelector(".series-edit-modal");
const seriesEditList = document.querySelector(".series-edit-list");
const closeSeriesEdit = document.querySelector(".close-series-edit");

const seriesSelector = document.querySelector(".series-selector");

let datasets = [];
let storageError = false;
let storageErrorType = null;
let corruptedData = null;
let downloadedData = false;

let savedData = null;


//test area

let forceDataError = false;
let forceStorageUnavailable = false;
let forceNonCrashError = false;

function testOSOD() {
    if (forceDataError) {
        storageErrorType = "corrupted-data";
        showStorageError();
        forceDataError = false;
    }

    if (forceStorageUnavailable) {
        showNonCrashModal(
            "Storage Unavailable",
            "Could not access your local storage",
            "Graph cannot read or write your saved data",
            "Check your browser settings and enable local storage",
            true
        );
        forceStorageUnavailable = false;
    }

    if (forceNonCrashError) {
        showNonCrashModal(
            "Test error",
            "This is a test error",
            "Testing the Non-Crash modal",
            "No action is required"
        );
        forceNonCrashError = false;
    }
}

//

try {
    savedData = localStorage.getItem("datasets");

    datasets = savedData ? JSON.parse(savedData) : []; //if savedData == true -> parseData, else []

    if (!Array.isArray(datasets) || !datasets.every(validateDataset)) {
        throw new Error("Invalid datasets format");
    }

    datasets.forEach(dataset => {
        dataset.graphs.forEach(graph => {
            graph.series.forEach(series => {
                if (!series.color) {
                    series.color = "#ffa726";
                }
            });
        });
    });

    saveDatasets();
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
            !allowedChartTypes.includes(graph.type)
        ) {
            return false;
        }

        if (!Array.isArray(graph.categories) || !Array.isArray(graph.series)) {
            return false;
        }

        if (
            !graph.categories.every(category => typeof category === "string")
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
                serie.data.length !== graph.categories.length ||
                !serie.data.every(value => typeof value === "number" && Number.isFinite(value))
            ) {
                return false;
            }
        }

        if (graph.type === "pie" || graph.type === "donut") {
            if (!Array.isArray(graph.slices) || graph.slices.length !== graph.categories.length) return false;

            for (const slice of graph.slices) {
                if (
                    !slice ||
                    typeof slice !== "object" ||
                    Array.isArray(slice) ||
                    typeof slice.value !== "number" ||
                    !Number.isFinite(slice.value) ||
                    typeof slice.color !== "string"
                ) {
                    return false;
                }
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

let selectedSeriesIndex = 0;

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

    if (!requireValue(renameDatasetInput)) return

    const otherDatasetNames = [];

    for (const dataset of datasets) {
        if (dataset.id !== selectedDatasetId) {
            otherDatasetNames.push(dataset.name);
        }
    }

    if (!requireUniqueName(renameDatasetInput, otherDatasetNames, "dataset")) return;

    const newName = renameDatasetInput.value.trim();

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

function getNextGraphName(dataset) {
    const usedNames = new Set(dataset.graphs.map(graph => graph.name));

    let number = 1;

    while (usedNames.has(`Graph ${number}`)) {
        number++;
    }

    return `Graph ${number}`;
}

function syncChartSelect() {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) {
        return
    }

    chartTypeSelect.value = selectedGraph.type;
}

function renderSeriesSelect() {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    if (selectedGraph.type === "pie" || selectedGraph.type === "donut") {
        return;
    }

    seriesSelect.innerHTML = "";

    selectedGraph.series.forEach((series, index) => {
        const option = document.createElement("option");

        option.value = index;
        option.textContent = series.name;

        seriesSelect.appendChild(option);
    });

    const createOption = document.createElement("option");

    createOption.value = "create";
    createOption.textContent = "Create Series";

    seriesSelect.appendChild(createOption);
    seriesSelect.value = selectedSeriesIndex;
    colorSelector.value = selectedGraph.series[selectedSeriesIndex].color || "#ffa726"
}

function renderSeriesEditList() {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    seriesEditList.innerHTML = "";

    selectedGraph.series.forEach((series, index) => {
        const item = createElement("div", "series-edit-item");

        const name = document.createElement("span");
        name.textContent = series.name;

        const edit = document.createElement("button");
        edit.type = "button"
        edit.classList.add("btn-flat");
        edit.setAttribute("aria-label", `Edit series ${series.name}`)
        edit.innerHTML = '<i class="material-symbols-outlined" aria-hidden="true">edit</i>';

        edit.addEventListener("click", () => {
            const input = document.createElement("input");
            input.value = series.name;

            const save = document.createElement("button");
            save.type = "button"
            save.classList.add("btn-flat");
            save.setAttribute("aria-label", `Save series name for ${series.name}`);
            save.innerHTML = '<i class="material-symbols-outlined" aria-hidden="true">check</i>';

            save.addEventListener("click", () => {
                const newName = input.value.trim();

                if (!newName) return;

                series.name = newName;

                saveDatasets();
                renderSeriesEditList();
                renderSeriesSelect();
                chart.updateSeries(selectedGraph.series);
            });

            item.replaceChild(input, name);
            edit.replaceWith(save);
        })

        const remove = document.createElement("button");
        remove.type = "button";
        remove.classList.add("btn-flat");
        remove.setAttribute("aria-label", `Delete series ${series.name}`);
        remove.innerHTML = '<i class="material-symbols-outlined" aria-hidden="true">delete</i>'

        remove.addEventListener("click", () => {
            if (selectedGraph.series.length <= 1) return;

            selectedGraph.series.splice(index, 1);

            if (selectedSeriesIndex >= selectedGraph.series.length) {
                selectedSeriesIndex = selectedGraph.series.length - 1;
            }

            saveDatasets();
            renderSeriesEditList();
            renderSeriesSelect();
            renderCategories();
            chart.updateSeries(selectedGraph.series);
        });

        item.append(name, edit, remove);
        seriesEditList.appendChild(item);
    });
}

function requireValue(input) {
    if (!input.value.trim()) {
        input.setCustomValidity("Please enter a name");
        input.reportValidity();
        return false;
    }

    input.setCustomValidity("");
    return true;
}

saveSeriesCreate.addEventListener("click", () => {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    const seriesName = seriesNameInput.value.trim();

    if (!seriesName) {
        seriesNameInput.focus();
        return;
    }

    const newSeries = {
        name: seriesName,
        data: selectedGraph.categories.map(() => 0),
        color: "#ffa726"
    };

    selectedGraph.series.push(newSeries);

    selectedSeriesIndex = selectedGraph.series.length - 1;

    seriesCreateModal.close();

    renderSeriesSelect();
    renderCategories();
    chart.updateSeries(selectedGraph.series);
});

editSeriesButton.addEventListener("click", () => {
    renderSeriesEditList();
    seriesEditModal.showModal();
})

function submitOnEnter(input, button) {
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            button.click();
        }
    });
}

function isNameTaken(name, existingNames) {
    const normalized = name.trim().toLowerCase();

    for (const existing of existingNames) {
        if (existing.trim().toLowerCase() === normalized) {
            return true;
        }
    }

    return false;
}

function requireUniqueName(input, existingNames, label) {
    if (!isNameTaken(input.value, existingNames)) {
        return true;
    }

    input.setCustomValidity(`A ${label} with this name already exists`);
    input.reportValidity();
    return false;
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

const chartOptions = {
    chart: {
        type: "bar",
        height: "97%",
        width: "100%",
        foreColor: "#E3E2E6",
        background: "#131721",
        fontFamily: "Google Sans Flex, sans-serif"
    },
    series: [],
    xaxis: {
        categories: []
    }
};

const chartLibraryLoaded = typeof ApexCharts !== "undefined";

let chart;

if (chartLibraryLoaded) {
    chart = new ApexCharts(document.querySelector(".chart"), chartOptions);
} else {
    chart = { updateOptions() { }, updateSeries() { }, render() { } }; //cria um "gráfico falso" pra não quebrar tudo depois
}

if (!chartLibraryLoaded && !nonCrashModal.open) {
    showNonCrashModal("Chart unavailable", "Could not load the chart library", "You can still edit your data, but graphs will not be displayed", "Check your internet connection and try again", true);
}

//netfly check

const isTemporaryDeployment =
    window.location.hostname === "lukazzdev-temp.netlify.app";

if (
    isTemporaryDeployment &&
    !storageError &&
    chartLibraryLoaded &&
    !nonCrashModal.open
) {
    showNonCrashModal(
        "Temporary deployment",
        "This version of Graph is temporarily hosted on Netlify.",
        "The official GitHub Pages deployment remains unchanged while the previous Terra submission is under review.",
        "This temporary environment allows development and testing without affecting the previously submitted version."
    );
}

function updateChart() {
    const selectedDataset = getSelectedDataset();

    const selectedGraph = selectedDataset?.graphs.find(graph => graph.id === selectedGraphId); //o ? ali faz sacessar somente se tiver algo, pra nao dar null

    if (!selectedDataset || !selectedGraph) {
        clearChart();
        return;
    }

    if (selectedGraph.type === "pie" || selectedGraph.type === "donut") {
        chart.updateOptions({
            chart: {
                type: selectedGraph.type
            },
            labels: selectedGraph.categories,
            colors: selectedGraph.slices.map(slice => slice.color),
            series: selectedGraph.slices.map(slice => slice.value)
        });

        return;
    }

    chart.updateOptions({
        chart: {
            type: selectedGraph.type
        },
        stroke: {
            width: selectedGraph.type === "bar" ? 0 : 3
        },
        xaxis: {
            categories: selectedGraph.categories
        },
        colors: selectedGraph.series.map(series => series.color || "#ffa726"),
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

const dropdowns = document.querySelectorAll(".dropdown-header");

dropdowns.forEach(header => {
    const dropdown = header.parentElement;

    header.addEventListener("click", () => {
        const isActive = dropdown.classList.toggle("active");

        header.setAttribute("aria-expanded", isActive);
    })

    header.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            header.click();
        }
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

cancelbutton.addEventListener("click", () => {
    datasetInput.setCustomValidity("");
    datasetForm.reset();
    modal.close();
});

modal.addEventListener("close", () => {
    datasetInput.setCustomValidity("");
    datasetForm.reset();
});

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

    const allDatasetNames = [];

    for (const dataset of datasets) {
        allDatasetNames.push(dataset.name);
    }

    if (!requireUniqueName(datasetInput, allDatasetNames, "dataset")) {
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
            slices: [],
            series: [{
                name: "Series 1",
                data: [],
                color: "#ffa726"
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
        const item = createElement("button", "dataset-item");
        item.type = "button";
        item.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
            }
        })
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
        const item = createElement("button", "graph-item");
        item.type = "button";

        const name = document.createElement("span");
        name.textContent = graph.name;

        item.appendChild(name);

        item.addEventListener("click", () => {
            selectedGraphId = graph.id;
            graphTitle.textContent = graph.name;
            graphConfig.hidden = false;
            graphConfig.style.display = "flex";
            showGraphControls();
            syncChartSelect();
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

    if (!requireValue(graphNameInput)) return;

    const otherGraphNames = [];

    for (const graph of selectedDataset.graphs) {
        if (graph.id !== selectedGraph.id) {
            otherGraphNames.push(graph.name);
        }
    }

    if (!requireUniqueName(graphNameInput, otherGraphNames, "graph")) return;

    const newName = graphNameInput.value.trim();

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

closeSeriesCreate.addEventListener("click", () => {
    seriesCreateModal.close();
})

closeSeriesEdit.addEventListener("click", () => {
    seriesEditModal.close();
})

saveCategoryEdit.addEventListener("click", () => {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    if (!requireValue(categoryNameInput)) return
    const newName = categoryNameInput.value.trim();

    const otherCategoryNames = [];

    for (let i = 0; i < selectedGraph.categories.length; i++) {
        if (i !== editingCategoryIndex) {
            otherCategoryNames.push(selectedGraph.categories[i]);
        }
    }

    if (!requireUniqueName(categoryNameInput, otherCategoryNames, "category")) return;

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
    clearChart();

    configModal.close();
    deleteConfirmModal.close();
});

chart.render();

// customize

const categoryInput = document.querySelector(".category-input");
const addCategoryButton = document.querySelector(".add-category");

addCategoryButton.addEventListener("click", () => {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    if (!requireValue(categoryInput)) return;

    if (!requireUniqueName(categoryInput, selectedGraph.categories, "category")) return;

    const categoryName = categoryInput.value.trim();

    selectedGraph.categories.push(categoryName);

    if (selectedGraph.type === "pie" || selectedGraph.type === "donut") {
        selectedGraph.slices.push({
            value: 0,
            color: "#ffa726"
        })
    }

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
            data: selectedGraph.categories.map(() => 0),
            color: "#ffa726"
        });
        saveDatasets();
    }

    renderSeriesSelect();

    const isPieOrDonut = selectedGraph.type === "pie" || selectedGraph.type === "donut"

    seriesSelector.hidden = isPieOrDonut;

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
        edit.setAttribute("aria-label", `Edit category ${category}`);
        edit.innerHTML = '<i class="material-symbols-outlined" aria-hidden="true">edit</i>';



        const color = document.createElement("input");
        color.type = "color";

        if (isPieOrDonut) {
            color.value = selectedGraph.slices[categoryIndex].color;

            color.setAttribute("aria-label", `Color for ${category}`);

            color.addEventListener("input", () => {
                selectedGraph.slices[categoryIndex].color = color.value;
                updateChart();
            });

            color.addEventListener("change", () => {
                saveDatasets();
            });
        }

        const value = document.createElement("input");
        value.type = "number";
        value.step = "any";
        if (isPieOrDonut) {
            value.min = "0";
        }

        const selectedSeries = selectedGraph.series[selectedSeriesIndex];

        if (isPieOrDonut) {
            value.setAttribute("aria-label", `Value for ${category}`);

            if (selectedGraph.slices[categoryIndex]) {
                value.value = selectedGraph.slices[categoryIndex].value;
            } else {
                value.value = 0;
            }
        } else {
            if (selectedSeries) {
                value.setAttribute("aria-label", `Value for ${category} in series ${selectedSeries.name}`);
                value.value = selectedSeries.data[categoryIndex];
            } else {
                value.setAttribute("aria-label", `Value for ${category} in selected series`);
                value.value = 0;
            }
        }

        value.addEventListener("input", () => {
            if (isPieOrDonut) {

                if (Number(value.value) < 0) {
                    value.setCustomValidity("Negative values are not allowed.");
                    value.reportValidity();
                    return;
                }

                value.setCustomValidity("");
                selectedGraph.slices[categoryIndex].value = Number(value.value);

            } else {
                const selectedSeries = selectedGraph.series[selectedSeriesIndex];

                if (!selectedSeries) return;

                selectedSeries.data[categoryIndex] = Number(value.value);
            }
            updateChart();
        })

        value.addEventListener("change", () => {
            saveDatasets();
        })

        const remove = document.createElement("button");
        remove.classList.add("btn-flat");
        remove.setAttribute("aria-label", `Delete category ${category}`);
        remove.innerHTML = '<i class="material-symbols-outlined" aria-hidden="true">delete</i>';

        remove.addEventListener("click", (event) => {
            event.stopPropagation();

            selectedGraph.categories.splice(categoryIndex, 1);

            selectedGraph.series.forEach(series => {
                series.data.splice(categoryIndex, 1);
            });

            if (selectedGraph.type === "pie" || selectedGraph.type === "donut") {
                selectedGraph.slices.splice(categoryIndex, 1);
            }

            saveDatasets();

            renderCategories();
            updateChart();
        });

        if (isPieOrDonut) {
            item.append(name, edit, color, value, remove);
        } else {
            item.append(name, edit, value, remove);
        }
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

    const graph = {
        id: crypto.randomUUID(),
        name: getNextGraphName(selectedDataset),
        type: "bar",
        categories: [],
        slices: [],
        series: [{
            name: "Series 1",
            data: [],
            color: "#ffa726"
        }]
    }

    selectedDataset.graphs.push(graph);

    saveDatasets();

    selectedGraphId = graph.id;
    graphTitle.textContent = graph.name;

    renderGraphs(selectedDataset);

    graphConfig.hidden = false;
    graphConfig.style.display = "flex";

    showGraphControls();
    syncChartSelect();
    renderCategories();
    updateChart();
});

submitOnEnter(renameDatasetInput, saveDatasetName);
submitOnEnter(graphNameInput, document.querySelector(".save-graph-name"));
submitOnEnter(categoryNameInput, saveCategoryEdit);

function clearErrorOnInput(input) {
    input.addEventListener("input", () => {
        input.setCustomValidity("");
    });
}

clearErrorOnInput(renameDatasetInput);
clearErrorOnInput(graphNameInput);
clearErrorOnInput(categoryNameInput);
clearErrorOnInput(datasetInput);
clearErrorOnInput(categoryInput);

chartTypeSelect.addEventListener("change", () => {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    selectedGraph.type = chartTypeSelect.value;

    if (selectedGraph.type === "pie" || selectedGraph.type === "donut") {
        if (!Array.isArray(selectedGraph.slices)) {
            selectedGraph.slices = [];
        }

        while (selectedGraph.slices.length < selectedGraph.categories.length) {
            selectedGraph.slices.push({
                value: 0,
                color: "#ffa726"
            });
        }
    }

    saveDatasets();
    renderCategories();
    updateChart();
});

seriesSelect.addEventListener("change", () => {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    if (seriesSelect.value === "create") {
        seriesSelect.value = String(selectedSeriesIndex);

        seriesNameInput.value = "";
        seriesCreateModal.showModal();

        return;
    }

    selectedSeriesIndex = Number(seriesSelect.value);

    renderCategories();
});

colorSelector.addEventListener("input", () => {
    const selectedGraph = getSelectedGraph();

    if (!selectedGraph) return;

    selectedGraph.series[selectedSeriesIndex].color = colorSelector.value;

    saveDatasets();
    updateChart();
});

const mobileMenuButton = document.querySelector(".mobile-menu");
const main = document.querySelector("main");

mobileMenuButton.addEventListener("click", () => {
    const isOpen = main.classList.toggle("mobile-sidebar-open");

    mobileMenuButton.setAttribute("aria-expanded", isOpen);
    mobileMenuButton.setAttribute(
        "aria-label",
        isOpen ? "Close sidebar" : "Open sidebar"

        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Atualiza o texto do aria-label conforme o estado da sidebar:
        // se estiver aberta, o botão anuncia "Close sidebar";
        // se estiver fechada, anuncia "Open sidebar".
    );

    mobileMenuButton.querySelector(".material-symbols-outlined").textContent = isOpen ? "close" : "menu";

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Atualiza o ícone do botão conforme o estado da sidebar:
    // se estiver aberta, mostra "close";
    // se estiver fechada, mostra "menu".
});