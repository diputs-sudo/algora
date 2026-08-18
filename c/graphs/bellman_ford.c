#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

int bellman_ford(
    int width,
    int height,
    bool walls[height][width],
    int costs[height][width],
    Cell start,
    Cell target,
    Cell path[]
) {
    const int total = width * height;
    const int infinity = total * 100 + 1;
    int distance[height][width];
    Cell parent[height][width];

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            distance[row][col] = infinity;
            parent[row][col] = (Cell){-1, -1};
        }
    }

    distance[start.row][start.col] = 0;

    for (int pass = 1; pass < total; pass++) {
        bool changed = false;

        for (int row = 0; row < height; row++) {
            for (int col = 0; col < width; col++) {
                if (walls[row][col] || distance[row][col] == infinity) {
                    continue;
                }

                Cell neighbors[4] = {
                    {row - 1, col},
                    {row, col + 1},
                    {row + 1, col},
                    {row, col - 1},
                };

                for (int index = 0; index < 4; index++) {
                    Cell next = neighbors[index];
                    if (next.row < 0 || next.row >= height || next.col < 0 || next.col >= width) {
                        continue;
                    }
                    if (walls[next.row][next.col]) {
                        continue;
                    }

                    int candidate = distance[row][col] + costs[next.row][next.col];
                    if (candidate < distance[next.row][next.col]) {
                        distance[next.row][next.col] = candidate;
                        parent[next.row][next.col] = (Cell){row, col};
                        changed = true;
                    }
                }
            }
        }

        if (!changed) {
            break;
        }
    }

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            if (walls[row][col] || distance[row][col] == infinity) {
                continue;
            }

            Cell neighbors[4] = {
                {row - 1, col},
                {row, col + 1},
                {row + 1, col},
                {row, col - 1},
            };

            for (int index = 0; index < 4; index++) {
                Cell next = neighbors[index];
                if (next.row >= 0 && next.row < height && next.col >= 0 && next.col < width
                    && !walls[next.row][next.col]
                    && distance[row][col] + costs[next.row][next.col] < distance[next.row][next.col]) {
                    return -1;
                }
            }
        }
    }

    if (distance[target.row][target.col] == infinity) {
        return 0;
    }

    int length = 0;
    for (Cell current = target; current.row != -1; current = parent[current.row][current.col]) {
        path[length++] = current;
        if (current.row == start.row && current.col == start.col) {
            break;
        }
    }

    for (int left = 0; left < length / 2; left++) {
        Cell temp = path[left];
        path[left] = path[length - left - 1];
        path[length - left - 1] = temp;
    }
    return length;
}
