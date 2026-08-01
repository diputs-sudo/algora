#include <functional>
#include <iterator>
#include <utility>
#include <vector>

template <typename Size>
std::vector<Size> shell_ciura_gaps(Size length) {
    std::vector<Size> gaps{1, 4, 10, 23, 57, 132, 301, 701, 1750};

    while (gaps.back() < length) {
        gaps.push_back(static_cast<Size>(gaps.back() * 9 / 4));
    }

    while (!gaps.empty() && gaps.back() >= length) {
        gaps.pop_back();
    }

    return gaps;
}

template <typename RandomIt, typename Compare = std::less<>>
void shell_sort_in_place(RandomIt first, RandomIt last, Compare compare = Compare{}) {
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    const Difference length = last - first;

    if (length < 2) {
        return;
    }

    std::vector<Difference> gaps = shell_ciura_gaps(length);

    for (auto gap_it = gaps.rbegin(); gap_it != gaps.rend(); ++gap_it) {
        const Difference gap = *gap_it;

        for (Difference index = gap; index < length; ++index) {
            auto current = std::move(first[index]);
            Difference position = index;

            while (position >= gap && compare(current, first[position - gap])) {
                first[position] = std::move(first[position - gap]);
                position -= gap;
            }

            first[position] = std::move(current);
        }
    }
}
