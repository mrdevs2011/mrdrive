#!/bin/sh
# CMC only. Uploads repo -> kompyuter -> MRdrive (binary, no base64).
# Ishlatish: ~/.uploads-to-mrdrive.sh NOM [PAPKA]
set -e
NOM="$1"
FOLDER="${2:-}"
[ -n "$NOM" ] || { echo "NOM kerak"; exit 2; }
DEST="$HOME/Claude/Uploads"
mkdir -p "$DEST"
TARGET="$DEST/$NOM"
if [ ! -e "$TARGET" ]; then
  ~/.uploads-pull.sh "$NOM" "$DEST"
else
  echo "allaqachon bor: $TARGET — uploads-pull o'tkazib yuborildi"
fi
[ -e "$TARGET" ] || { echo "kompyuterda $TARGET yo'q"; exit 3; }
exec "$HOME/.local/bin/mrdrive" push "$TARGET" "$FOLDER"
