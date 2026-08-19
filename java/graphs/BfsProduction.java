import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class BfsProduction {
    record Cell(int row, int col) {}

    public static List<Cell> bfsPath(boolean[][] walls, Cell start, Cell target) {
        int height = walls.length;
        int width = walls[0].length;
        validateCell(start, width, height);
        validateCell(target, width, height);

        if (walls[start.row()][start.col()] || walls[target.row()][target.col()]) {
            return List.of();
        }

        int total = width * height;
        int startId = start.row() * width + start.col();
        int targetId = target.row() * width + target.col();
        boolean[] visited = new boolean[total];
        int[] parent = new int[total];
        Deque<Integer> queue = new ArrayDeque<>();

        java.util.Arrays.fill(parent, -1);
        queue.addLast(startId);
        visited[startId] = true;

        while (!queue.isEmpty()) {
            int currentId = queue.removeFirst();
            if (currentId == targetId) {
                List<Cell> path = new ArrayList<>();
                for (int stepId = targetId; stepId != -1; stepId = parent[stepId]) {
                    path.add(new Cell(stepId / width, stepId % width));
                }
                Collections.reverse(path);
                return path;
            }

            int row = currentId / width;
            int col = currentId % width;
            int[][] moves = {
                {-1, 0},
                {0, 1},
                {1, 0},
                {0, -1}
            };

            for (int[] move : moves) {
                int nextRow = row + move[0];
                int nextCol = col + move[1];
                if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
                    continue;
                }

                int nextId = nextRow * width + nextCol;
                if (walls[nextRow][nextCol] || visited[nextId]) {
                    continue;
                }

                visited[nextId] = true;
                parent[nextId] = currentId;
                queue.addLast(nextId);
            }
        }

        return List.of();
    }

    private static void validateCell(Cell cell, int width, int height) {
        if (cell.row() < 0 || cell.row() >= height || cell.col() < 0 || cell.col() >= width) {
            throw new IllegalArgumentException("start and target must be inside the grid");
        }
    }
}
