import { SearchStep } from "./types.js";
import { SearchVisualizer } from "./searchVisualizer.js";

export class SearchController {
    private generator: Generator<SearchStep>;
    private visualizer: SearchVisualizer;
    private intervalId: number | null = null;
    private speed = 500;
    private isRunning = false;
    private stepCount = 0;

    constructor(generator: Generator<SearchStep>, visualizer: SearchVisualizer) {
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

    public reset(generator: Generator<SearchStep>, initialStep: SearchStep) {
        this.pause();
        this.generator = generator;
        this.stepCount = 0;
        this.visualizer.resetStepCount();
        this.visualizer.render(initialStep);
    }

    private advance() {
        const result = this.generator.next();

        if (result.done) {
            this.pause();
            return;
        }

        if (result.value.type === "inspect") {
            this.stepCount += 1;
            this.visualizer.setStepCount(this.stepCount);
        }

        this.visualizer.render(result.value);

        if (result.value.type === "found" || result.value.type === "miss" || result.value.type === "done") {
            this.pause();
        }
    }
}
