def sentinel_linear_search(array, target):
    if not array:
        return -1 

    last_index = len(array) - 1
    saved_last = array[last_index]
    array[last_index] = target

    index = 0 
    while array[index] != target:
        index += 1

    array[last_index] = saved_last

    if index < last_index or saved_last == target: 
        return index 

    return -1 
