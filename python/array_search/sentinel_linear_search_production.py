from dataclasses import dataclass 

@dataclass(frozen=True)


class SentinelSearchResult:
    found: bool 
    index: int 
    inspected: int 


def sentinel_find_first(values, target, *, start=0, stop=None):
    length = len(values)
    end = length if stop is None else stop 

    if start < 0 or start > length or end < start or end > length: 
        raise ValueError("range must satisfy 0 <= start <= stop <= len(values)")

    if start == end:
        return SentinelSearchResult(False, -1, 0)

    sentinel_index = end - 1
    saved = values[sentinel_index]
    values[sentinel_index] = target

    inspected = 0 

    try: 
        index = start 

        while values[index] != target:
            inspected += 1
            index += 1 

        inspected += 1
        found = index < sentinel_index or saved == target
        return SentinelSearchResult(found, index if found else -1, inspected)
    finally: 
        values[sentinel_index] = saved
