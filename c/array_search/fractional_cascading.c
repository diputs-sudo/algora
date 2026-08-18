#include <stddef.h>
#include <stdlib.h>

typedef struct {
    int value;
    size_t catalog_position;
    size_t next_position;
} CascadeEntry;

typedef struct {
    CascadeEntry *entries;
    size_t length;
} CascadeLayer;

static size_t lower_bound_int(const int *values, size_t length, int target) {
    size_t low = 0;
    size_t high = length;
    while (low < high) {
        size_t mid = low + (high - low) / 2;
        if (values[mid] < target) low = mid + 1;
        else high = mid;
    }
    return low;
}

static size_t lower_bound_entry(const CascadeEntry *entries, size_t length, int target) {
    size_t low = 0;
    size_t high = length;
    while (low < high) {
        size_t mid = low + (high - low) / 2;
        if (entries[mid].value < target) low = mid + 1;
        else high = mid;
    }
    return low;
}

static int compare_ints(const void *left, const void *right) {
    int a = *(const int *)left;
    int b = *(const int *)right;
    return (a > b) - (a < b);
}

static void free_layers(CascadeLayer *layers, size_t count) {
    if (!layers) return;
    for (size_t index = 0; index < count; index++) free(layers[index].entries);
    free(layers);
}

void fractional_cascading(
    const int *const *catalogs,
    const size_t *lengths,
    size_t catalog_count,
    int target,
    size_t *positions
) {
    if (catalog_count == 0) return;

    CascadeLayer *layers = calloc(catalog_count, sizeof(*layers));
    if (!layers) return;

    for (size_t offset = 0; offset < catalog_count; offset++) {
        size_t index = catalog_count - 1 - offset;
        const CascadeLayer *next = index + 1 < catalog_count ? &layers[index + 1] : NULL;
        size_t sampled = next ? next->length / 2 : 0;
        size_t value_count = lengths[index] + sampled;
        int *values = malloc(value_count * sizeof(*values));

        if (value_count > 0 && !values) {
            free_layers(layers, catalog_count);
            return;
        }

        for (size_t item = 0; item < lengths[index]; item++) values[item] = catalogs[index][item];
        for (size_t item = 1, out = lengths[index]; next && item < next->length; item += 2) {
            values[out++] = next->entries[item].value;
        }
        qsort(values, value_count, sizeof(*values), compare_ints);

        layers[index].entries = malloc(value_count * sizeof(*layers[index].entries));
        layers[index].length = value_count;
        if (value_count > 0 && !layers[index].entries) {
            free(values);
            free_layers(layers, catalog_count);
            return;
        }

        for (size_t item = 0; item < value_count; item++) {
            layers[index].entries[item].value = values[item];
            layers[index].entries[item].catalog_position =
                lower_bound_int(catalogs[index], lengths[index], values[item]);
            layers[index].entries[item].next_position = next
                ? lower_bound_entry(next->entries, next->length, values[item])
                : 0;
        }
        free(values);
    }

    size_t position = lower_bound_entry(layers[0].entries, layers[0].length, target);
    for (size_t index = 0; index < catalog_count; index++) {
        CascadeLayer *layer = &layers[index];
        while (position > 0 && layer->entries[position - 1].value >= target) position--;
        while (position < layer->length && layer->entries[position].value < target) position++;

        positions[index] = position == layer->length
            ? lengths[index]
            : layer->entries[position].catalog_position;

        if (index + 1 < catalog_count) {
            position = position == layer->length
                ? layers[index + 1].length
                : layer->entries[position].next_position;
        }
    }

    free_layers(layers, catalog_count);
}
