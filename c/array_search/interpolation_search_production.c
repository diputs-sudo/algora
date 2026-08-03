#include <stddef.h>

typedef struct {
    int found;
    size_t index;
    size_t insertion_point;
} interpolation_search_result;

static size_t lower_bound_int(const int *values, size_t left, size_t right, int target) {
    while (left < right) {
        size_t mid = left + (right - left) / 2;

        if (values[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
}

interpolation_search_result interpolation_search_first(const int *values, size_t length, int target) {
    interpolation_search_result result = {0, 0, 0};

    if (values == NULL || length == 0) {
        return result;
    }

    size_t low = 0;
    size_t high = length - 1;
    size_t candidate_left = 0;

    while (low <= high && values[low] <= target && target <= values[high]) {
        int low_value = values[low];
        int high_value = values[high];

        if (low_value == high_value) {
            result.insertion_point = low;

            if (low_value == target) {
                result.found = 1;
                result.index = low;
            }

            return result;
        }

        long long numerator = ((long long)target - low_value) * (long long)(high - low);
        long long denominator = (long long)high_value - low_value;
        size_t probe = low + (size_t)(numerator / denominator);

        if (probe < low) probe = low;
        if (probe > high) probe = high;

        if (values[probe] < target) {
            low = probe + 1;
            candidate_left = low;
        } else {
            high = probe;

            if (values[probe] == target) {
                break;
            }
        }
    }

    size_t search_right = high >= candidate_left ? high + 1 : length;
    size_t insertion_point = lower_bound_int(values, candidate_left, search_right, target);
    result.insertion_point = insertion_point;

    if (insertion_point < length && values[insertion_point] == target) {
        result.found = 1;
        result.index = insertion_point;
    }

    return result;
}
