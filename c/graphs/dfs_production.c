#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

int dfs_grid_path(int width, int height, bool walls[height][width], Cell start, Cell target, Cell path[]) {
    if (width <= 0 || height <= 0) return -1;
    if (start.row < 0 || start.row >= height || start.col < 0 || start.col >= width) return -1;
    if (target.row < 0 || target.row >= height || target.col < 0 || target.col >= width) return -1;
    if (walls[start.row][start.col] || walls[target.row][target.col]) return 0;

    bool visited[height][width];
    int parent[height][width];
    int stack[height * width];
    int top = 0;

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            visited[row][col] = false;
            parent[row][col] = -1;
        }
    }

    stack[top++] = start.row * width + start.col;
    visited[start.row][start.col] = true;

    while (top > 0) {
        int cell_id = stack[--top];
        Cell cell = {cell_id / width, cell_id % width};

        if (cell.row == target.row && cell.col == target.col) {
            int count = 0;
            for (Cell current = target; current.row != -1;) {
                path[count++] = current;
                if (current.row == start.row && current.col == start.col) break;
                int parent_id = parent[current.row][current.col];
                current = (Cell){parent_id / width, parent_id % width};
            }
            for (int i = 0; i < count / 2; i++) {
                Cell temp = path[i];
                path[i] = path[count - 1 - i];
                path[count - 1 -i] = temp;
            }
            return count;
        }

        Cell neighbors[4] = {
            {cell.row - 1, cell.col},
            {cell.row, cell.col + 1},
            {cell.row + 1, cell.col},
            {cell.row, cell.col - 1}
        };

        for (int i = 0; i < 4; i++) {
            Cell next = neighbors[i];
            if (next.row >= 0 && next.row < height && next.col >= 0 && next.col < width
                && !walls[next.row][next.col] && !visited[next.row][next.col]) {
                if (!visited[next.row][next.col]) {
                    visited[next.row][next.col] = true;
                    parent[next.row][next.col] = cell_id;
                    stack[top++] = next.row * width + next.col;
                }
            }
        }
    }

    return 0;
}
