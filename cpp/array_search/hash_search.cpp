#include <unordered_map>
#include <vector>

using namespace std;

int hash_search(const vector<int>& arr, int target) {
    unordered_map<int, int> table;

    for (int i = 0; i < static_cast<int>(arr.size()); i++) {
        if (table.find(arr[i]) == table.end()) {
            table[arr[i]] = i;
        }
    }

    auto it = table.find(target);
    return it == table.end() ? -1 : it->second;
}
