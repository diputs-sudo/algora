import java.util.Arrays;
import java.util.Objects;

public final class CountingSortProduction {

    private static final int DEFAULT_MAX_RANGE = 1_000_000;

    private CountingSortProduction() {
    }

    public static int[] countingSort(int[] values) {
        return countingSort(values, DEFAULT_MAX_RANGE);
    }

    public static int[] countingSort(int[] values, int maxRange) {
        Objects.requireNonNull(values, "values");

        if (maxRange <= 0) {
            throw new IllegalArgumentException("maxRange must be greater than zero");
        }

        if (values.length == 0) {
            return new int[0];
        }

        int minimum = values[0];
        int maximum = values[0];

        for (int value : values) {
            if (value < minimum) {
                minimum = value;
            }

            if (value > maximum) {
                maximum = value;
            }
        }

        long valueRange = (long)maximum - minimum + 1L;

        if (valueRange > maxRange) {
            int[] result = Arrays.copyOf(values, values.length);
            Arrays.sort(result);
            return result;
        }

        int[] counts = new int[(int)valueRange];

        for (int value : values) {
            counts[value - minimum]++;
        }

        int[] result = new int[values.length];
        int position = 0;

        for (int offset = 0; offset < counts.length; offset++) {
            int value = minimum + offset;

            for (int count = 0; count < counts[offset]; count++) {
                result[position++] = value;
            }
        }

        return result;
    }
}
