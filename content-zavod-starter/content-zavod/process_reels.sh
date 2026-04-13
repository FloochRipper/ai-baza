#!/usr/bin/env bash
# Пайплайн транскрипции Reels: yt-dlp → ffmpeg → whisper.cpp
# Читает список URL из stdin, складывает транскрипты в knowledge/reels-corpus/transcripts.md
#
# Использование:
#   cat scripts/reels_urls.txt | bash scripts/process_reels.sh
#
# Работает из корня рабочего проекта Claude Code.

set -u

# Все пути относительно текущей рабочей папки
PROJECT_DIR="$(pwd)"
MODEL="$PROJECT_DIR/.models/ggml-large-v3-turbo-q5_0.bin"
DOWNLOADS="$PROJECT_DIR/downloads/competitors"
CORPUS="$PROJECT_DIR/knowledge/reels-corpus"
TRANSCRIPTS_MD="$CORPUS/transcripts.md"
METADATA_JSON="$CORPUS/metadata.json"
LOG="$CORPUS/process.log"

mkdir -p "$DOWNLOADS" "$CORPUS"
: > "$LOG"

# Проверка модели
if [ ! -f "$MODEL" ]; then
  echo "ОШИБКА: не найдена модель whisper по пути $MODEL"
  echo "Скачай её командой:"
  echo "  mkdir -p .models && curl -L -o $MODEL https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin"
  exit 1
fi

# Инициализация transcripts.md если нет
if [ ! -f "$TRANSCRIPTS_MD" ]; then
  cat > "$TRANSCRIPTS_MD" <<'EOF'
# Корпус транскрипций Reels конкурентов

Единый источник транскрипций для анализа паттернов. Пополняется скриптом `process_reels.sh`.

Формат: ID → URL → метадата → чистый транскрипт.

---
EOF
fi

# Инициализация metadata.json
[ -f "$METADATA_JSON" ] || echo "[]" > "$METADATA_JSON"

extract_id() {
  local url="$1"
  echo "$url" | sed -E 's|.*/reel/([^/?]+).*|\1|'
}

processed=0
skipped=0
failed=0

while IFS= read -r url; do
  [ -z "$url" ] && continue
  id=$(extract_id "$url")
  [ -z "$id" ] && continue

  # Дедуп: уже есть в transcripts.md?
  if grep -q "^## $id\$" "$TRANSCRIPTS_MD" 2>/dev/null; then
    echo "[SKIP] $id — уже в корпусе" | tee -a "$LOG"
    skipped=$((skipped+1))
    continue
  fi

  echo "[PROCESS] $id — $url" | tee -a "$LOG"

  cd "$DOWNLOADS"

  # 1. Скачать + метадата
  if ! yt-dlp --sleep-interval 3 --max-sleep-interval 6 \
       -o "${id}.%(ext)s" --write-info-json \
       "$url" >> "$LOG" 2>&1; then
    echo "[FAIL] $id — yt-dlp не смог скачать" | tee -a "$LOG"
    failed=$((failed+1))
    continue
  fi

  mp4="$DOWNLOADS/${id}.mp4"
  info="$DOWNLOADS/${id}.info.json"

  if [ ! -f "$mp4" ]; then
    echo "[FAIL] $id — mp4 не найден после yt-dlp" | tee -a "$LOG"
    failed=$((failed+1))
    continue
  fi

  # 2. Вытащить метадату
  uploader=$(jq -r '.uploader // .channel // "unknown"' "$info" 2>/dev/null)
  view_count=$(jq -r '.view_count // 0' "$info" 2>/dev/null)
  like_count=$(jq -r '.like_count // 0' "$info" 2>/dev/null)
  upload_date=$(jq -r '.upload_date // "unknown"' "$info" 2>/dev/null)
  duration=$(jq -r '.duration // 0' "$info" 2>/dev/null)
  description=$(jq -r '.description // ""' "$info" 2>/dev/null | head -c 200)

  # 3. В WAV
  wav="$DOWNLOADS/${id}.wav"
  if ! ffmpeg -y -i "$mp4" -ar 16000 -ac 1 -c:a pcm_s16le "$wav" >> "$LOG" 2>&1; then
    echo "[FAIL] $id — ffmpeg" | tee -a "$LOG"
    failed=$((failed+1))
    continue
  fi

  # 4. Whisper (авто-определение языка)
  txt_base="$DOWNLOADS/${id}"
  if ! whisper-cli -m "$MODEL" -f "$wav" -otxt -of "$txt_base" --no-prints >> "$LOG" 2>&1; then
    echo "[FAIL] $id — whisper" | tee -a "$LOG"
    failed=$((failed+1))
    continue
  fi

  txt_file="${txt_base}.txt"
  [ -f "$txt_file" ] || { echo "[FAIL] $id — txt не создан"; failed=$((failed+1)); continue; }

  # 5. Добавить в transcripts.md
  transcript=$(cat "$txt_file" | sed 's/^ *//' | awk 'NF' | tr '\n' ' ' | sed 's/  */ /g')
  {
    echo ""
    echo "## $id"
    echo "**URL:** $url"
    echo "**Автор:** @$uploader | **Просмотры:** $view_count | **Лайки:** $like_count | **Дата:** $upload_date | **Длина:** ${duration}с"
    echo ""
    echo "$transcript"
    echo ""
    echo "---"
  } >> "$TRANSCRIPTS_MD"

  # 6. Добавить в metadata.json
  jq --arg id "$id" --arg url "$url" --arg uploader "$uploader" \
     --argjson views "$view_count" --argjson likes "$like_count" \
     --arg date "$upload_date" --argjson duration "$duration" \
     --arg desc "$description" \
     '. += [{id:$id, url:$url, uploader:$uploader, views:$views, likes:$likes, date:$date, duration:$duration, description:$desc}]' \
     "$METADATA_JSON" > "${METADATA_JSON}.tmp" && mv "${METADATA_JSON}.tmp" "$METADATA_JSON"

  # 7. Очистить промежуточные файлы (оставляем только mp4 на всякий)
  rm -f "$wav" "$info" "$txt_file"

  processed=$((processed+1))
  echo "[OK] $id — @$uploader, views=$view_count" | tee -a "$LOG"

done

echo ""
echo "==========================================="
echo "ИТОГО: обработано=$processed, пропущено=$skipped, ошибок=$failed"
echo "==========================================="
