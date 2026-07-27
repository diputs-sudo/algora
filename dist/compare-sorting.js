import { bitonicSort } from "./sorting/algorithms/bitonic.js";
import { bubbleSort } from "./sorting/algorithms/bubble.js";
import { bucketSort } from "./sorting/algorithms/bucket.js";
import { countingSort } from "./sorting/algorithms/counting.js";
import { heapSort } from "./sorting/algorithms/heap.js";
import { insertionSort } from "./sorting/algorithms/insertion.js";
import { introSort } from "./sorting/algorithms/intro.js";
import { mergeSort } from "./sorting/algorithms/merge.js";
import { mergeSortInPlace } from "./sorting/algorithms/mergeInPlace.js";
import { quickSort } from "./sorting/algorithms/quick.js";
import { radixSort } from "./sorting/algorithms/radix.js";
import { selectionSort } from "./sorting/algorithms/selection.js";
import { shellSort } from "./sorting/algorithms/shell.js";
import { timSort } from "./sorting/algorithms/tim.js";
import { tournamentSort } from "./sorting/algorithms/tournament.js";
import { Controller } from "./sorting/visualizer/controller.js";
import { Graph } from "./sorting/visualizer/graph.js";
import { generateUniqueRandomArray } from "./sorting/visualizer/randomArray.js";
import { copyText, highlightCode, showCopySuccess } from "./ui/codeLoader.js";
const algorithmInfo = {
    bitonic_sort: {
        title: "Bitonic Sort",
        summary: "A comparison network that shines in parallel settings and works best when the structure of comparisons is fixed ahead of time.",
        href: "bitonic_sort.html",
        tags: ["Avg: \\(O(n \\log^2 n)\\)", "Parallel-Friendly", "Advanced"],
        details: [
            "Memory usage: about \\(O(\\log n)\\) stack in this recursive visualizer",
            "Best for: understanding sorting networks and parallel compare-exchange patterns",
            "Tradeoff: usually less practical than quick or merge sort on everyday inputs"
        ]
    },
    bubble_sort: {
        title: "Bubble Sort",
        summary: "A simple adjacent-swap algorithm that is easy to understand but inefficient on larger inputs.",
        href: "bubble_sort.html",
        tags: ["Best: \\(O(n)\\)", "Avg: \\(O(n^2)\\)", "Stable"],
        details: [
            "Memory usage: \\(O(1)\\)",
            "Best for: learning swaps and comparison-based sorting basics",
            "Weakness: becomes impractical quickly as input size grows"
        ]
    },
    bucket_sort: {
        title: "Bucket Sort",
        summary: "Groups values into buckets first, then sorts within each bucket for near-linear performance on suitable data.",
        href: "bucket_sort.html",
        tags: ["Expected: near \\(O(n)\\)", "\\(O(n + k)\\) Memory", "Distribution-Based"],
        details: [
            "Best for: values spread fairly evenly across a known range",
            "Strength: can be very fast when the bucket distribution is favorable",
            "Tradeoff: performance depends on input distribution and bucket design"
        ]
    },
    counting_sort: {
        title: "Counting Sort",
        summary: "A non-comparative integer sort that uses frequencies instead of pairwise comparisons.",
        href: "counting_sort.html",
        tags: ["\\(O(n + k)\\) Time", "\\(O(n + k)\\) Memory", "Stable"],
        details: [
            "Best for: non-negative integers with a reasonably small range",
            "Strength: avoids comparison cost entirely",
            "Tradeoff: extra memory grows with the input range"
        ],
        requiresNonNegativeIntegers: true
    },
    heap_sort: {
        title: "Heap Sort",
        summary: "Turns the array into a heap to guarantee \\(O(n \\log n)\\) time while staying in place.",
        href: "heap_sort.html",
        tags: ["\\(O(n \\log n)\\)", "\\(O(1)\\) Extra Space", "In-Place"],
        details: [
            "Best for: guaranteed comparison-sort performance with low extra memory",
            "Strength: avoids quick sort's bad pivot worst case",
            "Tradeoff: usually less cache-friendly and less intuitive than merge or quick sort"
        ]
    },
    insertion_sort: {
        title: "Insertion Sort",
        summary: "Builds the sorted portion one item at a time and works especially well on small or nearly sorted data.",
        href: "insertion_sort.html",
        tags: ["Best: \\(O(n)\\)", "Avg: \\(O(n^2)\\)", "Stable"],
        details: [
            "Memory usage: \\(O(1)\\)",
            "Best for: small inputs and nearly sorted arrays",
            "Strength: simple, adaptive, and often used inside hybrid sorts"
        ]
    },
    intro_sort: {
        title: "Intro Sort",
        summary: "Starts as quick sort and switches strategies when needed to avoid worst-case performance.",
        href: "intro_sort.html",
        tags: ["Avg: \\(O(n \\log n)\\)", "Hybrid", "In-Place"],
        details: [
            "Worst case: capped at \\(O(n \\log n)\\) by falling back to heap sort",
            "Best for: practical general-purpose sorting with safety against bad pivots",
            "Tradeoff: more implementation complexity than standalone quick sort"
        ]
    },
    merge_sort: {
        title: "Merge Sort",
        summary: "Recursively splits the array and merges sorted halves for reliable \\(O(n \\log n)\\) performance.",
        href: "merge_sort.html",
        tags: ["\\(O(n \\log n)\\)", "\\(O(n)\\) Memory", "Stable"],
        details: [
            "Best for: stable sorting and predictable performance",
            "Strength: clean divide-and-conquer behavior with strong theoretical guarantees",
            "Tradeoff: needs extra space for merging"
        ]
    },
    merge_sort_inplace: {
        title: "Merge Sort In-Place",
        summary: "A memory-optimized merge variant that trades implementation simplicity for in-place behavior.",
        href: "merge_sort_inplace.html",
        tags: ["\\(O(n \\log n)\\)", "\\(O(1)\\) Extra Space", "Advanced"],
        details: [
            "Best for: studying how merging can be done without a full helper array",
            "Strength: keeps merge-sort structure while minimizing extra storage",
            "Tradeoff: shifting values in place makes the implementation harder to follow"
        ],
        codeBaseName: "MergeSortInPlace"
    },
    quick_sort: {
        title: "Quick Sort",
        summary: "One of the fastest practical comparison sorts, built around partitioning by a pivot.",
        href: "quick_sort.html",
        tags: ["Avg: \\(O(n \\log n)\\)", "\\(O(\\log n)\\) Memory", "In-Place"],
        details: [
            "Worst case: \\(O(n^2)\\)",
            "Best for: strong practical speed on general-purpose data",
            "Tradeoff: performance depends heavily on partition quality"
        ]
    },
    radix_sort: {
        title: "Radix Sort",
        summary: "Sorts by individual digits instead of direct comparisons, making it powerful on fixed-format numeric data.",
        href: "radix_sort.html",
        tags: ["\\(O(d(n + k))\\)", "\\(O(n + k)\\) Memory", "Stable by Pass"],
        details: [
            "Best for: non-negative integers with a bounded digit structure",
            "Strength: avoids comparison cost by processing one digit place at a time",
            "Tradeoff: only a good fit when the data format matches the technique"
        ],
        requiresNonNegativeIntegers: true
    },
    selection_sort: {
        title: "Selection Sort",
        summary: "Repeatedly selects the next smallest value, minimizing writes but not comparisons.",
        href: "selection_sort.html",
        tags: ["\\(O(n^2)\\)", "\\(O(1)\\) Memory", "Few Writes"],
        details: [
            "Best for: simple scenarios where write count matters more than comparison count",
            "Strength: easy to reason about and keeps swaps low",
            "Tradeoff: still performs badly on larger inputs"
        ]
    },
    shell_sort: {
        title: "Shell Sort",
        summary: "Improves insertion sort by comparing elements across shrinking gaps before the final pass.",
        href: "shell_sort.html",
        tags: ["Gap-Based", "\\(O(1)\\) Memory", "In-Place"],
        details: [
            "Best for: medium-size inputs when you want something between insertion and \\(O(n \\log n)\\) sorts",
            "Strength: moves values closer to their final positions early",
            "Tradeoff: exact performance depends on the chosen gap sequence"
        ]
    },
    tim_sort: {
        title: "Tim Sort",
        summary: "A production-style hybrid sort that exploits natural runs and uses merge-like behavior underneath.",
        href: "tim_sort.html",
        tags: ["\\(O(n \\log n)\\)", "Stable", "Hybrid"],
        details: [
            "Best for: real-world data that often contains existing ordered runs",
            "Strength: combines insertion and merge strategies very effectively",
            "Tradeoff: more moving parts than simpler textbook sorts"
        ]
    },
    tournament_sort: {
        title: "Tournament Sort",
        summary: "Uses a tournament tree to repeatedly surface the next smallest element from a structured bracket.",
        href: "tournament_sort.html",
        tags: ["\\(O(n \\log n)\\)", "Tree-Based", "Extra Memory"],
        details: [
            "Best for: learning tree-based selection and repeated winner extraction",
            "Strength: the tournament structure makes each next minimum easy to trace",
            "Tradeoff: requires extra structure and is less common in practice"
        ]
    }
};
const algorithmOrder = [
    "bitonic_sort",
    "bubble_sort",
    "bucket_sort",
    "counting_sort",
    "heap_sort",
    "insertion_sort",
    "intro_sort",
    "merge_sort",
    "merge_sort_inplace",
    "quick_sort",
    "radix_sort",
    "selection_sort",
    "shell_sort",
    "tim_sort",
    "tournament_sort"
];
function typesetMath(root) {
    const mathJax = window.MathJax;
    void mathJax?.typesetPromise?.([root]);
}
function createSlot(slotId) {
    const select = document.getElementById(`compareSlot${slotId}`);
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
function getCodeBaseName(algorithm, language) {
    if (language === "java") {
        return algorithmInfo[algorithm].codeBaseName ?? algorithm
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
    }
    return algorithm;
}
async function loadCode(slot) {
    const extensions = {
        python: "py",
        cpp: "cpp",
        java: "java",
        c: "c"
    };
    const extension = extensions[slot.language];
    const fileName = getCodeBaseName(slot.algorithm, slot.language);
    const path = new URL(`../../${slot.language}/sorting/${fileName}.${extension}`, window.location.href).href;
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
    slot.link.classList.remove("disabled");
    slot.link.removeAttribute("aria-disabled");
    slot.visualizerTitle.textContent = info.title;
    slot.codeTitle.textContent = `${info.title} Code`;
    typesetMath(slot.summary);
    typesetMath(slot.tags);
    typesetMath(slot.details);
    void loadCode(slot);
}
function createGenerator(algorithm, dataset) {
    switch (algorithm) {
        case "bitonic_sort":
            return bitonicSort(dataset);
        case "bubble_sort":
            return bubbleSort(dataset);
        case "bucket_sort":
            return bucketSort(dataset);
        case "counting_sort":
            return countingSort(dataset);
        case "heap_sort":
            return heapSort(dataset);
        case "insertion_sort":
            return insertionSort(dataset);
        case "intro_sort":
            return introSort(dataset);
        case "merge_sort":
            return mergeSort(dataset);
        case "merge_sort_inplace":
            return mergeSortInPlace(dataset);
        case "quick_sort":
            return quickSort(dataset);
        case "radix_sort":
            return radixSort(dataset);
        case "selection_sort":
            return selectionSort(dataset);
        case "shell_sort":
            return shellSort(dataset);
        case "tim_sort":
            return timSort(dataset);
        case "tournament_sort":
            return tournamentSort(dataset);
    }
}
function sanitizeDataset(values, algorithms) {
    const requiresNonNegativeIntegers = algorithms.some(algorithm => algorithmInfo[algorithm].requiresNonNegativeIntegers);
    return values.filter(value => {
        if (Number.isNaN(value)) {
            return false;
        }
        if (!requiresNonNegativeIntegers) {
            return true;
        }
        return Number.isInteger(value) && value >= 0;
    });
}
function generateRandomArray(size) {
    return generateUniqueRandomArray(size);
}
function nextPowerOfTwo(n) {
    return 1 << Math.ceil(Math.log2(Math.max(1, n)));
}
function createInitialWorkspace(algorithm, dataset) {
    switch (algorithm) {
        case "bitonic_sort": {
            const targetLength = nextPowerOfTwo(dataset.length);
            return {
                title: "Algorithm Workspace",
                detail: "Bitonic Sort will build opposite-direction blocks, then merge them through a fixed comparison network",
                rows: [
                    { label: "Active Block", values: [...dataset] },
                    { label: "Compare Pair", values: [null, null] },
                    {
                        label: "Network View",
                        values: [
                            ...dataset,
                            ...new Array(Math.max(targetLength - dataset.length, 0)).fill(null)
                        ]
                    }
                ]
            };
        }
        case "bucket_sort": {
            if (dataset.length === 0) {
                return {
                    title: "Algorithm Workspace",
                    detail: "Buckets and output will appear here during the sort",
                    rows: [{ label: "Output", values: [] }]
                };
            }
            const bucketSize = 5;
            const minValue = Math.min(...dataset);
            const maxValue = Math.max(...dataset);
            const bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1;
            return {
                title: "Algorithm Workspace",
                detail: "Values will be distributed into buckets, then merged back in order",
                rows: [
                    ...Array.from({ length: bucketCount }, (_, index) => ({
                        label: `Bucket ${index}`,
                        values: [null]
                    })),
                    {
                        label: "Output",
                        values: new Array(dataset.length).fill(null)
                    }
                ]
            };
        }
        case "counting_sort": {
            const maxValue = dataset.length > 0 ? Math.max(...dataset) : 0;
            return {
                title: "Algorithm Workspace",
                detail: "Count and output arrays will animate here during the sort",
                rows: [
                    { label: "Count Array", values: new Array(maxValue + 1).fill(0) },
                    { label: "Output Array", values: new Array(dataset.length).fill(null) }
                ]
            };
        }
        case "heap_sort":
            return {
                title: "Algorithm Workspace",
                detail: "Heap Sort will build a max heap, then move the largest value into the sorted tail one step at a time",
                rows: [
                    { label: "Heap View", values: dataset.length > 0 ? [...dataset] : [] },
                    { label: "Sorted Tail", values: [] }
                ]
            };
        case "intro_sort": {
            const maxDepth = dataset.length > 0 ? 2 * Math.floor(Math.log2(dataset.length)) : 0;
            return {
                title: "Algorithm Workspace",
                detail: "Intro Sort will begin with Quick Sort, watch recursion depth, and switch strategies when needed",
                rows: [
                    { label: "Active Range", values: dataset.length > 0 ? [...dataset] : [] },
                    { label: "Focus", values: [null] },
                    { label: "Depth Budget", values: [maxDepth] },
                    { label: "Full Array", values: dataset.length > 0 ? [...dataset] : [] }
                ]
            };
        }
        case "merge_sort":
            return {
                title: "Algorithm Workspace",
                detail: "Merge Sort will split the array, then merge sorted halves back together here",
                rows: [
                    { label: "Left Half", values: [] },
                    { label: "Right Half", values: [] },
                    { label: "Merged", values: new Array(dataset.length).fill(null) }
                ]
            };
        case "merge_sort_inplace":
            return {
                title: "Algorithm Workspace",
                detail: "In-place merge sort will compare the two sorted sides, shift values right, and insert without a helper array",
                rows: [
                    { label: "Merge Range", values: dataset.length > 0 ? [...dataset] : [] },
                    { label: "Focus", values: [null] },
                    { label: "Full Array", values: dataset.length > 0 ? [...dataset] : [] }
                ]
            };
        case "quick_sort":
            return {
                title: "Algorithm Workspace",
                detail: "Quick Sort will choose a pivot, partition the active range, and recurse on the left and right sides",
                rows: [
                    { label: "Partition Range", values: dataset.length > 0 ? [...dataset] : [] },
                    { label: "Pivot", values: [null] },
                    { label: "Full Array", values: dataset.length > 0 ? [...dataset] : [] }
                ]
            };
        case "radix_sort":
            return {
                title: "Algorithm Workspace",
                detail: "Digit buckets and the collected output will animate here during each pass",
                rows: [
                    ...Array.from({ length: 10 }, (_, index) => ({
                        label: `Bucket ${index}`,
                        values: [null]
                    })),
                    { label: "Collected", values: new Array(dataset.length).fill(null) }
                ]
            };
        case "tim_sort":
            return {
                title: "Algorithm Workspace",
                detail: "Tim Sort will build small runs first, then merge those runs into larger sorted blocks",
                rows: [
                    { label: "Run 0", values: dataset.length > 0 ? [...dataset] : [] },
                    { label: "Merged", values: new Array(dataset.length).fill(null) }
                ]
            };
        case "tournament_sort":
            return {
                title: "Algorithm Workspace",
                detail: "The tournament tree will track the current winner while the output row fills in order",
                rows: [
                    { label: "Tournament Tree", values: new Array(Math.max(2 * nextPowerOfTwo(dataset.length) - 1, 0)).fill(null) },
                    { label: "Output", values: new Array(dataset.length).fill(null) }
                ]
            };
        default:
            return undefined;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const slotOne = createSlot("One");
    const slotTwo = createSlot("Two");
    const datasetInput = document.getElementById("compareDatasetInput");
    const generateBtn = document.getElementById("compareGenerateBtn");
    const playBtn = document.getElementById("comparePlayBtn");
    const pauseBtn = document.getElementById("comparePauseBtn");
    const stepBtn = document.getElementById("compareStepBtn");
    const resetBtn = document.getElementById("compareResetBtn");
    const speedRange = document.getElementById("compareSpeedRange");
    const graphOne = new Graph("compareGraphOne");
    const graphTwo = new Graph("compareGraphTwo");
    let dataset = generateRandomArray(20);
    slotOne.select.value = "quick_sort";
    slotTwo.select.value = "merge_sort";
    slotOne.algorithm = slotOne.select.value;
    slotTwo.algorithm = slotTwo.select.value;
    let controllerOne = new Controller(createGenerator(slotOne.algorithm, dataset), graphOne);
    let controllerTwo = new Controller(createGenerator(slotTwo.algorithm, dataset), graphTwo);
    datasetInput.value = dataset.join(",");
    function renderInitialState() {
        renderSlot(slotOne);
        renderSlot(slotTwo);
        graphOne.render(dataset, [], "default", createInitialWorkspace(slotOne.algorithm, dataset));
        graphTwo.render(dataset, [], "default", createInitialWorkspace(slotTwo.algorithm, dataset));
        controllerOne.setSpeed(Number(speedRange.value));
        controllerTwo.setSpeed(Number(speedRange.value));
    }
    function resetControllers() {
        controllerOne.reset(createGenerator(slotOne.algorithm, dataset), dataset);
        controllerTwo.reset(createGenerator(slotTwo.algorithm, dataset), dataset);
        graphOne.render(dataset, [], "default", createInitialWorkspace(slotOne.algorithm, dataset));
        graphTwo.render(dataset, [], "default", createInitialWorkspace(slotTwo.algorithm, dataset));
        controllerOne.setSpeed(Number(speedRange.value));
        controllerTwo.setSpeed(Number(speedRange.value));
    }
    function normalizeDatasetForActiveAlgorithms() {
        const sanitized = sanitizeDataset(dataset, [slotOne.algorithm, slotTwo.algorithm]);
        if (sanitized.length > 0 && sanitized.length !== dataset.length) {
            dataset = sanitized;
            datasetInput.value = dataset.join(",");
        }
    }
    const copyButtons = Array.from(document.querySelectorAll(".copy-code-btn"));
    [slotOne, slotTwo].forEach(slot => {
        slot.languageButtons.forEach(button => {
            button.addEventListener("click", () => {
                slot.language = button.dataset.lang;
                slot.languageButtons.forEach(btn => {
                    btn.classList.toggle("active", btn === button);
                });
                void loadCode(slot);
            });
        });
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
    slotOne.select.addEventListener("change", () => {
        renderSlot(slotOne);
        normalizeDatasetForActiveAlgorithms();
        resetControllers();
    });
    slotTwo.select.addEventListener("change", () => {
        renderSlot(slotTwo);
        normalizeDatasetForActiveAlgorithms();
        resetControllers();
    });
    generateBtn.addEventListener("click", () => {
        dataset = generateRandomArray(20);
        datasetInput.value = dataset.join(",");
        normalizeDatasetForActiveAlgorithms();
        resetControllers();
    });
    datasetInput.addEventListener("change", () => {
        const values = sanitizeDataset(datasetInput.value
            .split(",")
            .map(value => Number(value.trim()))
            .filter(value => !Number.isNaN(value)), [slotOne.algorithm, slotTwo.algorithm]);
        if (values.length > 0) {
            dataset = values;
            datasetInput.value = dataset.join(",");
            resetControllers();
        }
    });
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
    resetBtn.addEventListener("click", () => {
        resetControllers();
    });
    speedRange.addEventListener("input", () => {
        const speed = Number(speedRange.value);
        controllerOne.setSpeed(speed);
        controllerTwo.setSpeed(speed);
    });
    renderInitialState();
});
