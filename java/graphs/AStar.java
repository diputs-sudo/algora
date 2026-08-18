import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;

public class AStar {
    record Cell(int row, int col) {}

    record Candidate(int f, int g, Cell cell) {}

    public static List<Cell> aStar(boolean[][] walls, Cell start, Cell target) {
        int height = walls.length;
        int width = walls[0].length;
        int[][] distance = new int[height][width];
        Cell[][] parent = new Cell[height][width];
        boolean[][] closed = new boolean[height][width];
        PriorityQueue<Candidate> open = new PriorityQueue<>((left, right) -> left.f() - right.f());

        for (int row = 0; row < height; row++) {
            java.util.Arrays.fill(distance[row], Integer.MAX_VALUE);
        }

        distance[start.row()][start.col()] = 0;
        open.add(new Candidate(heuristic(start, target), 0, start));

        while (!open.isEmpty()) {
            Candidate candidate = open.remove();
            Cell current = candidate.cell();
            if (closed[current.row()][current.col()]) {
                continue;
            }
            closed[current.row()][current.col()] = true;

            if (current.equals(target)) {
                return pathTo(parent, start, target);
            }

            int[][] moves = {
                {-1, 0},
                {0, 1},
                {1, 0},
                {0, -1}
            };

            for (int[] move : moves) {
                int nextRow = current.row() + move[0];
                int nextCol = current.col() + move[1];
                if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
                    continue;
                }
                if (walls[nextRow][nextCol] || closed[nextRow][nextCol]) {
                    continue;
                }

                int nextG = candidate.g() + 1;
                if (nextG >= distance[nextRow][nextCol]) {
                    continue;
                }

                Cell next = new Cell(nextRow, nextCol);
                distance[nextRow][nextCol] = nextG;
                parent[nextRow][nextCol] = current;
                open.add(new Candidate(nextG + heuristic(next, target), nextG, next));
            }
        }

        return List.of();
    }

    private static int heuristic(Cell current, Cell target) {
        return Math.abs(current.row() - target.row()) + Math.abs(current.col() - target.col());
    }

    private static List<Cell> pathTo(Cell[][] parent, Cell start, Cell target) {
        List<Cell> path = new ArrayList<>();
        for (Cell current = target; current != null; current = parent[current.row()][current.col()]) {
            path.add(current);
            if (current.equals(start)) {
                break;
            }
        }
        Collections.reverse(path);
        return path;
    }
}
