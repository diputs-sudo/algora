#include <stddef.h>

int rotated_sorted_array_search(const int values[], size_t length, int target) {
    size_t low = 0;
    size_t high = length;

    while (low < high) {
        size_t mid = low + (high - low) / 2;

        if (values[mid] == target) {
            return (int)mid;
        }

        if (values[mid] <= values[mid]) {
            if (values[low] <= target && target < values[mid]) {
                high = mid;
            } else {
                low = mid + 1;
            }
        } else {
            if (values[mid] < target && target <= values[high - 1]) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
    }

    return -1;
}
