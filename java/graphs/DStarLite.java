import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

public final class DStarLite {
    public record Cell(int row, int col) {}

    public enum Heuristic {
        MANHATTAN,
        EUCLIDEAN,
        CHEBYSHEV,
        OCTILE
    }

    private record Key(double first, double second) implements Comparable<Key> {
        @Override
        public int compareTo(Key other) {
            int firstComparison = Double.compare(first, other.first);
            return firstComparison != 0 ? firstComparison : Double.compare(second, other.second);
        }
    }

    private record Entry(Key key, int id) implements Comparable<Entry> {
        @Override
        public int compareTo(Entry other) {
            int keyComparison = key.compareTo(other.key);
            return keyComparison != 0 ? keyComparison : Integer.compare(id, other.id);
        }
    }

    private final int rows;
    private final int cols;
    private final boolean[] blocked;
    private final double[] g;
    private final double[] rhs;
    private final Key[] openKeys;
    private final PriorityQueue<Entry> queue = new PriorityQueue<>();
    private final Cell goal;
    private final Heuristic heuristic;
    private Cell start;
    private double km;

    public DStarLite(int[][] grid, Cell start, Cell goal) {
        this(grid, start, goal, Heuristic.MANHATTAN);
    }

    public DStarLite(int[][] grid, Cell start, Cell goal, Heuristic heuristic) {
        rows = grid.length;
        cols = grid[0].length;
        this.start = start;
        this.goal = goal;
        this.heuristic = heuristic;
        blocked = new boolean[rows * cols];
        g = new double[rows * cols];
        rhs = new double[rows * cols];
        openKeys = new Key[rows * cols];

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                blocked[id(new Cell(row, col))] = grid[row][col] != 0;
            }
        }
        java.util.Arrays.fill(g, Double.POSITIVE_INFINITY);
        java.util.Arrays.fill(rhs, Double.POSITIVE_INFINITY);
        rhs[id(goal)] = 0.0;
        push(id(goal));
    }

    public List<Cell> replan() {
        computeShortestPath();
        return path();
    }

    public void setBlocked(Cell cell, boolean isBlocked) {
        if (cell.equals(start) || cell.equals(goal)) {
            throw new IllegalArgumentException("start and goal cannot be blocked");
        }

        int cellId = id(cell);
        if (blocked[cellId] == isBlocked) {
            return;
        }

        blocked[cellId] = isBlocked;
        if (isBlocked) {
            g[cellId] = Double.POSITIVE_INFINITY;
            rhs[cellId] = Double.POSITIVE_INFINITY;
            openKeys[cellId] = null;
        } else {
            updateVertex(cellId);
        }

        for (int neighbor : adjacent(cellId)) {
            if (!blocked[neighbor]) {
                updateVertex(neighbor);
            }
        }
    }

    public void moveStart(Cell newStart) {
        km += estimate(start, newStart);
        start = newStart;
    }

    private void computeShortestPath() {
        int startId = id(start);
        while (keyLess(topKey(), calculateKey(startId)) || rhs[startId] != g[startId]) {
            Entry entry = pop();
            if (entry == null) {
                return;
            }

            Key newKey = calculateKey(entry.id());
            if (keyLess(entry.key(), newKey)) {
                push(entry.id());
            } else if (g[entry.id()] > rhs[entry.id()]) {
                g[entry.id()] = rhs[entry.id()];
                for (int predecessor : neighbors(entry.id())) {
                    updateVertex(predecessor);
                }
            } else {
                g[entry.id()] = Double.POSITIVE_INFINITY;
                updateVertex(entry.id());
                for (int predecessor : neighbors(entry.id())) {
                    updateVertex(predecessor);
                }
            }
        }
    }

    private List<Cell> path() {
        int current = id(start);
        if (!Double.isFinite(g[current])) {
            return List.of();
        }

        List<Cell> path = new ArrayList<>();
        path.add(start);
        for (int steps = 0; steps < rows * cols; steps++) {
            if (current == id(goal)) {
                return path;
            }

            int best = -1;
            for (int candidate : neighbors(current)) {
                if (best == -1 || g[candidate] < g[best]
                    || (g[candidate] == g[best] && candidate < best)) {
                    best = candidate;
                }
            }
            if (best == -1 || !Double.isFinite(g[best])) {
                return List.of();
            }

            current = best;
            path.add(cell(current));
        }
        return List.of();
    }

    private void updateVertex(int cellId) {
        if (blocked[cellId]) {
            openKeys[cellId] = null;
            return;
        }

        if (cellId != id(goal)) {
            double best = Double.POSITIVE_INFINITY;
            for (int successor : neighbors(cellId)) {
                best = Math.min(best, 1.0 + g[successor]);
            }
            rhs[cellId] = best;
        }

        openKeys[cellId] = null;
        if (g[cellId] != rhs[cellId]) {
            push(cellId);
        }
    }

    private void push(int cellId) {
        Key key = calculateKey(cellId);
        openKeys[cellId] = key;
        queue.add(new Entry(key, cellId));
    }

    private Key topKey() {
        while (!queue.isEmpty()) {
            Entry entry = queue.peek();
            if (entry.key().equals(openKeys[entry.id()])) {
                return entry.key();
            }
            queue.remove();
        }
        return new Key(Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY);
    }

    private Entry pop() {
        while (!queue.isEmpty()) {
            Entry entry = queue.remove();
            if (entry.key().equals(openKeys[entry.id()])) {
                openKeys[entry.id()] = null;
                return entry;
            }
        }
        return null;
    }

    private Key calculateKey(int cellId) {
        double value = Math.min(g[cellId], rhs[cellId]);
        return new Key(value + estimate(start, cell(cellId)) + km, value);
    }

    private double estimate(Cell left, Cell right) {
        int rowDistance = Math.abs(left.row() - right.row());
        int colDistance = Math.abs(left.col() - right.col());
        return switch (heuristic) {
            case EUCLIDEAN -> Math.hypot(rowDistance, colDistance);
            case CHEBYSHEV -> Math.max(rowDistance, colDistance);
            case OCTILE -> Math.max(rowDistance, colDistance)
                + (Math.sqrt(2.0) - 1.0) * Math.min(rowDistance, colDistance);
            case MANHATTAN -> rowDistance + colDistance;
        };
    }

    private List<Integer> adjacent(int cellId) {
        Cell current = cell(cellId);
        List<Integer> result = new ArrayList<>(4);
        if (current.row() > 0) {
            result.add(cellId - cols);
        }
        if (current.col() + 1 < cols) {
            result.add(cellId + 1);
        }
        if (current.row() + 1 < rows) {
            result.add(cellId + cols);
        }
        if (current.col() > 0) {
            result.add(cellId - 1);
        }
        return result;
    }

    private List<Integer> neighbors(int cellId) {
        List<Integer> result = new ArrayList<>(4);
        for (int neighbor : adjacent(cellId)) {
            if (!blocked[neighbor]) {
                result.add(neighbor);
            }
        }
        return result;
    }

    private int id(Cell cell) {
        return cell.row() * cols + cell.col();
    }

    private Cell cell(int cellId) {
        return new Cell(cellId / cols, cellId % cols);
    }

    private static boolean keyLess(Key left, Key right) {
        return left.compareTo(right) < 0;
    }
}
