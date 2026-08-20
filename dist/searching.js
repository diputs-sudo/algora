const sortSelect = document.getElementById("sortSelect");
const grid = document.getElementById("algorithmGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = Array.from(document.querySelectorAll(".sorting-filter-chip"));
const viewButtons = Array.from(document.querySelectorAll(".searching-view-btn"));
const viewTitle = document.getElementById("searchingViewTitle");
const viewSummary = document.getElementById("searchingViewSummary");
let activeFilter = "all";
let activeView = "core";
const viewCopy = {
    core: {
        title: "Searching",
        summary: "Classic algorithms for finding a target in a single array."
    },
    specialized: {
        title: "Specialized Search",
        summary: "Search-related algorithms that require a different visualization or solve a different kind of search problem."
    }
};
function getCards() {
    if (!grid)
        return [];
    return Array.from(grid.querySelectorAll(".card"));
}
function sortCards(criteria) {
    if (!grid)
        return;
    const cards = getCards();
    const sorted = cards.sort((a, b) => {
        if (criteria === "name") {
            const nameA = a.dataset.name?.toLowerCase() || "";
            const nameB = b.dataset.name?.toLowerCase() || "";
            return nameA.localeCompare(nameB);
        }
        if (criteria === "speed") {
            return Number(a.dataset.speed) - Number(b.dataset.speed);
        }
        if (criteria === "memory") {
            return Number(a.dataset.memory) - Number(b.dataset.memory);
        }
        if (criteria === "difficulty") {
            return Number(a.dataset.difficulty) - Number(b.dataset.difficulty);
        }
        return 0;
    });
    sorted.forEach(card => grid.appendChild(card));
}
function filterCards() {
    const query = searchInput?.value.toLowerCase().trim() || "";
    const cards = getCards();
    cards.forEach(card => {
        const name = card.dataset.name?.toLowerCase() || "";
        const text = card.textContent?.toLowerCase() || "";
        const filters = card.dataset.filters?.toLowerCase().split(" ") || [];
        const view = card.dataset.searchView || "core";
        const matchesQuery = name.includes(query) || text.includes(query);
        const matchesFilter = activeFilter === "all" || filters.includes(activeFilter);
        const matchesView = view === activeView;
        card.style.display = matchesView && matchesQuery && matchesFilter ? "" : "none";
    });
}
function refreshCards() {
    if (!sortSelect)
        return;
    const copy = viewCopy[activeView];
    if (viewTitle) {
        viewTitle.textContent = copy.title;
    }
    if (viewSummary) {
        viewSummary.textContent = copy.summary;
    }
    sortCards(sortSelect.value);
    filterCards();
}
sortSelect?.addEventListener("change", refreshCards);
searchInput?.addEventListener("input", filterCards);
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        filterButtons.forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });
        filterCards();
    });
});
viewButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeView = button.dataset.searchView || "core";
        viewButtons.forEach(btn => {
            const isActive = btn === button;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-selected", String(isActive));
        });
        refreshCards();
    });
});
refreshCards();
export {};
