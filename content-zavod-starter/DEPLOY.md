# Как это задеплоено

Стартовый пак деплоится как часть базы знаний на Netlify.
Корень базы знаний: `/Users/mac/Documents/Projects/baza-znaniy/`.

После подключения к Netlify URL будет:
```
https://<site-name>.netlify.app/content-zavod-starter/
```
(где `<site-name>` - имя сайта в Netlify, например `baza-znaniy`)

Это и есть ссылка, которую отправляешь в директ на слово `ЗАВОД`.

## Что лежит в этой папке

- `index.html` - лендинг
- `content-zavod-starter.zip` - архив со скиллом (8KB), отдаётся кнопкой "Скачать"
- `skill-source/` - исходники скилла (для дальнейших правок)
- `content-zavod/` - распакованная версия скилла (временно, нужна только для сборки zip)

## Как менять контент потом

**Текст лендинга:** правишь `index.html` -> коммит -> Netlify сам задеплоит.

**Содержимое скилла:** правишь файлы в `skill-source/` -> пересобираешь zip командой ниже -> коммит.

Пересборка zip:
```bash
cd /Users/mac/Documents/Projects/baza-znaniy/content-zavod-starter
rm -rf content-zavod content-zavod-starter.zip
mkdir content-zavod
cp skill-source/SKILL.md skill-source/process_reels.sh skill-source/reels_urls.txt skill-source/README.md content-zavod/
zip -r content-zavod-starter.zip content-zavod/
rm -rf content-zavod
```

## Проверка перед коммитом

Открой локально:
```bash
open /Users/mac/Documents/Projects/baza-znaniy/content-zavod-starter/index.html
```

Проверь:
- Лендинг выглядит как надо
- Кнопка "Скачать скилл" реально скачивает zip
- В архиве 4 файла: SKILL.md, process_reels.sh, reels_urls.txt, README.md

## Если что-то не работает у конечного пользователя

В README внутри скилла описаны все шаги установки. Если пользователь пишет в директ "не работает" - попроси:
1. Скриншот ошибки
2. Результат команды `which yt-dlp ffmpeg whisper-cli jq` (что установлено)
3. Результат `ls -la .models/` (есть ли модель whisper)

Типичные проблемы:
- Нет Homebrew -> ставить brew первым делом
- Нет места на диске -> модель 547MB не поместилась
- Приватные аккаунты в ссылках -> yt-dlp не скачает, нужно отдельно логиниться
