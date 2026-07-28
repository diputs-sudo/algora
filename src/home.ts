import { Graph } from "./sorting/visualizer/graph.js";
import { bubbleSort } from "./sorting/algorithms/bubble.js";
import { selectionSort } from "./sorting/algorithms/selection.js";
import { insertionSort } from "./sorting/algorithms/insertion.js";
import { mergeSort } from "./sorting/algorithms/merge.js";
import { quickSort } from "./sorting/algorithms/quick.js";
import { heapSort } from "./sorting/algorithms/heap.js";
import { Step } from "./sorting/visualizer/types.js";

type SortPreview = {
    name: string;
    data: number[];
    run: (input: number[]) => Generator<Step>;
};

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("homeGraphContainer");
    const label = document.getElementById("homePreviewAlgorithm");

    if (!container) return;

    const graph = new Graph("homeGraphContainer");
    const previews: SortPreview[] = [
        {
            name: "Bubble Sort",
            data: [62, 18, 44, 12, 86, 30, 71, 24],
            run: bubbleSort
        },
        {
            name: "Selection Sort",
            data: [72, 14, 58, 36, 91, 27, 49, 8],
            run: selectionSort
        },
        {
            name: "Insertion Sort",
            data: [21, 64, 18, 75, 32, 90, 44, 57],
            run: insertionSort
        },
        {
            name: "Merge Sort",
            data: [82, 28, 66, 12, 54, 39, 93, 47],
            run: mergeSort
        },
        {
            name: "Quick Sort",
            data: [55, 13, 89, 31, 76, 22, 68, 40],
            run: quickSort
        },
        {
            name: "Heap Sort",
            data: [34, 87, 19, 63, 5, 71, 48, 96],
            run: heapSort
        }
    ];
    const stepDelay = 170;
    const restartDelay = 1300;

    let timerId: number | null = null;
    let restartId: number | null = null;
    let previewIndex = 0;
    let generator = previews[previewIndex].run(previews[previewIndex].data);

    function clearTimers() {
        if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
        }

        if (restartId !== null) {
            window.clearTimeout(restartId);
            restartId = null;
        }
    }

    function runLoop() {
        clearTimers();
        const preview = previews[previewIndex];
        generator = preview.run(preview.data);
        if (label) {
            label.textContent = preview.name;
        }
        graph.resetStepCount();
        graph.render(preview.data);

        timerId = window.setInterval(() => {
            const result = generator.next();

            if (result.done || result.value.type === "done") {
                clearTimers();
                graph.markSorted();
                previewIndex = (previewIndex + 1) % previews.length;
                restartId = window.setTimeout(runLoop, restartDelay);
                return;
            }

            graph.incrementStepCount();
            graph.render(
                result.value.array,
                result.value.indices,
                result.value.type
            );
        }, stepDelay);
    }

    runLoop();
});
