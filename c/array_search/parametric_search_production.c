#include <stdbool.h>
#include <stddef.h>

static bool can_ship(const int *weights, size_t length, int days, int capacity) {
    int used_days = 1;
    int current_load = 0;

    for (size_t i = 0; i < length; i++) {
        if (current_load + weights[i] > capacity) {
            used_days++;
            current_load = 0;
            if (used_days > days) {
                return false;
            }
        }
        current_load += weights[i];
    }

    return true;
}

bool minimum_ship_capacity(const int *weights, size_t length, int days, int *result) {
    if (weights == NULL || result == NULL || length == 0 || days <= 0) {
        return false;
    }

    int low = weights[0];
    int high = 0;

    for (size_t i = 0; i < length; i++) {
        if (weights[i] > low) {
            low = weights[i];
        }
        high += weights[i];
    }

    while (low < high) {
        int mid = low + (high - low) / 2;

        if (can_ship(weights, length, days, mid)) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    *result = low;
    return true;
} 
