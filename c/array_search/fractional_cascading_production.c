#include <stddef.h>

typedef struct {
    size_t position;
    int found;
} fractional_cascading_result;

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

void fractional_cascading_query(
    const int *const *catalogs,
    const size_t *lengths,
    size_t catalog_count,
    int target,
    fractional_cascading_result *results
) {
    if (catalog_count == 0) {
        return;
    }

    size_t position = lower_bound_int(catalogs[0], lengths[0], target);

    for (size_t catalog_index = 0; catalog_index < catalog_count; catalog_index++) {
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

        results[catalog_index].position = position;
        results[catalog_index].found = position < length && catalog[position] == target;
    }
}
