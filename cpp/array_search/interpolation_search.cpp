#include <vector>

using namespace std;

int interpolation_search(const vector<int>& arr, int target) {
    if (arr.empty()) return -1;

    int low = 0;
    int high = static_cast<int>(arr.size()) - 1;

    while (low <= high && arr[low] <= target && target <= arr[high]) {
        if (arr[high] == arr[low]) {
            return arr[low] == target ? low : -1;
        }

        int position = low + static_cast<int>(
            static_cast<long long>(target - arr[low]) * (high - low) / (arr[high] - arr[low])
        );

        if (arr[position] == target) return position;
        if (arr[position] < target) low = position + 1;
        else high = position - 1;
    }

    return -1;
}
