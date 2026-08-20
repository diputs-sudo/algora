#include <algorithm>
#include <stdexcept>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

std::vector<Cell> bidirectionalBfsPath(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    Cell start,
    Cell target
) {
    if (width <= 0 || height <= 0) throw std::invalid_argument("grid dimensions must be positive");
    if (static_cast<int>(walls.size()) != height) throw std::invalid_argument("wall grid height must match height");
    for (const auto& row : walls) {
        if (static_cast<int>(row.size()) != width) throw std::invalid_argument("wall grid width must match width");
    }

    auto inside = [width, height](Cell cell) {
        return cell.first >= 0 && cell.first < height && cell.second >= 0 && cell.second < width;
    };
    if (!inside(start) || !inside(target)) throw std::out_of_range("start and target must be inside the grid");
    if (walls[start.first][start.second] || walls[target.first][target.second]) return {};
    if (start == target) return {start};

    auto id = [width](Cell cell) { return cell.first * width + cell.second; };
    const int total = width * height;
    std::vector<std::vector<int>> frontier(2);
    frontier[0] = {id(start)};
    frontier[1] = {id(target)};
    std::vector<std::vector<bool>> seen(2, std::vector<bool>(total, false));
    std::vector<std::vector<int>> parent(2, std::vector<int>(total, -1));
    seen[0][id(start)] = true;
    seen[1][id(target)] = true;

    while (!frontier[0].empty() && !frontier[1].empty()) {
        const int side = frontier[0].size() <= frontier[1].size() ? 0 : 1;
        const int other = 1 - side;
        std::vector<int> next;

        for (int current : frontier[side]) {
            const int row = current / width;
            const int col = current % width;
            const int moves[4][2] = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};

            for (const auto& move : moves) {
                const int nextRow = row + move[0];
                const int nextCol = col + move[1];
                if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) continue;

                const int nextId = nextRow * width + nextCol;
                if (walls[nextRow][nextCol] || seen[side][nextId]) continue;
                seen[side][nextId] = true;
                parent[side][nextId] = current;

                if (seen[other][nextId]) {
                    std::vector<int> path;
                    for (int step = nextId; step != -1; step = parent[0][step]) {
                        path.push_back(step);
                        if (step == id(start)) break;
                    }
                    std::reverse(path.begin(), path.end());
                    for (int step = parent[1][nextId]; step != -1; step = parent[1][step]) path.push_back(step);

                    std::vector<Cell> result;
                    for (int step : path) result.push_back({step / width, step % width});
                    return result;
                }
                next.push_back(nextId);
            }
        }
        frontier[side] = std::move(next);
    }
    return {};
}

