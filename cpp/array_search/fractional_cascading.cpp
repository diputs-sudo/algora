#include <algorithm>
#include <cstddef>
#include <vector>

namespace {
struct Entry {
    int value;
    std::size_t catalog_position;
    std::size_t next_position;
};
using Layer = std::vector<Entry>;

std::size_t lower_bound(const std::vector<int>& values, int target) {
    return static_cast<std::size_t>(
        std::lower_bound(values.begin(), values.end(), target) - values.begin()
    );
}

std::size_t lower_bound(const Layer& layer, int target) {
    return static_cast<std::size_t>(std::lower_bound(
        layer.begin(), layer.end(), target,
        [](const Entry& entry, int value) { return entry.value < value; }
    ) - layer.begin());
}

std::vector<Layer> build_layers(const std::vector<std::vector<int>>& catalogs) {
    std::vector<Layer> layers(catalogs.size());

    for (std::size_t offset = 0; offset < catalogs.size(); offset++) {
        std::size_t index = catalogs.size() - 1 - offset;
        const Layer* next = index + 1 < catalogs.size() ? &layers[index + 1] : nullptr;
        std::vector<int> values = catalogs[index];

        if (next) {
            for (std::size_t next_index = 1; next_index < next->size(); next_index += 2) {
                values.push_back((*next)[next_index].value);
            }
        }
        std::sort(values.begin(), values.end());

        for (int value : values) {
            layers[index].push_back({
                value,
                lower_bound(catalogs[index], value),
                next ? lower_bound(*next, value) : 0
            });
        }
    }
    return layers;
}
}

std::vector<int> fractional_cascading(
    const std::vector<std::vector<int>>& catalogs,
    int target
) {
    std::vector<int> results;
    if (catalogs.empty()) return results;

    const std::vector<Layer> layers = build_layers(catalogs);
    std::size_t position = lower_bound(layers[0], target);

    for (std::size_t index = 0; index < catalogs.size(); index++) {
        const Layer& layer = layers[index];
        while (position > 0 && layer[position - 1].value >= target) position--;
        while (position < layer.size() && layer[position].value < target) position++;

        results.push_back(position == layer.size()
            ? static_cast<int>(catalogs[index].size())
            : static_cast<int>(layer[position].catalog_position));

        if (index + 1 < catalogs.size()) {
            position = position == layer.size()
                ? layers[index + 1].size()
                : layer[position].next_position;
        }
    }
    return results;
}
