#include <functional>
#include <iterator>
#include <utility>

template <typename RandomIt, typename Compare>
void heap_sift_down(RandomIt first, std::ptrdiff_t start, std::ptrdiff_t end, Compare comp)
{
    std::ptrdiff_t root = start;

    while (true) {
        std::ptrdiff_t child = root * 2 + 1;

        if (child >= end) {
            break;
        }

        std::ptrdiff_t right = child + 1;

        if (right < end && comp(*(first + child), *(first + right))) {
            child = right;
        }

        if (!comp(*(first + root), *(first + child))) {
            break;
        }

        std::iter_swap(first + root, first + child);
        root = child;
    }
}

template <typename RandomIt, typename Compare = std::less<>>
void heap_sort_in_place(RandomIt first, RandomIt last, Compare comp = Compare{})
{
    std::ptrdiff_t count = std::distance(first, last);

    if (count < 2) {
        return;
    }

    for (std::ptrdiff_t start = count / 2; start > 0; --start) {
        heap_sift_down(first, start - 1, count, comp);
    }

    for (std::ptrdiff_t end = count - 1; end > 0; --end) {
        std::iter_swap(first, first + end);
        heap_sift_down(first, 0, end, comp);
    }
}
