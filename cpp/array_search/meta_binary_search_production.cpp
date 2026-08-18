#include <functional>
#include <iterator>

template <typename Iterator>
struct MetaBinarySearchResult {
    bool found;
    Iterator position; 
    Iterator insertion_point;
};

template <typename Difference>
Difference highest_power_of_two_below(Difference length) {
    Difference bit = 1;

    while (bit <= length / 2) {
        bit *= 2;
    }

    return bit;
}

template <typename RandomIt, typename T, typename Compare = std::less<>>
RandomIt meta_binary_lower_bound(RandomIt first, RandomIt last, const T& target, Compare compare = Compare{}) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference length = last - first;

    if (length <= 0) {
        return first;
    }

    Difference position = -1;
    Difference bit = highest_power_of_two_below(length);

    while (bit > 0) {
        Difference next = position + bit;

        if (next < length && compare(first[next], target)) {
            position = next;
        }

        bit /= 2;
    }

    return first + position + 1;
}

template <typename RandomIt, typename T, typename Compare = std::less<>>
MetaBinarySearchResult<RandomIt> meta_binary_search_first(RandomIt first, RandomIt last, const T& target, Compare compare = Compare{}) {
    RandomIt position = meta_binary_lower_bound(first, last, target, compare);
    bool found = position != last && !compare(*position, target) && !compare(target, *position);
    return {found, found ? position : last, position};
}
