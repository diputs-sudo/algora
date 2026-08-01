#include <algorithm>
#include <functional>

template <typename RandomIt, typename Compare = std::less<>>
void tim_sort_in_place(RandomIt first, RandomIt last, Compare compare = Compare{}) {
    std::stable_sort(first, last, compare);
}
