#include <algorithm>
#include <functional>

template <typename BidirectionalIt, typename Compare = std::less<>>
void merge_sort_inplace_in_place(BidirectionalIt first, BidirectionalIt last, Compare compare = Compare{}) {
    const auto length = std::distance(first, last);

    if (length < 2) {
        return;
    }

    BidirectionalIt mid = first;
    std::advance(mid, length / 2);
    merge_sort_inplace_in_place(first, mid, compare);
    merge_sort_inplace_in_place(mid, last, compare);
    std::inplace_merge(first, mid, last, compare);
}
