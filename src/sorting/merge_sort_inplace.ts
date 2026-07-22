import { Graph } from "./visualizer/graph.js";
import { Controller } from "./visualizer/controller.js";
import { generateUniqueRandomArray } from "./visualizer/randomArray.js";
import { mergeSortInPlace } from "./algorithms/mergeInPlace.js";
import { initLearnMore } from "../ui/navigation.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { WorkspaceState } from "./visualizer/types.js";

function createInitialWorkspace(dataset: number[]): WorkspaceState {
    return {
        title: "Algorithm Workspace",
        detail: "In-place merge sort will compare the two sorted sides, shift values right, and insert without a helper array",
        rows: [
            { label: "Merge Range", values: dataset.length > 0 ? [...dataset] : [] },
            { label: "Focus", values: [null] },
            { label: "Full Array", values: dataset.length > 0 ? [...dataset] : [] }
        ]
    };
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("sorting", "merge_sort_inplace", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });

    const graph = new Graph("graphContainer");

    let dataset: number[] = generateRandomArray(20);
    let generator = mergeSortInPlace(dataset);
    let controller = new Controller(generator, graph);

    graph.render(dataset, [], "default", createInitialWorkspace(dataset));

    const datasetInput = document.getElementById("datasetInput") as HTMLInputElement;
    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

    datasetInput.value = dataset.join(",");

    generateBtn.addEventListener("click", () => {
        dataset = generateRandomArray(20);
        datasetInput.value = dataset.join(",");
        reset();
    });

    datasetInput.addEventListener("change", () => {
        const values = datasetInput.value
            .split(",")
            .map(value => Number(value.trim()))
            .filter(value => !Number.isNaN(value));

        if (values.length > 0) {
            dataset = values;
            datasetInput.value = dataset.join(",");
            reset();
        }
    });

    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    resetBtn.addEventListener("click", () => reset());

    speedRange.addEventListener("input", () => {
        controller.setSpeed(Number(speedRange.value));
    });

    function reset() {
        generator = mergeSortInPlace(dataset);
        controller.reset(generator, dataset);
        graph.render(dataset, [], "default", createInitialWorkspace(dataset));
    }

    function generateRandomArray(size: number): number[] {
        return generateUniqueRandomArray(size);
    }
});
