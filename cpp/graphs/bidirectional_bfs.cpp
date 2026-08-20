#include <algorithm>
#include <queue>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

std::vector<Cell> bidirectionalBfs(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    Cell start,
    Cell target
) {
    auto inside = [width, height](Cell cell) {
        return cell.first >= 0 && cell.first < height
            && cell.second >= 0 && cell.second < width;
    };
    if (!inside(start) || !inside(target) || walls[start.first][start.second] || walls[target.first][target.second]) return {};
    if (start == target) return {start};

    auto id = [width](Cell cell) { return cell.first * width + cell.second; };
    const int total = width * height;
    std::vector<std::vector<int>> queues(2);
    queues[0].push_back(id(start));
    queues[1].push_back(id(target));
    std::vector<std::vector<bool>> seen(2, std::vector<bool>(total, false));
    std::vector<std::vector<int>> parent(2, std::vector<int>(total, -1));
    seen[0][id(start)] = true;
    seen[1][id(target)] = true;

    auto neighbors = [&](int current) {
        Cell cell{current / width, current % width};
        return std::vector<Cell>{
            {cell.first - 1, cell.second}, {cell.first, cell.second + 1},
            {cell.first + 1, cell.second}, {cell.first, cell.second - 1}
        };
    };

    while (!queues[0].empty() && !queues[1].empty()) {
        int side = queues[0].size() <= queues[1].size() ? 0 : 1;
        int other = 1 - side;
        std::vector<int> next;

        for (int current : queues[side]) {
            for (Cell neighbor : neighbors(current)) {
                if (!inside(neighbor)) continue;
                int next_id = id(neighbor);
                if (walls[neighbor.first][neighbor.second] || seen[side][next_id]) continue;
                seen[side][next_id] = true;
                parent[side][next_id] = current;

                if (seen[other][next_id]) {
                    std::vector<int> left;
                    for (int step = next_id; step != -1; step = parent[0][step]) {
                        left.push_back(step);
                        if (step == id(start)) break;
                    }
                    std::reverse(left.begin(), left.end());

                    std::vector<int> right;
                    for (int step = parent[1][next_id]; step != -1; step = parent[1][step]) right.push_back(step);

                    std::vector<Cell> path;
                    for (int step : left) path.push_back({step / width, step % width});
                    for (int step : right) path.push_back({step / width, step % width});
                    return path;
                }
                next.push_back(next_id);
            }
        }
        queues[side] = std::move(next);
    }
    return {};
}

