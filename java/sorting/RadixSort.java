import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RadixSort {

    public static int[] radixSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);

        if (a.length == 0) {
            return a;
        }

        int maxNum = Arrays.stream(a).max().getAsInt();
        int exp = 1;

        while (maxNum / exp > 0) {
            List<List<Integer>> buckets = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                buckets.add(new ArrayList<>());
            }

            for (int num : a) {
                int digit = (num / exp) % 10;
                buckets.get(digit).add(num);
            }

            List<Integer> collected = new ArrayList<>();
            for (List<Integer> bucket : buckets) {
                collected.addAll(bucket);
            }

            a = collected.stream().mapToInt(i -> i).toArray();
            exp *= 10;
        }

        return a;
    }
}
