import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FractionalCascading {
    private record Entry(int value, int catalogPosition, int nextPosition) {
    }

    public static List<Integer> fractionalCascading(List<List<Integer>> catalogs, int target) {
        List<Integer> results = new ArrayList<>();
        if (catalogs.isEmpty()) return results;

        List<List<Entry>> layers = buildLayers(catalogs);
        int position = entryLowerBound(layers.get(0), target);

        for (int index = 0; index < catalogs.size(); index++) {
            List<Entry> layer = layers.get(index);
            while (position > 0 && layer.get(position - 1).value() >= target) position--;
            while (position < layer.size() && layer.get(position).value() < target) position++;

            results.add(position == layer.size()
                ? catalogs.get(index).size()
                : layer.get(position).catalogPosition());

            if (index + 1 < catalogs.size()) {
                position = position == layer.size()
                    ? layers.get(index + 1).size()
                    : layer.get(position).nextPosition();
            }
        }
        return results;
    }

    private static List<List<Entry>> buildLayers(List<List<Integer>> catalogs) {
        List<List<Entry>> layers = new ArrayList<>(Collections.nCopies(catalogs.size(), List.of()));

        for (int index = catalogs.size() - 1; index >= 0; index--) {
            List<Integer> catalog = catalogs.get(index);
            List<Entry> next = index + 1 < catalogs.size() ? layers.get(index + 1) : List.of();
            List<Integer> values = new ArrayList<>(catalog);

            for (int nextIndex = 1; nextIndex < next.size(); nextIndex += 2) {
                values.add(next.get(nextIndex).value());
            }
            Collections.sort(values);

            List<Entry> layer = new ArrayList<>();
            for (int value : values) {
                layer.add(new Entry(
                    value,
                    catalogLowerBound(catalog, value),
                    entryLowerBound(next, value)
                ));
            }
            layers.set(index, List.copyOf(layer));
        }
        return List.copyOf(layers);
    }

    private static int catalogLowerBound(List<Integer> values, int target) {
        int low = 0;
        int high = values.size();
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (values.get(mid) < target) low = mid + 1;
            else high = mid;
        }
        return low;
    }

    private static int entryLowerBound(List<Entry> values, int target) {
        int low = 0;
        int high = values.size();
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (values.get(mid).value() < target) low = mid + 1;
            else high = mid;
        }
        return low;
    }
}
