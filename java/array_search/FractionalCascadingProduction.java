import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class FractionalCascadingProduction {
    public record QueryResult(List<Integer> positions, List<Boolean> matches) {
    }

    private record Entry(int value, int catalogPosition, int nextPosition) {
    }

    private final List<List<Integer>> catalogs;
    private final List<List<Entry>> layers;

    public FractionalCascadingProduction(List<List<Integer>> catalogs) {
        this.catalogs = catalogs.stream()
            .map(List::copyOf)
            .toList();
        this.layers = buildLayers();
    }

    public QueryResult query(int target) {
        List<Integer> positions = new ArrayList<>();
        List<Boolean> matches = new ArrayList<>();

        if (layers.isEmpty()) {
            return new QueryResult(positions, matches);
        }

        int position = entryLowerBound(layers.get(0), target);

        for (int index = 0; index < catalogs.size(); index++) {
            List<Entry> layer = layers.get(index);
            List<Integer> catalog = catalogs.get(index);

            position = repairPosition(layer, position, target);
            int catalogPosition = position == layer.size()
                ? catalog.size()
                : layer.get(position).catalogPosition();

            positions.add(catalogPosition);
            matches.add(catalogPosition < catalog.size() && catalog.get(catalogPosition) == target);

            if (index + 1 < layers.size()) {
                position = position == layer.size()
                    ? layers.get(index + 1).size()
                    : layer.get(position).nextPosition();
            }
        }

        return new QueryResult(positions, matches);
    }

    private List<List<Entry>> buildLayers() {
        List<List<Entry>> result = new ArrayList<>(Collections.nCopies(catalogs.size(), List.of()));

        for (int index = catalogs.size() - 1; index >= 0; index--) {
            List<Integer> catalog = catalogs.get(index);
            List<Entry> nextLayer = index + 1 < catalogs.size() ? result.get(index + 1) : List.of();
            List<Integer> values = new ArrayList<>(catalog);

            for (int nextIndex = 1; nextIndex < nextLayer.size(); nextIndex += 2) {
                values.add(nextLayer.get(nextIndex).value());
            }

            Collections.sort(values);

            List<Entry> layer = new ArrayList<>();
            for (int value : values) {
                layer.add(new Entry(
                    value,
                    lowerBound(catalog, value),
                    entryLowerBound(nextLayer, value)
                ));
            }

            result.set(index, List.copyOf(layer));
        }

        return List.copyOf(result);
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

    private static int entryLowerBound(List<Entry> layer, int target) {
        int low = 0;
        int high = layer.size();

        while (low < high) {
            int mid = low + (high - low) / 2;

            if (layer.get(mid).value() < target) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    }

    private static int repairPosition(List<Entry> layer, int position, int target) {
        while (position > 0 && layer.get(position - 1).value() >= target) {
            position--;
        }

        while (position < layer.size() && layer.get(position).value() < target) {
            position++;
        }

        return position;
    }
}
