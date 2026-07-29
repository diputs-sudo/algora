#include <functional>
#include <iterator>
#include <utility>

template <typename BidirectionalIt, typename Compare = std::less<>>
void bubble_sort_in_place(BidirectionalIt first, BidirectionalIt last, Compare comp = Compare{})
{
    if (first == last) {
        return;
    }

    BidirectionalIt unsorted_end = last;

    while (first != unsorted_end) {
        BidirectionalIt current = first;
        BidirectionalIt next = current;
        ++next;

        if (next == unsorted_end) {
            break;
        }

        BidirectionalIt last_swap = first;
        bool swapped = false;

        for (; next != unsorted_end; ++current, ++next) {
            if (comp(*next, *current)) {
                std::iter_swap(current, next);
                last_swap = next;
                swapped = true;
            }
        }

        if (!swapped) {
            break;
        }

        unsorted_end = last_swap;
    }
}
