#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

int bfs(
    int width,
    int height,
    bool walls[height][width],
    Cell start,
    Cell target,
    Cell path[]
) {
    bool visited[height][width];
    Cell parent[height][width];
    Cell queue[height * width];
    int front = 0;
    int back = 0;

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            visited[row][col] = false;
            parent[row][col] = (Cell){-1, -1};
        }
    }

    queue[back++] = start;
    visited[start.row][start.col] = true;

    while (front < back) {
        Cell current = queue[front++];
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
            if (walls[next.row][next.col] || visited[next.row][next.col]) {
                continue;
            }

            visited[next.row][next.col] = true;
            parent[next.row][next.col] = current;
            queue[back++] = next;
        }
    }

    return 0;
}
