#include <stddef.h>

static size_t lower_bound_int(const int *values, size_t length, int target) {
    size_t low = 0;
    size_t high = length;

    while (low < high) {
        size_t mid = low + (high - low) / 2;

        if (values[mid] < target) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    return low;
}

void fractional_cascading(
    const int *const *catalogs,
    const size_t *lengths,
    size_t catalog_count,
    int target,
    size_t *positions
) {
    if (catalog_count == 0) {
        return;
    }

    size_t position = lower_bound_int(catalogs[0], lengths[0], target);
    positions[0] = position;

    for (size_t catalog_index = 1; catalog_index < catalog_count; catalog_index++) {
        const int *catalog = catalogs[catalog_index];
        size_t length = lengths[catalog_index];

        if (position > length) {
            position = length;
        }

        while (position > 0 && catalog[position - 1] >= target) {
            position--;
        }

        while (position < length && catalog[position] < target) {
            position++;
        }

        positions[catalog_index] = position;
    }
}
