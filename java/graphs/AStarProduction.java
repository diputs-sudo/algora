import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;

public class AStarProduction {
    record Cell(int row, int col) {}

    record Candidate(int f, int g, int id) {}

    public static List<Cell> aStarPath(boolean[][] walls, Cell start, Cell target) {
        int height = walls.length;
        int width = walls[0].length;
        validateCell(start, width, height);
        validateCell(target, width, height);

        if (walls[start.row()][start.col()] || walls[target.row()][target.col()]) {
            return List.of();
        }

        int total = width * height;
        int startId = id(start, width);
        int targetId = id(target, width);
        int[] distance = new int[total];
        int[] parent = new int[total];
        boolean[] closed = new boolean[total];
        PriorityQueue<Candidate> open = new PriorityQueue<>((left, right) -> left.f() - right.f());

        java.util.Arrays.fill(distance, Integer.MAX_VALUE);
        java.util.Arrays.fill(parent, -1);
        distance[startId] = 0;
        open.add(new Candidate(heuristic(startId, target, width), 0, startId));

        while (!open.isEmpty()) {
            Candidate candidate = open.remove();
            if (closed[candidate.id()]) {
                continue;
            }
            closed[candidate.id()] = true;

            if (candidate.id() == targetId) {
                return pathTo(parent, targetId, width);
            }

            int row = candidate.id() / width;
            int col = candidate.id() % width;
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
                if (walls[nextRow][nextCol] || closed[nextId]) {
                    continue;
                }

                int nextG = candidate.g() + 1;
                if (nextG >= distance[nextId]) {
                    continue;
                }

                distance[nextId] = nextG;
                parent[nextId] = candidate.id();
                open.add(new Candidate(nextG + heuristic(nextId, target, width), nextG, nextId));
            }
        }

        return List.of();
    }

    private static int id(Cell cell, int width) {
        return cell.row() * width + cell.col();
    }

    private static int heuristic(int cellId, Cell target, int width) {
        int row = cellId / width;
        int col = cellId % width;
        return Math.abs(row - target.row()) + Math.abs(col - target.col());
    }

    private static void validateCell(Cell cell, int width, int height) {
        if (cell.row() < 0 || cell.row() >= height || cell.col() < 0 || cell.col() >= width) {
            throw new IllegalArgumentException("start and target must be inside the grid");
        }
    }

    private static List<Cell> pathTo(int[] parent, int targetId, int width) {
        List<Cell> path = new ArrayList<>();
        for (int currentId = targetId; currentId != -1; currentId = parent[currentId]) {
            path.add(new Cell(currentId / width, currentId % width));
        }
        Collections.reverse(path);
        return path;
    }
}
