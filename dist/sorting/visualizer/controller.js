export class Controller {
    constructor(generator, graph) {
        this.intervalId = null;
        this.speed = 300;
        this.isRunning = false;
        this.stepCount = 0;
        this.generator = generator;
        this.graph = graph;
        this.graph.resetStepCount();
        this.graph.resetMemoryUsage();
    }
    setSpeed(ms) {
        this.speed = ms;
    }
    play() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.intervalId = window.setInterval(() => {
            const result = this.generator.next();
            if (result.done || result.value.type === "done") {
                this.stop();
                if (result.value) {
                    this.graph.render(result.value.array, result.value.indices, result.value.type, result.value.workspace);
                }
                this.graph.setMemoryUsage(result.value?.memoryUsed ?? 0, result.value?.memoryLabel ?? "Memory", result.value?.memoryUnit ?? "items");
                this.graph.showPeakMemoryUsage();
                this.graph.markSorted();
                return;
            }
            this.stepCount += 1;
            this.graph.setStepCount(this.stepCount);
            this.graph.setMemoryUsage(result.value.memoryUsed ?? 0, result.value.memoryLabel ?? "Memory", result.value.memoryUnit ?? "items");
            this.graph.render(result.value.array, result.value.indices, result.value.type, result.value.workspace);
        }, this.speed);
    }
    pause() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }
    stop() {
        this.pause();
    }
    step() {
        if (this.isRunning)
            return;
        const result = this.generator.next();
        if (result.done || result.value.type === "done") {
            if (result.value) {
                this.graph.render(result.value.array, result.value.indices, result.value.type, result.value.workspace);
            }
            this.graph.setMemoryUsage(result.value?.memoryUsed ?? 0, result.value?.memoryLabel ?? "Memory", result.value?.memoryUnit ?? "items");
            this.graph.showPeakMemoryUsage();
            this.graph.markSorted();
            return;
        }
        this.stepCount += 1;
        this.graph.setStepCount(this.stepCount);
        this.graph.setMemoryUsage(result.value.memoryUsed ?? 0, result.value.memoryLabel ?? "Memory", result.value.memoryUnit ?? "items");
        this.graph.render(result.value.array, result.value.indices, result.value.type, result.value.workspace);
    }
    reset(newGenerator, initialArray) {
        this.pause();
        this.generator = newGenerator;
        this.stepCount = 0;
        this.graph.resetStepCount();
        this.graph.resetMemoryUsage();
        this.graph.render(initialArray);
    }
}
