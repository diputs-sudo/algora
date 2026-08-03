import java.util.List;

public final class InterpolationSearchProduction {
    public record SearchResult(boolean found, int index, int insertionPoint) {
    }

    private InterpolationSearchProduction() {
    }

    public static SearchResult interpolationSearchFirst(List<Integer> values, int target) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        int length = values.size();
        int low = 0;
        int high = length - 1;
        int candidateLeft = 0;

        while (low <= high && values.get(low) <= target && target <= values.get(high)) {
            int lowValue = values.get(low);
            int highValue = values.get(high);

            if (lowValue == highValue) {
                boolean found = lowValue == target;
                return new SearchResult(found, found ? low : -1, low);
            }

            long numerator = ((long) target - lowValue) * (high - low);
            long denominator = (long) highValue - lowValue;
            int probe = low + (int) (numerator / denominator);
            probe = Math.max(low, Math.min(high, probe));
            int value = values.get(probe);

            if (value < target) {
                low = probe + 1;
                candidateLeft = low;
            } else {
                high = probe;

                if (value == target) {
                    break;
                }
            }
        }

        int searchRight = high >= candidateLeft ? high + 1 : length;
        int insertionPoint = lowerBound(values, target, candidateLeft, searchRight);
        boolean found = insertionPoint < length && values.get(insertionPoint) == target;

        return new SearchResult(found, found ? insertionPoint : -1, insertionPoint);
    }

    private static int lowerBound(List<Integer> values, int target, int left, int right) {
        while (left < right) {
            int mid = left + (right - left) / 2;

            if (values.get(mid) < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }
}
