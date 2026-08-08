const DEFAULT_CAPACITY = 17;
function hashIndex(value, capacity) {
    const index = value % capacity;
    return index < 0 ? index + capacity : index;
}
function createBuckets(table, activeIndex, state) {
    return table.map((entry, index) => ({
        index,
        key: entry?.key,
        value: entry?.value,
        state: index === activeIndex ? state : entry ? "filled" : "empty"
    }));
}
function bucketStateForPhase(phase) {
    switch (phase) {
        case "collision":
            return "collision";
        case "found":
            return "found";
        case "miss":
            return "miss";
        default:
            return "active";
    }
}
function createInsight(phase, table, hash, probe, value, insertedCount, collisions, probeLength, stepTitle, stepDetail, bucketDetail, note, sourceIndex, comparison, decisionText) {
    return {
        phase,
        buckets: createBuckets(table, probe, bucketStateForPhase(phase)),
        hashIndex: hash,
        probeIndex: probe,
        sourceIndex,
        value,
        items: insertedCount,
        loadFactor: table.length === 0 ? 0 : insertedCount / table.length,
        collisions,
        probeLength,
        stepTitle,
        stepDetail,
        bucketDetail,
        comparison,
        decisionText: decisionText ?? "Hash the key, inspect the bucket, and probe forward only when a collision blocks the slot.",
        note
    };
}
function createStep(type, array, target, insight, message, probes, resultIndex) {
    return {
        type,
        array,
        target,
        mid: insight.sourceIndex,
        highlightIndices: insight.sourceIndex === undefined ? [] : [insight.sourceIndex],
        pointers: insight.sourceIndex === undefined ? [] : [{ label: insight.phase === "build" ? "insert" : "key", index: insight.sourceIndex }],
        probes,
        resultIndex,
        message,
        hashTable: insight
    };
}
export function createHashTableLookupInitialStep(array, target) {
    const capacity = Math.max(DEFAULT_CAPACITY, array.length * 2 + 1);
    const table = Array(capacity).fill(null);
    const firstValue = array[0] ?? target;
    const hash = hashIndex(firstValue, capacity);
    const insight = createInsight("build", table, hash, hash, firstValue, 0, 0, 0, "Compute the hash", `Hash key ${firstValue} to choose the first bucket.`, "No bucket has been inspected yet.", "Start by building a table that maps each value to its first array index.", array.length > 0 ? 0 : undefined, "empty bucket", "Hash each value, then place it in the first available bucket.");
    return createStep("narrow", array, target, insight, "Build the hash table before the target lookup.", 0);
}
export function* hashTableLookup(array, target) {
    const capacity = Math.max(DEFAULT_CAPACITY, array.length * 2 + 1);
    const table = Array(capacity).fill(null);
    let probes = 0;
    let insertedCount = 0;
    let collisions = 0;
    for (let sourceIndex = 0; sourceIndex < array.length; sourceIndex++) {
        const value = array[sourceIndex];
        const hash = hashIndex(value, capacity);
        let probe = hash;
        while (table[probe] !== null && table[probe]?.key !== value) {
            probes += 1;
            collisions += 1;
            const insight = createInsight("collision", table, hash, probe, value, insertedCount, collisions, probe - hash >= 0 ? probe - hash + 1 : capacity - hash + probe + 1, "Inspect a blocked bucket", `Bucket ${probe} already stores key ${table[probe]?.key}.`, `Stored key ${table[probe]?.key} does not match incoming key ${value}.`, "Linear probing moves to the next bucket until it finds the key or an empty slot.", sourceIndex, `${table[probe]?.key} blocks ${value}`, `Bucket ${probe} is occupied, so probe bucket ${(probe + 1) % capacity}.`);
            yield createStep("inspect", array, target, insight, `Collision while inserting ${value}: bucket ${probe} is occupied.`, probes);
            probe = (probe + 1) % capacity;
        }
        probes += 1;
        if (table[probe] === null) {
            table[probe] = { key: value, value: sourceIndex };
            insertedCount += 1;
            const insight = createInsight("build", table, hash, probe, value, insertedCount, collisions, probe - hash >= 0 ? probe - hash + 1 : capacity - hash + probe + 1, "Store the key", `Bucket ${probe} is available for key ${value}.`, `Store key ${value} with array index ${sourceIndex}.`, "The bucket now stores the value and the first index where it appears.", sourceIndex, `bucket ${probe} is empty`, `Store ${value} at bucket ${probe}.`);
            yield createStep("inspect", array, target, insight, `Insert ${value} from array index ${sourceIndex} into bucket ${probe}.`, probes);
        }
        else {
            const insight = createInsight("build", table, hash, probe, value, insertedCount, collisions, probe - hash >= 0 ? probe - hash + 1 : capacity - hash + probe + 1, "Keep first occurrence", `Bucket ${probe} already stores key ${value}.`, `The table keeps array index ${table[probe]?.value}.`, "Duplicate keys keep the earliest source index for this teaching table.", sourceIndex, `${value} already stored`, `Keep the earlier index ${table[probe]?.value}.`);
            yield createStep("inspect", array, target, insight, `${value} is already in the table, so keep its first index.`, probes);
        }
    }
    const lookupHash = hashIndex(target, capacity);
    let lookupProbe = lookupHash;
    while (table[lookupProbe] !== null) {
        probes += 1;
        const entry = table[lookupProbe];
        const found = entry?.key === target;
        const insight = createInsight(found ? "found" : "lookup", table, lookupHash, lookupProbe, target, insertedCount, collisions, lookupProbe - lookupHash >= 0 ? lookupProbe - lookupHash + 1 : capacity - lookupHash + lookupProbe + 1, found ? "Lookup succeeds" : "Inspect next bucket", found ? `Bucket ${lookupProbe} contains the target key.` : `Bucket ${lookupProbe} contains key ${entry?.key}.`, found ? `Stored key ${entry?.key} matches target ${target}.` : `Stored key ${entry?.key} does not match target ${target}.`, found ? "The bucket key matches the target, so the stored array index is returned." : "This bucket has a different key, so lookup continues to the next bucket.", undefined, `${entry?.key} ${found ? "==" : "!="} ${target}`, found
            ? `Bucket ${lookupProbe} contains key ${target}. Keys match. Lookup succeeds and returns array index ${entry?.value}.`
            : `Bucket ${lookupProbe} stores key ${entry?.key}, not ${target}. Continue probing at bucket ${(lookupProbe + 1) % capacity}.`);
        yield createStep(found ? "found" : "inspect", array, target, insight, found ? `Target ${target} found through bucket ${lookupProbe}.` : `Bucket ${lookupProbe} has ${entry?.key}, not ${target}.`, probes, found ? entry?.value : undefined);
        if (found) {
            return;
        }
        lookupProbe = (lookupProbe + 1) % capacity;
    }
    probes += 1;
    const missInsight = createInsight("miss", table, lookupHash, lookupProbe, target, insertedCount, collisions, lookupProbe - lookupHash >= 0 ? lookupProbe - lookupHash + 1 : capacity - lookupHash + lookupProbe + 1, "Lookup stops", `Bucket ${lookupProbe} is empty.`, "An empty bucket means the probe chain never stored this key.", "An empty bucket ends the probe chain, so the target was never inserted.", undefined, `bucket ${lookupProbe} is empty`, `Return -1 because ${target} is not in the table.`);
    yield createStep("miss", array, target, missInsight, `Bucket ${lookupProbe} is empty, so ${target} is not in the hash table.`, probes, -1);
}
