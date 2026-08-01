#include <stddef.h>
#include <stdlib.h>
#include <string.h>

typedef int (*shell_compare_fn)(const void *left, const void *right);

static int build_ciura_gaps(size_t length, size_t **out_gaps, size_t *out_count) {
    static const size_t base_gaps[] = {1, 4, 10, 23, 57, 132, 301, 701, 1750};
    size_t capacity = sizeof(base_gaps) / sizeof(base_gaps[0]) + 8;
    size_t *gaps = malloc(capacity * sizeof(*gaps));

    if (gaps == NULL) {
        return -1;
    }

    size_t count = 0;
    for (size_t i = 0; i < sizeof(base_gaps) / sizeof(base_gaps[0]); ++i) {
        if (base_gaps[i] < length) {
            gaps[count++] = base_gaps[i];
        }
    }

    size_t last = base_gaps[(sizeof(base_gaps) / sizeof(base_gaps[0])) - 1];
    while (last < length) {
        last = (last * 9) / 4;

        if (last < length) {
            if (count == capacity) {
                capacity *= 2;
                size_t *expanded = realloc(gaps, capacity * sizeof(*gaps));

                if (expanded == NULL) {
                    free(gaps);
                    return -1;
                }

                gaps = expanded;
            }

            gaps[count++] = last;
        }
    }

    *out_gaps = gaps;
    *out_count = count;
    return 0;
}

int shell_sort_in_place(void *base, size_t length, size_t width, shell_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    size_t *gaps = NULL;
    size_t gap_count = 0;

    if (build_ciura_gaps(length, &gaps, &gap_count) != 0) {
        return -1;
    }

    unsigned char *items = base;
    unsigned char *current = malloc(width);

    if (current == NULL) {
        free(gaps);
        return -1;
    }

    for (size_t gap_index = gap_count; gap_index > 0; --gap_index) {
        size_t gap = gaps[gap_index - 1];

        for (size_t index = gap; index < length; ++index) {
            memcpy(current, items + index * width, width);
            size_t position = index;

            while (position >= gap && compare(current, items + (position - gap) * width) < 0) {
                memcpy(items + position * width, items + (position - gap) * width, width);
                position -= gap;
            }

            memcpy(items + position * width, current, width);
        }
    }

    free(current);
    free(gaps);
    return 0;
}
