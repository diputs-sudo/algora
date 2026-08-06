#include <cstddef>
#include <functional>
#include <iterator>

template <typename Iterator>
struct TernarySearchResult {
    bool found;
    Iterator position;
    std::size_t comparisons;
};

template <typename RandomIt, typename T, typename Compare = std::less<>>
TernarySearchResult<RandomIt> ternary_search(
    RandomIt first,
    RandomIt last,
    const T& target,
    Compare compare = Compare{}
) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;

    Difference left = 0;
    Difference right = last - first - 1;
    std::size_t comparisons = 0;

    while (left <= right) {
        Difference third = (right - left) / 3;
        Difference mid1 = left + third;
        Difference mid2 = right - third;

        RandomIt probe1 = first + mid1;
        RandomIt probe2 = first + mid2;

        comparisons += 1;
        if (!compare(*probe1, target) && !compare(target, *probe1)) {
            return {true, probe1, comparisons};
        }

        if (mid2 != mid1) {
            comparisons += 1;
            if (!compare(*probe2, target) && !compare(target, *probe2)) {
                return {true, probe2, comparisons};
            }
        }

        comparisons += 1;
        if (compare(target, *probe1)) {
            right = mid1 - 1;
            continue;
        }

        comparisons += 1;
        if (compare(*probe2, target)) {
            left = mid2 + 1;
        } else {
            left = mid1 + 1;
            right = mid2 - 1;
        }
    }

    return {false, last, comparisons};
}
