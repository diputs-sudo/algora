import java.util.Arrays;

public final class RadixSortProduction {
    private static final int RADIX = 256;
    private static final int MASK = RADIX - 1;
    private static final int SMALL_ARRAY_THRESHOLD = 64;

    private RadixSortProduction() {
    }

    public static void radixSortInPlace(int[] values) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        if (values.length < 2) {
            return;
        }

        if (values.length < SMALL_ARRAY_THRESHOLD) {
            Arrays.sort(values);
            return;
        }

        int[] output = new int[values.length];
        int[] counts = new int[RADIX];

        for (int shift = 0; shift < Integer.BYTES * 8; shift += 8) {
            Arrays.fill(counts, 0);

            for (int value : values) {
                counts[((value ^ Integer.MIN_VALUE) >>> shift) & MASK]++;
            }

            int total = 0;
            for (int index = 0; index < RADIX; index++) {
                int count = counts[index];
                counts[index] = total;
                total += count;
            }

            for (int value : values) {
                int bucket = ((value ^ Integer.MIN_VALUE) >>> shift) & MASK;
                output[counts[bucket]++] = value;
            }

            System.arraycopy(output, 0, values, 0, values.length);
        }
    }
}
