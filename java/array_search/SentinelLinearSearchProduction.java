import java.util.List; 
import java.util.Objects;

public final class SentinelLinearSearchProduction {
    public record SearchResult(boolean found, int index, int inspected) {
    }

    private SentinelLinearSearchProduction() {
    }

    public static <T> SearchResult findFirst(List<T> values, T target) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        return findFirst(values, target, 0, values.size());
    }

    public static <T> SearchResult findFirst(List<T> values, T target, int start, int stop) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        validateRange(values.size(), start, stop);

        if (start == stop) {
            return new SearchResult(false, -1, 0);
        }

        int sentinelIndex = stop - 1; 
        T saved = values.get(sentinelIndex);
        values.set(sentinelIndex, target);

        int inspected = 0;

        try {
            int index = start; 

            while (!Objects.equals(values.get(index), target)) {
                inspected += 1;
                index += 1;
            }

            inspected += 1;
            boolean found = index < sentinelIndex || Objects.equals(saved, target);
            return new SearchResult(found, found ? index : -1, inspected);
        } finally {
            values.set(sentinelIndex, saved);
        }
    }

    private static void validateRange(int length, int start, int stop) {
        if (start < 0 || start > length || stop < start || stop > length) {
            throw new IllegalArgumentException("range must satisfy 0 <= start <= stop <= values.size()");
        }
    }
}
