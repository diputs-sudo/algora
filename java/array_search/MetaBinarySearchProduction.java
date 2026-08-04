import java.util.Comparator;
import java.util.List;

public final class MetaBinarySearchProduction {
    public record SearchResult(boolean found, int index, int insertionPoint) {
    }

    private MetaBinarySearchProduction() {
    }

    public static <T extends Comparable<? super T>> int lowerBound(List<T> values, T target) {
        return lowerBound(values, target, Comparator.naturalOrder());
    }

    public static <T> int lowerBound(List<T> values, T target, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int length = values.size();

        if (length == 0) {
            return 0;
        }

        int position = -1;
        int bit = highestPowerOfTwoBelow(length);

        while (bit > 0) {
            int next = position + bit;

            if (next < length && comparator.compare(values.get(next), target) < 0) {
                position = next;
            }

            bit /= 2;
        }

        return position + 1;
    }

    public static <T extends Comparable<? super T>> SearchResult searchFirst(List<T> values, T target) {
        return searchFirst(values, target, Comparator.naturalOrder());
    }

    public static <T> SearchResult searchFirst(List<T> values, T target, Comparator<? super T> comparator) {
        int insertionPoint = lowerBound(values, target, comparator);
        boolean found = insertionPoint < values.size() && comparator.compare(values.get(insertionPoint), target) == 0;
        return new SearchResult(found, found ? insertionPoint : -1, insertionPoint);
    }

    private static int highestPowerOfTwoBelow(int length) {
        int bit = 1;

        while (bit * 2 < length) {
            bit *= 2;
        }

        return bit;
    }
}
