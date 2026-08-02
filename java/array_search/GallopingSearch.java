public class GallopingSearch {

    private static int binarySearchRange(int[] arr, int target, int left, int right) {
        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }

        return -1;
    }

    public static int gallopingSearch(int[] arr, int target) {
        int n = arr.length;

        if (n == 0) return -1;
        if (arr[0] == target) return 0;

        int previous = 0;
        int jump = 1;

        while (jump < n && arr[jump] < target) {
            previous = jump;
            jump *= 2;
        }

        return binarySearchRange(arr, target, previous + 1, Math.min(jump, n - 1));
    }
}
