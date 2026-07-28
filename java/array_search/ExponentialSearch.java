public class ExponentialSearch {

    private static int binarySearchRange(int[] arr, int target, int left, int right) {
        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }

        return -1;
    }

    public static int exponentialSearch(int[] arr, int target) {
        int n = arr.length;

        if (n == 0) return -1;
        if (arr[0] == target) return 0;

        int bound = 1;
        while (bound < n && arr[bound] <= target) {
            bound *= 2;
        }

        return binarySearchRange(arr, target, bound / 2, Math.min(bound, n - 1));
    }
}
