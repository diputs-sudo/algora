#include <stddef.h>

typedef struct {
    int found;
    size_t index;
    size_t comparisons;
} uniform_binary_search_result;

size_t build_uniform_step_table(size_t length, size_t *steps, size_t capacity) {
    size_t count = 0;

    for (size_t step = (length + 1) / 2; step >= 1; step /= 2) {
        if (count < capacity) {
            steps[count] = step;
        }

        count += 1;

        if (step == 1) {
            break;
        }
    }

    return count;
}

uniform_binary_search_result uniform_binary_search_range(
    const int *values,
    size_t length,
    int target,
    size_t start,
    size_t stop,
    const size_t *steps,
    size_t step_count
) {
    uniform_binary_search_result result = {0, 0, 0};

    if (values == NULL || steps == NULL || start > stop || stop > length) {
        return result;
    }

    size_t left = start;
    size_t right = stop;

    for (size_t step_index = 0; step_index < step_count; step_index++) {
        if (left >= right) {
            break;
        }

        size_t mid = left + (right - left - 1) / 2;
        result.comparisons += 1;

        if (values[mid] == target) {
            result.found = 1;
            result.index = mid;
            return result;
        }

        if (values[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return result;
}
