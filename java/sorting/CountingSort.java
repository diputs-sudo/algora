import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CountingSort {

    public static int[] countingSort(int[] arr) {
        if (arr == null || arr.length == 0) {
            return new int[0];
        }

        int[] a = Arrays.copyOf(arr, arr.length);
        int maxVal = Arrays.stream(a).max().getAsInt();
        int[] count = new int[maxVal + 1];

        for (int num : a) {
            count[num]++;
        }

        List<Integer> result = new ArrayList<>();
        for (int value = 0; value < count.length; value++) {
            for (int i = 0; i < count[value]; i++) {
                result.add(value);
            }
        }

        return result.stream().mapToInt(i -> i).toArray();
    }
}
