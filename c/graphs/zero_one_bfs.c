#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

int zero_one_bfs(
    int width,
    int height,
    bool walls[height][width],
    int weights[height][width],
    Cell start,
    Cell target,
    Cell path[]
) {
    const int total = width * height;
    const int infinity = total + 1;
    int distance[height][width];
    Cell parent[height][width];
    Cell deque[total * 2];
    int front = total;
    int back = total + 1;

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            distance[row][col] = infinity;
            parent[row][col] = (Cell){-1, -1};
        }
    }

    distance[start.row][start.col] = 0;
    deque[back++] = start;

    while (front < back) {
        Cell current = deque[front++];

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
            if (walls[next.row][next.col]) {
                continue;
            }

            int weight = weights[next.row][next.col];
            int next_distance = distance[current.row][current.col] + weight;
            if (next_distance >= distance[next.row][next.col]) {
                continue;
            }

            distance[next.row][next.col] = next_distance;
            parent[next.row][next.col] = current;
            if (weight == 0) {
                deque[--front] = next;
            } else {
                deque[back++] = next;
            }
        }
    }

    return 0;
}
