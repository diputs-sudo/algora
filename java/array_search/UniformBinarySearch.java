public class UniformBinarySearch {
    public static int uniformBinarySearch(int[] array, int target) {
        if (array.length == 0) return -1;

        int largest = 1;
        while (largest <= array.length / 2) largest *= 2;

        int base = -1;
        for (int step = largest; step >= 1; step /= 2) {
            int probe = base + step;
            if (probe >= array.length) continue;

            if (array[probe] == target) return probe;
            if (array[probe] < target) base = probe;
        }

        return -1;
    }
}
