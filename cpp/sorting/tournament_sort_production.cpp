#include <functional>
#include <iterator>
#include <utility>
#include <vector>

template <typename RandomIt, typename Compare = std::less<>>
void tournament_sort_in_place(RandomIt first, RandomIt last, Compare compare = Compare{}) {
    using Value = typename std::iterator_traits<RandomIt>::value_type;
    using Difference = typename std::iterator_traits<RandomIt>::difference_type;
    const Difference length = last - first;

    if (length < 2) {
        return;
    }

    Difference size = 1;
    while (size < length) {
        size *= 2;
    }

    std::vector<Difference> tree(static_cast<std::size_t>(size * 2), Difference{-1});

    auto winner = [&](Difference left, Difference right) {
        if (left < 0) {
            return right;
        }

        if (right < 0) {
            return left;
        }

        return compare(first[right], first[left]) ? right : left;
    };

    for (Difference index = 0; index < length; ++index) {
        tree[static_cast<std::size_t>(size + index)] = index;
    }

    for (Difference index = size - 1; index > 0; --index) {
        tree[static_cast<std::size_t>(index)] = winner(
            tree[static_cast<std::size_t>(index * 2)],
            tree[static_cast<std::size_t>(index * 2 + 1)]
        );
    }

    std::vector<Value> output;
    output.reserve(static_cast<std::size_t>(length));

    for (Difference count = 0; count < length; ++count) {
        Difference selected = tree[1];
        output.push_back(std::move(first[selected]));

        Difference node = size + selected;
        tree[static_cast<std::size_t>(node)] = Difference{-1};
        node /= 2;

        while (node > 0) {
            tree[static_cast<std::size_t>(node)] = winner(
                tree[static_cast<std::size_t>(node * 2)],
                tree[static_cast<std::size_t>(node * 2 + 1)]
            );
            node /= 2;
        }
    }

    std::move(output.begin(), output.end(), first);
}
