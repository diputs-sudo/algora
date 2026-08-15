import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class DfsProduction {
    record Cell(int row, int col) {}

    public static List<Cell> dfsGridPath(boolean[][] walls, Cell start, Cell target) {
        int height = walls.length;
        int width = walls[0].length;

        if (!inside(start, width, height) || !inside(target, width, height)) {
            throw new IllegalArgumentException("start and target must be inside the grid");
        }

        if (walls[start.row()][start.col()] || walls[target.row()][target.col()]) {
            return List.of();
        }

        int total = width * height;
        boolean[] visited = new boolean[total];
        int[] parent = new int[total];
        java.util.Arrays.fill(parent, -1);
        Deque<Integer> stack = new ArrayDeque<>();

        int startId = start.row() * width + start.col();
        int targetId = target.row() * width + target.col();
        stack.push(startId);
        visited[startId] = true;

        while (!stack.isEmpty()) {
            int cellId = stack.pop();
            Cell cell = new Cell(cellId / width, cellId % width);

            if (cellId == targetId) {
                List<Cell> path = new ArrayList<>();
                for (int currentId = targetId; currentId != -1; currentId = parent[currentId]) {
                    path.add(new Cell(currentId / width, currentId % width));
                }
                Collections.reverse(path);
                return path;
            }

            int[][] moves = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};
            for (int[] move : moves) {
                int nextRow = cell.row() + move[0];
                int nextCol = cell.col() + move[1];
                if (nextRow >= 0 && nextRow < height && nextCol >= 0 && nextCol < width && !walls[nextRow][nextCol]) {
                    int nextId = nextRow * width + nextCol;
                    if (!visited[nextId]) {
                        visited[nextId] = true;
                        parent[nextId] = cellId;
                        stack.push(nextId);
                    }
                }
            }
        }

        return List.of();
    }

    private static boolean inside(Cell cell, int width, int height) {
        return cell.row() >= 0 && cell.row() < height && cell.col() >= 0 && cell.col() < width;
    }
}
