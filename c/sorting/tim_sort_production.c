#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

typedef int (*tim_compare_fn)(const void *left, const void *right);

typedef struct {
    size_t start;
    size_t length;
} tim_run;

static size_t min_size(size_t left, size_t right) {
    return left < right ? left : right;
}

static size_t min_run_for(size_t length) {
    size_t remainder = 0;

    while (length >= 64) {
        remainder |= length & 1u;
        length >>= 1;
    }

    return length + remainder;
}

static void reverse_range(unsigned char *items, size_t left, size_t right, size_t width, unsigned char *slot) {
    while (left < right) {
        --right;

        if (left >= right) {
            break;
        }

        memcpy(slot, items + left * width, width);
        memcpy(items + left * width, items + right * width, width);
        memcpy(items + right * width, slot, width);
        ++left;
    }
}

static void binary_insertion_sort(unsigned char *items, size_t left, size_t right, size_t sorted_until, size_t width, tim_compare_fn compare, unsigned char *slot) {
    if (sorted_until <= left) {
        sorted_until = left + 1;
    }

    for (size_t index = sorted_until; index < right; ++index) {
        memcpy(slot, items + index * width, width);

        size_t low = left;
        size_t high = index;

        while (low < high) {
            size_t mid = low + (high - low) / 2;

            if (compare(slot, items + mid * width) < 0) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        memmove(items + (low + 1) * width, items + low * width, (index - low) * width);
        memcpy(items + low * width, slot, width);
    }
}

static size_t count_run(unsigned char *items, size_t start, size_t length, size_t width, tim_compare_fn compare, unsigned char *slot) {
    if (start + 1 == length) {
        return 1;
    }

    size_t end = start + 2;

    if (compare(items + (start + 1) * width, items + start * width) < 0) {
        while (end < length && compare(items + end * width, items + (end - 1) * width) < 0) {
            ++end;
        }

        reverse_range(items, start, end, width, slot);
    } else {
        while (end < length && compare(items + end * width, items + (end - 1) * width) >= 0) {
            ++end;
        }
    }

    return end - start;
}

static void merge_ranges(unsigned char *items, unsigned char *buffer, size_t left, size_t mid, size_t right, size_t width, tim_compare_fn compare) {
    size_t left_index = left;
    size_t right_index = mid;
    size_t output = 0;

    while (left_index < mid && right_index < right) {
        unsigned char *left_item = items + left_index * width;
        unsigned char *right_item = items + right_index * width;

        if (compare(right_item, left_item) < 0) {
            memcpy(buffer + output * width, right_item, width);
            ++right_index;
        } else {
            memcpy(buffer + output * width, left_item, width);
            ++left_index;
        }

        ++output;
    }

    while (left_index < mid) {
        memcpy(buffer + output * width, items + left_index * width, width);
        ++left_index;
        ++output;
    }

    while (right_index < right) {
        memcpy(buffer + output * width, items + right_index * width, width);
        ++right_index;
        ++output;
    }

    memcpy(items + left * width, buffer, (right - left) * width);
}

int tim_sort_in_place(void *base, size_t length, size_t width, tim_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    if (length > SIZE_MAX / width) {
        return -1;
    }

    unsigned char *items = base;
    unsigned char *slot = malloc(width);
    unsigned char *buffer = malloc(length * width);
    tim_run *runs = malloc(length * sizeof(*runs));

    if (slot == NULL || buffer == NULL || runs == NULL) {
        free(slot);
        free(buffer);
        free(runs);
        return -1;
    }

    size_t min_run = min_run_for(length);
    size_t run_count = 0;
    size_t start = 0;

    while (start < length) {
        size_t run_length = count_run(items, start, length, width, compare, slot);
        size_t force = min_size(length - start, min_run);

        if (run_length < force) {
            binary_insertion_sort(items, start, start + force, start + run_length, width, compare, slot);
            run_length = force;
        }

        runs[run_count++] = (tim_run){start, run_length};
        start += run_length;
    }

    while (run_count > 1) {
        size_t write = 0;

        for (size_t read = 0; read < run_count; read += 2) {
            if (read + 1 == run_count) {
                runs[write++] = runs[read];
                continue;
            }

            size_t left = runs[read].start;
            size_t mid = runs[read].start + runs[read].length;
            size_t right = runs[read + 1].start + runs[read + 1].length;

            merge_ranges(items, buffer, left, mid, right, width, compare);
            runs[write++] = (tim_run){left, right - left};
        }

        run_count = write;
    }

    free(slot);
    free(buffer);
    free(runs);
    return 0;
}
