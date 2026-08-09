#include <stdbool.h>
#include <stddef.h>

bool can_ship(const int *weights, size_t length, int days, int capacity) {
    int used_days = 1;
    int current_load = 0;

    for (size_t i = 0; i < length; i++) {
        if (current_load + weights[i] > capacity) {
            used_days++;
            current_load = 0;
        }
        current_load += weights[i];
    }

    return used_days <= days;
}

int parametric_search(const int *weights, size_t length, int days) {
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

    return low;
}
