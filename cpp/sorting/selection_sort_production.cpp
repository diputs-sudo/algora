#include <functional>
#include <iterator>
#include <utility>

template <typename BidirectionalIt, typename Compare = std::less<>>
void selection_sort_in_place(BidirectionalIt first, BidirectionalIt last, Compare compare = Compare{}) {
    if (first == last) {
        return;
    }

    BidirectionalIt left = first;
    BidirectionalIt right = last;
    --right;

    while (left != right) {
        BidirectionalIt min_it = left;
        BidirectionalIt max_it = left;

        for (BidirectionalIt it = left; ; ++it) {
            if (compare(*it, *min_it)) {
                min_it = it;
            }

            if (compare(*max_it, *it)) {
                max_it = it;
            }

            if (it == right) {
                break;
            }
        }

        std::iter_swap(left, min_it);

        if (max_it == left) {
            max_it = min_it;
        }

        std::iter_swap(right, max_it);

        if (left == right || ++left == right) {
            break;
        }

        --right;
    }
}
