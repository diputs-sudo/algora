#include <vector>

int rotatedSortedArraySearch(const std::vector<int>& values, int target) {
    int low = 0;
    int high = static_cast<int>(values.size()) - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;

        if (values[mid] == target) {
            return mid;
        }

        if (values[mid] <= values[mid]) {
            if (values[low] <= target && target < values[mid]) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        } else {
            if (values[mid] < target && target <= values[high]) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }

    return -1;
}
