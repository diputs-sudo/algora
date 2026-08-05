#include <cstddef>
#include <iterator>
#include <utility>

template <typename Iterator>
struct SentinelSearchResult {
    bool found;
    Iterator position;
    std::size_t inspected;
};

template <typename RandomIt, typename T>
SentinelSearchResult<RandomIt> sentinel_find_first(RandomIt first, RandomIt last, const T& target) {
    if (first == last) {
        return {false, last, 0};
    }

    RandomIt sentinel = last - 1;
    using Value = typename std::iterator_traits<RandomIt>::value_type;

    struct RestoreGuard {
        RandomIt position;
        Value saved;

        ~RestoreGuard() {
            *position = std::move(saved);
        }
    };

    RestoreGuard guard{sentinel, *sentinel};
    *sentinel = target;

    RandomIt current = first;
    std::size_t inspected = 1;

    while (!(*current == target)) {
        ++current;
        ++inspected;
    }

    const bool found = current != sentinel || guard.saved == target;
    return {found, found ? current : last, inspected};
}
