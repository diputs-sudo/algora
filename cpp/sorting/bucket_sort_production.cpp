#include <algorithm>
#include <cstddef>
#include <cmath>
#include <stdexcept>
#include <vector>

std::vector<double> bucket_sort(
    const std::vector<double>& values,
    double bucket_size = 5.0,
    std::size_t max_buckets = 10000
) {
    if (bucket_size <= 0.0 || !std::isfinite(bucket_size)) {
        throw std::invalid_argument("bucket_size must be finite and greater than zero");
    }

    if (max_buckets == 0) {
        throw std::invalid_argument("max_buckets must be greater than zero");
    }

    if (values.empty()) {
        return {};
    }

    for (double value : values) {
        if (!std::isfinite(value)) {
            throw std::invalid_argument("bucket_sort only accepts finite numeric values");
        }
    }

    auto bounds = std::minmax_element(values.begin(), values.end());
    double minimum = *bounds.first;
    double maximum = *bounds.second;
    std::size_t bucket_count = static_cast<std::size_t>((maximum - minimum) / bucket_size) + 1;

    if (bucket_count > max_buckets) {
        std::vector<double> result = values;
        std::sort(result.begin(), result.end());
        return result;
    }

    std::vector<std::vector<double>> buckets(bucket_count);

    for (double value : values) {
        std::size_t index = static_cast<std::size_t>((value - minimum) / bucket_size);
        buckets[std::min(index, bucket_count - 1)].push_back(value);
    }

    std::vector<double> result;
    result.reserve(values.size());

    for (auto& bucket : buckets) {
        std::sort(bucket.begin(), bucket.end());
        result.insert(result.end(), bucket.begin(), bucket.end());
    }

    return result;
}
