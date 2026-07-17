export function initLearnMore() {
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