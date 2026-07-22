import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeSort {

    public static int[] mergeSort(int[] arr) {
        if (arr.length <= 1) {
            return Arrays.copyOf(arr, arr.length);
        }

        int mid = arr.length / 2;
        int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
        int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));

        List<Integer> result = new ArrayList<>();
        int i = 0;
        int j = 0;

        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result.add(left[i++]);
            } else {
                result.add(right[j++]);
            }
        }

        while (i < left.length) {
            result.add(left[i++]);
        }
        while (j < right.length) {
            result.add(right[j++]);
        }

        return result.stream().mapToInt(x -> x).toArray();
    }
}
