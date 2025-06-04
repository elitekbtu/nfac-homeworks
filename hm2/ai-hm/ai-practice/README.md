Transformer Study Buddy 🧠📄

Интерактивный помощник, обученный на статье "MathBook", с возможностью отвечать на вопросы, используя встроенное векторное хранилище и file_search.
📦 Быстрый старт

    Установите зависимости:

pip install -r requirements.txt

Сконфигурируйте API:

cp .env.example .env

# Вставьте свой OPENAI_API_KEY в .env

Запустите инициализацию ассистента:

    python scripts/init_assistant.py

🗂 Структура проекта

transformer-study-buddy/
│
├─ README.md # Этот файл
├─ requirements.txt # Зависимости: openai, dotenv
├─ .env.example # Шаблон конфигурации
│
├─ scripts/
│ ├─ init_assistant.py # Создание ассистента + загрузка PDF
│ ├─ cleanup.py # Очистка: удаление ассистента, файлов и векторного хранилища
│
├─ data/
│ └─ mathbook.pdf # Загружаемый документ (замените на нужный PDF)
│
└─ assistant_info.json # (авто) сохранение ID ассистента и ресурсов

⚙️ Что делает ассистент?

    Отвечает только на основе прикреплённого PDF

    Всегда указывает номер страницы в ответе

    Использует возможности RAG (retrieval-augmented generation) через file_search

⏱ Учебный маршрут (30 минут)
Время Этап
0-5 Установка зависимостей и настройка .env
5-15 Запуск init_assistant.py
15-30 Вопросы к ассистенту через Playground
🧹 Очистка ресурсов

Чтобы избежать лишних затрат и квот:

python scripts/cleanup.py

🔗 Полезные ссылки

    OpenAI Assistants API

    File Search Tool

    Python SDK

📝 Требования

    Python 3.8+

    OpenAI API ключ

    PDF-файл для загрузки в data/mathbook.pdf
