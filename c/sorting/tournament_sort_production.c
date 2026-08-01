#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

typedef int (*tournament_compare_fn)(const void *left, const void *right);

static size_t tournament_winner(size_t left, size_t right, unsigned char *items, size_t width, tournament_compare_fn compare) {
    if (left == SIZE_MAX) {
        return right;
    }

    if (right == SIZE_MAX) {
        return left;
    }

    return compare(items + right * width, items + left * width) < 0 ? right : left;
}

int tournament_sort_in_place(void *base, size_t length, size_t width, tournament_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    size_t size = 1;
    while (size < length) {
        if (size > SIZE_MAX / 2) {
            return -1;
        }

        size *= 2;
    }

    if (size > SIZE_MAX / 2 || length > SIZE_MAX / width) {
        return -1;
    }

    size_t *tree = malloc(size * 2 * sizeof(*tree));
    unsigned char *output = malloc(length * width);

    if (tree == NULL || output == NULL) {
        free(tree);
        free(output);
        return -1;
    }

    for (size_t index = 0; index < size * 2; ++index) {
        tree[index] = SIZE_MAX;
    }

    for (size_t index = 0; index < length; ++index) {
        tree[size + index] = index;
    }

    unsigned char *items = base;

    for (size_t index = size - 1; index > 0; --index) {
        tree[index] = tournament_winner(tree[index * 2], tree[index * 2 + 1], items, width, compare);
    }

    for (size_t count = 0; count < length; ++count) {
        size_t selected = tree[1];
        memcpy(output + count * width, items + selected * width, width);

        size_t node = size + selected;
        tree[node] = SIZE_MAX;
        node /= 2;

        while (node > 0) {
            tree[node] = tournament_winner(tree[node * 2], tree[node * 2 + 1], items, width, compare);
            node /= 2;
        }
    }

    memcpy(items, output, length * width);
    free(tree);
    free(output);
    return 0;
}
