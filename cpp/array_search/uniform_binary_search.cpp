#include <cstddef>
#include <vector>

int uniform_binary_search(const std::vector<int>& array, int target) {
    const std::ptrdiff_t length = static_cast<std::ptrdiff_t>(array.size());
    if (length == 0) return -1;

    std::ptrdiff_t largest = 1;
    while (largest <= length / 2) largest *= 2;

    std::ptrdiff_t base = -1;
    for (std::ptrdiff_t step = largest; step >= 1; step /= 2) {
        const std::ptrdiff_t probe = base + step;
        if (probe >= length) continue;

        if (array[probe] == target) return static_cast<int>(probe);
        if (array[probe] < target) base = probe;

        if (step == 1) break;
    }

    return -1;
}
