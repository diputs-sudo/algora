#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

int dfs_grid(int width, int height, bool walls[height][width], Cell start, Cell target, Cell path[]) {
    bool visited[height][width];
    Cell parent[height][width];
    Cell stack[height * width];
    int top = 0;

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            visited[row][col] = false;
            parent[row][col] = (Cell){-1, -1};
        }
    }

    stack[top++] = start;

    while (top > 0) {
        Cell cell = stack[--top];
        if (visited[cell.row][cell.col]) continue;

        visited[cell.row][cell.col] = true;

        if (cell.row == target.row && cell.col == target.col) {
            int count = 0;
            for (Cell current = target; current.row != -1; current = parent[current.row][current.col]) {
                path[count++] = current;
                if (current.row == start.row && current.col == start.col) break;
            }
            for (int i = 0; i < count / 2; i++) {
                Cell temp = path[i];
                path[i] = path[count - 1 - i];
                path[count - 1 - i] = temp;
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
                parent[next.row][next.col] = cell;
                stack[top++] = next;
            }
        }
    }

    return 0;
}
