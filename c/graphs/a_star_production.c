#include <stdbool.h>
#include <stdlib.h>

typedef struct {
    int row;
    int col;
} Cell;

int a_star_path(
    int width,
    int height,
    const bool walls[height][width],
    Cell start,
    Cell target,
    Cell path[]
) {
    if (width <= 0 || height <= 0) {
        return -1;
    }

    if (start.row < 0 || start.row >= height || start.col < 0 || start.col >= width
        || target.row < 0 || target.row >= height || target.col < 0 || target.col >= width) {
        return -1;
    }

    if (walls[start.row][start.col] || walls[target.row][target.col]) {
        return 0;
    }

    const int total = width * height;
    const int infinity = total + 1;
    int *distance = malloc((size_t)total * sizeof(*distance));
    int *parent = malloc((size_t)total * sizeof(*parent));
    bool *closed = calloc((size_t)total, sizeof(*closed));
    bool *open = calloc((size_t)total, sizeof(*open));

    if (!distance || !parent || !closed || !open) {
        free(distance);
        free(parent);
        free(closed);
        free(open);
        return -1;
    }

    for (int index = 0; index < total; index++) {
        distance[index] = infinity;
        parent[index] = -1;
    }

    int start_id = start.row * width + start.col;
    int target_id = target.row * width + target.col;
    distance[start_id] = 0;
    open[start_id] = true;

    while (true) {
        int current_id = -1;
        int best_f = infinity;

        for (int index = 0; index < total; index++) {
            if (!open[index] || closed[index]) {
                continue;
            }

            int row = index / width;
            int col = index % width;
            int h = abs(row - target.row) + abs(col - target.col);
            if (distance[index] + h < best_f) {
                best_f = distance[index] + h;
                current_id = index;
            }
        }

        if (current_id == -1) {
            free(distance);
            free(parent);
            free(closed);
            free(open);
            return 0;
        }

        open[current_id] = false;
        closed[current_id] = true;
        if (current_id == target_id) {
            int length = 0;
            for (int step_id = target_id; step_id != -1; step_id = parent[step_id]) {
                path[length++] = (Cell){step_id / width, step_id % width};
            }
            for (int left = 0; left < length / 2; left++) {
                Cell temp = path[left];
                path[left] = path[length - left - 1];
                path[length - left - 1] = temp;
            }
            free(distance);
            free(parent);
            free(closed);
            free(open);
            return length;
        }

        Cell current = {current_id / width, current_id % width};
        Cell neighbors[4] = {
            {current.row - 1, current.col},
            {current.row, current.col + 1},
            {current.row + 1, current.col},
            {current.row, current.col - 1},
        };

        for (int index = 0; index < 4; index++) {
            Cell next = neighbors[index];
            if (next.row < 0 || next.row >= height || next.col < 0 || next.col >= width) {
                continue;
            }

            int next_id = next.row * width + next.col;
            if (walls[next.row][next.col] || closed[next_id]) {
                continue;
            }

            int next_distance = distance[current_id] + 1;
            if (next_distance < distance[next_id]) {
                distance[next_id] = next_distance;
                parent[next_id] = current_id;
                open[next_id] = true;
            }
        }
    }
}
