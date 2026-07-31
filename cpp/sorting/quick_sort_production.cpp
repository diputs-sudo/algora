#include <algorithm>
#include <functional>

template <typename RandomIt, typename Compare = std::less<>>
void quick_sort_in_place(RandomIt first, RandomIt last, Compare compare = Compare{}) {
    std::sort(first, last, compare);
}
