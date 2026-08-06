public class UniformBinarySearch {
    public static int uniformBinarySearch(int[] array, int target) {
        int low = 0;
        int high = array.length - 1;
        int stepIndex = 0;

        while (low <= high) {
            int mid = low + (high - low) / 2;

            if (array[mid] == target) return mid;
            if (array[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }

            stepIndex++;
        }

        return -1;
    }
}
