#include <functional>
#include <iterator>

template <typename Iterator>
struct BinarySearchResult {
    bool found; 
    Iterator position; 
};

template <typename RandomIt, typename T, typename Compare = std::less<>>
RandomIt lower_bound_indexed(RandomIt first, RandomIt last, const T& target, Compare compare = Compare{}) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference left = 0; 
    Difference right = last - first; 

    while (left < right) {
        Difference mid = left + (right - left) / 2; 

        if (compare(first[mid], target)) {
            left = mid + 1; 
        } else {
            right = mid; 
        }
    }

    return first + left; 
}

template <typename RandomIt, typename T, typename Compare = std::less<>>
BinarySearchResult<RandomIt> binary_search_first(RandomIt first, RandomIt last, const T& target, Compare compare = Compare{}) {
    RandomIt position = lower_bound_indexed(first, last, target, compare);
    bool found = position != last && !compare(target, *position) && !compare(*position, target);
    return {found, position};
}
