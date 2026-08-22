#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <optional>
#include <queue>
#include <stdexcept>
#include <string>
#include <tuple>
#include <utility>
#include <vector>

class DStarLiteProduction final {
public:
    struct Cell {
        int row;
        int col;

        bool operator==(const Cell& other) const {
            return row == other.row && col == other.col;
        }
    };

    enum class Heuristic {
        Manhattan,
        Euclidean,
        Chebyshev,
        Octile,
    };

    DStarLiteProduction(
        const std::vector<std::vector<bool>>& walls,
        Cell start,
        Cell goal,
        Heuristic heuristic = Heuristic::Manhattan
    )
        : rows_(static_cast<int>(walls.size())),
          cols_(walls.empty() ? 0 : static_cast<int>(walls.front().size())),
          start_(start),
          goal_(goal),
          heuristic_(heuristic) {
        validateGrid(walls);
        validateCell(start_, "start");
        validateCell(goal_, "goal");

        blocked_.assign(cellCount(), false);
        for (int row = 0; row < rows_; ++row) {
            for (int col = 0; col < cols_; ++col) {
                blocked_[id({row, col})] = walls[row][col];
            }
        }

        if (isBlocked(id(start_)) || isBlocked(id(goal_))) {
            throw std::invalid_argument("start and goal must be traversable");
        }

        g_.assign(cellCount(), infinity());
        rhs_.assign(cellCount(), infinity());
        open_keys_.assign(cellCount(), std::nullopt);
        rhs_[id(goal_)] = 0.0;
        push(id(goal_));
    }

    std::vector<Cell> replan() {
        computeShortestPath();
        return extractPath();
    }

    bool setBlocked(Cell cell, bool blocked) {
        validateCell(cell, "cell");
        if (cell == start_ || cell == goal_) {
            throw std::invalid_argument("start and goal cannot be changed");
        }

        int cell_id = id(cell);
        if (isBlocked(cell_id) == blocked) {
            return false;
        }

        blocked_[cell_id] = blocked;
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
        return true;
    }

    void moveStart(Cell new_start) {
        validateCell(new_start, "new start");
        if (isBlocked(id(new_start))) {
            throw std::invalid_argument("new start must be traversable");
        }

        km_ += estimate(start_, new_start);
        start_ = new_start;
    }

    Cell start() const {
        return start_;
    }

    Cell goal() const {
        return goal_;
    }

private:
    using Key = std::pair<double, double>;
    using Entry = std::tuple<double, double, int>;

    int rows_;
    int cols_;
    Cell start_;
    Cell goal_;
    Heuristic heuristic_;
    double km_ = 0.0;
    std::vector<bool> blocked_;
    std::vector<double> g_;
    std::vector<double> rhs_;
    std::vector<std::optional<Key>> open_keys_;
    std::priority_queue<Entry, std::vector<Entry>, std::greater<>> queue_;

    static double infinity() {
        return std::numeric_limits<double>::infinity();
    }

    int cellCount() const {
        return rows_ * cols_;
    }

    void validateGrid(const std::vector<std::vector<bool>>& walls) const {
        if (rows_ <= 0 || cols_ <= 0) {
            throw std::invalid_argument("grid must be non-empty");
        }
        for (const auto& row : walls) {
            if (static_cast<int>(row.size()) != cols_) {
                throw std::invalid_argument("grid must be rectangular");
            }
        }
    }

    void validateCell(Cell cell, const char* name) const {
        if (cell.row < 0 || cell.row >= rows_ || cell.col < 0 || cell.col >= cols_) {
            throw std::out_of_range(std::string(name) + " must be inside the grid");
        }
    }

    int id(Cell cell) const {
        return cell.row * cols_ + cell.col;
    }

    Cell cell(int cell_id) const {
        return {cell_id / cols_, cell_id % cols_};
    }

    bool isBlocked(int cell_id) const {
        return blocked_[cell_id];
    }

    std::vector<int> adjacent(int cell_id) const {
        Cell current = cell(cell_id);
        std::vector<int> result;
        result.reserve(4);
        if (current.row > 0) {
            result.push_back(cell_id - cols_);
        }
        if (current.col + 1 < cols_) {
            result.push_back(cell_id + 1);
        }
        if (current.row + 1 < rows_) {
            result.push_back(cell_id + cols_);
        }
        if (current.col > 0) {
            result.push_back(cell_id - 1);
        }
        return result;
    }

    std::vector<int> neighbors(int cell_id) const {
        std::vector<int> result;
        result.reserve(4);
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
            auto entry = pop();
            if (!entry) {
                return;
            }

            const Key old_key = entry->first;
            const int current = entry->second;
            const Key new_key = calculateKey(current);
            if (keyLess(old_key, new_key)) {
                push(current);
                continue;
            }

            if (g_[current] > rhs_[current]) {
                g_[current] = rhs_[current];
                for (int predecessor : neighbors(current)) {
                    updateVertex(predecessor);
                }
                continue;
            }

            g_[current] = infinity();
            updateVertex(current);
            for (int predecessor : neighbors(current)) {
                updateVertex(predecessor);
            }
        }
    }

    std::vector<Cell> extractPath() const {
        int current = id(start_);
        if (!std::isfinite(g_[current])) {
            return {};
        }

        std::vector<Cell> path{start_};
        path.reserve(static_cast<std::size_t>(cellCount()));
        for (int steps = 0; steps < cellCount(); ++steps) {
            if (current == id(goal_)) {
                return path;
            }

            std::vector<int> successors = neighbors(current);
            if (successors.empty()) {
                return {};
            }

            int best = successors.front();
            for (int candidate : successors) {
                if (std::pair{1.0 + g_[candidate], candidate} < std::pair{1.0 + g_[best], best}) {
                    best = candidate;
                }
            }
            if (!std::isfinite(g_[best])) {
                return {};
            }

            current = best;
            path.push_back(cell(current));
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
            for (int successor : neighbors(cell_id)) {
                best = std::min(best, 1.0 + g_[successor]);
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
            const auto [first, second, cell_id] = queue_.top();
            if (open_keys_[cell_id] == Key{first, second}) {
                return {first, second};
            }
            queue_.pop();
        }
        return {infinity(), infinity()};
    }

    std::optional<std::pair<Key, int>> pop() {
        while (!queue_.empty()) {
            const auto [first, second, cell_id] = queue_.top();
            queue_.pop();
            if (open_keys_[cell_id] == Key{first, second}) {
                open_keys_[cell_id].reset();
                return std::pair{Key{first, second}, cell_id};
            }
        }
        return std::nullopt;
    }

    Key calculateKey(int cell_id) const {
        const double value = std::min(g_[cell_id], rhs_[cell_id]);
        return {value + estimate(start_, cell(cell_id)) + km_, value};
    }

    double estimate(Cell left, Cell right) const {
        const int rows = std::abs(left.row - right.row);
        const int cols = std::abs(left.col - right.col);
        switch (heuristic_) {
            case Heuristic::Euclidean:
                return std::hypot(rows, cols);
            case Heuristic::Chebyshev:
                return std::max(rows, cols);
            case Heuristic::Octile:
                return std::max(rows, cols) + (std::sqrt(2.0) - 1.0) * std::min(rows, cols);
            case Heuristic::Manhattan:
                return rows + cols;
        }
        return rows + cols;
    }

    static bool keyLess(Key left, Key right) {
        return left < right;
    }
};
