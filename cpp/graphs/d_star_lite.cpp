#include <cmath>
#include <functional>
#include <limits>
#include <optional>
#include <queue>
#include <stdexcept>
#include <tuple>
#include <utility>
#include <vector>

struct Point {
    int row;
    int col;

    bool operator==(const Point& other) const {
        return row == other.row && col == other.col;
    }
};

enum class Heuristic {
    Manhattan,
    Euclidean,
    Chebyshev,
    Octile,
};

class DStarLite {
public:
    DStarLite(
        std::vector<std::vector<int>> grid,
        Point start,
        Point goal,
        Heuristic heuristic = Heuristic::Manhattan
    )
        : grid_(std::move(grid)),
          rows_(static_cast<int>(grid_.size())),
          cols_(static_cast<int>(grid_[0].size())),
          start_(start),
          goal_(goal),
          heuristic_(heuristic),
          g_(rows_ * cols_, infinity()),
          rhs_(rows_ * cols_, infinity()),
          open_keys_(rows_ * cols_) {
        rhs_[id(goal_)] = 0.0;
        push(id(goal_));
    }

    std::vector<Point> replan() {
        computeShortestPath();
        return path();
    }

    void setBlocked(Point cell, bool blocked) {
        if (cell == start_ || cell == goal_) {
            throw std::invalid_argument("start and goal cannot be blocked");
        }

        int cell_id = id(cell);
        if (isBlocked(cell_id) == blocked) {
            return;
        }

        grid_[cell.row][cell.col] = blocked ? 1 : 0;
        if (blocked) {
            g_[cell_id] = infinity();
            rhs_[cell_id] = infinity();
            open_keys_[cell_id].reset();
        } else {
            updateVertex(cell_id);
        }

        for (int neighbor : adjacent(cell_id)) {
            if (!isBlocked(neighbor)) {
                updateVertex(neighbor);
            }
        }
    }

    void moveStart(Point new_start) {
        km_ += estimate(start_, new_start);
        start_ = new_start;
    }

private:
    using Key = std::pair<double, double>;
    using Entry = std::tuple<double, double, int>;

    std::vector<std::vector<int>> grid_;
    int rows_;
    int cols_;
    Point start_;
    Point goal_;
    Heuristic heuristic_;
    double km_ = 0.0;
    std::vector<double> g_;
    std::vector<double> rhs_;
    std::vector<std::optional<Key>> open_keys_;
    std::priority_queue<Entry, std::vector<Entry>, std::greater<>> queue_;

    static double infinity() {
        return std::numeric_limits<double>::infinity();
    }

    int id(Point cell) const {
        return cell.row * cols_ + cell.col;
    }

    Point point(int cell_id) const {
        return {cell_id / cols_, cell_id % cols_};
    }

    bool isBlocked(int cell_id) const {
        Point cell = point(cell_id);
        return grid_[cell.row][cell.col] != 0;
    }

    std::vector<int> adjacent(int cell_id) const {
        Point cell = point(cell_id);
        std::vector<int> result;
        if (cell.row > 0) {
            result.push_back(cell_id - cols_);
        }
        if (cell.col + 1 < cols_) {
            result.push_back(cell_id + 1);
        }
        if (cell.row + 1 < rows_) {
            result.push_back(cell_id + cols_);
        }
        if (cell.col > 0) {
            result.push_back(cell_id - 1);
        }
        return result;
    }

    std::vector<int> neighbors(int cell_id) const {
        std::vector<int> result;
        for (int neighbor : adjacent(cell_id)) {
            if (!isBlocked(neighbor)) {
                result.push_back(neighbor);
            }
        }
        return result;
    }

    void computeShortestPath() {
        int start_id = id(start_);
        while (keyLess(topKey(), calculateKey(start_id)) || rhs_[start_id] != g_[start_id]) {
            std::optional<std::pair<Key, int>> entry = pop();
            if (!entry) {
                return;
            }

            Key old_key = entry->first;
            int current = entry->second;
            Key new_key = calculateKey(current);
            if (keyLess(old_key, new_key)) {
                push(current);
            } else if (g_[current] > rhs_[current]) {
                g_[current] = rhs_[current];
                for (int predecessor : neighbors(current)) {
                    updateVertex(predecessor);
                }
            } else {
                g_[current] = infinity();
                updateVertex(current);
                for (int predecessor : neighbors(current)) {
                    updateVertex(predecessor);
                }
            }
        }
    }

    std::vector<Point> path() const {
        int current = id(start_);
        if (!std::isfinite(g_[current])) {
            return {};
        }

        std::vector<Point> result{start_};
        for (int steps = 0; steps < rows_ * cols_; ++steps) {
            if (current == id(goal_)) {
                return result;
            }

            std::vector<int> choices = neighbors(current);
            if (choices.empty()) {
                return {};
            }

            int best = choices.front();
            for (int candidate : choices) {
                if (std::pair{1.0 + g_[candidate], candidate} < std::pair{1.0 + g_[best], best}) {
                    best = candidate;
                }
            }
            if (!std::isfinite(g_[best])) {
                return {};
            }

            current = best;
            result.push_back(point(current));
        }
        return {};
    }

    void updateVertex(int cell_id) {
        if (isBlocked(cell_id)) {
            open_keys_[cell_id].reset();
            return;
        }

        if (cell_id != id(goal_)) {
            double best = infinity();
            for (int neighbor : neighbors(cell_id)) {
                best = std::min(best, 1.0 + g_[neighbor]);
            }
            rhs_[cell_id] = best;
        }

        open_keys_[cell_id].reset();
        if (g_[cell_id] != rhs_[cell_id]) {
            push(cell_id);
        }
    }

    void push(int cell_id) {
        Key key = calculateKey(cell_id);
        open_keys_[cell_id] = key;
        queue_.push({key.first, key.second, cell_id});
    }

    Key topKey() {
        while (!queue_.empty()) {
            auto [first, second, cell_id] = queue_.top();
            if (open_keys_[cell_id] == Key{first, second}) {
                return {first, second};
            }
            queue_.pop();
        }
        return {infinity(), infinity()};
    }

    std::optional<std::pair<Key, int>> pop() {
        while (!queue_.empty()) {
            auto [first, second, cell_id] = queue_.top();
            queue_.pop();
            if (open_keys_[cell_id] == Key{first, second}) {
                open_keys_[cell_id].reset();
                return std::pair{Key{first, second}, cell_id};
            }
        }
        return std::nullopt;
    }

    Key calculateKey(int cell_id) const {
        double value = std::min(g_[cell_id], rhs_[cell_id]);
        return {value + estimate(start_, point(cell_id)) + km_, value};
    }

    double estimate(Point left, Point right) const {
        int rows = std::abs(left.row - right.row);
        int cols = std::abs(left.col - right.col);
        if (heuristic_ == Heuristic::Euclidean) {
            return std::hypot(rows, cols);
        }
        if (heuristic_ == Heuristic::Chebyshev) {
            return std::max(rows, cols);
        }
        if (heuristic_ == Heuristic::Octile) {
            return std::max(rows, cols) + (std::sqrt(2.0) - 1.0) * std::min(rows, cols);
        }
        return rows + cols;
    }

    static bool keyLess(Key left, Key right) {
        return left < right;
    }
};
