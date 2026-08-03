#include <cmath>
#include <functional>
#include <iterator>

template <typename Iterator>
struct JumpSearchResult {
    bool found;
    Iterator position;
    Iterator insertion_point;
    typename std::iterator_traits<Iterator>::difference_type block_size;
};

template <typename RandomIt, typename T, typename Compare = std::less<>>
JumpSearchResult<RandomIt> jump_search_first(
    RandomIt first,
    RandomIt last,
    const T& target,
    Compare compare = Compare{},
    typename std::iterator_traits<RandomIt>::difference_type block_size = 0
) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference length = last - first; 

    if (length == 0) {
        return {false, last, first, 0};
    }

    Difference step = block_size > 0
        ? block_size
        : static_cast<Difference>(std::sqrt(static_cast<long double>(length)));

    if (step < 1) {
        step = 1;
    }

    Difference left = 0;
    Difference right = step < length ? step : length; 

    while (right < length && compare(first[right - 1], target)) {
        left = right;
        Difference next = right + step; 
        right = next < length ? next : length;
    }

    RandomIt range_first = first + left; 
    RandomIt range_last = first + right; 

    while (range_first < range_last) {
        RandomIt mid = range_first + (range_last - range_first) / 2;

        if (compare(*mid, target)) {
            range_first = mid + 1;
        } else {
            range_last = mid;
        }
    }

    bool found = range_first != last && !compare(*range_first, target) && !compare(target, *range_first);
    return {found, found ? range_first : last, range_first, step};
}
