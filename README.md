# Sheber Frontend

SPA платформы Sheber. Правила, структура и соглашения — в [AGENTS.md](AGENTS.md).

## Быстрый старт

```bash
cp .env.example .env
npm install
npm run dev
```

Нужны бэкенд на http://localhost:8000 (`../backend`) и Keycloak на http://localhost:8080 (`../keycloak-theme`, `make up`).
Тестовые пользователи — в `../keycloak-theme/README.md`.

Дизайн-система (цвета, шрифт, иконки, эмблема): `src/shared/design`, витрина — http://localhost:5173/design (dev).
