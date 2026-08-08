#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

typedef struct {
    int key;
    size_t value;
    unsigned char used;
} hash_index_entry;

typedef struct {
    hash_index_entry *entries;
    size_t capacity;
} hash_index;

static size_t hash_int(int value) {
    uint32_t x = (uint32_t)value;
    x ^= x >> 16;
    x *= 0x7feb352dU;
    x ^= x >> 15;
    x *= 0x846ca68bU;
    x ^= x >> 16;
    return (size_t)x;
}

static size_t next_capacity(size_t length) {
    size_t capacity = 16;

    while (capacity < length * 2 + 1) {
        capacity *= 2;
    }

    return capacity;
}

int hash_index_build(hash_index *index, const int *values, size_t length) {
    if (index == NULL || (values == NULL && length > 0)) {
        return 0;
    }

    index->capacity = next_capacity(length);
    index->entries = calloc(index->capacity, sizeof(hash_index_entry));

    if (index->entries == NULL) {
        index->capacity = 0;
        return 0;
    }

    for (size_t position = 0; position < length; position++) {
        size_t bucket = hash_int(values[position]) & (index->capacity - 1);

        while (index->entries[bucket].used && index->entries[bucket].key != values[position]) {
            bucket = (bucket + 1) & (index->capacity - 1);
        }

        if (!index->entries[bucket].used) {
            index->entries[bucket].used = 1;
            index->entries[bucket].key = values[position];
            index->entries[bucket].value = position;
        }
    }

    return 1;
}

void hash_index_destroy(hash_index *index) {
    if (index == NULL) {
        return;
    }

    free(index->entries);
    index->entries = NULL;
    index->capacity = 0;
}

int hash_index_find(const hash_index *index, int target, size_t *out_position) {
    if (index == NULL || index->entries == NULL || index->capacity == 0) {
        return 0;
    }

    size_t bucket = hash_int(target) & (index->capacity - 1);

    while (index->entries[bucket].used) {
        if (index->entries[bucket].key == target) {
            if (out_position != NULL) {
                *out_position = index->entries[bucket].value;
            }

            return 1;
        }

        bucket = (bucket + 1) & (index->capacity - 1);
    }

    return 0;
}

int hash_search(const int *values, size_t length, int target) {
    hash_index index = {NULL, 0};
    size_t position = 0;

    if (!hash_index_build(&index, values, length)) {
        return -1;
    }

    int found = hash_index_find(&index, target, &position);
    hash_index_destroy(&index);
    return found ? (int)position : -1;
}
