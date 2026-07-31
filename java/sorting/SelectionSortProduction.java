import java.util.Comparator;
import java.util.List;

public final class SelectionSortProduction {
    private SelectionSortProduction() {
    }

    public static <T extends Comparable<? super T>> void selectionSortInPlace(List<T> values) {
        selectionSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void selectionSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int left = 0;
        int right = values.size() - 1;

        while (left < right) {
            int minIndex = left;
            int maxIndex = left;

            for (int index = left + 1; index <= right; index++) {
                if (comparator.compare(values.get(index), values.get(minIndex)) < 0) {
                    minIndex = index;
                }

                if (comparator.compare(values.get(maxIndex), values.get(index)) < 0) {
                    maxIndex = index;
                }
            }

            swap(values, left, minIndex);

            if (maxIndex == left) {
                maxIndex = minIndex;
            }

            swap(values, right, maxIndex);
            left++;
            right--;
        }
    }

    private static <T> void swap(List<T> values, int left, int right) {
        if (left != right) {
            T temp = values.get(left);
            values.set(left, values.get(right));
            values.set(right, temp);
        }
    }
}
