export class SearchController {
    constructor(generator, visualizer) {
        this.intervalId = null;
        this.speed = 500;
        this.isRunning = false;
        this.stepCount = 0;
        this.generator = generator;
        this.visualizer = visualizer;
        this.visualizer.resetStepCount();
    }
    setSpeed(ms) {
        this.speed = ms;
    }
    play() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.intervalId = window.setInterval(() => {
            this.advance();
        }, this.speed);
    }
    pause() {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }
    step() {
        if (this.isRunning)
            return;
        this.advance();
    }
    reset(generator, initialStep) {
        this.pause();
        this.generator = generator;
        this.stepCount = 0;
        this.visualizer.resetStepCount();
        this.visualizer.render(initialStep);
    }
    advance() {
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
