public class BitonicArraySearch {

    private static int findPeak(int[] arr) {
        int left = 0;
        int right = arr.length - 1;

        while (left < right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] < arr[mid + 1]) left = mid + 1;
            else right = mid;
        }

        return left;
    }

    private static int binarySearchIncreasing(int[] arr, int target, int left, int right) {
        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }

        return -1;
    }

    private static int binarySearchDecreasing(int[] arr, int target, int left, int right) {
        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) return mid;
            if (arr[mid] > target) left = mid + 1;
            else right = mid - 1;
        }

        return -1;
    }

    public static int bitonicSearch(int[] arr, int target) {
        if (arr.length == 0) return -1;

        int peak = findPeak(arr);
        int index = binarySearchIncreasing(arr, target, 0, peak);

        if (index != -1) return index;

        return binarySearchDecreasing(arr, target, peak + 1, arr.length - 1);
    }
}
