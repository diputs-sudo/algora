def hash_search(arr, target): 
    table = {}

    for index, value in enumerate(arr):
        if value not in table:
            table[value] = index

    return table.get(target, -1)
