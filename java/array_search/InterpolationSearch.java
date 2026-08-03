public class InterpolationSearch {

    public static int interpolationSearch(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;

        while (low <= high && target >= arr[low] && target <= arr[high]) {
            if (arr[low] == arr[high]) {
                return arr[low] == target ? low : -1;
            }

            int position = low + (int) (((long) (target - arr[low]) * (high - low))
                    / (arr[high] - arr[low]));

            if (arr[position] == target) return position;
            if (arr[position] < target) low = position + 1;
            else high = position - 1;
        }

        return -1;
    }
}
