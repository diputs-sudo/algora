#include <cstddef>
#include <optional>
#include <unordered_map>
#include <vector>

class HashIndex {
public:
    explicit HashIndex(const std::vector<int>& values) {
        index_.reserve(values.size());

        for (std::size_t position = 0; position < values.size(); ++position) {
            index_.try_emplace(values[position], position);
        }
    }

    std::optional<std::size_t> find(int target) const {
        const auto it = index_.find(target);

        if (it == index_.end()) {
            return std::nullopt;
        }

        return it->second;
    }

private:
    std::unordered_map<int, std::size_t> index_;
};

int hash_search(const std::vector<int>& values, int target) {
    HashIndex index(values);
    const auto result = index.find(target);
    return result ? static_cast<int>(*result) : -1;
}
