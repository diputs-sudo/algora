#include <limits.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

int radix_sort_in_place(int *values, size_t length) {
    enum { radix = 256, small_array_threshold = 64 };

    if (length < 2) {
        return 0;
    }

    if (values == NULL) {
        return -1;
    }

    if (length < small_array_threshold) {
        for (size_t i = 1; i < length; ++i) {
            int current = values[i];
            size_t j = i;

            while (j > 0 && values[j - 1] > current) {
                values[j] = values[j - 1];
                --j;
            }

            values[j] = current;
        }

        return 0;
    }

    if (length > SIZE_MAX / sizeof(*values)) {
        return -1;
    }

    int *buffer = malloc(length * sizeof(*buffer));
    if (buffer == NULL) {
        return -1;
    }

    const unsigned int sign_mask = 1u << (sizeof(int) * CHAR_BIT - 1);

    for (unsigned shift = 0; shift < sizeof(int) * CHAR_BIT; shift += 8) {
        size_t counts[radix] = {0};

        for (size_t i = 0; i < length; ++i) {
            unsigned int key = ((unsigned int) values[i]) ^ sign_mask;
            ++counts[(key >> shift) & 255u];
        }

        size_t total = 0;
        for (size_t i = 0; i < radix; ++i) {
            size_t count = counts[i];
            counts[i] = total;
            total += count;
        }

        for (size_t i = 0; i < length; ++i) {
            unsigned int key = ((unsigned int) values[i]) ^ sign_mask;
            size_t bucket = (key >> shift) & 255u;
            buffer[counts[bucket]++] = values[i];
        }

        memcpy(values, buffer, length * sizeof(*values));
    }

    free(buffer);
    return 0;
}
