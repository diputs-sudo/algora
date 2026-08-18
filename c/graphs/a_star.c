#include <stdbool.h>
#include <stdlib.h>

typedef struct {
    int row;
    int col;
} Cell;

int a_star(
    int width,
    int height,
    bool walls[height][width],
    Cell start,
    Cell target,
    Cell path[]
) {
    const int total = width * height;
    const int infinity = total + 1;
    int g_score[height][width];
    Cell parent[height][width];
    bool open[height][width];
    bool closed[height][width];

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            g_score[row][col] = infinity;
            parent[row][col] = (Cell){-1, -1};
            open[row][col] = false;
            closed[row][col] = false;
        }
    }

    g_score[start.row][start.col] = 0;
    open[start.row][start.col] = true;

    while (true) {
        Cell current = {-1, -1};
        int best_f = infinity;

        for (int row = 0; row < height; row++) {
            for (int col = 0; col < width; col++) {
                if (!open[row][col] || closed[row][col]) {
                    continue;
                }

                int h = abs(row - target.row) + abs(col - target.col);
                if (g_score[row][col] + h < best_f) {
                    best_f = g_score[row][col] + h;
                    current = (Cell){row, col};
                }
            }
        }

        if (current.row == -1) {
            return 0;
        }

        open[current.row][current.col] = false;
        closed[current.row][current.col] = true;
        if (current.row == target.row && current.col == target.col) {
            int length = 0;
            for (Cell step = target; step.row != -1; step = parent[step.row][step.col]) {
                path[length++] = step;
                if (step.row == start.row && step.col == start.col) {
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
            if (walls[next.row][next.col] || closed[next.row][next.col]) {
                continue;
            }

            int next_g = g_score[current.row][current.col] + 1;
            if (next_g < g_score[next.row][next.col]) {
                g_score[next.row][next.col] = next_g;
                parent[next.row][next.col] = current;
                open[next.row][next.col] = true;
            }
        }
    }
}
