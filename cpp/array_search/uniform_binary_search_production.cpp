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

    for (std::ptrdiff_t step = (length + 1) / 2; step >= 1; step /= 2) {
        steps.push_back(step);
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
    Difference left = 0;
    Difference right = length - 1;
    std::size_t comparisons = 0;

    for (Difference step : steps) {
        (void)step;

        if (left > right) {
            break;
        }

        Difference mid = left + (right - left) / 2;
        RandomIt probe = first + mid;
        comparisons += 1;

        if (!compare(*probe, target) && !compare(target, *probe)) {
            return {true, probe, comparisons};
        }

        if (compare(*probe, target)) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return {false, last, comparisons};
}
