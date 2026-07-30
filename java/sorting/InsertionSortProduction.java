import java.util.Comparator;
import java.util.List;

public final class InsertionSortProduction {
    private InsertionSortProduction() {
    }

    public static <T extends Comparable<? super T>> void binaryInsertionSortInPlace(List<T> values) {
        binaryInsertionSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void binaryInsertionSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        for (int index = 1; index < values.size(); index++) {
            T current = values.get(index);
            int insertAt = upperBound(values, current, 0, index, comparator);

            if (insertAt == index) {
                continue;
            }

            for (int move = index; move > insertAt; move--) {
                values.set(move, values.get(move - 1));
            }

            values.set(insertAt, current);
        }
    }

    private static <T> int upperBound(List<T> values, T target, int low, int high, Comparator<? super T> comparator) {
        while (low < high) {
            int mid = low + (high - low) / 2;

            if (comparator.compare(values.get(mid), target) <= 0) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    }
}
