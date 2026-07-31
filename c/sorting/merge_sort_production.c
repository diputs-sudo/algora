#include <stddef.h>
#include <stdlib.h>
#include <string.h>

typedef int (*merge_compare_fn)(const void *left, const void *right);

static size_t min_size(size_t left, size_t right) {
    return left < right ? left : right;
}

static void merge_into(unsigned char *source, unsigned char *target, size_t start, size_t mid, size_t end, size_t width, merge_compare_fn compare) {
    size_t left = start;
    size_t right = mid;
    size_t write = start; 

    while (left < mid && right < end) {
        unsigned char *left_item = source + left * width; 
        unsigned char *right_item = source + right * width;

        if (compare(right_item, left_item) < 0) {
            memcpy(target + write * width, right_item, width);
            ++right;
        } else {
            memcpy(target + write * width, left_item, width);
            ++left;
        }

        ++write;
    }

    while (left < mid) {
        memcpy(target + write * width, source + left * width, width);
        ++left;
        ++write;
    }

    while (right < end) {
        memcpy(target + write * width, source + right * width, width);
        ++right;
        ++write;
    }
}

int merge_sort_in_place(void *base, size_t length, size_t width, merge_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    unsigned char *items = base;
    unsigned char *buffer = malloc(length * width);

    if (buffer == NULL) {
        return -1;
    }

    memcpy(buffer, items, length * width);
    int source_is_buffer = 0;

    for (size_t merge_width = 1; merge_width < length; merge_width *= 2) {
        unsigned char *source = source_is_buffer ? buffer : items;
        unsigned char *target = source_is_buffer ? items : buffer;

        for (size_t start = 0; start < length; start += merge_width *2) {
            size_t mid = min_size(start + merge_width, length);
            size_t end = min_size(start + merge_width * 2, length);
            merge_into(source, target, start, mid, end, width, compare);
        }

        source_is_buffer = !source_is_buffer;
    }

    if (source_is_buffer) {
        memcpy(items, buffer, length * width);
    }

    free(buffer);
    return 0;
}
