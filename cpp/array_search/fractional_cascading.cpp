#include <algorithm>
#include <vector>

using namespace std;

vector<int> fractional_cascading(const vector<vector<int>>& catalogs, int target) {
    vector<int> results;

    if (catalogs.empty()) {
        return results;
    }

    int position = static_cast<int>(
        lower_bound(catalogs[0].begin(), catalogs[0].end(), target) - catalogs[0].begin()
    );
    results.push_back(position);

    for (size_t catalog_index = 1; catalog_index < catalogs.size(); catalog_index++) {
        const vector<int>& catalog = catalogs[catalog_index];
        position = min(position, static_cast<int>(catalog.size()));

        while (position > 0 && catalog[position - 1] >= target) {
            position--;
        }

        while (position < static_cast<int>(catalog.size()) && catalog[position] < target) {
            position++;
        }

        results.push_back(position);
    }

    return results;
}
