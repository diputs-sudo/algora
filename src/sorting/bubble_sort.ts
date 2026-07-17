import { Graph } from "./visualizer/graph.js";
import { Controller } from "./visualizer/controller.js";
import { generateUniqueRandomArray } from "./visualizer/randomArray.js";
import { bubbleSort } from "./algorithms/bubble.js";
import { initLearnMore } from "../ui/navigation.js";
import { initCodeLoader } from "../ui/codeLoader.js";

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("sorting", "bubble_sort", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });

    const graph = new Graph("graphContainer");

    let dataset: number[] = generateRandomArray(20);
    let generator = bubbleSort(dataset);
    let controller = new Controller(generator, graph);

    graph.render(dataset);

    const datasetInput = document.getElementById("datasetInput") as HTMLInputElement;
    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

    generateBtn.addEventListener("click", () => {
        dataset = generateRandomArray(20);
        datasetInput.value = dataset.join(",");
        reset();
    });

    datasetInput.addEventListener("change", () => {
        const values = datasetInput.value
            .split(",")
            .map(v => Number(v.trim()))
            .filter(v => !isNaN(v));

        if (values.length > 0) {
            dataset = values;
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
        generator = bubbleSort(dataset);
        controller.reset(generator, dataset);
    }

    function generateRandomArray(size: number): number[] {
        return generateUniqueRandomArray(size);
    }
});
