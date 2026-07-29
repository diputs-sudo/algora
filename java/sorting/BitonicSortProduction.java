import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class BitonicSortProduction {

    private BitonicSortProduction() {
    }

    public static <T extends Comparable<? super T>> void bitonicSortInPlace(List<T> values) {
        bitonicSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void bitonicSortInPlace(List<T> values, Comparator<? super T> comparator) {
        Objects.requireNonNull(values, "values");
        Objects.requireNonNull(comparator, "comparator");

        if (values.size() < 2) {
            return;
        }

        if (!isPowerOfTwo(values.size())) {
            throw new IllegalArgumentException("bitonicSortInPlace requires a power-of-two length");
        }

        bitonicSort(values, 0, values.size(), true, comparator);
    }

    private static boolean isPowerOfTwo(int value) {
        return value > 0 && (value & (value - 1)) == 0;
    }

    private static <T> void bitonicSort(
        List<T> values,
        int start,
        int count,
        boolean ascending,
        Comparator<? super T> comparator
    ) {
        if (count <= 1) {
            return;
        }

        int half = count / 2;
        bitonicSort(values, start, half, true, comparator);
        bitonicSort(values, start + half, half, false, comparator);
        bitonicMerge(values, start, count, ascending, comparator);
    }

    private static <T> void bitonicMerge(
        List<T> values,
        int start,
        int count,
        boolean ascending,
        Comparator<? super T> comparator
    ) {
        if (count <= 1) {
            return;
        }

        int half = count / 2;

        for (int index = start; index < start + half; index++) {
            compareAndSwap(values, index, index + half, ascending, comparator);
        }

        bitonicMerge(values, start, half, ascending, comparator);
        bitonicMerge(values, start + half, half, ascending, comparator);
    }

    private static <T> void compareAndSwap(
        List<T> values,
        int left,
        int right,
        boolean ascending,
        Comparator<? super T> comparator
    ) {
        T leftValue = values.get(left);
        T rightValue = values.get(right);
        boolean shouldSwap = ascending
            ? comparator.compare(rightValue, leftValue) < 0
            : comparator.compare(leftValue, rightValue) < 0;

        if (shouldSwap) {
            values.set(left, rightValue);
            values.set(right, leftValue);
        }
    }
}
