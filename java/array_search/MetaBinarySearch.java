public class MetaBinarySearch {

    private static int highestPowerOfTwoBelow(int length) {
        int bit = 1;

        while (bit * 2 < length) {
            bit *= 2;
        }

        return bit;
    }

    public static int metaBinarySearch(int[] arr, int target) {
        int n = arr.length;

        if (n == 0) return -1;

        int position = -1;
        int bit = highestPowerOfTwoBelow(n);

        while (bit > 0) {
            int nextIndex = position + bit;

            if (nextIndex < n && arr[nextIndex] < target) {
                position = nextIndex;
            }

            bit /= 2;
        }

        int candidate = position + 1;
        return candidate < n && arr[candidate] == target ? candidate : -1;
    }
}
