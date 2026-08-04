#include <vector>

using namespace std;

int linear_search(const vector<int>& arr, int target) {
    for (int i = 0; i < static_cast<int>(arr.size()); i++) {
        if (arr[i] == target) return i;
    }

    return -1;
}
