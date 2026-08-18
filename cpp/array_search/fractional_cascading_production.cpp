#include <algorithm>
#include <cstddef>
#include <utility>
#include <vector>

struct CascadingQueryResult {
    std::vector<std::size_t> positions;
    std::vector<bool> matches;
};

class FractionalCascade {
public:
    explicit FractionalCascade(std::vector<std::vector<int>> catalogs)
        : catalogs_(std::move(catalogs)),
          layers_(catalogs_.size()) {
        buildLayers();
    }

    CascadingQueryResult query(int target) const {
        CascadingQueryResult result;

        if (layers_.empty()) {
            return result;
        }

        std::size_t position = lowerBound(layers_[0], target);

        for (std::size_t index = 0; index < catalogs_.size(); index++) {
            const std::vector<Entry>& layer = layers_[index];
            const std::vector<int>& catalog = catalogs_[index];

            position = repairPosition(layer, position, target);
            std::size_t catalogPosition = position == layer.size()
                ? catalog.size()
                : layer[position].catalogPosition;

            result.positions.push_back(catalogPosition);
            result.matches.push_back(
                catalogPosition < catalog.size() && catalog[catalogPosition] == target
            );

            if (index + 1 < layers_.size()) {
                position = position == layer.size()
                    ? layers_[index + 1].size()
                    : layer[position].nextPosition;
            }
        }

        return result;
    }

private:
    struct Entry {
        int value;
        std::size_t catalogPosition;
        std::size_t nextPosition;
    };

    std::vector<std::vector<int>> catalogs_;
    std::vector<std::vector<Entry>> layers_;

    void buildLayers() {
        for (std::size_t offset = 0; offset < catalogs_.size(); offset++) {
            std::size_t index = catalogs_.size() - 1 - offset;
            const std::vector<int>& catalog = catalogs_[index];
            const std::vector<Entry>* nextLayer = index + 1 < layers_.size() ? &layers_[index + 1] : nullptr;

            std::vector<int> values;
            values.reserve(catalog.size() + (nextLayer == nullptr ? 0 : nextLayer->size() / 2));
            values.insert(values.end(), catalog.begin(), catalog.end());

            if (nextLayer != nullptr) {
                for (std::size_t nextIndex = 1; nextIndex < nextLayer->size(); nextIndex += 2) {
                    values.push_back((*nextLayer)[nextIndex].value);
                }
            }

            std::sort(values.begin(), values.end());
            layers_[index].reserve(values.size());

            for (int value : values) {
                layers_[index].push_back({
                    value,
                    lowerBound(catalog, value),
                    nextLayer == nullptr ? 0 : lowerBound(*nextLayer, value)
                });
            }
        }
    }

    static std::size_t lowerBound(const std::vector<int>& values, int target) {
        return static_cast<std::size_t>(
            std::lower_bound(values.begin(), values.end(), target) - values.begin()
        );
    }

    static std::size_t lowerBound(const std::vector<Entry>& layer, int target) {
        return static_cast<std::size_t>(
            std::lower_bound(
                layer.begin(),
                layer.end(),
                target,
                [](const Entry& entry, int value) {
                    return entry.value < value;
                }
            ) - layer.begin()
        );
    }

    static std::size_t repairPosition(const std::vector<Entry>& layer, std::size_t position, int target) {
        while (position > 0 && layer[position - 1].value >= target) {
            position--;
        }

        while (position < layer.size() && layer[position].value < target) {
            position++;
        }

        return position;
    }
};
