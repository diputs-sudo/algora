class HashIndex: 
    def __init__(self, values):
        self._index = {}

        for position, value in enumerate(values):
            self._index.setdefault(value, position)

    def find(self, target):
        return self._index.get(target, -1)

    def contains(self, target):
        return target in self._index


def hash_search(values, target):
    return HashIndex(values).find(target)
