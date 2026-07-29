import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class BubbleSortProduction {

    private BubbleSortProduction() {
    }

    public static <T extends Comparable<? super T>> void bubbleSortInPlace(List<T> values) {
        bubbleSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void bubbleSortInPlace(List<T> values, Comparator<? super T> comparator) {
        Objects.requireNonNull(values, "values");
        Objects.requireNonNull(comparator, "comparator");

        int unsortedEnd = values.size() - 1;

        while (unsortedEnd > 0) {
            int lastSwap = 0;

            for (int index = 0; index < unsortedEnd; index++) {
                T left = values.get(index);
                T right = values.get(index + 1);

                if (comparator.compare(left, right) > 0) {
                    values.set(index, right);
                    values.set(index + 1, left);
                    lastSwap = index;
                }
            }

            if (lastSwap == 0) {
                break;
            }

            unsortedEnd = lastSwap;
        }
    }
}
