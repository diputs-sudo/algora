import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class BidirectionalBfsProduction {
    public record Cell(int row, int col) {}

    private BidirectionalBfsProduction() {
    }

    public static List<Cell> bidirectionalBfsPath(boolean[][] walls, Cell start, Cell target) {
        if (walls == null || walls.length == 0 || walls[0].length == 0) {
            throw new IllegalArgumentException("walls must be a non-empty rectangular grid");
        }
        int height = walls.length;
        int width = walls[0].length;
        for (boolean[] row : walls) {
            if (row == null || row.length != width) throw new IllegalArgumentException("walls must be rectangular");
        }
        validate(start, width, height);
        validate(target, width, height);
        if (walls[start.row()][start.col()] || walls[target.row()][target.col()]) return List.of();
        if (start.equals(target)) return List.of(start);

        @SuppressWarnings("unchecked")
        ArrayDeque<Integer>[] frontiers = new ArrayDeque[]{new ArrayDeque<>(), new ArrayDeque<>()};
        int total = width * height;
        boolean[][] seen = new boolean[2][total];
        int[][] parent = {new int[total], new int[total]};
        java.util.Arrays.fill(parent[0], -1);
        java.util.Arrays.fill(parent[1], -1);

        int startId = start.row() * width + start.col();
        int targetId = target.row() * width + target.col();
        frontiers[0].add(startId);
        frontiers[1].add(targetId);
        seen[0][startId] = true;
        seen[1][targetId] = true;

        while (!frontiers[0].isEmpty() && !frontiers[1].isEmpty()) {
            int side = frontiers[0].size() <= frontiers[1].size() ? 0 : 1;
            int other = 1 - side;
            ArrayDeque<Integer> next = new ArrayDeque<>();

            while (!frontiers[side].isEmpty()) {
                int current = frontiers[side].removeFirst();
                int row = current / width;
                int col = current % width;
                int[][] moves = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};

                for (int[] move : moves) {
                    int nextRow = row + move[0];
                    int nextCol = col + move[1];
                    if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) continue;
                    int nextId = nextRow * width + nextCol;
                    if (walls[nextRow][nextCol] || seen[side][nextId]) continue;

                    seen[side][nextId] = true;
                    parent[side][nextId] = current;
                    if (seen[other][nextId]) return buildPath(nextId, parent, width);
                    next.addLast(nextId);
                }
            }
            frontiers[side] = next;
        }
        return List.of();
    }

    private static List<Cell> buildPath(int meeting, int[][] parent, int width) {
        List<Integer> ids = new ArrayList<>();
        for (int id = meeting; id != -1; id = parent[0][id]) ids.add(id);
        Collections.reverse(ids);
        for (int id = parent[1][meeting]; id != -1; id = parent[1][id]) ids.add(id);

        List<Cell> path = new ArrayList<>();
        for (int id : ids) path.add(new Cell(id / width, id % width));
        return path;
    }

    private static void validate(Cell cell, int width, int height) {
        if (cell == null || cell.row() < 0 || cell.row() >= height || cell.col() < 0 || cell.col() >= width) {
            throw new IllegalArgumentException("start and target must be inside the grid");
        }
    }
}
