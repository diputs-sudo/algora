#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

int bfs_path(
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

    bool visited[height][width];
    int parent[height][width];
    int queue[height * width];
    int front = 0;
    int back = 0;

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            visited[row][col] = false;
            parent[row][col] = -1;
        }
    }

    int start_id = start.row * width + start.col;
    int target_id = target.row * width + target.col;
    queue[back++] = start_id;
    visited[start.row][start.col] = true;

    while (front < back) {
        int current_id = queue[front++];
        if (current_id == target_id) {
            int length = 0;
            for (int step_id = target_id; step_id != -1; step_id = parent[step_id / width][step_id % width]) {
                path[length++] = (Cell){step_id / width, step_id % width};
            }

            for (int left = 0; left < length / 2; left++) {
                Cell temp = path[left];
                path[left] = path[length - left - 1];
                path[length - left - 1] = temp;
            }
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
            if (next.row < 0 || next.row >= height || next.col < 0 || next.col >= width
                || walls[next.row][next.col] || visited[next.row][next.col]) {
                continue;
            }

            int next_id = next.row * width + next.col;
            visited[next.row][next.col] = true;
            parent[next.row][next.col] = current_id;
            queue[back++] = next_id;
        }
    }

    return 0;
}
