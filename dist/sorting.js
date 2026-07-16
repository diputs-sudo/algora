"use strict";
const sortSelect = document.getElementById("sortSelect");
const grid = document.getElementById("algorithmGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = Array.from(document.querySelectorAll(".sorting-filter-chip"));
let activeFilter = "all";
function getCards() {
    return Array.from(grid.querySelectorAll(".card"));
}
function sortCards(criteria) {
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
    const query = searchInput.value.toLowerCase().trim();
    const cards = getCards();
    cards.forEach(card => {
        const name = card.dataset.name?.toLowerCase() || "";
        const text = card.textContent?.toLowerCase() || "";
        const filters = card.dataset.filters?.toLowerCase().split(" ") || [];
        const matchesQuery = name.includes(query) || text.includes(query);
        const matchesFilter = activeFilter === "all" || filters.includes(activeFilter);
        card.style.display = matchesQuery && matchesFilter ? "" : "none";
    });
}
function refreshCards() {
    sortCards(sortSelect.value);
    filterCards();
}
sortSelect.addEventListener("change", refreshCards);
searchInput.addEventListener("input", filterCards);
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        filterButtons.forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });
        filterCards();
    });
});
refreshCards();
