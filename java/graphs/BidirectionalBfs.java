import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class BidirectionalBfs {
    record Cell(int row, int col) {}

    public static List<Cell> bidirectionalBfs(boolean[][] walls, Cell start, Cell target) {
        int height = walls.length;
        int width = walls[0].length;
        if (walls[start.row()][start.col()] || walls[target.row()][target.col()]) return List.of();
        if (start.equals(target)) return List.of(start);

        Deque<Cell>[] queues = new Deque[]{new ArrayDeque<>(), new ArrayDeque<>()};
        boolean[][][] seen = new boolean[2][height][width];
        Cell[][][] parent = new Cell[2][height][width];
        queues[0].add(start);
        queues[1].add(target);
        seen[0][start.row()][start.col()] = true;
        seen[1][target.row()][target.col()] = true;

        while (!queues[0].isEmpty() && !queues[1].isEmpty()) {
            int side = queues[0].size() <= queues[1].size() ? 0 : 1;
            int other = 1 - side;
            Deque<Cell> nextQueue = new ArrayDeque<>();

            for (Cell current : List.copyOf(queues[side])) {
                queues[side].removeFirst();
                for (Cell neighbor : neighbors(current, width, height)) {
                    if (walls[neighbor.row()][neighbor.col()] || seen[side][neighbor.row()][neighbor.col()]) continue;
                    seen[side][neighbor.row()][neighbor.col()] = true;
                    parent[side][neighbor.row()][neighbor.col()] = current;

                    if (seen[other][neighbor.row()][neighbor.col()]) {
                        return buildPath(neighbor, parent[0], parent[1], start, target);
                    }
                    nextQueue.addLast(neighbor);
                }
            }
            queues[side] = nextQueue;
        }
        return List.of();
    }

    private static List<Cell> neighbors(Cell cell, int width, int height) {
        List<Cell> result = new ArrayList<>();
        int[][] moves = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};
        for (int[] move : moves) {
            int row = cell.row() + move[0];
            int col = cell.col() + move[1];
            if (row >= 0 && row < height && col >= 0 && col < width) result.add(new Cell(row, col));
        }
        return result;
    }

    private static List<Cell> buildPath(
        Cell meeting,
        Cell[][] forwardParent,
        Cell[][] backwardParent,
        Cell start,
        Cell target
    ) {
        List<Cell> left = new ArrayList<>();
        for (Cell cell = meeting; cell != null; cell = forwardParent[cell.row()][cell.col()]) left.add(cell);
        Collections.reverse(left);

        List<Cell> right = new ArrayList<>();
        for (Cell cell = backwardParent[meeting.row()][meeting.col()]; cell != null; cell = backwardParent[cell.row()][cell.col()]) right.add(cell);
        left.addAll(right);
        return left;
    }
}
