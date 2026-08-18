#include <stdbool.h>
#include <stddef.h>
#include <stdlib.h>

typedef struct {
    int value;
    size_t catalog_position;
    size_t next_position;
} FractionalCascadeEntry;

typedef struct {
    FractionalCascadeEntry *entries;
    size_t length;
} FractionalCascadeLayer;

typedef struct {
    const int *const *catalogs;
    const size_t *lengths;
    size_t catalog_count;
    FractionalCascadeLayer *layers;
} FractionalCascade;

typedef struct {
    size_t *positions;
    bool *matches;
} FractionalCascadeQueryResult;

static size_t catalog_lower_bound(
    const int *values,
    size_t length,
    int target
) {
    size_t low = 0;
    size_t high = length;

    while (low < high) {
        size_t mid = low + (high - low) / 2;
        if (values[mid] < target) low = mid + 1;
        else high = mid;
    }
    return low;
}

static size_t layer_lower_bound(
    const FractionalCascadeLayer *layer,
    int target
) {
    size_t low = 0;
    size_t high = layer->length;

    while (low < high) {
        size_t mid = low + (high - low) / 2;
        if (layer->entries[mid].value < target) low = mid + 1;
        else high = mid;
    }
    return low;
}

static int compare_ints(const void *left, const void *right) {
    int a = *(const int *)left;
    int b = *(const int *)right;
    return (a > b) - (a < b);
}

static void free_layer(FractionalCascadeLayer *layer) {
    free(layer->entries);
    layer->entries = NULL;
    layer->length = 0;
}

void fractional_cascade_destroy(FractionalCascade *cascade) {
    if (!cascade) return;

    if (cascade->layers) {
        for (size_t index = 0; index < cascade->catalog_count; index++) {
            free_layer(&cascade->layers[index]);
        }
    }
    free(cascade->layers);
    cascade->layers = NULL;
    cascade->catalog_count = 0;
    cascade->catalogs = NULL;
    cascade->lengths = NULL;
}

int fractional_cascade_init(
    FractionalCascade *cascade,
    const int *const *catalogs,
    const size_t *lengths,
    size_t catalog_count
) {
    if (!cascade || (!catalogs && catalog_count > 0) || (!lengths && catalog_count > 0)) {
        return 0;
    }

    cascade->catalogs = catalogs;
    cascade->lengths = lengths;
    cascade->catalog_count = catalog_count;
    cascade->layers = calloc(catalog_count, sizeof(*cascade->layers));
    if (catalog_count > 0 && !cascade->layers) {
        fractional_cascade_destroy(cascade);
        return 0;
    }

    for (size_t offset = 0; offset < catalog_count; offset++) {
        size_t index = catalog_count - 1 - offset;
        FractionalCascadeLayer *layer = &cascade->layers[index];
        const FractionalCascadeLayer *next =
            index + 1 < catalog_count ? &cascade->layers[index + 1] : NULL;
        size_t sampled = next ? next->length / 2 : 0;
        size_t value_count = lengths[index] + sampled;
        int *values = malloc(value_count * sizeof(*values));

        if (value_count > 0 && !values) {
            fractional_cascade_destroy(cascade);
            return 0;
        }

        for (size_t item = 0; item < lengths[index]; item++) {
            values[item] = catalogs[index][item];
        }
        for (size_t item = 1, out = lengths[index];
             next && item < next->length;
             item += 2) {
            values[out++] = next->entries[item].value;
        }
        qsort(values, value_count, sizeof(*values), compare_ints);

        layer->entries = malloc(value_count * sizeof(*layer->entries));
        layer->length = value_count;
        if (value_count > 0 && !layer->entries) {
            free(values);
            fractional_cascade_destroy(cascade);
            return 0;
        }

        for (size_t item = 0; item < value_count; item++) {
            layer->entries[item].value = values[item];
            layer->entries[item].catalog_position = catalog_lower_bound(
                catalogs[index], lengths[index], values[item]
            );
            layer->entries[item].next_position = next
                ? layer_lower_bound(next, values[item])
                : 0;
        }
        free(values);
    }

    return 1;
}

int fractional_cascade_query(
    const FractionalCascade *cascade,
    int target,
    FractionalCascadeQueryResult result
) {
    if (!cascade || (!result.positions && cascade->catalog_count > 0) ||
        (!result.matches && cascade->catalog_count > 0)) {
        return 0;
    }

    if (cascade->catalog_count == 0) return 1;

    size_t position = layer_lower_bound(&cascade->layers[0], target);

    for (size_t index = 0; index < cascade->catalog_count; index++) {
        const FractionalCascadeLayer *layer = &cascade->layers[index];

        while (position > 0 && layer->entries[position - 1].value >= target) position--;
        while (position < layer->length && layer->entries[position].value < target) position++;

        size_t catalog_position = position == layer->length
            ? cascade->lengths[index]
            : layer->entries[position].catalog_position;

        result.positions[index] = catalog_position;
        result.matches[index] = catalog_position < cascade->lengths[index] &&
            cascade->catalogs[index][catalog_position] == target;

        if (index + 1 < cascade->catalog_count) {
            position = position == layer->length
                ? cascade->layers[index + 1].length
                : layer->entries[position].next_position;
        }
    }

    return 1;
}
