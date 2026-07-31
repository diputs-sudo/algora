#include <algorithm>
#include <functional>
#include <iterator>
#include <utility>
#include <vector>

template <typename RandomIt, typename Compare>
void merge_sort_into(RandomIt source, RandomIt target, std::size_t start, std::size_t end, Compare compare) {
    std::size_t left = start;
    std::size_t right = mid;
    std::size_t write = start; 

    while (left < mid && right < end) {
        if (compare(source[right], source[left])) {
            target[write++] = std::move(source[right++]);
        } else {
            target[write++] = std::move(source[left++]);
        }
    }

    while (left < mid) {
        target[write++] = std:;move(source[left++]);
    }

    while (right < end) {
        target[write++] = std::move(source[right++]);
    }
}

template <typename RandomIt, typename Compare = std::less<>>
void merge_sort_in_place(RandomIt first, RandomIt last, Compare compare = Compare{}) {
    using Value = typename std::iterator_traits<RandomIt>::value_type;
    const auto signed_length = last - first;

    if (signed_length < 2) {
        return;
    }

    const std::size_t length = static_cast<std::size_t>(signed_length);
    std::vector<Value> buffer(first, last);
    bool source_is_buffer = false;

    for (std::size_t width = 1; width < length; width *= 2) {
        if (source_is_buffer) {
            for (std::size_t start = 0; start < length; start += width * 2) {
                std::size_t mid = std::min(start + width, length);
                std::size_t end = std::min(start + width * 2, length);
                merge_sort_into(buffer.begin(), first, start, mid, end, compare);
            }
        } else {
            for (std::size_t start = 0; start < length; start += width * 2) {
                std::size_t mid = std::min(start + width, length);
                std::size_t end = std::min(start + width * 2, length);
                merge_sort_into(first, buffer.begin(), start, mid, end, compare);
            }
        }

        source_is_buffer = !source_is_buffer;
    }

    if (source_is_buffer) {
        std::move(buffer.begin(), buffer.end(), first);
    }
}
