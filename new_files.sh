#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <algorithm_name>"
    echo "Example: $0 hash_table"
    exit 1
fi

NAME="$1"

PASCAL_NAME=$(echo "$NAME" | awk -F'_' '{
    for (i = 1; i <= NF; i++) {
        printf "%s", toupper(substr($i,1,1)) substr($i,2)
    }
}')

CATEGORY="graphs"

mkdir -p ".python/$CATEGORY"
mkdir -p ".c/$CATEGORY"
mkdir -p ".cpp/$CATEGORY"
mkdir -p ".java/$CATEGORY"

touch "./python/$CATEGORY/${NAME}.py"
touch "./python/$CATEGORY/${NAME}_production.py"

touch "./c/$CATEGORY/${NAME}.c"
touch "./c/$CATEGORY/${NAME}_production.c"

touch "./cpp/$CATEGORY/${NAME}.cpp"
touch "./cpp/$CATEGORY/${NAME}_production.cpp"

touch "./java/$CATEGORY/${PASCAL_NAME}.java"
touch "./java/$CATEGORY/${PASCAL_NAME}Production.java"

echo "Created files for: $NAME"