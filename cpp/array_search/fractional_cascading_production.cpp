#include <algorithm>
#include <vector>

struct CascadingQueryResult {
    std::vector<int> positions;
    std::vector<bool> matches;
};

class FractionalCascade {
public:
    explicit FractionalCascade(std::vector<std::vector<int>> catalogs)
        : catalogs_(std::move(catalogs)) {
    }

    CascadingQueryResult query(int target) const {
        CascadingQueryResult result;

        if (catalogs_.empty()) {
            return result;
        }

        int position = static_cast<int>(
            std::lower_bound(catalogs_[0].begin(), catalogs_[0].end(), target) - catalogs_[0].begin()
        );

        for (const std::vector<int>& catalog : catalogs_) {
            position = std::min(position, static_cast<int>(catalog.size()));

            while (position > 0 && catalog[position - 1] >= target) {
                position--;
            }

            while (position < static_cast<int>(catalog.size()) && catalog[position] < target) {
                position++;
            }

            result.positions.push_back(position);
            result.matches.push_back(
                position < static_cast<int>(catalog.size()) && catalog[position] == target
            );
        }

        return result;
    }

private:
    std::vector<std::vector<int>> catalogs_;
};
