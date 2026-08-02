#include <functional>
#include <iterator>

template <typename Iterator>
struct FibonacciSearchResult {
    bool found;
    Iterator position;
    Iterator insertion_point;
};

template <typename RandomIt, typename T, typename Compare = std::less<>>
RandomIt fibonacci_lower_bound(RandomIt first, RandomIt last, const T& target, Compare compare = Compare{}) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    Difference length = last - first;
    Difference fib_mm2 = 0;
    Difference fib_mm1 = 1;
    Difference fib_m = 1;

    while (fib_m < length) {
        fib_mm2 = fib_mm1;
        fib_mm1 = fib_m;
        fib_m = fib_mm2 + fib_mm1;
    }

    Difference offset = -1;

    while (fib_m > 1) {
        Difference probe = offset + fib_mm2;

        if (probe >= length) {
            probe = length - 1;
        }

        if (compare(first[probe], target)) {
            fib_m = fib_mm1;
            fib_mm1 = fib_mm2;
            fib_mm2 = fib_m - fib_mm1;
            offset = probe;
        } else {
            fib_m = fib_mm2;
            fib_mm1 = fib_mm1 - fib_mm2;
            fib_mm2 = fib_m - fib_mm1;
        }
    }

    return first + offset + 1;
}

template <typename RandomIt, typename T, typename Compare = std::less<>>
FibonacciSearchResult<RandomIt> fibonacci_search_first(RandomIt first, RandomIt last, const T& target, Compare compare = Compare{}) {
    RandomIt position = fibonacci_lower_bound(first, last, target, compare);
    bool found = position != last && !compare(*position, target) && !compare(target, *position);
    return {found, found ? position : last, position};
}
