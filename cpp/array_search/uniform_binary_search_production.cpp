#include <cstddef>
#include <functional>
#include <iterator>
#include <vector>

template <typename Iterator>
struct UniformBinarySearchResult {
    bool found;
    Iterator position;
    std::size_t comparisons;
};

inline std::vector<std::ptrdiff_t> build_uniform_step_table(std::ptrdiff_t length) {
    std::vector<std::ptrdiff_t> steps;
    if (length <= 0) return steps;

    std::ptrdiff_t largest = 1;
    while (largest <= length / 2) largest *= 2;

    for (std::ptrdiff_t step = largest; step >= 1; step /= 2) {
        steps.push_back(step);
        if (step == 1) break;
    }
    return steps;
}

template <typename RandomIt, typename T, typename Compare = std::less<>>
UniformBinarySearchResult<RandomIt> uniform_binary_search(
    RandomIt first,
    RandomIt last,
    const T& target,
    Compare compare = Compare{}
) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    const Difference length = last - first;
    const std::vector<Difference> steps = build_uniform_step_table(length);
    Difference base = -1;
    std::size_t comparisons = 0;

    for (Difference step : steps) {
        const Difference probe = base + step;
        if (probe >= length) continue;

        RandomIt position = first + probe;
        comparisons += 1;

        if (!compare(*position, target) && !compare(target, *position)) {
            return {true, position, comparisons};
        }
        if (compare(*position, target)) base = probe;
    }

    return {false, last, comparisons};
}
