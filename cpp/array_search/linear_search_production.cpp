#include <iterator>

template <typename Iterator>
struct LinearSearchResult {
    bool found;
    Iterator position;
    typename std::iterator_traits<Iterator>::difference_type inspected;
};

template <typename InputIt, typename T>
LinearSearchResult<InputIt> find_first(InputIt first, InputIt last, const T& target) {
    using Difference = typename std::iterator_traits<InputIt>::difference_type;
    Difference inspected = 0;

    for (InputIt current = first; current != last; ++current) {
        inspected += 1;

        if (*current == target) {
            return {true, current, inspected};
        }
    }

    return {false, last, inspected};
}

template <typename InputIt, typename Predicate>
LinearSearchResult<InputIt> find_first_where(InputIt first, InputIt last, Predicate predicate) {
    using Difference = typename std::iterator_traits<InputIt>::difference_type;
    Difference inspected = 0;

    for (InputIt current = first; current != last; ++current) {
        inspected += 1;

        if (predicate(*current)) {
            return {true, current, inspected};
        }
    }

    return {false, last, inspected};
}
