# Sheber Frontend — правила для разработчиков и ИИ-агентов

Sheber — платформа заказа мебели. **Клиент** загружает ссылку или фото мебели с другого сайта,
мы разбираем её и открываем в онлайн **3D-конструкторе**. Клиент дорабатывает модель и публикует
**объявление**. **Подрядчики** (мебельные цехи) берут объявления и выполняют заказ.

Это SPA. Бэкенд (FastAPI) — в соседнем репозитории `../backend`; клиент API генерируется из его
OpenAPI-схемы через Orval.

## Стек

React 19 · TypeScript (strict) · Vite · TanStack Router (файловый роутинг) · TanStack Query ·
Orval (axios + react-query + zod) · Tailwind CSS 4 · shadcn/ui (Radix) · react-hook-form + Zod ·
i18next (ru, kk) · Three.js + React Three Fiber + drei (3D-конструктор) · Biome · Steiger (FSD) ·
Vitest + Testing Library.

Авторизация будет через Keycloak (keycloak-js) — пока не реализована, не добавляйте свою.

## Команды

```bash
npm install            # зависимости + git-хуки (husky)
npm run dev            # http://localhost:5173
npm run generate:api   # клиент API из OpenAPI бэкенда
npm run lint           # Biome: линтер + формат + порядок импортов
npm run lint:fix       # то же с автоисправлением
npm run lint:fsd       # Steiger: правила Feature-Sliced Design
npm run typecheck      # tsc
npm test               # vitest
npm run build          # vite build + tsc
npm run ui:add -- dialog input   # добавить компоненты shadcn
```

Зависимости ставьте через `npm install <pkg>` (`-D` для dev). Не используйте yarn/pnpm.

## Структура — Feature-Sliced Design

```
src/
├── main.tsx            точка входа
├── app/                инициализация: entrypoint (провайдеры), router, i18n, styles
├── routes/             файлы роутов TanStack Router — только связывают URL со страницей
├── pages/              страницы: композиция виджетов и фич
├── widgets/            крупные самостоятельные блоки (шапка, 3D-сцена конструктора)
├── features/           действия пользователя (опубликовать объявление, откликнуться)
├── entities/           бизнес-сущности (объявление, мебель, подрядчик)
├── shared/             переиспользуемое без бизнес-логики
│   ├── api/            http-client, query-client, generated/ (Orval)
│   ├── ui/             компоненты shadcn и базовые UI-примитивы
│   ├── lib/            утилиты (cn, форматтеры, хуки общего назначения)
│   └── config/         env и константы
└── routeTree.gen.ts    генерируется роутером
```

**Слайс** (папка внутри `pages`/`widgets`/`features`/`entities`):

```
<slice>/
├── ui/        React-компоненты
├── model/     хуки, состояние, бизнес-логика, типы
├── api/       обёртки над сгенерированными хуками (если нужна своя логика)
├── lib/       утилиты слайса
└── index.ts   единственная публичная точка входа
```

Создавайте только нужные сегменты. Пустых папок не заводим.

### Правила импортов (проверяются Biome и Steiger)

- Слой импортирует только **нижележащие** слои: `app → pages → widgets → features → entities → shared`.
- Слайсы одного слоя **не импортируют друг друга** (фича не знает про другую фичу). Нужна общая логика — опустите её в `entities` или `shared`.
- Слайс импортируется **только через `index.ts`**: `@/entities/listing`, а не `@/entities/listing/ui/listing-card`.
- Внутри слайса — относительные импорты (`./ui/listing-card`); снаружи — через алиас `@/`.
- `shared` импортируется по сегментам: `@/shared/ui/button`, `@/shared/lib/utils`, `@/shared/api`.
- `routes/` содержит только `createFileRoute(...)` с `component`, `loader`, `validateSearch`. Разметка и логика — в `pages`.

### Слайсы (план)

| Слой | Слайсы |
|---|---|
| `entities` | `user`, `contractor`, `furniture`, `listing`, `offer`, `order` |
| `features` | `import-furniture` (ссылка/фото → черновик), `edit-furniture-params`, `publish-listing`, `send-offer`, `accept-offer` |
| `widgets` | `app-header`, `furniture-constructor` (3D-сцена), `listing-feed` |
| `pages` | `home`, `import`, `constructor`, `listings`, `listing-details`, `contractor-dashboard` |

## Нейминг

- **Файлы и папки** — `kebab-case`: `listing-card.tsx`, `use-listing-filters.ts`, `publish-listing/`. Проверяет Biome (кроме `src/routes`, где действуют правила роутера: `$listingId.tsx`, `__root.tsx`).
- **Компоненты** — `PascalCase`, только именованный экспорт: `export function ListingCard()`. `export default` запрещён (кроме конфигов).
- **Хуки** — `useCamelCase`, файл `use-*.ts`.
- **Функции, переменные** — `camelCase`; константы модуля — `UPPER_SNAKE_CASE`.
- **Типы** — `type`, не `interface` (исключение — расширение чужих модулей). Пропсы — `type Props`.
- **Перечисления** — объект `as const` + тип, `enum` запрещён:
  ```ts
  export const LISTING_STATUS = { draft: 'draft', published: 'published' } as const
  export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS]
  ```
  Если значения приходят из API — берите тип из `@/shared/api/generated/model`, свой не дублируйте.
- **Тесты** — рядом с кодом: `listing-card.test.tsx`.
- **Роуты** — по файлам: `routes/listings/index.tsx`, `routes/listings/$listingId.tsx`.

## API: Orval

Клиент API **только генерируется**: `src/shared/api/generated/` не редактируется руками.

```bash
npm run generate:api                                   # с запущенного бэкенда (localhost:8000)
OPENAPI_URL=../backend/openapi.json npm run generate:api   # из файла (cd ../backend && make openapi)
```

- Генерируются: хуки TanStack Query (`endpoints/<тег>/<тег>.ts`), типы (`model/`), Zod-схемы (`zod/`).
- Имя хука = имя эндпоинта на бэкенде: `get_listing` → `useGetListing`, `create_listing` → `useCreateListing`.
- Все запросы идут через мутатор `src/shared/api/http-client.ts` (axios, baseURL, позже — токен Keycloak).
- Сгенерированный код коммитится — фронт собирается без запущенного бэкенда.
- Нужен другой ответ или параметр — меняйте бэкенд и перегенерируйте. Не пишите запросы руками через axios/fetch в обход Orval.
- После мутации инвалидируйте кэш сгенерированным ключом: `queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() })`.
- Обёртку в `<slice>/api/` создавайте, только когда к запросу добавляется логика (инвалидация, маппинг, оптимистичные обновления).

## Формы

react-hook-form + `zodResolver`. Схему валидации берите из `@/shared/api/generated/zod/...` — те же правила,
что на бэкенде. Расширяйте её (`.extend`, `.refine`) только для чисто клиентских правил.

## UI и стили

- Компоненты shadcn — в `src/shared/ui`, добавляются **только** через `npm run ui:add -- <name>`.
  Файлы shadcn можно править под проект.
- Tailwind-классы; цвета — только токены темы (`bg-background`, `text-muted-foreground`, `border-border`), без хардкода `#hex`.
- Склейка классов — `cn()` из `@/shared/lib/utils`. Варианты компонента — `cva`.
- Иконки — `lucide-react`.
- Каждая строка интерфейса — через `t('...')` из `react-i18next`. Ключи добавляйте в `src/app/i18n/locales/ru.json` и `kk.json` одновременно (ключи типизированы по `ru.json`).

## 3D-конструктор

- Сцена — React Three Fiber (`<Canvas>`) + хелперы drei. Three.js императивно не используем, кроме случаев, которых нет в R3F/drei.
- Параметры мебели (габариты, материалы, секции) — данные из API, а не состояние Three.js. Сцена строится из них.
- 3D-код живёт в `widgets/furniture-constructor` и `entities/furniture` (геометрия, материалы).

## Состояние

- Серверное — только TanStack Query (через сгенерированные хуки). Не копируйте ответы API в `useState`.
- URL-состояние (фильтры, пагинация) — search params TanStack Router с `validateSearch` на Zod.
- Локальное UI-состояние — `useState`/`useReducer` в компоненте.

## TypeScript

- `any`, `@ts-ignore`, `@ts-expect-error` без описания и non-null `!` запрещены.
- `import.meta.env` напрямую не читаем — только `env` из `@/shared/config` (проверяется Zod). Новую переменную — в `env.ts` и `.env.example`.

## Тесты

Vitest + Testing Library. Тестируем поведение (что видит и делает пользователь), а не реализацию.
Логика в `model/` и `lib/` — с тестами.

## Git

Коммиты — **Conventional Commits** (проверяет commitlint в хуке `commit-msg`):

```
<type>(<scope>): <описание>
```

| type | когда |
|---|---|
| `feat` | новая функциональность |
| `fix` | исправление бага |
| `refactor` | изменение кода без изменения поведения |
| `perf` | производительность |
| `test` | только тесты |
| `docs` | только документация (в т.ч. AGENTS.md) |
| `style` | форматирование без изменения логики |
| `build` | зависимости, Vite, Docker |
| `ci` | CI/CD |
| `chore` | прочее обслуживание (в т.ч. перегенерация API: `chore(api): обновить клиент API`) |
| `revert` | откат коммита |

- `scope` — слайс или область (`listing`, `constructor`, `api`, `i18n`), необязателен.
- Описание — по-русски, с маленькой буквы, в инфинитиве («добавить», а не «добавил»), без точки, заголовок до 72 символов.
- Ломающее изменение — `feat!:` и футер `BREAKING CHANGE:`.
- Один коммит — одно логическое изменение.
- Примеры: `feat(constructor): добавить изменение ширины шкафа`, `fix(listing): исправить пагинацию ленты`.
- Ветки: `<type>/<кратко-через-дефис>` — `feat/listing-feed`.

Хуки: `pre-commit` — Biome на изменённых файлах; `commit-msg` — commitlint; `pre-push` — typecheck, Steiger, тесты.

## Чек-лист перед завершением задачи

1. `npm run lint:fix`, затем `npm run lint` и `npm run lint:fsd` — без ошибок.
2. `npm run typecheck` и `npm test` — зелёные.
3. Менялся API бэкенда — `npm run generate:api`, сгенерированный код в том же изменении.
4. Новые строки интерфейса — в `ru.json` и `kk.json`.

## Для ИИ-агентов

- Не коммитьте и не пушьте без явной просьбы пользователя.
- Не редактируйте `src/shared/api/generated/` и `src/routeTree.gen.ts` — они генерируются (Claude Code заблокирует правку).
- Не добавляйте зависимости без необходимости; если добавили — объясните зачем.
- Не создавайте слои, сегменты и папки вне описанной структуры без согласования.
- Комментарии — по-русски, объясняют «почему», а не пересказывают код.
- Если правило мешает решить задачу — остановитесь и спросите, а не обходите его.
