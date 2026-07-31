#include <algorithm>
#include <cmath>
#include <functional>
#include <iterator>
#include <utility>

template <typename RandomIt, typename Compare>
void intro_insertion(RandomIt first, RandomIt last, Compare compare) {
    for (RandomIt it = first + 1; it < last; ++it) {
        auto current = std::move(*it);
        RandomIt position = it;

        while (position > first && compare(current, *(position - 1))) {
            *position = std::move(*(position - 1));
            --position;
        }

        *position = std::move(current);
    }
}

template <typename RandomIt, typename Compare>
RandomIt intro_median(RandomIt first, RandomIt mid, RandomIt last, Compare compare) {
    RandomIt right = last - 1;

    if (compare(*mid, *first)) {
        std::iter_swap(first, mid);
    }

    if (compare(*right, *first)) {
        std::iter_swap(first, right);
    }

    if (compare(*right, *mid)) {
        std::iter_swap(mid, right);
    }

    return mid;
}

template <typename RandomIt, typename Compare>
void intro_sort_range(RandomIt first, RandomIt last, int depth_limit, Compare compare) {
    while (last - first > 24) {
        if (depth_limit == 0) {
            std::make_heap(first, last, compare);
            std::sort_heap(first, last, compare);
            return;
        }

        --depth_limit;
        RandomIt pivot_it = intro_median(first, first + (last - first) / 2, last, compare);
        auto pivot = *pivot_it;
        RandomIt left = first;
        RandomIt index = first;
        RandomIt right = last;

        while (index < right) {
            if (compare(*index, pivot)) {
                std::iter_swap(left, index);
                ++left;
                ++index;
            } else if (compare(pivot, *index)) {
                --right;
                std::iter_swap(index, right);
            } else {
                ++index;
            }
        }

        if (left - first < last - right) {
            intro_sort_range(first, left, depth_limit, compare);
            first = right;
        } else {
            intro_sort_range(right, last, depth_limit, compare);
            last = left;
        }
    }
}

template <typename RandomIt, typename Compare = std::less<>>
void intro_sort_in_place(RandomIt first, RandomIt last, Compare compare = Compare{}) {
    const auto length = last - first;

    if (length < 2) {
        return;
    }

    int depth_limit = 2 * static_cast<int>(std::log2(static_cast<double>(length)));
    intro_sort_range(first, last, depth_limit, compare);
    intro_insertion(first, last, compare);
}
