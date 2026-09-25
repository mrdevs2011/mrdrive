#!/bin/sh
# Ishlatish: ~/.uploads-pull.sh NOM [MANZIL_PAPKA]
# uploads repo'dan NOM ni kompyuterga ko'chiradi, tekshiradi, keyin repo'dan o'chiradi.
set -e
NOM="$1"; DEST="${2:-$HOME}"
[ -n "$NOM" ] || { echo "NOM kerak"; exit 2; }
D=$(mktemp -d); trap 'rm -rf "$D"' EXIT
export GIT_ASKPASS="$HOME/.gh-askpass.sh" GIT_TERMINAL_PROMPT=0
MASK='s/(github_pat_|ghp_|gho_|ghs_)[A-Za-z0-9_]+/***/g'
git clone -q --depth 1 https://github.com/mrdevs2011/uploads.git "$D/r" 2>&1 | sed -E "$MASK"
[ -e "$D/r/$NOM" ] || { echo "repo'da $NOM yo'q"; exit 3; }
TARGET="$DEST/$NOM"
[ ! -e "$TARGET" ] || { echo "$TARGET allaqachon bor, ustidan yozmadim, repo'dan o'chirmadim"; exit 4; }
mkdir -p "$DEST"
cp -a "$D/r/$NOM" "$TARGET"
A=$(cd "$D/r" && find "$NOM" -type f | wc -l)
B=$(cd "$DEST" && find "$NOM" -type f | wc -l)
SA=$(du -sb "$D/r/$NOM" | cut -f1)
SB=$(du -sb "$TARGET" | cut -f1)
if [ "$A" != "$B" ] || [ "$SA" != "$SB" ]; then
  echo "tekshiruv mos kelmadi (fayl $A/$B, bayt $SA/$SB), repo'dan o'chirmadim"; exit 5
fi
cd "$D/r"
git rm -rq "$NOM"
git -c user.email=cmmgh@local -c user.name=CMMGH commit -qm "remove $NOM (kompyuterga ko'chirildi)"
git push -q origin HEAD 2>&1 | sed -E "$MASK"
echo "OK: $TARGET ($A fayl, $SA bayt). uploads repo'dan o'chirildi."
