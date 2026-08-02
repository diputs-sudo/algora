#include <functional>
#include <iterator>

template <typename Iterator>
struct GallopingSearchResult {
    bool found;
    Iterator position;
    Iterator insertion_point;
    Iterator upper_bound;
};

template <typename RandomIt, typename T, typename Compare = std::less<>>
GallopingSearchResult<RandomIt> galloping_search_first(
    RandomIt first,
    RandomIt last,
    const T& target,
    Compare compare = Compare{}
) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference length = last - first;

    if (length == 0) {
        return {false, last, first, first};
    }

    if (!compare(*first, target)) {
        bool found = !compare(target, *first);
        return {found, found ? first : last, first, first + 1};
    }

    Difference jump = 1;

    while (jump < length && compare(first[jump], target)) {
        if (jump > length / 2) {
            jump = length;
            break;
        }

        jump *= 2;
    }

    RandomIt range_first = first + jump / 2 + 1;
    RandomIt range_last = first + (jump + 1 < length ? jump + 1 : length);

    while (range_first < range_last) {
        Difference half = (range_last - range_first) / 2;
        RandomIt mid = range_first + half;

        if (compare(*mid, target)) {
            range_first = mid + 1;
        } else {
            range_last = mid;
        }
    }

    bool found = range_first != last && !compare(*range_first, target) && !compare(target, *range_first);
    return {found, found ? range_first : last, range_first, first + (jump + 1 < length ? jump + 1 : length)};
}
