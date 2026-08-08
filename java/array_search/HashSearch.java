import java.util.HashMap;
import java.util.Map;

public class HashSearch {

    public static int hashSearch(int[] arr, int target) {
        Map<Integer, Integer> indexByValue = new HashMap<>();

        for (int i = 0; i < arr.length; i++) {
            indexByValue.putIfAbsent(arr[i], i);
        }

        return indexByValue.getOrDefault(target, -1);
    }
}
