export class SearchVisualizer {
    constructor(containerId) {
        this.pointerSlots = [];
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error("Search visualizer container not found");
        }
        this.container = element;
        this.container.innerHTML = "";
        this.container.classList.add("search-visualizer");
        this.statsRoot = document.createElement("div");
        this.statsRoot.classList.add("visualizer-stats");
        this.stepCounter = document.createElement("div");
        this.stepCounter.classList.add("visualizer-stat");
        this.resultCounter = document.createElement("div");
        this.resultCounter.classList.add("visualizer-stat");
        this.statsRoot.appendChild(this.stepCounter);
        this.statsRoot.appendChild(this.resultCounter);
        this.statusRoot = document.createElement("div");
        this.statusRoot.classList.add("search-status");
        this.gridRoot = document.createElement("div");
        this.gridRoot.classList.add("search-array-grid");
        this.metaBinaryRoot = document.createElement("div");
        this.metaBinaryRoot.classList.add("meta-binary-insight", "hidden");
        this.uniformBinaryRoot = document.createElement("div");
        this.uniformBinaryRoot.classList.add("uniform-binary-insight", "hidden");
        this.fibonacciRoot = document.createElement("div");
        this.fibonacciRoot.classList.add("fibonacci-insight", "hidden");
        this.rangeSearchRoot = document.createElement("div");
        this.rangeSearchRoot.classList.add("range-search-insight", "hidden");
        this.jumpSearchRoot = document.createElement("div");
        this.jumpSearchRoot.classList.add("jump-search-insight", "hidden");
        this.sentinelLinearRoot = document.createElement("div");
        this.sentinelLinearRoot.classList.add("sentinel-linear-insight", "hidden");
        this.bitonicRoot = document.createElement("div");
        this.bitonicRoot.classList.add("bitonic-insight", "hidden");
        this.fractionalCascadingRoot = document.createElement("div");
        this.fractionalCascadingRoot.classList.add("fractional-cascading-insight", "hidden");
        this.hashTableRoot = document.createElement("div");
        this.hashTableRoot.classList.add("hash-table-insight", "hidden");
        this.parametricRoot = document.createElement("div");
        this.parametricRoot.classList.add("parametric-insight", "hidden");
        this.interpolationRoot = document.createElement("div");
        this.interpolationRoot.classList.add("interpolation-insight", "hidden");
        this.workspaceRoot = document.createElement("div");
        this.workspaceRoot.classList.add("visualizer-workspace", "hidden");
        this.workspaceTitle = document.createElement("div");
        this.workspaceTitle.classList.add("visualizer-workspace-title");
        this.workspaceDetail = document.createElement("div");
        this.workspaceDetail.classList.add("visualizer-workspace-detail");
        this.workspaceRows = document.createElement("div");
        this.workspaceRows.classList.add("visualizer-workspace-rows");
        this.workspaceRoot.appendChild(this.workspaceTitle);
        this.workspaceRoot.appendChild(this.workspaceDetail);
        this.workspaceRoot.appendChild(this.workspaceRows);
        const counterHost = this.findCounterHost();
        counterHost?.appendChild(this.statsRoot);
        this.container.appendChild(this.statusRoot);
        this.container.appendChild(this.gridRoot);
        this.container.appendChild(this.metaBinaryRoot);
        this.container.appendChild(this.uniformBinaryRoot);
        this.container.appendChild(this.fibonacciRoot);
        this.container.appendChild(this.rangeSearchRoot);
        this.container.appendChild(this.jumpSearchRoot);
        this.container.appendChild(this.sentinelLinearRoot);
        this.container.appendChild(this.bitonicRoot);
        this.container.appendChild(this.fractionalCascadingRoot);
        this.container.appendChild(this.hashTableRoot);
        this.container.appendChild(this.parametricRoot);
        this.container.appendChild(this.interpolationRoot);
        this.container.appendChild(this.workspaceRoot);
        this.setStepCount(0);
        this.setResult("Waiting");
    }
    findCounterHost() {
        const visualizerSection = this.container.closest(".visualizer");
        const dedicatedHost = visualizerSection?.querySelector(".visualizer-counter-host");
        if (dedicatedHost) {
            return dedicatedHost;
        }
        const speedControl = visualizerSection?.querySelector(".speed-control");
        return speedControl ?? this.container;
    }
    render(step) {
        this.gridRoot.innerHTML = "";
        this.pointerSlots = [];
        this.container.style.setProperty("--search-cell-count", String(Math.min(Math.max(step.array.length, 1), 20)));
        this.statusRoot.textContent = step.message ?? "Set a sorted array and target, then step through the search.";
        const useFractionalWorkspaceOnly = step.fractionalCascading !== undefined;
        this.gridRoot.classList.toggle("hidden", useFractionalWorkspaceOnly);
        if (!useFractionalWorkspaceOnly) {
            step.array.forEach((value, index) => {
                const item = document.createElement("div");
                item.classList.add("search-array-item");
                const indexCell = document.createElement("div");
                indexCell.classList.add("search-index");
                indexCell.textContent = String(index);
                item.appendChild(indexCell);
                const cell = document.createElement("div");
                cell.classList.add("search-cell");
                const valueElement = document.createElement("span");
                valueElement.classList.add("search-cell-value");
                valueElement.textContent = String(value);
                cell.appendChild(valueElement);
                if (step.low !== undefined && step.high !== undefined && index >= step.low && index <= step.high) {
                    cell.classList.add("in-range");
                }
                if (index === step.mid || step.highlightIndices?.includes(index)) {
                    cell.classList.add("mid");
                }
                if (index === step.resultIndex && step.type === "found") {
                    cell.classList.add("found");
                }
                if (step.type === "miss" && index === step.mid) {
                    cell.classList.add("miss");
                }
                item.appendChild(cell);
                const pointerSlot = document.createElement("div");
                pointerSlot.classList.add("search-pointer-slot");
                item.appendChild(pointerSlot);
                this.pointerSlots[index] = pointerSlot;
                this.gridRoot.appendChild(item);
            });
            this.renderPointers(step);
        }
        this.renderMetaBinaryInsight(step.metaBinary);
        this.renderUniformBinaryInsight(step.uniformBinary);
        this.renderFibonacciInsight(step.fibonacci);
        this.renderRangeSearchInsight(step.rangeSearch);
        this.renderJumpSearchInsight(step.jumpSearch);
        this.renderSentinelLinearInsight(step.sentinelLinear);
        this.renderBitonicInsight(step.bitonic, step.array, step.target);
        this.renderFractionalCascadingInsight(step.fractionalCascading);
        this.renderHashTableInsight(step.hashTable);
        this.renderParametricInsight(step.parametric);
        this.renderInterpolationInsight(step.interpolation);
        this.renderWorkspace(step.workspace);
        this.setResult(this.getResultText(step));
    }
    renderPointers(step) {
        const pointers = step.pointers ?? [
            { label: "low", index: step.low },
            { label: "mid", index: step.mid },
            { label: "high", index: step.high }
        ];
        pointers.forEach(pointer => {
            if (pointer.index === undefined || pointer.index < 0 || pointer.index >= step.array.length) {
                return;
            }
            const marker = document.createElement("div");
            marker.classList.add("search-pointer", `search-pointer-${pointer.label}`);
            marker.textContent = pointer.label;
            this.pointerSlots[pointer.index]?.appendChild(marker);
        });
    }
    renderInterpolationInsight(insight) {
        if (!insight) {
            this.interpolationRoot.classList.add("hidden");
            this.interpolationRoot.innerHTML = "";
            return;
        }
        const ratioPercent = Math.max(0, Math.min(100, insight.ratio * 100));
        const probePercent = insight.indexSpan === 0
            ? 0
            : ((insight.probe - insight.low) / insight.indexSpan) * 100;
        const clampedProbePercent = Math.max(0, Math.min(100, probePercent));
        this.interpolationRoot.classList.remove("hidden");
        this.interpolationRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("interpolation-insight-header");
        const title = document.createElement("div");
        title.classList.add("interpolation-insight-title");
        title.textContent = "How the Probe is Estimated";
        const summary = document.createElement("div");
        summary.classList.add("interpolation-insight-summary");
        summary.textContent = `Same position, different scale: ${formatPercentPrecise(ratioPercent)}.`;
        header.appendChild(title);
        header.appendChild(summary);
        const estimate = document.createElement("div");
        estimate.classList.add("interpolation-estimate");
        estimate.appendChild(createEstimateCell("Value position", formatFraction(insight.valueDistance, insight.valueSpan), formatPercentPrecise(ratioPercent)));
        estimate.appendChild(createEstimateDivider());
        estimate.appendChild(createEstimateCell("Index position", formatFraction(insight.probe - insight.low, insight.indexSpan), `probe ${insight.probe}`));
        const maps = document.createElement("div");
        maps.classList.add("interpolation-map-grid");
        maps.appendChild(createMap("Value scale", String(insight.lowValue), String(insight.highValue), String(insight.target), ratioPercent));
        maps.appendChild(createMap("Index scale", String(insight.low), String(insight.high), "Probe", clampedProbePercent));
        const note = document.createElement("p");
        note.classList.add("interpolation-note");
        note.textContent = insight.note ?? `Target sits ${formatPercentPrecise(ratioPercent)} through the values, so the next probe lands at index ${insight.probe}.`;
        this.interpolationRoot.appendChild(header);
        this.interpolationRoot.appendChild(estimate);
        this.interpolationRoot.appendChild(maps);
        this.interpolationRoot.appendChild(note);
    }
    renderMetaBinaryInsight(insight) {
        if (!insight) {
            this.metaBinaryRoot.classList.add("hidden");
            this.metaBinaryRoot.innerHTML = "";
            return;
        }
        this.metaBinaryRoot.classList.remove("hidden");
        this.metaBinaryRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("meta-binary-insight-header");
        const title = document.createElement("div");
        title.classList.add("meta-binary-insight-title");
        title.textContent = "Bit Builder";
        const decision = document.createElement("div");
        decision.classList.add("meta-binary-decision", `meta-binary-decision-${insight.decision}`);
        decision.textContent = formatMetaDecision(insight.decision);
        header.appendChild(title);
        header.appendChild(decision);
        const bitStrip = document.createElement("div");
        bitStrip.classList.add("meta-binary-bit-strip");
        insight.bits.forEach(bitState => {
            const bit = document.createElement("div");
            bit.classList.add("meta-binary-bit", `meta-binary-bit-${bitState.status}`);
            bit.textContent = `+${bitState.bit}`;
            bitStrip.appendChild(bit);
        });
        const equation = document.createElement("div");
        equation.classList.add("meta-binary-equation");
        equation.appendChild(createMetaMetric("Base", formatMetaIndex(insight.baseIndex), "last confirmed smaller"));
        equation.appendChild(createMetaMetric("Trying", insight.activeBit > 0 ? `+${insight.activeBit}` : "done", "current bit"));
        equation.appendChild(createMetaMetric("Test", formatMetaIndex(insight.testIndex), insight.testValue === undefined ? "outside array" : `value ${insight.testValue}`));
        equation.appendChild(createMetaMetric("Final check", formatMetaIndex(insight.candidateIndex), "base + 1"));
        const comparison = document.createElement("div");
        comparison.classList.add("meta-binary-comparison", `meta-binary-comparison-${insight.decision}`);
        const comparisonLabel = document.createElement("span");
        comparisonLabel.textContent = "Decision";
        const comparisonText = document.createElement("strong");
        comparisonText.textContent = insight.comparison ?? formatMetaDecision(insight.decision);
        const comparisonDetail = document.createElement("em");
        comparisonDetail.textContent = insight.decisionText;
        comparison.appendChild(comparisonLabel);
        comparison.appendChild(comparisonText);
        comparison.appendChild(comparisonDetail);
        const note = document.createElement("p");
        note.classList.add("meta-binary-note");
        note.textContent = insight.note;
        this.metaBinaryRoot.appendChild(header);
        this.metaBinaryRoot.appendChild(bitStrip);
        this.metaBinaryRoot.appendChild(equation);
        this.metaBinaryRoot.appendChild(comparison);
        this.metaBinaryRoot.appendChild(note);
    }
    renderUniformBinaryInsight(insight) {
        if (!insight) {
            this.uniformBinaryRoot.classList.add("hidden");
            this.uniformBinaryRoot.innerHTML = "";
            return;
        }
        this.uniformBinaryRoot.classList.remove("hidden");
        this.uniformBinaryRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("uniform-binary-insight-header");
        const title = document.createElement("div");
        title.classList.add("uniform-binary-insight-title");
        title.textContent = "Step Table";
        const direction = document.createElement("div");
        direction.classList.add("uniform-binary-direction", `uniform-binary-direction-${insight.direction}`);
        direction.textContent = formatUniformDirection(insight.direction);
        header.appendChild(title);
        header.appendChild(direction);
        const stepStrip = document.createElement("div");
        stepStrip.classList.add("uniform-binary-step-strip");
        insight.steps.forEach((step, index) => {
            const item = document.createElement("div");
            item.classList.add("uniform-binary-step", `uniform-binary-step-${step.status}`);
            const label = document.createElement("span");
            label.textContent = `t${index}`;
            const value = document.createElement("strong");
            value.textContent = String(step.step);
            item.appendChild(label);
            item.appendChild(value);
            stepStrip.appendChild(item);
        });
        const metrics = document.createElement("div");
        metrics.classList.add("uniform-binary-metrics");
        metrics.appendChild(createUniformMetric("Range", `${formatUniformIndex(insight.low)} to ${formatUniformIndex(insight.high)}`, "active bounds"));
        metrics.appendChild(createUniformMetric("Probe", formatUniformIndex(insight.mid), "current index"));
        metrics.appendChild(createUniformMetric("Current step", String(insight.currentStep), `table entry t${insight.currentStepIndex}`));
        metrics.appendChild(createUniformMetric("Next step", insight.nextStep === undefined ? "done" : String(insight.nextStep), "smaller offset"));
        const comparison = document.createElement("div");
        comparison.classList.add("uniform-binary-comparison", `uniform-binary-comparison-${insight.direction}`);
        const comparisonLabel = document.createElement("span");
        comparisonLabel.textContent = "Decision";
        const comparisonText = document.createElement("strong");
        comparisonText.textContent = insight.comparison ?? formatUniformDirection(insight.direction);
        const comparisonDetail = document.createElement("em");
        comparisonDetail.textContent = insight.decisionText;
        comparison.appendChild(comparisonLabel);
        comparison.appendChild(comparisonText);
        comparison.appendChild(comparisonDetail);
        const note = document.createElement("p");
        note.classList.add("uniform-binary-note");
        note.textContent = insight.note;
        this.uniformBinaryRoot.appendChild(header);
        this.uniformBinaryRoot.appendChild(stepStrip);
        this.uniformBinaryRoot.appendChild(metrics);
        this.uniformBinaryRoot.appendChild(comparison);
        this.uniformBinaryRoot.appendChild(note);
    }
    renderFibonacciInsight(insight) {
        if (!insight) {
            this.fibonacciRoot.classList.add("hidden");
            this.fibonacciRoot.innerHTML = "";
            return;
        }
        this.fibonacciRoot.classList.remove("hidden");
        this.fibonacciRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("fibonacci-insight-header");
        const title = document.createElement("div");
        title.classList.add("fibonacci-insight-title");
        title.textContent = "Fibonacci Window";
        const direction = document.createElement("div");
        direction.classList.add("fibonacci-direction", `fibonacci-direction-${insight.direction}`);
        direction.textContent = formatFibonacciDirection(insight.direction);
        header.appendChild(title);
        header.appendChild(direction);
        const numbers = document.createElement("div");
        numbers.classList.add("fibonacci-number-strip");
        numbers.appendChild(createFibonacciMetric("F", String(insight.fibM), "window size"));
        numbers.appendChild(createFibonacciMetric("F-1", String(insight.fibM1), "right shrink"));
        numbers.appendChild(createFibonacciMetric("F-2", String(insight.fibM2), "probe offset"));
        const equation = document.createElement("div");
        equation.classList.add("fibonacci-equation");
        equation.appendChild(createFibonacciMetric("Offset", formatSearchIndex(insight.offset), "last discarded"));
        equation.appendChild(createFibonacciMetric("Probe", formatSearchIndex(insight.probe), "offset + F-2"));
        equation.appendChild(createFibonacciMetric("Window", `${formatSearchIndex(insight.windowStart)} to ${formatSearchIndex(insight.windowEnd)}`, "remaining range"));
        const comparison = document.createElement("div");
        comparison.classList.add("fibonacci-comparison", `fibonacci-comparison-${insight.direction}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison ?? formatFibonacciDirection(insight.direction)));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("fibonacci-note");
        note.textContent = insight.note;
        this.fibonacciRoot.appendChild(header);
        this.fibonacciRoot.appendChild(numbers);
        this.fibonacciRoot.appendChild(equation);
        this.fibonacciRoot.appendChild(comparison);
        this.fibonacciRoot.appendChild(note);
    }
    renderRangeSearchInsight(insight) {
        if (!insight) {
            this.rangeSearchRoot.classList.add("hidden");
            this.rangeSearchRoot.innerHTML = "";
            return;
        }
        this.rangeSearchRoot.classList.remove("hidden");
        this.rangeSearchRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("range-search-insight-header");
        const title = document.createElement("div");
        title.classList.add("range-search-insight-title");
        title.textContent = insight.title;
        const phase = document.createElement("div");
        phase.classList.add("range-search-phase", `range-search-phase-${insight.phase}`);
        phase.textContent = formatRangePhase(insight.phase);
        header.appendChild(title);
        header.appendChild(phase);
        const metrics = document.createElement("div");
        metrics.classList.add("range-search-metrics");
        metrics.appendChild(createRangeMetric("Lower", formatSearchIndex(insight.lower), "left edge"));
        metrics.appendChild(createRangeMetric("Probe", formatSearchIndex(insight.probe), insight.jump === undefined ? "middle" : `jump ${insight.jump}`));
        metrics.appendChild(createRangeMetric("Upper", formatSearchIndex(insight.upper), "right edge"));
        metrics.appendChild(createRangeMetric("Next", insight.nextJump === undefined ? "binary" : String(insight.nextJump), insight.phase === "expand" ? "next jump" : "next bound"));
        const comparison = document.createElement("div");
        comparison.classList.add("range-search-comparison", `range-search-comparison-${insight.phase}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison ?? formatRangePhase(insight.phase)));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("range-search-note");
        note.textContent = insight.note;
        this.rangeSearchRoot.appendChild(header);
        this.rangeSearchRoot.appendChild(metrics);
        this.rangeSearchRoot.appendChild(comparison);
        this.rangeSearchRoot.appendChild(note);
    }
    renderJumpSearchInsight(insight) {
        if (!insight) {
            this.jumpSearchRoot.classList.add("hidden");
            this.jumpSearchRoot.innerHTML = "";
            return;
        }
        this.jumpSearchRoot.classList.remove("hidden");
        this.jumpSearchRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("jump-search-insight-header");
        const title = document.createElement("div");
        title.classList.add("jump-search-insight-title");
        title.textContent = "Block Finder";
        const phase = document.createElement("div");
        phase.classList.add("jump-search-phase", `jump-search-phase-${insight.phase}`);
        phase.textContent = formatJumpPhase(insight.phase);
        header.appendChild(title);
        header.appendChild(phase);
        const metrics = document.createElement("div");
        metrics.classList.add("jump-search-metrics");
        metrics.appendChild(createJumpMetric("Block", `${formatSearchIndex(insight.blockStart)} to ${formatSearchIndex(insight.blockEnd)}`, "candidate range"));
        metrics.appendChild(createJumpMetric("Current", formatSearchIndex(insight.current), insight.phase === "jump" ? "boundary" : "scan index"));
        metrics.appendChild(createJumpMetric("Jump", String(insight.jumpSize), "block size"));
        metrics.appendChild(createJumpMetric("Next", insight.nextStart === undefined ? "scan" : formatSearchIndex(insight.nextStart), "next start"));
        const comparison = document.createElement("div");
        comparison.classList.add("jump-search-comparison", `jump-search-comparison-${insight.phase}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison ?? formatJumpPhase(insight.phase)));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("jump-search-note");
        note.textContent = insight.note;
        this.jumpSearchRoot.appendChild(header);
        this.jumpSearchRoot.appendChild(metrics);
        this.jumpSearchRoot.appendChild(comparison);
        this.jumpSearchRoot.appendChild(note);
    }
    renderSentinelLinearInsight(insight) {
        if (!insight) {
            this.sentinelLinearRoot.classList.add("hidden");
            this.sentinelLinearRoot.innerHTML = "";
            return;
        }
        this.sentinelLinearRoot.classList.remove("hidden");
        this.sentinelLinearRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("sentinel-linear-insight-header");
        const title = document.createElement("div");
        title.classList.add("sentinel-linear-insight-title");
        title.textContent = "Sentinel Guard";
        const phase = document.createElement("div");
        phase.classList.add("sentinel-linear-phase", `sentinel-linear-phase-${insight.phase}`);
        phase.textContent = formatSentinelPhase(insight.phase);
        header.appendChild(title);
        header.appendChild(phase);
        const metrics = document.createElement("div");
        metrics.classList.add("sentinel-linear-metrics");
        metrics.appendChild(createSentinelMetric("Saved last", String(insight.savedLast), "original value"));
        metrics.appendChild(createSentinelMetric("Sentinel", formatSearchIndex(insight.sentinelIndex), "temporary target"));
        metrics.appendChild(createSentinelMetric("Current", formatSearchIndex(insight.current), insight.workingValue === undefined ? "not scanning" : `value ${insight.workingValue}`));
        const comparison = document.createElement("div");
        comparison.classList.add("sentinel-linear-comparison", `sentinel-linear-comparison-${insight.phase}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison ?? formatSentinelPhase(insight.phase)));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("sentinel-linear-note");
        note.textContent = insight.note;
        this.sentinelLinearRoot.appendChild(header);
        this.sentinelLinearRoot.appendChild(metrics);
        this.sentinelLinearRoot.appendChild(comparison);
        this.sentinelLinearRoot.appendChild(note);
    }
    renderBitonicInsight(insight, array = [], target) {
        if (!insight) {
            this.bitonicRoot.classList.add("hidden");
            this.bitonicRoot.innerHTML = "";
            return;
        }
        this.bitonicRoot.classList.remove("hidden");
        this.bitonicRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("bitonic-insight-header");
        const title = document.createElement("div");
        title.classList.add("bitonic-insight-title");
        title.textContent = "Peak Split";
        const phase = document.createElement("div");
        phase.classList.add("bitonic-phase", `bitonic-phase-${insight.phase}`);
        phase.textContent = formatBitonicPhase(insight.phase);
        header.appendChild(title);
        header.appendChild(phase);
        const stage = document.createElement("div");
        stage.classList.add("bitonic-stage");
        stage.style.setProperty("--bitonic-count", String(Math.min(Math.max(array.length, 1), 20)));
        const minValue = array.length ? Math.min(...array) : 0;
        const maxValue = array.length ? Math.max(...array) : 1;
        const span = Math.max(maxValue - minValue, 1);
        array.forEach((value, index) => {
            const point = document.createElement("div");
            point.classList.add("bitonic-point");
            point.style.setProperty("--bitonic-height", `${30 + ((value - minValue) / span) * 70}%`);
            if (index >= insight.left && index <= insight.right) {
                point.classList.add("in-range");
            }
            if (index === insight.mid) {
                point.classList.add("is-mid");
            }
            if (insight.phase === "peak" && index === insight.mid + 1 && insight.mid + 1 < array.length) {
                point.classList.add("is-next");
            }
            if (index === insight.peak) {
                point.classList.add("is-peak");
            }
            if (insight.side === "increasing" && insight.peak !== undefined && index <= insight.peak) {
                point.classList.add("is-active-side");
            }
            if (insight.side === "decreasing" && insight.peak !== undefined && index >= insight.peak) {
                point.classList.add("is-active-side");
            }
            const bar = document.createElement("div");
            bar.classList.add("bitonic-point-bar");
            const valueLabel = document.createElement("strong");
            valueLabel.textContent = String(value);
            const indexLabel = document.createElement("span");
            indexLabel.textContent = String(index);
            point.appendChild(bar);
            point.appendChild(valueLabel);
            point.appendChild(indexLabel);
            stage.appendChild(point);
        });
        const split = document.createElement("div");
        split.classList.add("bitonic-split-map");
        split.appendChild(createBitonicSplitCell("Increasing side", insight.peak === undefined ? "before peak" : `0 to ${insight.peak}`, insight.side === "increasing"));
        split.appendChild(createBitonicSplitCell("Peak", insight.peak === undefined ? "searching" : `${formatSearchIndex(insight.peak)} = ${array[insight.peak]}`, insight.peak !== undefined && insight.phase === "peak"));
        split.appendChild(createBitonicSplitCell("Decreasing side", insight.peak === undefined ? "after peak" : `${insight.peak} to ${array.length - 1}`, insight.side === "decreasing"));
        const metrics = document.createElement("div");
        metrics.classList.add("bitonic-metrics");
        metrics.appendChild(createBitonicMetric("Window", `${formatSearchIndex(insight.left)} to ${formatSearchIndex(insight.right)}`, "current candidates"));
        metrics.appendChild(createBitonicMetric("Probe", formatSearchIndex(insight.mid), insight.phase === "peak" ? "slope check" : "binary middle"));
        metrics.appendChild(createBitonicMetric("Target", target === undefined ? "none" : String(target), "wanted value"));
        metrics.appendChild(createBitonicMetric("Rule", formatBitonicRule(insight), insight.side === "decreasing" ? "comparison flips" : "comparison follows order"));
        const comparison = document.createElement("div");
        comparison.classList.add("bitonic-comparison", `bitonic-comparison-${insight.phase}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison ?? formatBitonicPhase(insight.phase)));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("bitonic-note");
        note.textContent = insight.note;
        this.bitonicRoot.appendChild(header);
        this.bitonicRoot.appendChild(stage);
        this.bitonicRoot.appendChild(split);
        this.bitonicRoot.appendChild(metrics);
        this.bitonicRoot.appendChild(comparison);
        this.bitonicRoot.appendChild(note);
    }
    renderFractionalCascadingInsight(insight) {
        if (!insight) {
            this.fractionalCascadingRoot.classList.add("hidden");
            this.fractionalCascadingRoot.innerHTML = "";
            return;
        }
        this.fractionalCascadingRoot.classList.remove("hidden");
        this.fractionalCascadingRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("fractional-cascading-insight-header");
        const title = document.createElement("div");
        title.classList.add("fractional-cascading-insight-title");
        title.textContent = "Cascade Links";
        const phase = document.createElement("div");
        phase.classList.add("fractional-cascading-phase", `fractional-cascading-phase-${insight.phase}`);
        phase.textContent = formatFractionalPhase(insight.phase);
        header.appendChild(title);
        header.appendChild(phase);
        const cascadeMap = document.createElement("div");
        cascadeMap.classList.add("fractional-cascading-map");
        insight.catalogs.forEach((catalog, catalogIndex) => {
            const row = document.createElement("div");
            row.classList.add("fractional-cascading-row");
            if (catalogIndex === insight.catalogIndex) {
                row.classList.add("active");
            }
            const label = document.createElement("div");
            label.classList.add("fractional-cascading-row-label");
            label.textContent = `C${catalogIndex + 1}`;
            row.appendChild(label);
            const cells = document.createElement("div");
            cells.classList.add("fractional-cascading-cells");
            cells.style.setProperty("--fractional-count", String(Math.min(Math.max(catalog.length, 1), 12)));
            catalog.forEach((value, valueIndex) => {
                const cell = document.createElement("div");
                cell.classList.add("fractional-cascading-cell");
                cell.textContent = String(value);
                if (catalogIndex === insight.catalogIndex && valueIndex === insight.anchorIndex) {
                    cell.classList.add("is-anchor");
                }
                if (catalogIndex === insight.catalogIndex && valueIndex === insight.probeIndex) {
                    cell.classList.add("is-probe");
                }
                if (catalogIndex === insight.catalogIndex && valueIndex === insight.resultIndex) {
                    cell.classList.add("is-result");
                }
                cells.appendChild(cell);
            });
            row.appendChild(cells);
            const rowState = document.createElement("div");
            rowState.classList.add("fractional-cascading-row-state");
            rowState.textContent = formatFractionalRowState(insight, catalogIndex);
            row.appendChild(rowState);
            cascadeMap.appendChild(row);
        });
        const metrics = document.createElement("div");
        metrics.classList.add("fractional-cascading-metrics");
        metrics.appendChild(createFractionalMetric("Catalog", `${insight.catalogIndex + 1} / ${insight.catalogCount}`, "current list"));
        metrics.appendChild(createFractionalMetric("Bridge", formatSearchIndex(insight.anchorIndex), insight.phase === "first-search" ? "binary start" : "reused position"));
        metrics.appendChild(createFractionalMetric("Probe", formatSearchIndex(insight.probeIndex), "local check"));
        metrics.appendChild(createFractionalMetric("Result", insight.resultIndex === undefined ? "pending" : formatSearchIndex(insight.resultIndex), "lower bound"));
        const comparison = document.createElement("div");
        comparison.classList.add("fractional-cascading-comparison", `fractional-cascading-comparison-${insight.phase}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison ?? formatFractionalPhase(insight.phase)));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("fractional-cascading-note");
        note.textContent = insight.note;
        this.fractionalCascadingRoot.appendChild(header);
        this.fractionalCascadingRoot.appendChild(cascadeMap);
        this.fractionalCascadingRoot.appendChild(metrics);
        this.fractionalCascadingRoot.appendChild(comparison);
        this.fractionalCascadingRoot.appendChild(note);
    }
    renderHashTableInsight(insight) {
        if (!insight) {
            this.hashTableRoot.classList.add("hidden");
            this.hashTableRoot.innerHTML = "";
            return;
        }
        this.hashTableRoot.classList.remove("hidden");
        this.hashTableRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("hash-table-insight-header");
        const title = document.createElement("div");
        title.classList.add("hash-table-insight-title");
        title.textContent = "Hash Debugger";
        const phase = document.createElement("div");
        phase.classList.add("hash-table-phase", `hash-table-phase-${insight.phase}`);
        phase.textContent = formatHashTablePhase(insight.phase);
        header.appendChild(title);
        header.appendChild(phase);
        const debuggerPanel = document.createElement("div");
        debuggerPanel.classList.add("hash-table-debugger");
        const stepCard = document.createElement("div");
        stepCard.classList.add("hash-table-step-card");
        const stepLabel = document.createElement("span");
        stepLabel.classList.add("hash-table-step-label");
        stepLabel.textContent = "Current step";
        const stepTitle = document.createElement("strong");
        stepTitle.textContent = insight.stepTitle;
        const stepDetail = document.createElement("p");
        stepDetail.textContent = insight.stepDetail;
        stepCard.appendChild(stepLabel);
        stepCard.appendChild(stepTitle);
        stepCard.appendChild(stepDetail);
        const flow = document.createElement("div");
        flow.classList.add("hash-table-flow");
        flow.appendChild(createHashFormulaCell("Key", String(insight.value)));
        flow.appendChild(createHashFormulaArrow("passes through"));
        flow.appendChild(createHashFormulaCell("Hash function", `hash(key) = key % ${insight.buckets.length}`));
        flow.appendChild(createHashFormulaArrow("computes"));
        flow.appendChild(createHashFormulaCell("Bucket", `${insight.value} % ${insight.buckets.length} = ${insight.hashIndex}`));
        debuggerPanel.appendChild(stepCard);
        debuggerPanel.appendChild(flow);
        const path = document.createElement("div");
        path.classList.add("hash-table-path");
        path.appendChild(createHashPathNode("Start", `Bucket ${insight.hashIndex}`, insight.hashIndex === insight.probeIndex));
        path.appendChild(createHashPathLine(insight.probeLength <= 1 ? "direct" : `${insight.probeLength} probes`));
        path.appendChild(createHashPathNode("Inspect", `Bucket ${insight.probeIndex}`, true));
        path.appendChild(createHashPathLine(formatHashPathResult(insight.phase)));
        path.appendChild(createHashPathNode("Decision", formatHashTablePhase(insight.phase), insight.phase === "found" || insight.phase === "miss"));
        const buckets = document.createElement("div");
        buckets.classList.add("hash-table-buckets");
        buckets.style.setProperty("--hash-bucket-count", String(Math.min(Math.max(insight.buckets.length, 1), 17)));
        insight.buckets.forEach(bucket => {
            const bucketElement = document.createElement("div");
            bucketElement.classList.add("hash-table-bucket", `hash-table-bucket-${bucket.state}`);
            if (bucket.index === insight.hashIndex && bucket.index !== insight.probeIndex) {
                bucketElement.classList.add("hash-table-bucket-hash-start");
            }
            const index = document.createElement("span");
            index.textContent = String(bucket.index);
            const key = document.createElement("strong");
            key.textContent = bucket.key === undefined ? "empty" : String(bucket.key);
            const source = document.createElement("em");
            source.textContent = bucket.value === undefined ? "slot" : `array ${bucket.value}`;
            bucketElement.appendChild(index);
            bucketElement.appendChild(key);
            bucketElement.appendChild(source);
            buckets.appendChild(bucketElement);
        });
        const probe = document.createElement("div");
        probe.classList.add("hash-table-probe");
        const probeHeader = document.createElement("div");
        probeHeader.classList.add("hash-table-probe-header");
        probeHeader.appendChild(createInlineLabel(`Probe #${Math.max(insight.probeLength, 1)}`));
        probeHeader.appendChild(createInlineStrong(`Bucket ${insight.probeIndex}`));
        const probeGrid = document.createElement("div");
        probeGrid.classList.add("hash-table-probe-grid");
        probeGrid.appendChild(createHashTableMetric("Current bucket", String(insight.probeIndex), "linear probing position"));
        probeGrid.appendChild(createHashTableMetric("Bucket contains", formatHashBucketContents(insight), insight.bucketDetail));
        probeGrid.appendChild(createHashTableMetric("Comparison", insight.comparison ?? formatHashTablePhase(insight.phase), formatHashComparisonDetail(insight)));
        probe.appendChild(probeHeader);
        probe.appendChild(probeGrid);
        const stats = document.createElement("div");
        stats.classList.add("hash-table-stats");
        stats.appendChild(createHashTableMetric("Capacity", String(insight.buckets.length), "bucket slots"));
        stats.appendChild(createHashTableMetric("Items", String(insight.items), "stored keys"));
        stats.appendChild(createHashTableMetric("Load factor", `${Math.round(insight.loadFactor * 100)}%`, "items / capacity"));
        stats.appendChild(createHashTableMetric("Build collisions", String(insight.collisions), "while filling table"));
        stats.appendChild(createHashTableMetric("Probe length", String(insight.probeLength), formatProbeCount(insight.probeLength)));
        const comparison = document.createElement("div");
        comparison.classList.add("hash-table-comparison", `hash-table-comparison-${insight.phase}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison ?? formatHashTablePhase(insight.phase)));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("hash-table-note");
        note.textContent = insight.note;
        this.hashTableRoot.appendChild(header);
        this.hashTableRoot.appendChild(debuggerPanel);
        this.hashTableRoot.appendChild(path);
        this.hashTableRoot.appendChild(buckets);
        this.hashTableRoot.appendChild(probe);
        this.hashTableRoot.appendChild(stats);
        this.hashTableRoot.appendChild(comparison);
        this.hashTableRoot.appendChild(note);
    }
    renderParametricInsight(insight) {
        if (!insight) {
            this.parametricRoot.classList.add("hidden");
            this.parametricRoot.innerHTML = "";
            return;
        }
        this.parametricRoot.classList.remove("hidden");
        this.parametricRoot.innerHTML = "";
        const header = document.createElement("div");
        header.classList.add("parametric-insight-header");
        const title = document.createElement("div");
        title.classList.add("parametric-insight-title");
        title.textContent = "Answer Space Debugger";
        const phase = document.createElement("div");
        phase.classList.add("parametric-phase", `parametric-phase-${insight.phase}`);
        phase.textContent = formatParametricPhase(insight.phase);
        header.appendChild(title);
        header.appendChild(phase);
        const range = document.createElement("div");
        range.classList.add("parametric-range");
        const span = Math.max(insight.high - insight.low, 1);
        const candidatePosition = Math.max(0, Math.min(100, ((insight.candidate - insight.low) / span) * 100));
        range.style.setProperty("--parametric-candidate", `${candidatePosition}%`);
        const rangeHeader = document.createElement("div");
        rangeHeader.classList.add("parametric-range-header");
        rangeHeader.appendChild(createInlineLabel("Candidate answer"));
        rangeHeader.appendChild(createInlineStrong(String(insight.candidate)));
        const track = document.createElement("div");
        track.classList.add("parametric-track");
        const marker = document.createElement("div");
        marker.classList.add("parametric-track-marker");
        marker.textContent = String(insight.candidate);
        track.appendChild(marker);
        const endpoints = document.createElement("div");
        endpoints.classList.add("parametric-range-endpoints");
        endpoints.appendChild(createInlineStrong(String(insight.low)));
        endpoints.appendChild(createInlineStrong(String(insight.high)));
        range.appendChild(rangeHeader);
        range.appendChild(track);
        range.appendChild(endpoints);
        const loads = document.createElement("div");
        loads.classList.add("parametric-loads");
        insight.loads.forEach(load => {
            const day = document.createElement("div");
            day.classList.add("parametric-day");
            if (load.day > insight.daysLimit) {
                day.classList.add("over-limit");
            }
            const dayHeader = document.createElement("div");
            dayHeader.classList.add("parametric-day-header");
            dayHeader.appendChild(createInlineLabel(`Day ${load.day}`));
            dayHeader.appendChild(createInlineStrong(`${load.load} / ${insight.candidate}`));
            const packages = document.createElement("div");
            packages.classList.add("parametric-packages");
            load.packages.forEach(weight => {
                const item = document.createElement("span");
                item.textContent = String(weight);
                packages.appendChild(item);
            });
            day.appendChild(dayHeader);
            day.appendChild(packages);
            loads.appendChild(day);
        });
        const metrics = document.createElement("div");
        metrics.classList.add("parametric-metrics");
        metrics.appendChild(createParametricMetric("Allowed days", String(insight.daysLimit), "constraint"));
        metrics.appendChild(createParametricMetric("Used days", String(insight.usedDays), insight.usedDays <= insight.daysLimit ? "fits" : "too many"));
        metrics.appendChild(createParametricMetric("Best so far", insight.best === undefined ? "pending" : String(insight.best), "smallest feasible"));
        metrics.appendChild(createParametricMetric("Search range", `${insight.low} to ${insight.high}`, "possible answers"));
        const comparison = document.createElement("div");
        comparison.classList.add("parametric-comparison", `parametric-comparison-${insight.phase}`);
        comparison.appendChild(createInlineLabel("Decision"));
        comparison.appendChild(createInlineStrong(insight.comparison));
        comparison.appendChild(createInlineEm(insight.decisionText));
        const note = document.createElement("p");
        note.classList.add("parametric-note");
        note.textContent = insight.note;
        this.parametricRoot.appendChild(header);
        this.parametricRoot.appendChild(range);
        this.parametricRoot.appendChild(loads);
        this.parametricRoot.appendChild(metrics);
        this.parametricRoot.appendChild(comparison);
        this.parametricRoot.appendChild(note);
    }
    renderWorkspace(workspace) {
        if (!workspace || workspace.rows.length === 0) {
            this.container.classList.remove("has-workspace");
            this.workspaceRoot.classList.add("hidden");
            this.workspaceRows.innerHTML = "";
            return;
        }
        this.container.classList.add("has-workspace");
        this.workspaceRoot.classList.remove("hidden");
        this.workspaceTitle.textContent = workspace.title ?? "Search Workspace";
        this.workspaceDetail.textContent = workspace.detail ?? "";
        this.workspaceRows.innerHTML = "";
        workspace.rows.forEach(row => {
            const rowElement = document.createElement("div");
            rowElement.classList.add("visualizer-workspace-row");
            const labelElement = document.createElement("div");
            labelElement.classList.add("visualizer-workspace-label");
            labelElement.textContent = row.label;
            const valuesElement = document.createElement("div");
            valuesElement.classList.add("visualizer-workspace-values");
            row.values.forEach((value, index) => {
                const valueElement = document.createElement("span");
                valueElement.classList.add("visualizer-workspace-cell");
                valueElement.textContent = value === null ? "-" : String(value);
                if (row.activeIndices?.includes(index)) {
                    valueElement.classList.add("active");
                }
                valuesElement.appendChild(valueElement);
            });
            rowElement.appendChild(labelElement);
            rowElement.appendChild(valuesElement);
            this.workspaceRows.appendChild(rowElement);
        });
    }
    setStepCount(count) {
        this.stepCounter.textContent = `Probes ${count}`;
    }
    resetStepCount() {
        this.setStepCount(0);
    }
    setResult(text) {
        this.resultCounter.textContent = text;
    }
    getResultText(step) {
        if (step.parametric?.phase === "done") {
            return `Answer ${step.parametric.best ?? step.parametric.candidate}`;
        }
        if (step.type === "found") {
            return `Found at index ${step.resultIndex}`;
        }
        if (step.type === "miss" || step.type === "done") {
            return step.resultIndex === -1 ? "Not found" : "Complete";
        }
        return `Target ${step.target}`;
    }
}
function createMap(label, start, end, marker, percent) {
    const root = document.createElement("div");
    root.classList.add("interpolation-map");
    const labelElement = document.createElement("div");
    labelElement.classList.add("interpolation-map-label");
    labelElement.textContent = label;
    const track = document.createElement("div");
    track.classList.add("interpolation-track");
    const fill = document.createElement("div");
    fill.classList.add("interpolation-track-fill");
    fill.style.width = `${percent}%`;
    const markerElement = document.createElement("div");
    markerElement.classList.add("interpolation-track-marker");
    markerElement.style.left = `${percent}%`;
    const markerDot = document.createElement("span");
    markerDot.classList.add("interpolation-track-dot");
    markerDot.textContent = "●";
    const markerLabel = document.createElement("span");
    markerLabel.classList.add("interpolation-track-label");
    markerLabel.textContent = marker;
    markerElement.appendChild(markerDot);
    markerElement.appendChild(markerLabel);
    track.appendChild(fill);
    track.appendChild(markerElement);
    const endpoints = document.createElement("div");
    endpoints.classList.add("interpolation-map-endpoints");
    const startElement = document.createElement("span");
    startElement.textContent = start;
    const endElement = document.createElement("span");
    endElement.textContent = end;
    endpoints.appendChild(startElement);
    endpoints.appendChild(endElement);
    root.appendChild(labelElement);
    root.appendChild(track);
    root.appendChild(endpoints);
    return root;
}
function createEstimateCell(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("interpolation-estimate-cell");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createEstimateDivider() {
    const divider = document.createElement("div");
    divider.classList.add("interpolation-estimate-divider");
    divider.textContent = "=";
    return divider;
}
function createMetaMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("meta-binary-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createUniformMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("uniform-binary-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createFibonacciMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("fibonacci-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createRangeMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("range-search-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createJumpMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("jump-search-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createSentinelMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("sentinel-linear-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createBitonicMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("bitonic-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createBitonicSplitCell(label, value, active) {
    const root = document.createElement("div");
    root.classList.add("bitonic-split-cell");
    if (active) {
        root.classList.add("active");
    }
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    root.appendChild(labelElement);
    root.appendChild(valueElement);
    return root;
}
function createFractionalMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("fractional-cascading-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createHashFormulaCell(label, value) {
    const root = document.createElement("div");
    root.classList.add("hash-table-formula-cell");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    root.appendChild(labelElement);
    root.appendChild(valueElement);
    return root;
}
function createHashFormulaArrow(text) {
    const root = document.createElement("div");
    root.classList.add("hash-table-formula-arrow");
    root.textContent = text;
    return root;
}
function createHashPathNode(label, value, active) {
    const root = document.createElement("div");
    root.classList.add("hash-table-path-node");
    if (active) {
        root.classList.add("active");
    }
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    root.appendChild(labelElement);
    root.appendChild(valueElement);
    return root;
}
function createHashPathLine(text) {
    const root = document.createElement("div");
    root.classList.add("hash-table-path-line");
    const line = document.createElement("span");
    const label = document.createElement("em");
    label.textContent = text;
    root.appendChild(line);
    root.appendChild(label);
    return root;
}
function createHashTableMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("hash-table-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createParametricMetric(label, primary, secondary) {
    const root = document.createElement("div");
    root.classList.add("parametric-metric");
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;
    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;
    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);
    return root;
}
function createInlineLabel(text) {
    const element = document.createElement("span");
    element.textContent = text;
    return element;
}
function createInlineStrong(text) {
    const element = document.createElement("strong");
    element.textContent = text;
    return element;
}
function createInlineEm(text) {
    const element = document.createElement("em");
    element.textContent = text;
    return element;
}
function formatMetaIndex(index) {
    if (index < 0) {
        return "before start";
    }
    return `index ${index}`;
}
function formatSearchIndex(index) {
    if (index < 0) {
        return "before start";
    }
    return `index ${index}`;
}
function formatUniformIndex(index) {
    if (index < 0) {
        return "before start";
    }
    return `index ${index}`;
}
function formatFibonacciDirection(direction) {
    switch (direction) {
        case "left":
            return "Keep left";
        case "right":
            return "Move right";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Start";
    }
}
function formatRangePhase(phase) {
    switch (phase) {
        case "binary":
            return "Binary finish";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Expanding";
    }
}
function formatJumpPhase(phase) {
    switch (phase) {
        case "scan":
            return "Linear scan";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Jumping";
    }
}
function formatSentinelPhase(phase) {
    switch (phase) {
        case "scan":
            return "Scanning";
        case "verify":
            return "Verify";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Place sentinel";
    }
}
function formatBitonicPhase(phase) {
    switch (phase) {
        case "left":
            return "Search left";
        case "right":
            return "Search right";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Find peak";
    }
}
function formatBitonicRule(insight) {
    if (insight.phase === "peak") {
        return "follow slope";
    }
    if (insight.phase === "found") {
        return "return index";
    }
    if (insight.phase === "miss") {
        return "stop";
    }
    return insight.side === "decreasing" ? "descending" : "ascending";
}
function formatFractionalPhase(phase) {
    switch (phase) {
        case "cascade":
            return "Cascade";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        case "done":
            return "Complete";
        default:
            return "First search";
    }
}
function formatFractionalRowState(insight, catalogIndex) {
    if (catalogIndex < insight.catalogIndex) {
        return "linked";
    }
    if (catalogIndex > insight.catalogIndex) {
        return "waiting";
    }
    if (insight.phase === "first-search") {
        return "binary seed";
    }
    if (insight.phase === "found") {
        return "match";
    }
    if (insight.phase === "done") {
        return "complete";
    }
    return "bridge check";
}
function formatHashTablePhase(phase) {
    switch (phase) {
        case "collision":
            return "Collision";
        case "lookup":
            return "Lookup";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Build table";
    }
}
function formatParametricPhase(phase) {
    switch (phase) {
        case "feasible":
            return "Feasible";
        case "too-low":
            return "Too low";
        case "done":
            return "Answer found";
        default:
            return "Test capacity";
    }
}
function formatHashBucketContents(insight) {
    const bucket = insight.buckets[insight.probeIndex];
    if (!bucket || bucket.key === undefined) {
        return "Empty";
    }
    if (bucket.value === undefined) {
        return `Key ${bucket.key}`;
    }
    return `Key ${bucket.key}, index ${bucket.value}`;
}
function formatHashComparisonDetail(insight) {
    if (insight.phase === "miss") {
        return "An empty bucket ends the probe chain.";
    }
    if (insight.phase === "found") {
        return "Keys match, so lookup returns the stored index.";
    }
    if (insight.phase === "collision") {
        return "Different keys share a probe path.";
    }
    if (insight.phase === "lookup") {
        return "Different key, so continue probing.";
    }
    return "During build, the table stores each key with its array index.";
}
function formatHashPathResult(phase) {
    switch (phase) {
        case "collision":
            return "blocked";
        case "lookup":
            return "keep probing";
        case "found":
            return "match";
        case "miss":
            return "empty stop";
        default:
            return "store";
    }
}
function formatProbeCount(count) {
    return count === 1 ? "probe for this key" : "probes for this key";
}
function formatUniformDirection(direction) {
    switch (direction) {
        case "left":
            return "Move left";
        case "right":
            return "Move right";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Start";
    }
}
function formatMetaDecision(decision) {
    switch (decision) {
        case "keep":
            return "Keep bit";
        case "skip":
            return "Skip bit";
        case "outside":
            return "Outside";
        case "found":
            return "Found";
        case "miss":
            return "Not found";
        default:
            return "Testing";
    }
}
function formatPercent(percent) {
    return `${Math.round(percent)}%`;
}
function formatPercentPrecise(percent) {
    return `${percent.toFixed(1)}%`;
}
function formatFraction(numerator, denominator) {
    if (denominator === 0) {
        return "single point";
    }
    return `${numerator} / ${denominator}`;
}
