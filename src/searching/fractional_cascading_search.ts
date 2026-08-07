import { createFractionalCascadingInitialStep, defaultFractionalCatalogs, fractionalCascadingSearch } from "./algorithms/fractional_cascading.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";

function serializeCatalogs(catalogs: number[][]): string {
    return catalogs.map(catalog => catalog.join(",")).join("; ");
}

function parseCatalogs(value: string): number[][] {
    const catalogs = value
        .split(";")
        .map(group => group
            .split(",")
            .map(item => Number(item.trim()))
            .filter(item => !Number.isNaN(item))
            .sort((a, b) => a - b)
        )
        .filter(group => group.length > 0);

    return catalogs.length > 0 ? catalogs : defaultFractionalCatalogs.map(catalog => [...catalog]);
}

function generateCatalogs(count: number, size: number): number[][] {
    return Array.from({ length: count }, (_, catalogIndex) => {
        const values = new Set<number>();

        while (values.size < size) {
            values.add(Math.floor(Math.random() * 88) + 3 + catalogIndex * 2);
        }

        return Array.from(values).sort((a, b) => a - b);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "fractional_cascading", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "fractional_cascading_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });

    const visualizer = new SearchVisualizer("searchGraphContainer");

    let catalogs = defaultFractionalCatalogs.map(catalog => [...catalog]);
    let target = 44;
    let controller = new SearchController(fractionalCascadingSearch(catalogs, target), visualizer);

    visualizer.render(createFractionalCascadingInitialStep(catalogs, target));

    const datasetInput = document.getElementById("datasetInput") as HTMLInputElement;
    const targetInput = document.getElementById("targetInput") as HTMLInputElement;
    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

    datasetInput.value = serializeCatalogs(catalogs);
    targetInput.value = String(target);

    function reset() {
        catalogs = parseCatalogs(datasetInput.value);
        target = Number(targetInput.value);

        if (Number.isNaN(target)) {
            const middleCatalog = catalogs[Math.floor(catalogs.length / 2)] ?? catalogs[0];
            target = middleCatalog[Math.floor(middleCatalog.length / 2)] ?? 44;
            targetInput.value = String(target);
        }

        datasetInput.value = serializeCatalogs(catalogs);
        controller.reset(
            fractionalCascadingSearch(catalogs, target),
            createFractionalCascadingInitialStep(catalogs, target)
        );
        controller.setSpeed(Number(speedRange.value));
    }

    generateBtn.addEventListener("click", () => {
        catalogs = generateCatalogs(4, 7);
        target = catalogs[1]?.[Math.floor(catalogs[1].length / 2)] ?? 44;
        datasetInput.value = serializeCatalogs(catalogs);
        targetInput.value = String(target);
        reset();
    });

    datasetInput.addEventListener("change", reset);
    targetInput.addEventListener("change", reset);
    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    resetBtn.addEventListener("click", reset);
    speedRange.addEventListener("input", () => {
        controller.setSpeed(Number(speedRange.value));
    });

    controller.setSpeed(Number(speedRange.value));
});
