#include <stdbool.h>

typedef struct {
    int row;
    int col;
} Cell;

int bidirectional_bfs_path(
    int width,
    int height,
    const bool walls[height][width],
    Cell start,
    Cell target,
    Cell path[]
) {
    if (width <= 0 || height <= 0) return -1;
    if (start.row < 0 || start.row >= height || start.col < 0 || start.col >= width
        || target.row < 0 || target.row >= height || target.col < 0 || target.col >= width) return -1;
    if (walls[start.row][start.col] || walls[target.row][target.col]) return 0;

    bool seen[2][height * width];
    int parent[2][height * width];
    int frontier[2][height * width];
    int frontier_count[2] = {1, 1};
    int next[height * width];

    for (int side = 0; side < 2; side++) {
        for (int id = 0; id < width * height; id++) {
            seen[side][id] = false;
            parent[side][id] = -1;
        }
    }

    int start_id = start.row * width + start.col;
    int target_id = target.row * width + target.col;
    frontier[0][0] = start_id;
    frontier[1][0] = target_id;
    seen[0][start_id] = true;
    seen[1][target_id] = true;

    if (start_id == target_id) {
        path[0] = start;
        return 1;
    }

    int meeting = -1;
    while (frontier_count[0] > 0 && frontier_count[1] > 0 && meeting == -1) {
        int side = frontier_count[0] <= frontier_count[1] ? 0 : 1;
        int other = 1 - side;
        int next_count = 0;

        for (int index = 0; index < frontier_count[side] && meeting == -1; index++) {
            int current = frontier[side][index];
            int row = current / width;
            int col = current % width;
            const int moves[4][2] = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};

            for (int move_index = 0; move_index < 4; move_index++) {
                int next_row = row + moves[move_index][0];
                int next_col = col + moves[move_index][1];
                if (next_row < 0 || next_row >= height || next_col < 0 || next_col >= width) continue;

                int next_id = next_row * width + next_col;
                if (walls[next_row][next_col] || seen[side][next_id]) continue;
                seen[side][next_id] = true;
                parent[side][next_id] = current;

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

    int reversed[width * height];
    int left_count = 0;
    for (int id = meeting; id != -1; id = parent[0][id]) reversed[left_count++] = id;
    int length = 0;
    for (int index = left_count - 1; index >= 0; index--) path[length++] = (Cell){reversed[index] / width, reversed[index] % width};
    for (int id = parent[1][meeting]; id != -1; id = parent[1][id]) path[length++] = (Cell){id / width, id % width};
    return length;
}
