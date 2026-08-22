import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.PriorityQueue;

public final class DStarLiteProduction {
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

    private record QueueEntry(Key key, int id) implements Comparable<QueueEntry> {
        @Override
        public int compareTo(QueueEntry other) {
            int keyComparison = key.compareTo(other.key);
            return keyComparison != 0 ? keyComparison : Integer.compare(id, other.id);
        }
    }

    private final int rows;
    private final int cols;
    private final int cellCount;
    private final boolean[] blocked;
    private final double[] g;
    private final double[] rhs;
    private final Key[] openKeys;
    private final PriorityQueue<QueueEntry> open = new PriorityQueue<>();
    private final Cell goal;
    private final Heuristic heuristic;
    private Cell start;
    private double km;

    public DStarLiteProduction(boolean[][] walls, Cell start, Cell goal) {
        this(walls, start, goal, Heuristic.MANHATTAN);
    }

    public DStarLiteProduction(boolean[][] walls, Cell start, Cell goal, Heuristic heuristic) {
        validateGrid(walls);
        this.rows = walls.length;
        this.cols = walls[0].length;
        this.cellCount = Math.multiplyExact(rows, cols);
        this.start = Objects.requireNonNull(start, "start");
        this.goal = Objects.requireNonNull(goal, "goal");
        this.heuristic = Objects.requireNonNull(heuristic, "heuristic");
        validateCell(start, "start");
        validateCell(goal, "goal");

        blocked = new boolean[cellCount];
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                blocked[id(new Cell(row, col))] = walls[row][col];
            }
        }
        if (isBlocked(id(start)) || isBlocked(id(goal))) {
            throw new IllegalArgumentException("start and goal must be traversable");
        }

        g = new double[cellCount];
        rhs = new double[cellCount];
        openKeys = new Key[cellCount];
        Arrays.fill(g, Double.POSITIVE_INFINITY);
        Arrays.fill(rhs, Double.POSITIVE_INFINITY);
        rhs[id(goal)] = 0.0;
        enqueue(id(goal));
    }

    public List<Cell> replan() {
        computeShortestPath();
        return extractPath();
    }

    public boolean setBlocked(Cell cell, boolean shouldBlock) {
        validateCell(cell, "cell");
        if (cell.equals(start) || cell.equals(goal)) {
            throw new IllegalArgumentException("start and goal cannot be changed");
        }

        int cellId = id(cell);
        if (isBlocked(cellId) == shouldBlock) {
            return false;
        }

        blocked[cellId] = shouldBlock;
        if (shouldBlock) {
            g[cellId] = Double.POSITIVE_INFINITY;
            rhs[cellId] = Double.POSITIVE_INFINITY;
            openKeys[cellId] = null;
        } else {
            updateVertex(cellId);
        }

        for (int neighbor : adjacent(cellId)) {
            if (!isBlocked(neighbor)) {
                updateVertex(neighbor);
            }
        }
        return true;
    }

    public void moveStart(Cell newStart) {
        validateCell(newStart, "new start");
        if (isBlocked(id(newStart))) {
            throw new IllegalArgumentException("new start must be traversable");
        }

        km += estimate(start, newStart);
        start = newStart;
    }

    public Cell start() {
        return start;
    }

    public Cell goal() {
        return goal;
    }

    private void computeShortestPath() {
        int startId = id(start);
        while (keyLess(topKey(), calculateKey(startId)) || rhs[startId] != g[startId]) {
            QueueEntry entry = pop();
            if (entry == null) {
                return;
            }

            Key newKey = calculateKey(entry.id());
            if (keyLess(entry.key(), newKey)) {
                enqueue(entry.id());
                continue;
            }

            if (g[entry.id()] > rhs[entry.id()]) {
                g[entry.id()] = rhs[entry.id()];
                for (int predecessor : neighbors(entry.id())) {
                    updateVertex(predecessor);
                }
                continue;
            }

            g[entry.id()] = Double.POSITIVE_INFINITY;
            updateVertex(entry.id());
            for (int predecessor : neighbors(entry.id())) {
                updateVertex(predecessor);
            }
        }
    }

    private List<Cell> extractPath() {
        int current = id(start);
        if (!Double.isFinite(g[current])) {
            return List.of();
        }

        List<Cell> path = new ArrayList<>(cellCount);
        path.add(start);
        for (int steps = 0; steps < cellCount; steps++) {
            if (current == id(goal)) {
                return List.copyOf(path);
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
        if (isBlocked(cellId)) {
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
            enqueue(cellId);
        }
    }

    private void enqueue(int cellId) {
        Key key = calculateKey(cellId);
        openKeys[cellId] = key;
        open.add(new QueueEntry(key, cellId));
    }

    private Key topKey() {
        while (!open.isEmpty()) {
            QueueEntry entry = open.peek();
            if (entry.key().equals(openKeys[entry.id()])) {
                return entry.key();
            }
            open.remove();
        }
        return new Key(Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY);
    }

    private QueueEntry pop() {
        while (!open.isEmpty()) {
            QueueEntry entry = open.remove();
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
            if (!isBlocked(neighbor)) {
                result.add(neighbor);
            }
        }
        return result;
    }

    private boolean isBlocked(int cellId) {
        return blocked[cellId];
    }

    private int id(Cell cell) {
        return cell.row() * cols + cell.col();
    }

    private Cell cell(int cellId) {
        return new Cell(cellId / cols, cellId % cols);
    }

    private void validateCell(Cell cell, String name) {
        if (cell == null || cell.row() < 0 || cell.row() >= rows || cell.col() < 0 || cell.col() >= cols) {
            throw new IllegalArgumentException(name + " must be inside the grid");
        }
    }

    private static void validateGrid(boolean[][] walls) {
        if (walls == null || walls.length == 0 || walls[0] == null || walls[0].length == 0) {
            throw new IllegalArgumentException("grid must be non-empty");
        }
        int width = walls[0].length;
        for (boolean[] row : walls) {
            if (row == null || row.length != width) {
                throw new IllegalArgumentException("grid must be rectangular");
            }
        }
    }

    private static boolean keyLess(Key left, Key right) {
        return left.compareTo(right) < 0;
    }
}
