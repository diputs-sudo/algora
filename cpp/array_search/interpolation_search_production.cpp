#include <cstddef>
#include <iterator>

template <typename Iterator>
struct InterpolationSearchResult {
    bool found;
    Iterator position;
    Iterator insertion_point;
};

template <typename RandomIt, typename T>
RandomIt lower_bound_indexed(RandomIt first, RandomIt last, const T& target) {
    while (first < last) {
        RandomIt mid = first + (last - first) / 2;

        if (*mid < target) {
            first = mid + 1;
        } else {
            last = mid;
        }
    }

    return first;
}

template <typename RandomIt, typename T>
InterpolationSearchResult<RandomIt> interpolation_search_first(RandomIt first, RandomIt last, const T& target) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference length = last - first;

    if (length == 0) {
        return {false, last, first};
    }

    Difference low = 0;
    Difference high = length - 1;
    Difference candidate_left = 0;

    while (low <= high && first[low] <= target && target <= first[high]) {
        if (first[low] == first[high]) {
            bool found = first[low] == target;
            return {found, found ? first + low : last, first + low};
        }

        long double ratio = (static_cast<long double>(target) - static_cast<long double>(first[low]))
            / (static_cast<long double>(first[high]) - static_cast<long double>(first[low]));
        Difference probe = low + static_cast<Difference>(ratio * (high - low));

        if (probe < low) probe = low;
        if (probe > high) probe = high;

        if (first[probe] < target) {
            low = probe + 1;
            candidate_left = low;
        } else {
            high = probe;

            if (first[probe] == target) {
                break;
            }
        }
    }

    RandomIt search_first = first + candidate_left;
    RandomIt search_last = high >= candidate_left ? first + high + 1 : last;
    RandomIt position = lower_bound_indexed(search_first, search_last, target);
    bool found = position != last && *position == target;

    return {found, found ? position : last, position};
}
