#include <algorithm>
#include <cstddef>
#include <stdexcept>
#include <vector>

std::vector<int> counting_sort(const std::vector<int>& values, std::size_t max_range = 1000000)
{
    if (max_range == 0) {
        throw std::invalid_argument("max_range must be greater than zero");
    }

    if (values.empty()) {
        return {};
    }

    auto bounds = std::minmax_element(values.begin(), values.end());
    long long minimum = *bounds.first;
    long long maximum = *bounds.second;
    unsigned long long value_range = static_cast<unsigned long long>(maximum - minimum) + 1ULL;

    if (value_range > max_range) {
        std::vector<int> result = values;
        std::sort(result.begin(), result.end());
        return result;
    }

    std::vector<std::size_t> counts(static_cast<std::size_t>(value_range), 0);

    for (int value : values) {
        counts[static_cast<std::size_t>(static_cast<long long>(value) - minimum)] += 1;
    }

    std::vector<int> result;
    result.reserve(values.size());

    for (std::size_t offset = 0; offset < counts.size(); ++offset) {
        int value = static_cast<int>(minimum + static_cast<long long>(offset));
        result.insert(result.end(), counts[offset], value);
    }

    return result;
}
