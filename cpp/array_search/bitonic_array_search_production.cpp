#include <functional>
#include <iterator>

template <typename Iterator>
struct BitonicSearchResult {
    bool found;
    Iterator position;
    Iterator peak;
};

template <typename RandomIt, typename Compare>
RandomIt bitonic_peak(RandomIt first, RandomIt last, Compare compare) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference left = 0;
    Difference right = last - first - 1;

    while (left < right) {
        Difference mid = left + (right - left) / 2;

        if (compare(first[mid], first[mid + 1])) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return first + left;
}

template <typename RandomIt, typename T, typename Compare>
RandomIt directional_binary_search(RandomIt first, RandomIt last, const T& target, Compare compare, bool ascending) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference left = 0;
    Difference right = last - first;

    while (left < right) {
        Difference mid = left + (right - left) / 2;
        RandomIt position = first + mid;

        if (!compare(*position, target) && !compare(target, *position)) {
            return position;
        }

        if (compare(*position, target) == ascending) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return last;
}

template <typename RandomIt, typename T, typename Compare = std::less<>>
BitonicSearchResult<RandomIt> bitonic_search(RandomIt first, RandomIt last, const T& target, Compare compare = Compare{}) {
    if (first == last) {
        return {false, last, last};
    }

    RandomIt peak = bitonic_peak(first, last, compare);

    if (!compare(*peak, target) && !compare(target, *peak)) {
        return {true, peak, peak};
    }

    if (compare(*peak, target)) {
        return {false, last, peak};
    }

    if (compare(target, *first) && compare(target, *(last - 1))) {
        return {false, last, peak};
    }

    RandomIt position = directional_binary_search(first, peak, target, compare, true);

    if (position != peak) {
        return {true, position, peak};
    }

    position = directional_binary_search(peak + 1, last, target, compare, false);
    return {position != last, position, peak};
}
