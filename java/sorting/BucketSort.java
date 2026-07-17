import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class BucketSort {

    public static int[] bucketSort(int[] arr, int bucketSize) {
        if (arr == null || arr.length == 0) {
            return new int[0];
        }

        int[] a = Arrays.copyOf(arr, arr.length);
        int minVal = Arrays.stream(a).min().getAsInt();
        int maxVal = Arrays.stream(a).max().getAsInt();
        int bucketCount = (maxVal - minVal) / bucketSize + 1;

        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i < bucketCount; i++) {
            buckets.add(new ArrayList<>());
        }

        for (int num : a) {
            int index = (num - minVal) / bucketSize;
            buckets.get(index).add(num);
        }

        List<Integer> result = new ArrayList<>();
        for (List<Integer> bucket : buckets) {
            Collections.sort(bucket);
            result.addAll(bucket);
        }

        return result.stream().mapToInt(i -> i).toArray();
    }
}
