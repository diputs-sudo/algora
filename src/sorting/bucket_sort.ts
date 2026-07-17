import { Graph } from "./visualizer/graph.js";
import { Controller } from "./visualizer/controller.js";
import { generateUniqueRandomArray } from "./visualizer/randomArray.js";
import { bucketSort } from "./algorithms/bucket.js";
import { initLearnMore } from "../ui/navigation.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { WorkspaceState } from "./visualizer/types.js";

const BUCKET_SIZE = 5;

function createInitialWorkspace(dataset: number[]): WorkspaceState {
    if (dataset.length === 0) {
        return {
            title: "Algorithm Workspace",
            detail: "Buckets and output will appear here during the sort",
            rows: [{ label: "Output", values: [] }]
        };
    }

    const minValue = Math.min(...dataset);
    const maxValue = Math.max(...dataset);
    const bucketCount = Math.floor((maxValue - minValue) / BUCKET_SIZE) + 1;

    return {
        title: "Algorithm Workspace",
        detail: "Values will be distributed into buckets, then merged back in order",
        rows: [
            ...Array.from({ length: bucketCount }, (_, index) => ({
                label: `Bucket ${index}`,
                values: [null] as Array<number | null>
            })),
            {
                label: "Output",
                values: new Array(dataset.length).fill(null)
            }
        ]
    };
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("sorting", "bucket_sort", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });

    const graph = new Graph("graphContainer");

    let dataset: number[] = generateRandomArray(20);
    let generator = bucketSort(dataset);
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
        generator = bucketSort(dataset);
        controller.reset(generator, dataset);
        graph.render(dataset, [], "default", createInitialWorkspace(dataset));
    }

    function generateRandomArray(size: number): number[] {
        return generateUniqueRandomArray(size, 0, 99);
    }
});
