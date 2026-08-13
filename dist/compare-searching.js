import { binarySearch, createBinarySearchInitialStep } from "./searching/algorithms/binary.js";
import { createExponentialSearchInitialStep, exponentialSearch } from "./searching/algorithms/exponential.js";
import { createFibonacciSearchInitialStep, fibonacciSearch } from "./searching/algorithms/fibonacci.js";
import { createGallopingSearchInitialStep, gallopingSearch } from "./searching/algorithms/galloping.js";
import { createHashTableLookupInitialStep, hashTableLookup } from "./searching/algorithms/hash_table_lookup.js";
import { createInterpolationSearchInitialStep, interpolationSearch } from "./searching/algorithms/interpolation.js";
import { createJumpSearchInitialStep, jumpSearch } from "./searching/algorithms/jump.js";
import { createLinearSearchInitialStep, linearSearch } from "./searching/algorithms/linear.js";
import { createMetaBinarySearchInitialStep, metaBinarySearch } from "./searching/algorithms/meta_binary.js";
import { createQuickselectInitialStep, quickselect } from "./searching/algorithms/quickselect.js";
import { createSentinelLinearSearchInitialStep, sentinelLinearSearch } from "./searching/algorithms/sentinel_linear.js";
import { createTernarySearchInitialStep, ternarySearch } from "./searching/algorithms/ternary.js";
import { createUniformBinarySearchInitialStep, uniformBinarySearch } from "./searching/algorithms/uniform_binary.js";
import { SearchController } from "./searching/visualizer/searchController.js";
import { SearchVisualizer } from "./searching/visualizer/searchVisualizer.js";
import { copyText, highlightCode, showCopySuccess } from "./ui/codeLoader.js";
const fallbackDataset = [18, 42, 7, 63, 24, 9, 55, 31, 76, 12, 88, 3];
const algorithmInfo = {
    binary_search: {
        title: "Binary Search",
        summary: "Repeatedly halves a sorted array until the target is found or the active range disappears.",
        href: "binary_search.html",
        tags: ["O(log n)", "Sorted Input", "O(1) Memory"],
        details: [
            "Best for: static sorted arrays with frequent lookups",
            "Strength: discards half of the remaining candidates each probe",
            "Tradeoff: requires sorted input before the search starts"
        ],
        inputShape: "sorted",
        codeFileName: "binary_search"
    },
    linear_search: {
        title: "Linear Search",
        summary: "Checks each value from left to right and works on any array shape.",
        href: "linear_search.html",
        tags: ["O(n)", "Any Input", "O(1) Memory"],
        details: [
            "Best for: small or unsorted data where no preprocessing is worthwhile",
            "Strength: no ordering requirement and very simple control flow",
            "Tradeoff: average and worst-case lookup both scale linearly"
        ],
        inputShape: "any",
        codeFileName: "linear_search"
    },
    sentinel_linear_search: {
        title: "Sentinel Linear Search",
        summary: "Places the target as a temporary sentinel at the end to reduce boundary checks.",
        href: "sentinel_linear_search.html",
        tags: ["O(n)", "Any Input", "Boundary-Light"],
        details: [
            "Best for: linear scans where loop overhead matters",
            "Strength: reduces repeated end-of-array checks",
            "Tradeoff: still has linear lookup cost"
        ],
        inputShape: "any",
        codeFileName: "sentinel_linear_search"
    },
    jump_search: {
        title: "Jump Search",
        summary: "Jumps through blocks in a sorted array, then linearly scans the likely block.",
        href: "jump_search.html",
        tags: ["O(sqrt n)", "Sorted Input", "Block Search"],
        details: [
            "Best for: sorted arrays when block movement is useful to study",
            "Strength: fewer probes than plain linear scan on sorted data",
            "Tradeoff: usually less practical than binary search"
        ],
        inputShape: "sorted",
        codeFileName: "jump_search"
    },
    interpolation_search: {
        title: "Interpolation Search",
        summary: "Estimates the likely target position from the value distribution.",
        href: "interpolation_search.html",
        tags: ["Avg: O(log log n)", "Sorted Input", "Distribution-Sensitive"],
        details: [
            "Best for: evenly distributed sorted numeric values",
            "Strength: can jump very close to the target on friendly data",
            "Tradeoff: can degrade toward O(n) on skewed data"
        ],
        inputShape: "sorted",
        codeFileName: "interpolation_search"
    },
    exponential_search: {
        title: "Exponential Search",
        summary: "Expands a range by powers of two, then finishes with binary search.",
        href: "exponential_search.html",
        tags: ["O(log n)", "Sorted Input", "Range First"],
        details: [
            "Best for: sorted arrays when a likely range needs to be found first",
            "Strength: quickly brackets the target",
            "Tradeoff: uses an expansion phase before narrowing"
        ],
        inputShape: "sorted",
        codeFileName: "exponential_search"
    },
    fibonacci_search: {
        title: "Fibonacci Search",
        summary: "Uses Fibonacci offsets to narrow a sorted array.",
        href: "fibonacci_search.html",
        tags: ["O(log n)", "Sorted Input", "Offset-Based"],
        details: [
            "Best for: studying alternative probe schedules",
            "Strength: uses precomputed Fibonacci intervals",
            "Tradeoff: more bookkeeping than ordinary binary search"
        ],
        inputShape: "sorted",
        codeFileName: "fibonacci_search"
    },
    ternary_search: {
        title: "Ternary Search",
        summary: "Uses two probes to split a sorted range into thirds.",
        href: "ternary_search.html",
        tags: ["O(log3 n)", "Sorted Input", "Two Probes"],
        details: [
            "Best for: comparing multi-probe narrowing",
            "Strength: clear divide-into-thirds visualization",
            "Tradeoff: two comparisons per round add overhead"
        ],
        inputShape: "sorted",
        codeFileName: "ternary_search"
    },
    uniform_binary_search: {
        title: "Uniform Binary Search",
        summary: "Uses a precomputed step table to guide binary-search-like jumps.",
        href: "uniform_binary_search.html",
        tags: ["O(log n)", "Sorted Input", "Step Table"],
        details: [
            "Best for: seeing binary search as planned offsets",
            "Strength: exposes fixed jump scheduling",
            "Tradeoff: less direct than classic binary search"
        ],
        inputShape: "sorted",
        codeFileName: "uniform_binary_search"
    },
    galloping_search: {
        title: "Galloping Search",
        summary: "Leaps outward quickly, then switches to binary search.",
        href: "galloping_search.html",
        tags: ["O(log n)", "Sorted Input", "Adaptive Range"],
        details: [
            "Best for: sorted data where nearby hits are common",
            "Strength: grows the active window quickly",
            "Tradeoff: has two phases to reason about"
        ],
        inputShape: "sorted",
        codeFileName: "galloping_search"
    },
    meta_binary_search: {
        title: "Meta Binary Search",
        summary: "Builds the answer index bit by bit in sorted data.",
        href: "meta_binary_search.html",
        tags: ["O(log n)", "Sorted Input", "Bitwise"],
        details: [
            "Best for: understanding index construction",
            "Strength: exposes high-bit to low-bit reasoning",
            "Tradeoff: less familiar than classic binary search"
        ],
        inputShape: "sorted",
        codeFileName: "meta_binary_search"
    },
    hash_table_lookup: {
        title: "Hash Table Lookup",
        summary: "Builds a hash table first, then probes buckets for the target.",
        href: "hash_table_lookup.html",
        tags: ["Avg: O(1)", "Any Input", "Extra Memory"],
        details: [
            "Best for: many lookups after preprocessing",
            "Strength: expected constant-time lookup",
            "Tradeoff: needs extra memory and collision handling"
        ],
        inputShape: "any",
        codeFileName: "hash_search"
    },
    quickselect: {
        title: "Quickselect",
        summary: "Finds the kth smallest value without fully sorting the array.",
        href: "quickselect.html",
        tags: ["Avg: O(n)", "Selection", "In-Place"],
        details: [
            "Best for: median or kth-smallest queries",
            "Strength: avoids sorting everything",
            "Tradeoff: pivot quality controls worst-case behavior"
        ],
        inputShape: "any",
        codeFileName: "quickselect",
        kBased: true
    }
};
const algorithmOrder = [
    "binary_search",
    "linear_search",
    "sentinel_linear_search",
    "jump_search",
    "interpolation_search",
    "exponential_search",
    "fibonacci_search",
    "ternary_search",
    "uniform_binary_search",
    "galloping_search",
    "meta_binary_search",
    "hash_table_lookup",
    "quickselect"
];
function populateSelect(select) {
    select.innerHTML = algorithmOrder
        .map(algorithm => `<option value="${algorithm}">${algorithmInfo[algorithm].title}</option>`)
        .join("");
}
function createSlot(slotId) {
    const select = document.getElementById(`compareSlot${slotId}`);
    populateSelect(select);
    return {
        select,
        title: document.getElementById(`compareSlot${slotId}Title`),
        summary: document.getElementById(`compareSlot${slotId}Summary`),
        tags: document.getElementById(`compareSlot${slotId}Tags`),
        details: document.getElementById(`compareSlot${slotId}Details`),
        link: document.getElementById(`compareSlot${slotId}Link`),
        visualizerTitle: document.getElementById(`compareVisualizer${slotId}Title`),
        codeTitle: document.getElementById(`compareCode${slotId}Title`),
        codeDisplay: document.getElementById(`compareCodeDisplay${slotId}`),
        languageButtons: Array.from(document.querySelectorAll(`.lang-btn[data-slot="${slotId === "One" ? "one" : "two"}"]`)),
        language: "python",
        algorithm: select.value
    };
}
function toPascalCase(name) {
    return name
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}
function getCodeFileName(algorithm, language) {
    const fileName = algorithmInfo[algorithm].codeFileName;
    return language === "java" ? toPascalCase(fileName) : fileName;
}
async function loadCode(slot) {
    const extensions = {
        python: "py",
        cpp: "cpp",
        java: "java",
        c: "c"
    };
    const path = new URL(`../../${slot.language}/array_search/${getCodeFileName(slot.algorithm, slot.language)}.${extensions[slot.language]}`, window.location.href).href;
    try {
        const response = await fetch(path);
        if (!response.ok) {
            slot.codeDisplay.textContent = "File not found.";
            return;
        }
        const text = await response.text();
        slot.codeDisplay.innerHTML = highlightCode(text.trim(), slot.language);
    }
    catch {
        slot.codeDisplay.textContent = "Error loading file.";
    }
}
function renderSlot(slot) {
    slot.algorithm = slot.select.value;
    const info = algorithmInfo[slot.algorithm];
    slot.title.textContent = info.title;
    slot.summary.textContent = info.summary;
    slot.tags.innerHTML = info.tags.map(tag => `<span>${tag}</span>`).join("");
    slot.details.innerHTML = info.details.map(detail => `<li>${detail}</li>`).join("");
    slot.link.href = info.href;
    slot.visualizerTitle.textContent = info.title;
    slot.codeTitle.textContent = `${info.title} Code`;
    void loadCode(slot);
}
function getCompatibilityWarning(firstAlgorithm, secondAlgorithm) {
    const first = algorithmInfo[firstAlgorithm];
    const second = algorithmInfo[secondAlgorithm];
    if (Boolean(first.kBased) !== Boolean(second.kBased)) {
        return "These searches are not available as a strict same-dataset comparison because one searches for a target value while the other answers a k/selection question. Compare the behavior, but treat probe counts as separate scenarios.";
    }
    return "";
}
function parseDataset(value) {
    const values = value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => Number.isFinite(item));
    return values.length > 0 ? values : [...fallbackDataset];
}
function generateArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 3);
}
function sortedUnique(values) {
    return Array.from(new Set(values)).sort((a, b) => a - b);
}
function getDatasetForAlgorithm(algorithm, values) {
    return algorithmInfo[algorithm].inputShape === "sorted" ? sortedUnique(values) : [...values];
}
function getDatasetForComparison(firstAlgorithm, secondAlgorithm, values) {
    const requiresSortedInput = algorithmInfo[firstAlgorithm].inputShape === "sorted" ||
        algorithmInfo[secondAlgorithm].inputShape === "sorted";
    return requiresSortedInput ? sortedUnique(values) : [...values];
}
function getTargetForAlgorithm(algorithm, dataset, rawTarget) {
    if (algorithmInfo[algorithm].kBased) {
        const k = Math.floor(rawTarget);
        return Number.isFinite(k) && k >= 1 && k <= dataset.length ? k : Math.max(1, Math.ceil(dataset.length / 2));
    }
    return Number.isFinite(rawTarget) ? rawTarget : dataset[Math.floor(dataset.length / 2)] ?? 0;
}
function createGenerator(algorithm, dataset, target) {
    switch (algorithm) {
        case "linear_search":
            return linearSearch(dataset, target);
        case "sentinel_linear_search":
            return sentinelLinearSearch(dataset, target);
        case "binary_search":
            return binarySearch(dataset, target);
        case "jump_search":
            return jumpSearch(dataset, target);
        case "interpolation_search":
            return interpolationSearch(dataset, target);
        case "exponential_search":
            return exponentialSearch(dataset, target);
        case "fibonacci_search":
            return fibonacciSearch(dataset, target);
        case "ternary_search":
            return ternarySearch(dataset, target);
        case "uniform_binary_search":
            return uniformBinarySearch(dataset, target);
        case "galloping_search":
            return gallopingSearch(dataset, target);
        case "meta_binary_search":
            return metaBinarySearch(dataset, target);
        case "hash_table_lookup":
            return hashTableLookup(dataset, target);
        case "quickselect":
            return quickselect(dataset, target);
    }
}
function createInitialStep(algorithm, dataset, target) {
    switch (algorithm) {
        case "linear_search":
            return createLinearSearchInitialStep(dataset, target);
        case "sentinel_linear_search":
            return createSentinelLinearSearchInitialStep(dataset, target);
        case "binary_search":
            return createBinarySearchInitialStep(dataset, target);
        case "jump_search":
            return createJumpSearchInitialStep(dataset, target);
        case "interpolation_search":
            return createInterpolationSearchInitialStep(dataset, target);
        case "exponential_search":
            return createExponentialSearchInitialStep(dataset, target);
        case "fibonacci_search":
            return createFibonacciSearchInitialStep(dataset, target);
        case "ternary_search":
            return createTernarySearchInitialStep(dataset, target);
        case "uniform_binary_search":
            return createUniformBinarySearchInitialStep(dataset, target);
        case "galloping_search":
            return createGallopingSearchInitialStep(dataset, target);
        case "meta_binary_search":
            return createMetaBinarySearchInitialStep(dataset, target);
        case "hash_table_lookup":
            return createHashTableLookupInitialStep(dataset, target);
        case "quickselect":
            return createQuickselectInitialStep(dataset, target);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const slotOne = createSlot("One");
    const slotTwo = createSlot("Two");
    const datasetInput = document.getElementById("compareDatasetInput");
    const targetInput = document.getElementById("compareTargetInput");
    const generateBtn = document.getElementById("compareGenerateBtn");
    const playBtn = document.getElementById("comparePlayBtn");
    const pauseBtn = document.getElementById("comparePauseBtn");
    const stepBtn = document.getElementById("compareStepBtn");
    const resetBtn = document.getElementById("compareResetBtn");
    const speedRange = document.getElementById("compareSpeedRange");
    const warning = document.getElementById("compareSearchWarning");
    const warningText = document.getElementById("compareSearchWarningText");
    const visualizerOne = new SearchVisualizer("compareGraphOne");
    const visualizerTwo = new SearchVisualizer("compareGraphTwo");
    let baseDataset = [...fallbackDataset];
    let rawTarget = 55;
    let datasetOne = getDatasetForAlgorithm("binary_search", baseDataset);
    let datasetTwo = getDatasetForAlgorithm("linear_search", baseDataset);
    let targetOne = getTargetForAlgorithm("binary_search", datasetOne, rawTarget);
    let targetTwo = getTargetForAlgorithm("linear_search", datasetTwo, rawTarget);
    slotOne.select.value = "binary_search";
    slotTwo.select.value = "linear_search";
    slotOne.algorithm = "binary_search";
    slotTwo.algorithm = "linear_search";
    let controllerOne = new SearchController(createGenerator(slotOne.algorithm, datasetOne, targetOne), visualizerOne);
    let controllerTwo = new SearchController(createGenerator(slotTwo.algorithm, datasetTwo, targetTwo), visualizerTwo);
    datasetInput.value = baseDataset.join(",");
    targetInput.value = String(rawTarget);
    function recomputeInputs() {
        baseDataset = parseDataset(datasetInput.value);
        rawTarget = Number(targetInput.value);
        datasetInput.value = baseDataset.join(",");
        const comparisonDataset = getDatasetForComparison(slotOne.algorithm, slotTwo.algorithm, baseDataset);
        datasetOne = [...comparisonDataset];
        datasetTwo = [...comparisonDataset];
        targetOne = getTargetForAlgorithm(slotOne.algorithm, datasetOne, rawTarget);
        targetTwo = getTargetForAlgorithm(slotTwo.algorithm, datasetTwo, rawTarget);
    }
    function renderCurrent() {
        renderSlot(slotOne);
        renderSlot(slotTwo);
        const message = getCompatibilityWarning(slotOne.algorithm, slotTwo.algorithm);
        warning.hidden = message.length === 0;
        warningText.textContent = message;
    }
    function resetControllers() {
        renderCurrent();
        recomputeInputs();
        controllerOne.reset(createGenerator(slotOne.algorithm, datasetOne, targetOne), createInitialStep(slotOne.algorithm, datasetOne, targetOne));
        controllerTwo.reset(createGenerator(slotTwo.algorithm, datasetTwo, targetTwo), createInitialStep(slotTwo.algorithm, datasetTwo, targetTwo));
        controllerOne.setSpeed(Number(speedRange.value));
        controllerTwo.setSpeed(Number(speedRange.value));
    }
    const copyButtons = Array.from(document.querySelectorAll(".copy-code-btn"));
    [slotOne, slotTwo].forEach(slot => {
        slot.languageButtons.forEach(button => {
            button.addEventListener("click", () => {
                slot.language = button.dataset.lang;
                slot.languageButtons.forEach(btn => btn.classList.toggle("active", btn === button));
                void loadCode(slot);
            });
        });
        slot.select.addEventListener("change", resetControllers);
    });
    copyButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const targetId = button.dataset.copyTarget;
            const target = targetId ? document.getElementById(targetId) : null;
            if (!target)
                return;
            const text = target.innerText || target.textContent || "";
            await copyText(text);
            showCopySuccess(button);
        });
    });
    generateBtn.addEventListener("click", () => {
        baseDataset = generateArray(12);
        rawTarget = baseDataset[Math.floor(baseDataset.length / 2)];
        datasetInput.value = baseDataset.join(",");
        targetInput.value = String(rawTarget);
        resetControllers();
    });
    datasetInput.addEventListener("change", resetControllers);
    targetInput.addEventListener("change", resetControllers);
    playBtn.addEventListener("click", () => {
        controllerOne.play();
        controllerTwo.play();
    });
    pauseBtn.addEventListener("click", () => {
        controllerOne.pause();
        controllerTwo.pause();
    });
    stepBtn.addEventListener("click", () => {
        controllerOne.step();
        controllerTwo.step();
    });
    resetBtn.addEventListener("click", resetControllers);
    speedRange.addEventListener("input", () => {
        controllerOne.setSpeed(Number(speedRange.value));
        controllerTwo.setSpeed(Number(speedRange.value));
    });
    renderCurrent();
    visualizerOne.render(createInitialStep(slotOne.algorithm, datasetOne, targetOne));
    visualizerTwo.render(createInitialStep(slotTwo.algorithm, datasetTwo, targetTwo));
    controllerOne.setSpeed(Number(speedRange.value));
    controllerTwo.setSpeed(Number(speedRange.value));
});
