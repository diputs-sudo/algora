#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

static int cell_id(int width, Cell cell) {
    return cell.row * width + cell.col;
}

int bidirectional_bfs(
    int width,
    int height,
    bool walls[height][width],
    Cell start,
    Cell target,
    Cell path[]
) {
    if (width <= 0 || height <= 0) return -1;
    if (start.row < 0 || start.row >= height || start.col < 0 || start.col >= width
        || target.row < 0 || target.row >= height || target.col < 0 || target.col >= width) return -1;
    if (walls[start.row][start.col] || walls[target.row][target.col]) return 0;
    if (start.row == target.row && start.col == target.col) {
        path[0] = start;
        return 1;
    }

    const int total = width * height;
    bool seen[2][total];
    int parent[2][total];
    int frontier[2][total];
    int frontier_count[2] = {1, 1};
    int next[total];
    int next_count;
    int start_id = cell_id(width, start);
    int target_id = cell_id(width, target);

    for (int side = 0; side < 2; side++) {
        for (int id = 0; id < total; id++) {
            seen[side][id] = false;
            parent[side][id] = -1;
        }
    }
    frontier[0][0] = start_id;
    frontier[1][0] = target_id;
    seen[0][start_id] = true;
    seen[1][target_id] = true;

    int meeting = -1;
    while (frontier_count[0] > 0 && frontier_count[1] > 0 && meeting == -1) {
        int side = frontier_count[0] <= frontier_count[1] ? 0 : 1;
        int other = 1 - side;
        next_count = 0;

        for (int index = 0; index < frontier_count[side] && meeting == -1; index++) {
            int current_id = frontier[side][index];
            Cell current = {current_id / width, current_id % width};
            Cell neighbors[4] = {
                {current.row - 1, current.col}, {current.row, current.col + 1},
                {current.row + 1, current.col}, {current.row, current.col - 1}
            };

            for (int neighbor_index = 0; neighbor_index < 4; neighbor_index++) {
                Cell neighbor = neighbors[neighbor_index];
                if (neighbor.row < 0 || neighbor.row >= height || neighbor.col < 0 || neighbor.col >= width) continue;
                int next_id = cell_id(width, neighbor);
                if (walls[neighbor.row][neighbor.col] || seen[side][next_id]) continue;

                seen[side][next_id] = true;
                parent[side][next_id] = current_id;
                if (seen[other][next_id]) {
                    meeting = next_id;
                    break;
                }
                next[next_count++] = next_id;
            }
        }

        if (meeting == -1) {
            for (int index = 0; index < next_count; index++) frontier[side][index] = next[index];
            frontier_count[side] = next_count;
        }
    }

    if (meeting == -1) return 0;

    int left[total];
    int left_count = 0;
    for (int id = meeting; id != -1; id = parent[0][id]) left[left_count++] = id;
    for (int left_index = 0; left_index < left_count / 2; left_index++) {
        int temp = left[left_index];
        left[left_index] = left[left_count - left_index - 1];
        left[left_count - left_index - 1] = temp;
    }

    int length = 0;
    for (int index = 0; index < left_count; index++) path[length++] = (Cell){left[index] / width, left[index] % width};
    for (int id = parent[1][meeting]; id != -1; id = parent[1][id]) path[length++] = (Cell){id / width, id % width};
    return length;
}
