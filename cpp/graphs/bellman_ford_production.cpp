#include <algorithm>
#include <limits>
#include <stdexcept>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

std::vector<Cell> bellmanFordPath(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    const std::vector<std::vector<int>>& costs,
    Cell start,
    Cell target
) {
    if (width <= 0 || height <= 0) {
        throw std::invalid_argument("grid dimensions must be positive");
    }

    auto inside = [width, height](Cell cell) {
        return cell.first >= 0 && cell.first < height
            && cell.second >= 0 && cell.second < width;
    };

    if (!inside(start) || !inside(target)) {
        throw std::out_of_range("start and target must be inside the grid");
    }

    if (walls[start.first][start.second] || walls[target.first][target.second]) {
        return {};
    }

    const int total = width * height;
    const int infinity = std::numeric_limits<int>::max();
    std::vector<int> distance(total, infinity);
    std::vector<int> parent(total, -1);

    auto id = [width](Cell cell) {
        return cell.first * width + cell.second;
    };

    distance[id(start)] = 0;

    for (int pass = 1; pass < total; pass++) {
        bool changed = false;

        for (int row = 0; row < height; row++) {
            for (int col = 0; col < width; col++) {
                int currentId = row * width + col;
                if (walls[row][col] || distance[currentId] == infinity) {
                    continue;
                }

                const std::vector<Cell> neighbors = {
                    {row - 1, col},
                    {row, col + 1},
                    {row + 1, col},
                    {row, col - 1},
                };

                for (Cell next : neighbors) {
                    if (!inside(next)) {
                        continue;
                    }

                    int nextId = id(next);
                    if (walls[next.first][next.second]) {
                        continue;
                    }

                    int candidate = distance[currentId] + costs[next.first][next.second];
                    if (candidate < distance[nextId]) {
                        distance[nextId] = candidate;
                        parent[nextId] = currentId;
                        changed = true;
                    }
                }
            }
        }

        if (!changed) {
            break;
        }
    }

    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            int currentId = row * width + col;
            if (walls[row][col] || distance[currentId] == infinity) {
                continue;
            }

            const std::vector<Cell> neighbors = {
                {row - 1, col},
                {row, col + 1},
                {row + 1, col},
                {row, col - 1},
            };

            for (Cell next : neighbors) {
                if (inside(next) && !walls[next.first][next.second]
                    && distance[currentId] + costs[next.first][next.second] < distance[id(next)]) {
                    throw std::runtime_error("reachable negative cycle");
                }
            }
        }
    }

    std::vector<Cell> path;
    for (int currentId = id(target); currentId != -1; currentId = parent[currentId]) {
        path.push_back({currentId / width, currentId % width});
    }
    if (path.empty() || path.back() != start) {
        return {};
    }

    std::reverse(path.begin(), path.end());
    return path;
}
