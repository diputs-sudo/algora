import java.util.ArrayList;
import java.util.List;

public final class FractionalCascadingProduction {
    public record QueryResult(List<Integer> positions, List<Boolean> matches) {
    }

    private final List<List<Integer>> catalogs;

    public FractionalCascadingProduction(List<List<Integer>> catalogs) {
        this.catalogs = catalogs.stream()
            .map(List::copyOf)
            .toList();
    }

    public QueryResult query(int target) {
        List<Integer> positions = new ArrayList<>();
        List<Boolean> matches = new ArrayList<>();

        if (catalogs.isEmpty()) {
            return new QueryResult(positions, matches);
        }

        int position = lowerBound(catalogs.get(0), target);

        for (List<Integer> catalog : catalogs) {
            position = Math.min(position, catalog.size());

            while (position > 0 && catalog.get(position - 1) >= target) {
                position--;
            }

            while (position < catalog.size() && catalog.get(position) < target) {
                position++;
            }

            positions.add(position);
            matches.add(position < catalog.size() && catalog.get(position) == target);
        }

        return new QueryResult(positions, matches);
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
