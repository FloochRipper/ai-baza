---
source: "claude_tools_ru3.pdf — перевод для @prompt_design"
original_author: "@aiedge_ (X) — https://newsletter.aiedgehq.co/"
positioning: "AI-инструменты для продуктивности (англоязычный автор, русский перевод)"
added: 2026-04-18
purpose: "Референс-обзор всех инструментов Claude в 4 уровня. НЕ копировать структуру, но взять отдельные идеи/фишки для блоков базы."
---

# Гайд конкурента — структура

9 страниц, 4 уровня:

1. **Интерфейс** — Projects, Skills, Memory, Connectors
2. **Исследование и мышление** — Deep Research, Extended Thinking, Artifacts
3. **Агентские** — Claude Cowork (Scheduled Tasks, File Access, Plug-Ins), Cowork Dispatch, Claude in Chrome
4. **Сборка и кодинг** — Claude Code, Slash Commands, CLAUDE.md, Subagents, /memory

---

## Что реально новое для нашей базы

### 1. Memory в вебе (Settings → Memory)
Фишка, которую мы ещё не фиксировали: у claude.ai есть свой слой памяти между беседами, и в Settings можно зайти, посмотреть что Claude помнит, отредактировать или удалить. У нас это не описано — есть только `/memory` в Claude Code (через aizdec-референс).

**Использовать в блоке:** "Как Claude запоминает тебя" для новичков.

### 2. Перенос памяти из ChatGPT в Claude
Приём от автора: попросить ChatGPT выдать документ-экспорт своей памяти о тебе, затем импортировать в Claude. Полезная фишка для аудитории, которая уже сидит в ChatGPT и мигрирует.

**Использовать в блоке:** "Миграция с ChatGPT на Claude".

### 3. Extended Thinking — два способа включения
- Фразой в промпте: "think deeply before responding"
- Переключателем в интерфейсе под выбором модели

Плюс тезис "для глубоких задач — Opus". *Примечание: у автора "Opus 4.6", сейчас уже 4.7 — перепроверить актуальную модель перед публикацией.*

**Использовать в блоке:** объяснить разницу "быстрый ответ vs думающий".

### 4. Claude в десктопном приложении — три ежедневные функции
Автор выделяет три практических применения:
- **Scheduled Tasks** — запуск задач по расписанию (ежедневный ресерч, скан Gmail/Calendar по брифам)
- **File Access** — доступ к локальным файлам и папкам, Claude работает внутри выделенных рабочих пространств
- **Plug-Ins** — автор называет их "Skills на стероидах", якобы упаковывают несколько Skills в роль

**⚠️ Перед использованием перепроверить терминологию:** "Claude Cowork", "Cowork Dispatch" — похоже на авторский лексикон, не уверен что это официальные названия Anthropic. Нужно сверить с анонсами Anthropic.

### 5. Claude in Chrome
Коннектор/расширение для запуска задач в браузере без переключения окон.
Ссылка из гайда: chromewebstore.google.com/publisher/anthropic

**Использовать в блоке:** "Инструменты" — как альтернатива MCP-коннекторам для веб-задач.

### 6. Deep Research — время выполнения
Конкретика: от 5 до 45 минут в зависимости от сложности запроса. Хорошая цифра для объяснения новичкам, чтобы не паниковали что "он долго отвечает".

---

## Что уже есть у нас (дубли)

| Тема у конкурента | Где у нас |
|-|-|
| Projects — "среда для контекста" | [knowledge-base/wiki/projects-architecture.md](../../knowledge-base/wiki/projects-architecture.md) |
| Skills — модульные инструкции | [wiki/claude-code-skills.md](../../knowledge-base/wiki/claude-code-skills.md), [wiki/skills-architecture.md](../../knowledge-base/wiki/skills-architecture.md) |
| Connectors (Gmail, Drive, Slack, Calendar) | [references/competitor-guide-claude-install.md](competitor-guide-claude-install.md) |
| CLAUDE.md | [references/competitor-guide-aizdec-memory.md](competitor-guide-aizdec-memory.md) |
| Slash Commands + кастомные | наш CLAUDE.md, handoff-флоу с `/morning`, `/endday` |
| Multi-Agent / Subagents | упомянуто в skills-architecture |
| Claude Code как продукт | competitor-guide-claude-install (карточка) |

---

## Что сомнительное — перепроверить перед публикацией

1. **Терминология "Cowork / Dispatch"** — авторское это или официальное название? У Anthropic desktop-app называется просто "Claude Desktop". "Scheduled Tasks", "File Access", "Plug-Ins" — это фичи этого приложения.
2. **"Opus 4.6"** — в тексте говорят про 4.6, сейчас актуальна 4.7. При копировании цифр — обновлять.
3. **"50+ коннекторов"** — число может устаревать быстро. Если используем — дать ссылку на Anthropic, а не жёстко вписывать число.
4. **"Plug-In упаковывает несколько Skills в единую роль"** — формулировка спорная, нужно сверить с официальной докой.

---

## Идеи для блоков / статей на нашей платформе

Что можно собрать из этого материала (в свой тон, не копируя):

- **"Настройки Claude, о которых ты не знаешь"** — Memory, Connectors, Extended Thinking (3 быстрые фишки)
- **"Миграция с ChatGPT на Claude"** — включая трюк с экспортом памяти
- **"Claude Desktop vs веб"** — когда нужен десктоп (scheduled, file access)
- **"Как Claude думает: быстрый vs расширенный режим"** — Extended Thinking на пальцах
- **"4 уровня использования Claude"** — если хотим свою версию лестницы (но без термина "Cowork")

---

## Чего НЕ брать

- **Структуру "4 уровня"** — у автора она искусственная, "Cowork" звучит как маркетинг. У нас своя структура (БАЗА / ИНСТРУМЕНТЫ).
- **Фразы про "заменял реальных сотрудников"** — не наш тон, звучит как продажа курса.
- **Списки и жирный текст прямо оттуда** — у нас стиль без жирного и без маркированных списков в теле статей (CLAUDE.md).
