type AlgorithmBadge = {
    label: string; 
    title: string; 
    description: string;
};

const teachingOnlySortingAlgorithms = new Set([
    "Bubble Sort",
    "Selection Sort",
    "Insertion Sort"
]);

const teachingOnlyBadge: AlgorithmBadge = {
    label: "!",
    title: "Teaching-focused algorithm",
    description: "This algorithm is useful for learning and visualization, but it is not recommand for production sorting work. Prefer built-in sorting or the production-style implementation when performance matters."
};

export function initAlgorithmBadges() {
    const algorithmName = getAlgorithmName();

    if (!algorithmName || !teachingOnlySortingAlgorithms.has(algorithmName)) {
        return;
    }

    injectBadge(teachingOnlyBadge);
}

function getAlgorithmName(): string | null {
    const heading = document.querySelector(".algorithm-hero-copy h1");
    return heading?.textContent?.trim() || document.title.trim() || null;
}

function injectBadge(badge: AlgorithmBadge) {
    const tags = document.querySelector(".algorithm-hero-panel .tags");

    if (!tags || tags.querySelector(".algorithm-warning-badge")) {
        return;
    }

    const wrapper = document.createElement("span");
    wrapper.classList.add("algorithm-warning-badge");
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "note");
    wrapper.setAttribute("aria-label", `${badge.title}: ${badge.description}`);

    const icon = document.createElement("span");
    icon.classList.add("algorithm-warning-icon");
    icon.textContent = badge.label;

    const tooltip = document.createElement("span");
    tooltip.classList.add("algorithm-warning-tooltip");
    tooltip.textContent = badge.description;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);
    tags.prepend(wrapper);
}
