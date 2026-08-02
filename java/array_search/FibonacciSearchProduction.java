import java.util.Comparator;
import java.util.List;

public final class FibonacciSearchProduction {
    public record SearchResult(boolean found, int index, int insertionPoint) {
    }

    private FibonacciSearchProduction() {
    }

    public static <T extends Comparable<? super T>> int fibonacciLowerBound(List<T> values, T target) {
        return fibonacciLowerBound(values, target, Comparator.naturalOrder());
    }

    public static <T> int fibonacciLowerBound(List<T> values, T target, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int length = values.size();
        int fibMm2 = 0;
        int fibMm1 = 1;
        int fibM = 1;

        while (fibM < length) {
            fibMm2 = fibMm1;
            fibMm1 = fibM;
            fibM = fibMm2 + fibMm1;
        }

        int offset = -1;

        while (fibM > 1) {
            int probe = Math.min(offset + fibMm2, length - 1);

            if (comparator.compare(values.get(probe), target) < 0) {
                fibM = fibMm1;
                fibMm1 = fibMm2;
                fibMm2 = fibM - fibMm1;
                offset = probe;
            } else {
                fibM = fibMm2;
                fibMm1 = fibMm1 - fibMm2;
                fibMm2 = fibM - fibMm1;
            }
        }

        return offset + 1;
    }

    public static <T extends Comparable<? super T>> SearchResult fibonacciSearchFirst(List<T> values, T target) {
        return fibonacciSearchFirst(values, target, Comparator.naturalOrder());
    }

    public static <T> SearchResult fibonacciSearchFirst(List<T> values, T target, Comparator<? super T> comparator) {
        int index = fibonacciLowerBound(values, target, comparator);
        boolean found = index < values.size() && comparator.compare(values.get(index), target) == 0;
        return new SearchResult(found, found ? index : -1, index);
    }
}
