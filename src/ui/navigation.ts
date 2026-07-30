import { initAlgorithmBadges } from "./algorithmBadges.js";

export function initLearnMore() {
    initAlgorithmBadges();

    const learnMoreBtn = document.getElementById("learnMoreBtn");
    const detailsSection = document.getElementById("detailsSection");

    if (!learnMoreBtn || !detailsSection) return;

    learnMoreBtn.addEventListener("click", () => {
        detailsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}
