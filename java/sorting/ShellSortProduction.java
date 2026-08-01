import java.util.Comparator;
import java.util.List;
import java.util.RandomAccess;

public final class ShellSortProduction {
    private static final int[] BASE_GAPS = {1, 4, 10, 23, 57, 132, 301, 701, 1750};

    private ShellSortProduction() {
    }

    public static <T extends Comparable<? super T>> void shellSortInPlace(List<T> values) {
        shellSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void shellSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        if (values.size() < 2) {
            return;
        }

        if (!(values instanceof RandomAccess)) {
            values.sort(comparator);
            return;
        }

        int[] gaps = ciuraGaps(values.size());

        for (int gapIndex = gaps.length - 1; gapIndex >= 0; gapIndex--) {
            int gap = gaps[gapIndex];

            for (int index = gap; index < values.size(); index++) {
                T current = values.get(index);
                int position = index;

                while (position >= gap && comparator.compare(current, values.get(position - gap)) < 0) {
                    values.set(position, values.get(position - gap));
                    position -= gap;
                }

                values.set(position, current);
            }
        }
    }

    private static int[] ciuraGaps(int length) {
        int capacity = BASE_GAPS.length + 8;
        int[] gaps = new int[capacity];
        int count = 0;

        for (int gap : BASE_GAPS) {
            if (gap < length) {
                gaps[count++] = gap;
            }
        }

        int last = BASE_GAPS[BASE_GAPS.length - 1];
        while (last < length) {
            last = Math.max(last + 1, (last * 9) / 4);
            if (last < length) {
                if (count == gaps.length) {
                    int[] expanded = new int[gaps.length * 2];
                    System.arraycopy(gaps, 0, expanded, 0, gaps.length);
                    gaps = expanded;
                }

                gaps[count++] = last;
            }
        }

        int[] result = new int[count];
        System.arraycopy(gaps, 0, result, 0, count);
        return result;
    }
}
