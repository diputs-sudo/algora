import { GraphStep } from "./types.js";
import { GraphVisualizer } from "./graphVisualizer.js";

export class GraphController {
    private generator: Generator<GraphStep>;
    private visualizer: GraphVisualizer;
    private intervalId: number | null = null;
    private speed = 550;
    private isRunning = false;
    private stepCount = 0;

    constructor(generator: Generator<GraphStep>, visualizer: GraphVisualizer) {
        this.generator = generator;
        this.visualizer = visualizer;
        this.visualizer.resetStepCount();
    }

    public setSpeed(speedValue: number) {
        this.speed = Math.max(1, 1300 - speedValue);

        if (this.isRunning) {
            this.pause();
            this.play();
        }
    }

    public play() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalId = window.setInterval(() => {
            this.advance();
        }, this.speed);
    }

    public pause() {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
    }

    public step() {
        if (this.isRunning) return;
        this.advance();
    }

    public reset(generator: Generator<GraphStep>, initialStep: GraphStep) {
        this.pause();
        this.generator = generator;
        this.stepCount = 0;
        this.visualizer.resetStepCount();
        this.visualizer.render(initialStep);
    }

    public replace(generator: Generator<GraphStep>) {
        this.pause();
        this.generator = generator;
    }

    private advance() {
        const result = this.generator.next();

        if (result.done) {
            this.pause();
            return;
        }

        if (result.value.type !== "start") {
            this.stepCount += 1;
            this.visualizer.setStepCount(this.stepCount);
        }

        this.visualizer.render(result.value);

        if (result.value.type === "done") {
            this.pause();
        }
    }
}
