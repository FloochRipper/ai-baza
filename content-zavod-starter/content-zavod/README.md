# Контент-завод — стартовый пак

Скилл для Claude Code, который автоматически собирает корпус транскрипций Reels конкурентов.

## Что делает

1. Скачивает Reels с Instagram по ссылкам
2. Транскрибирует локально через `whisper.cpp` (бесплатно, без API)
3. Собирает метадату (автор, дата, длина)
4. Складывает всё в единый markdown-корпус

## Установка (делается один раз)

### 1. У тебя должен быть Claude Code

Если его ещё нет — поставь: https://docs.claude.com/en/docs/claude-code/overview

### 2. Разархивируй эту папку внутрь своего проекта

Папка `content-zavod/` должна оказаться по пути:
```
<твой-проект>/.claude/skills/content-zavod/
```

То есть структура:
```
твой-проект/
├── .claude/
│   └── skills/
│       └── content-zavod/
│           ├── SKILL.md
│           ├── process_reels.sh
│           ├── reels_urls.txt
│           └── README.md
```

### 3. Положи скрипт в папку scripts/ твоего проекта

Создай папку `scripts/` в корне проекта, если её нет, и положи туда `process_reels.sh`:
```
твой-проект/
└── scripts/
    └── process_reels.sh
```

Сделай скрипт исполняемым:
```bash
chmod +x scripts/process_reels.sh
```

### 4. Скажи Claude Code запустить установку

В Claude Code напиши:
```
разбери мне Reels, вот ссылка: https://www.instagram.com/reel/ЛЮБОЙ/
```

Claude сам проверит что установлено, чего нет поставит, скачает модель whisper (547MB, один раз).

Если хочешь установить инструменты заранее, без Claude Code:
```bash
brew install yt-dlp ffmpeg whisper-cpp jq
mkdir -p .models
curl -L -o .models/ggml-large-v3-turbo-q5_0.bin \
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin"
```

## Использование

### Вариант 1 — через Claude Code (проще)

В чате с Claude Code напиши:
```
разбери мне Reels:
https://www.instagram.com/reel/URL1
https://www.instagram.com/reel/URL2
https://www.instagram.com/reel/URL3
```

Claude сам всё сделает и доложит результат.

### Вариант 2 — вручную через Terminal

1. Положи ссылки в `scripts/reels_urls.txt` (по одной на строку)
2. Запусти:
```bash
cat scripts/reels_urls.txt | bash scripts/process_reels.sh
```

## Где лежат результаты

- `knowledge/reels-corpus/transcripts.md` — **главный корпус**, единый markdown со всеми записями
- `knowledge/reels-corpus/metadata.json` — метадата (автор, просмотры, дата)
- `knowledge/reels-corpus/process.log` — лог последнего запуска
- `downloads/competitors/<ID>.mp4` — оригинальные mp4 (для пересмотра)

## Скорость

На Mac с Apple Silicon (M1/M2/M3):
- Один ролик 30 сек = ~10 сек на скачивание + 3 сек на транскрипцию
- Пачка из 30 роликов = ~10-15 минут

## Требования

- macOS с Apple Silicon (M1/M2/M3) — на Intel тоже работает, но медленнее
- ~16GB RAM минимум
- ~1GB на диске (для модели whisper)
- Homebrew (https://brew.sh/)

## Что дальше

Когда корпус наберётся (20+ роликов) — попроси Claude Code:
```
разбери паттерны в корпусе Reels
```

Claude прочитает `transcripts.md`, выделит хуки, структуры, CTA — сохранит в `knowledge/reels-corpus/patterns_analysis.md`.

## Вопросы и продолжение

Больше таких инструментов + разборы в телеге: **@nikitashlyk**

Если скилл сработал — напиши, покажи свой корпус. Интересно что нашёл.
