import java.util.Comparator;
import java.util.List;

public final class BinarySearchProduction {
    public record SearchResult(int index, int insertionPoint) {
        public boolean found() {
            return index >= 0;
        }
    }

    private BinarySearchProduction() {
    }

    public static <T extends Comparable<? super T>> int lowerBound(List<T> values, T target) {
        return lowerBound(values, target, Comparator.naturalOrder());
    }

    public static <T> int lowerBound(List<T> values, T target, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int left = 0;
        int right = values.size();

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

    public static <T extends Comparable<? super T>> SearchResult binarySearchFirst(List<T> values, T target) {
        return binarySearchFirst(values, target, Comparator.naturalOrder());
    }

    public static <T> SearchResult binarySearchFirst(List<T> values, T target, Comparator<? super T> comparator) {
        int insertionPoint = lowerBound(values, target, comparator);
        int index = -1;

        if (insertionPoint < values.size() && comparator.compare(values.get(insertionPoint), target) == 0) {
            index = insertionPoint;
        }

        return new SearchResult(index, insertionPoint);
    }
}
