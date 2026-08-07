import java.util.ArrayList;
import java.util.List;

public class FractionalCascading {
    public static List<Integer> fractionalCascading(List<List<Integer>> catalogs, int target) {
        List<Integer> results = new ArrayList<>();

        if (catalogs.isEmpty()) {
            return results;
        }

        int position = lowerBound(catalogs.get(0), target);
        results.add(position);

        for (int catalogIndex = 1; catalogIndex < catalogs.size(); catalogIndex++) {
            List<Integer> catalog = catalogs.get(catalogIndex);
            position = Math.min(position, catalog.size());

            while (position > 0 && catalog.get(position - 1) >= target) {
                position--;
            }

            while (position < catalog.size() && catalog.get(position) < target) {
                position++;
            }

            results.add(position);
        }

        return results;
    }

    private static int lowerBound(List<Integer> values, int target) {
        int low = 0;
        int high = values.size();

        while (low < high) {
            int mid = low + (high - low) / 2;

            if (values.get(mid) < target) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    }
}
