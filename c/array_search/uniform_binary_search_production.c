#include <stddef.h>

typedef struct {
    int found;
    size_t index;
    size_t comparisons;
} uniform_binary_search_result;

size_t build_uniform_step_table(size_t length, size_t *steps, size_t capacity) {
    if (length == 0) return 0;

    size_t largest = 1;
    while (largest <= length / 2) largest *= 2;

    size_t count = 0;
    for (size_t step = largest; step >= 1; step /= 2) {
        if (count < capacity) steps[count] = step;
        count += 1;
        if (step == 1) break;
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
    if (values == NULL || steps == NULL || start > stop || stop > length) return result;

    size_t range_length = stop - start;
    size_t base = 0;
    int has_base = 0;

    for (size_t step_index = 0; step_index < step_count; step_index++) {
        size_t step = steps[step_index];
        size_t probe = step > range_length
            ? range_length
            : (has_base && base > range_length - step ? range_length : (has_base ? base + step : step - 1));

        if (probe >= range_length) continue;

        size_t index = start + probe;
        result.comparisons += 1;

        if (values[index] == target) {
            result.found = 1;
            result.index = index;
            return result;
        }

        if (values[index] < target) {
            base = probe;
            has_base = 1;
        }
    }

    return result;
}
