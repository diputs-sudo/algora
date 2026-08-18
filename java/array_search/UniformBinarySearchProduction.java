public final class UniformBinarySearchProduction {
    public record SearchResult(boolean found, int index, int comparisons) {
    }

    private UniformBinarySearchProduction() {
    }

    public static SearchResult search(int[] values, int target) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }
        return search(values, target, 0, values.length);
    }

    public static SearchResult search(int[] values, int target, int start, int stop) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }
        validateRange(values.length, start, stop);

        int rangeLength = stop - start;
        int largest = 1;
        while (largest <= rangeLength / 2) largest *= 2;

        int base = -1;
        int comparisons = 0;

        for (int step = rangeLength == 0 ? 0 : largest; step >= 1; step /= 2) {
            int probe = base + step;
            if (probe >= rangeLength) continue;

            int index = start + probe;
            comparisons += 1;

            if (values[index] == target) {
                return new SearchResult(true, index, comparisons);
            }
            if (values[index] < target) base = probe;
        }

        return new SearchResult(false, -1, comparisons);
    }

    private static void validateRange(int length, int start, int stop) {
        if (start < 0 || start > length || stop < start || stop > length) {
            throw new IllegalArgumentException("range must satisfy 0 <= start <= stop <= values.length");
        }
    }
}
