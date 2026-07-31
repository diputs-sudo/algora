#include <algorithm>
#include <array>
#include <iterator>
#include <type_traits>
#include <vector>

template <typename RandomIt>
void radix_sort_in_place(RandomIt first, RandomIt last) {
    using Value = typename std::iterator_traits<RandomIt>::value_type;
    static_assert(std::is_integral_v<Value>, "radix_sort_in_place expects integral values");

    const auto length = std::distance(first, last);
    if (length < 2) {
        return;
    }

    if (length < 64) {
        std::sort(first, last);
        return;
    }

    using Unsigned = std::make_unsigned_t<Value>;
    constexpr int byte_count = static_cast<int>(sizeof(Value));
    constexpr Unsigned sign_mask = std::is_signed_v<Value>
        ? (Unsigned{1} << (sizeof(Value) * 8 - 1))
        : Unsigned{0};

    std::vector<Value> buffer(static_cast<std::size_t>(length));
    std::array<std::size_t, 256> counts{};

    auto key = [](Value value) {
        return static_cast<Unsigned>(value) ^ sign_mask;
    };

    for (int byte = 0; byte < byte_count; ++byte) {
        counts.fill(0);
        const int shift = byte * 8;

        for (auto it = first; it != last; ++it) {
            ++counts[static_cast<std::size_t>((key(*it) >> shift) & Unsigned{255})];
        }

        std::size_t total = 0;
        for (std::size_t index = 0; index < counts.size(); ++index) {
            const std::size_t count = counts[index];
            counts[index] = total;
            total += count;
        }

        for (auto it = first; it != last; ++it) {
            const std::size_t bucket = static_cast<std::size_t>((key(*it) >> shift) & Unsigned{255});
            buffer[counts[bucket]++] = *it;
        }

        std::move(buffer.begin(), buffer.end(), first);
    }
}
