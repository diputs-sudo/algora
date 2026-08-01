import java.util.Comparator;
import java.util.List;

public final class ExponentialSearchProduction {
    public record SearchResult(boolean found, int index, int insertionPoint, int upperBound) {
    }

    private ExponentialSearchProduction() {
    }

    public static <T extends Comparable<? super T>> SearchResult exponentialSearchFirst(List<T> values, T target) {
        return exponentialSearchFirst(values, target, Comparator.naturalOrder());
    }

    public static <T> SearchResult exponentialSearchFirst(List<T> values, T target, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int length = values.size();

        if (length == 0) {
            return new SearchResult(false, -1, 0, 0);
        }

        if (comparator.compare(values.get(0), target) >= 0) {
            boolean found = comparator.compare(values.get(0), target) == 0;
            return new SearchResult(found, found ? 0 : -1, 0, 1);
        }

        int bound = 1;

        while (bound < length && comparator.compare(values.get(bound), target) < 0) {
            if (bound > length / 2) {
                bound = length;
                break;
            }

            bound *= 2;
        }

        int left = bound / 2 + 1;
        int right = Math.min(bound + 1, length);
        int insertionPoint = lowerBound(values, target, left, right, comparator);
        boolean found = insertionPoint < length && comparator.compare(values.get(insertionPoint), target) == 0;

        return new SearchResult(found, found ? insertionPoint : -1, insertionPoint, right);
    }

    private static <T> int lowerBound(List<T> values, T target, int left, int right, Comparator<? super T> comparator) {
        while (left < right) {
            int mid = left + (right - left) / 2;

            if (comparator.compare(values.get(mid), target) < 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }
}
