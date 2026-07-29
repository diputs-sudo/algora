#include <algorithm>
#include <cstddef>
#include <functional>
#include <iterator>
#include <stdexcept>

template <typename Distance>
bool bitonic_is_power_of_two(Distance count)
{
    return count > 0 && (count & (count - 1)) == 0;
}

template <typename RandomIt, typename Compare>
void bitonic_compare_and_swap(RandomIt first, std::ptrdiff_t left, std::ptrdiff_t right, bool ascending, Compare comp)
{
    RandomIt left_it = first + left;
    RandomIt right_it = first + right;
    bool should_swap = ascending ? comp(*right_it, *left_it) : comp(*left_it, *right_it);

    if (should_swap) {
        std::iter_swap(left_it, right_it);
    }
}

template <typename RandomIt, typename Compare>
void bitonic_merge(RandomIt first, std::ptrdiff_t start, std::ptrdiff_t count, bool ascending, Compare comp)
{
    if (count <= 1) {
        return;
    }

    std::ptrdiff_t half = count / 2;

    for (std::ptrdiff_t index = start; index < start + half; ++index) {
        bitonic_compare_and_swap(first, index, index + half, ascending, comp);
    }

    bitonic_merge(first, start, half, ascending, comp);
    bitonic_merge(first, start + half, half, ascending, comp);
}

template <typename RandomIt, typename Compare>
void bitonic_sort_impl(RandomIt first, std::ptrdiff_t start, std::ptrdiff_t count, bool ascending, Compare comp)
{
    if (count <= 1) {
        return;
    }

    std::ptrdiff_t half = count / 2;
    bitonic_sort_impl(first, start, half, true, comp);
    bitonic_sort_impl(first, start + half, half, false, comp);
    bitonic_merge(first, start, count, ascending, comp);
}

template <typename RandomIt, typename Compare = std::less<>>
void bitonic_sort_in_place(RandomIt first, RandomIt last, Compare comp = Compare{})
{
    auto count = std::distance(first, last);

    if (count < 2) {
        return;
    }

    if (!bitonic_is_power_of_two(count)) {
        throw std::invalid_argument("bitonic_sort_in_place requires a power-of-two length");
    }

    bitonic_sort_impl(first, 0, count, true, comp);
}
