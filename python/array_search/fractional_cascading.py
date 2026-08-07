from bisect import bisect_left


def fractional_cascading(catalogs, target):
    if not catalogs:
        return []

    results = [] 
    position = bisect_left(catalogs[0], target)
    results.append(position)

    for catalog in catalogs[1:]:
        position = min(position, len(catalog))

        while position > 0 and catalog[position - 1] >= target:
            position -= 1

        while position < len(catalog) and catalog[position] < target:
            position += 1

        results.append(position)

    return results
