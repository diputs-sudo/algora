import { Step } from "./types.js";
import { Graph } from "./graph.js";

export class Controller {
    private generator: Generator<Step>;
    private graph: Graph;
    private intervalId: number | null = null;
    private speed: number = 300;
    private isRunning: boolean = false;
    private stepCount: number = 0;

    constructor(generator: Generator<Step>, graph: Graph) {
        this.generator = generator;
        this.graph = graph;
        this.graph.resetStepCount();
        this.graph.resetMemoryUsage();
    }

    public setSpeed(ms: number) {
        this.speed = ms;
    }

    public play() {
        if (this.isRunning) return;

        this.isRunning = true;

        this.intervalId = window.setInterval(() => {
            const result = this.generator.next();

            if (result.done || result.value.type === "done") {
                this.stop();
                if (result.value) {
                    this.graph.render(
                        result.value.array,
                        result.value.indices,
                        result.value.type,
                        result.value.workspace
                    );
                }
                this.graph.setMemoryUsage(
                    result.value?.memoryUsed ?? 0,
                    result.value?.memoryLabel ?? "Memory",
                    result.value?.memoryUnit ?? "items"
                );
                this.graph.showPeakMemoryUsage();
                this.graph.markSorted();
                return;
            }

            this.stepCount += 1;
            this.graph.setStepCount(this.stepCount);
            this.graph.setMemoryUsage(
                result.value.memoryUsed ?? 0,
                result.value.memoryLabel ?? "Memory",
                result.value.memoryUnit ?? "items"
            );
            this.graph.render(
                result.value.array,
                result.value.indices,
                result.value.type,
                result.value.workspace
            );
        }, this.speed);
    }

    public pause() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    public stop() {
        this.pause();
    }

    public step() {
        if (this.isRunning) return;

        const result = this.generator.next();

        if (result.done || result.value.type === "done") {
            if (result.value) {
                this.graph.render(
                    result.value.array,
                    result.value.indices,
                    result.value.type,
                    result.value.workspace
                );
            }
            this.graph.setMemoryUsage(
                result.value?.memoryUsed ?? 0,
                result.value?.memoryLabel ?? "Memory",
                result.value?.memoryUnit ?? "items"
            );
            this.graph.showPeakMemoryUsage();
            this.graph.markSorted();
            return;
        }

        this.stepCount += 1;
        this.graph.setStepCount(this.stepCount);
        this.graph.setMemoryUsage(
            result.value.memoryUsed ?? 0,
            result.value.memoryLabel ?? "Memory",
            result.value.memoryUnit ?? "items"
        );
        this.graph.render(
            result.value.array,
            result.value.indices,
            result.value.type,
            result.value.workspace
        );
    }

    public reset(newGenerator: Generator<Step>, initialArray: number[]) {
        this.pause();
        this.generator = newGenerator;
        this.stepCount = 0;
        this.graph.resetStepCount();
        this.graph.resetMemoryUsage();
        this.graph.render(initialArray);
    }
}
