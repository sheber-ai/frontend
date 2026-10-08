# Sheber Frontend — правила для разработчиков и ИИ-агентов

Sheber — платформа заказа мебели. **Клиент** загружает ссылку или фото мебели с другого сайта,
мы разбираем её и открываем в онлайн **3D-конструкторе**. Клиент дорабатывает модель и публикует
**объявление**. **Подрядчики** (мебельные цехи) берут объявления и выполняют заказ.

Это SPA. Бэкенд (FastAPI) — в соседнем репозитории `../backend`; клиент API генерируется из его
OpenAPI-схемы через Orval.

## Стек

React 19 · TypeScript (strict) · Vite · TanStack Router (файловый роутинг) · TanStack Query ·
Orval (axios + react-query + zod) · Tailwind CSS 4 · shadcn/ui (Radix) · react-hook-form + Zod ·
i18next (ru, kk; en — в подготовке) · Three.js + React Three Fiber + drei (3D) · Motion (анимации) · Biome · Steiger (FSD) ·
Vitest + Testing Library.

Авторизация — Keycloak (keycloak-js), см. раздел «Авторизация». Локальный Keycloak: `../keycloak-theme` (`make up`).

## Команды

```bash
npm install            # зависимости + git-хуки (husky)
npm run dev            # http://localhost:5173
npm run generate:api   # клиент API из OpenAPI бэкенда
npm run lint           # Biome + проверка токенов дизайна (lint:design)
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
├── app/                инициализация: entrypoint (провайдеры), layout, router, i18n, styles
├── routes/             файлы роутов TanStack Router — только связывают URL со страницей
├── pages/              страницы: композиция виджетов и фич
├── widgets/            крупные самостоятельные блоки (шапка, 3D-сцена конструктора)
├── features/           действия пользователя (опубликовать объявление, откликнуться)
├── entities/           бизнес-сущности (объявление, мебель, подрядчик)
├── shared/             переиспользуемое без бизнес-логики
│   ├── design/         дизайн-система: токены, эмблема, иконки (см. «Дизайн-система»)
│   ├── api/            http-client, query-client, generated/ (Orval)
│   ├── auth/           keycloak-js: вход, выход, токен, requireAuth
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
| `entities` | `viewer` (текущий пользователь, есть), `furniture` (3D-модель шкафа, есть), `contractor`, `furniture`, `listing`, `offer`, `order` |
| `features` | `import-furniture` (ссылка/фото → черновик), `edit-furniture-params`, `publish-listing`, `send-offer`, `accept-offer` |
| `widgets` | `app-header` (есть), `furniture-constructor` (3D-сцена), `listing-feed` |
| `pages` | `landing` (главная, есть), `profile` (есть), `design-system` (dev), `import`, `constructor`, `listings`, `listing-details`, `contractor-dashboard` |

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

## Авторизация

Вход, регистрация и сброс пароля — на страницах Keycloak (тема в `../keycloak-theme`), не в SPA.
Своих форм логина не делаем.

- `src/shared/auth` — единственное место, где используется `keycloak-js`. Экземпляр `Keycloak` наружу не экспортируется.
- `initAuth()` вызывается в `main.tsx` до рендера (`check-sso`: тихо проверяет сессию, без редиректа).
  Если Keycloak недоступен — приложение работает как для гостя.
- Токен подставляет interceptor в `http-client.ts` и сам обновляет его заранее. В компонентах токен не трогаем.
- Защищённый роут: `beforeLoad: requireAuth` — гостя отправит на вход и вернёт обратно:
  ```ts
  export const Route = createFileRoute('/listings/new')({ beforeLoad: requireAuth, component: NewListingPage })
  ```
- Кнопки: `login()`, `register()`, `logout()` из `@/shared/auth`.
- Текущий пользователь и роли — `useViewer()` из `@/entities/viewer` (данные с бэкенда `/auth/me`,
  а не из токена). Проверка роли — `hasRole(viewer, UserRoleEnum.contractor)`; enum — из сгенерированных моделей.
- Скрытие кнопок по ролям — только UX. Настоящая проверка прав — на бэкенде.

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

## Дизайн-система

Единый справочник — `src/shared/design/`. Весь интерфейс берёт цвета, шрифты, размеры, иконки и логотип **только отсюда**.
Живая витрина: http://localhost:5173/design (только в dev) — палитра светлой и тёмной темы, типографика, иконки, компоненты.

| Файл | Что |
|---|---|
| `tokens.css` | все цвета (светлая + `.dark`), шрифт, шкала текста, радиусы → Tailwind-утилиты |
| `icons.ts` | одобренный набор иконок lucide-react, сгруппирован по смыслу |
| `logo.tsx` | `<Logo />` (знак + название), `<LogoMark />` (только эмблема, `variant="brand" \| "mono"`) |
| `tokens.ts` | списки токенов для страницы `/design` |

**Цвета** — тёплая «мастерская»: ореховый `primary`, песочные нейтральные, шалфейный `brand-sage`.
Используйте только семантические классы: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
`bg-primary text-primary-foreground`, `bg-secondary`, `border-border`, `ring-ring`; статусы — `success`, `warning`,
`info`, `destructive` (у каждого есть `-foreground`); графики — `chart-1..5`.
Запрещены `#hex`, `rgb()/oklch()` в компонентах и палитра Tailwind (`bg-red-500`, `text-white`) —
`npm run lint` падает (`scripts/check-design.mjs`). Нужен новый цвет — добавьте токен в `tokens.css`
(в `:root` и `.dark`) и в `@theme inline`, затем в `tokens.ts`.

**Шрифт** — Onest Variable (self-hosted, `@fontsource-variable/onest`): кириллица с казахскими буквами + латиница.
Другие шрифты не подключаем.

**Типографика** — только шкала: `text-display`, `text-h1`…`text-h4`, `text-body-lg`, `text-body`, `text-body-sm`,
`text-caption` (размер, высота строки, вес и трекинг уже заданы). В разметке — компоненты:
```tsx
import { Heading, Text } from '@/shared/ui/typography'
<Heading as="h1" size="h1">…</Heading>
<Text size="sm" tone="muted">…</Text>
```
Произвольные `text-[17px]`, `font-[650]`, `tracking-[…]` не используем.

**Иконки** — только из `@/shared/design`: `import { Ruler, Sofa } from '@/shared/design'`.
Прямой импорт `lucide-react` запрещён Biome (кроме `shared/design` и `shared/ui`). Нужна новая иконка —
добавьте её в `icons.ts` (импорт, нужная группа `ICON_GROUPS`, экспорт). Размер — классом `size-4`/`size-5`;
внутри `Button` иконка подстраивается сама.

**Логотип** — только `<Logo />` / `<LogoMark />`, не копируйте SVG. Favicon (`public/favicon.svg`) и тема Keycloak
используют ту же эмблему — меняете её, обновите все три места.

**Радиусы** — `rounded-sm/md/lg/xl` от токена `--radius`. **Тёмная тема** — класс `.dark` на контейнере.

## UI-компоненты

- Компоненты shadcn — в `src/shared/ui`, добавляются **только** через `npm run ui:add -- <name>`.
  Файлы shadcn можно править под проект (и нужно — если в них появился хардкод цвета).
- Склейка классов — `cn()` из `@/shared/lib/utils`. Варианты компонента — `cva`.
- Каждая строка интерфейса — через `t('...')` из `react-i18next`. Языки: `ru` (по умолчанию), `kk`, `en`.
  Ключи добавляйте в `src/app/i18n/locales/ru.json`, `kk.json` и `en.json` одновременно (ключи типизированы по `ru.json`).
  Все языки — `LANGUAGES`, в интерфейсе доступны только `ENABLED_LANGUAGES` (сейчас ru и kk; английский
  переводится, но пока не показывается). Выбор сохраняется в localStorage и передаётся в Keycloak.
  Исключение — dev-страница `/design`, она не переводится.

## 3D

- Сцены — React Three Fiber (`<Canvas>`) + хелперы drei. Three.js императивно — только там, где нет R3F/drei.
- 2D-рендер шкафа — `WardrobeDrawing` (`mode="model" | "blueprint"`) в `entities/furniture`. Реализм модели:
  каждая грань рисуется в плоских координатах (см, ось y вверх) и переносится в изометрию аффинной матрицей —
  текстуры и свет ложатся по грани; шпон и краска процедурные (`feTurbulence` + `feDisplacementMap`), без картинок.
  Новое покрытие — запись в `MATERIALS` (`finish: 'wood' | 'paint'`, цвета волокон/рисунка, фурнитура `HARDWARE`).
- Модели мебели — в `entities/furniture` (`<Cabinet getParams={...} />`). Геометрия общая (единичный куб),
  размеры меняются через `scale` — параметры можно менять каждый кадр без пересоздания геометрии.
- Параметры мебели (габариты, материалы, секции) — данные, сцена строится из них. Цвета материалов — только
  `MATERIALS` из `@/shared/design`.
- Покадровые изменения — в `useFrame` через ref, а не через `setState`.
- three.js тяжёлый: компонент с `<Canvas>` грузится лениво (`lazy(() => import(...))` + `Suspense`).
- Внешние ассеты (HDRI-пресеты drei `Environment` и т.п.) не используем — они тянутся с CDN.

## Анимации

- Библиотека — `motion` (`import { motion } from 'motion/react'`). Другие (GSAP, AOS) не добавляем.
- Появление при скролле — `whileInView` с `viewport={{ once: true }}`; общий компонент `Reveal` — в `pages/landing`
  (понадобится на других страницах — вынести в `shared/ui`).
- Привязка к скроллу — `useScroll` + `useTransform`/`useSpring`; для дискретных состояний — `useMotionValueEvent`.
- Анимируйте `transform` и `opacity`, не `width/height/top` (кроме случаев, где без этого нельзя).
- Уважайте `prefers-reduced-motion`: страница с анимациями оборачивается в `<MotionConfig reducedMotion="user">`,
  CSS-анимации — с `motion-reduce:animate-none`.
- Длительности 0.4–0.9 с, кривая `EASE_OUT` (`[0.22, 1, 0.36, 1]`).

## Лендинг (`pages/landing`)

Главная страница. Порядок: hero с живым конфигуратором (`configurator.tsx`: изометрический шкаф
`WardrobeDrawing` из `entities/furniture`, разделитель «модель ⇄ чертёж», ширина/высота/секции/материал)
→ «Как это работает» (4 карточки, мини-демо крутятся только пока карточка видна — `useInView`) → бегущая строка
→ «Для кого» (вкладки «Клиентам / Мастерским») → бенто «Почему Sheber» → CTA → подвал.
Якоря: `LANDING_SECTIONS` из `@/shared/config`, ссылки — `SectionLink` из `@/shared/ui/section-link`.

- Не привязывайте сюжет к позиции скролла (pinned-секции, scroll-timeline на несколько экранов): пользователь
  листает вверх, вниз, останавливается посередине — такие сцены ломаются и мешают якорям.
- Переключаемые панели не должны менять высоту страницы: держите варианты в одной ячейке грида.
- Тексты — `landing.*` в локалях. Не обещайте того, чего нет в продукте (цифр, гарантий, сроков).
  Данные для демо — `model/mock.ts`, явно помечены как иллюстрация.

## Адаптивность

**Каждый экран обязан корректно работать на любой ширине — от 320px до 2560px+.** Это условие готовности задачи.

- Mobile-first: базовые классы — для телефона, `sm:` / `md:` / `lg:` / `xl:` / `2xl:` — расширяют.
- Проверяйте минимум на 320, 375, 768, 1024, 1440 и 1920px. Горизонтального скролла страницы быть не должно
  (проверка: `document.documentElement.scrollWidth === innerWidth`).
- Ширина контента — утилита `page-container` (max 1600px, «резиновые» поля). Шапка, секции и подвал используют её же;
  свои `max-w-*` + `mx-auto` для раскладки страницы не заводим.
- Сетки — `grid` с колонками по брейкпоинтам (`sm:grid-cols-2 xl:grid-cols-4`), а не фиксированные ширины в px.
- Крупные заголовки — `text-hero` (уже «резиновый» через `clamp`) или шкала с брейкпоинтами (`text-h2 lg:text-h1`).
- Интерактив — с учётом тача: зоны нажатия от 40px, перетаскивание через pointer events с `touch-pan-y`,
  без зависимости от hover. Кнопки в узких местах — во всю ширину (`w-full sm:w-auto`).
- Длинные строки — `truncate` / `text-balance` / `min-w-0` у flex-детей, чтобы ничего не распирало контейнер.
- У любого `grid` задавайте колонки явно, начиная с `grid-cols-1` (это `minmax(0, 1fr)`). Неявная колонка `auto`
  растёт под самую широкую неразрывную строку и выталкивает контент за край экрана на узких телефонах.
- Длинные списки карточек на телефоне — горизонтальная карусель со `snap-x`, где следующая карточка
  выглядывает с края; переключатели вкладок длинных панелей — `sticky` под шапкой.
- Скрытие элементов на телефоне (`max-sm:hidden`) — только для второстепенного; основное действие доступно всегда.

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
| `chore` | прочее обслуживание (в т.ч. перегенерация API: `chore(api): regenerate api client`) |
| `revert` | откат коммита |

- `scope` — слайс или область (`listing`, `constructor`, `api`, `i18n`), необязателен.
- Описание — **на английском**, в повелительном наклонении («add», а не «added»/«adds»), с маленькой буквы, без точки, заголовок до 72 символов. Тело коммита (зачем) — тоже на английском.
- Ломающее изменение — `feat!:` и футер `BREAKING CHANGE:`.
- Один коммит — одно логическое изменение.
- Примеры: `feat(constructor): add wardrobe width control`, `fix(listing): fix feed pagination`.
- Ветки: `<type>/<кратко-через-дефис>` — `feat/listing-feed`.

Хуки: `pre-commit` — Biome на изменённых файлах; `commit-msg` — commitlint; `pre-push` — typecheck, Steiger, тесты.

## Комментарии и язык кода

- Комментарии и JSDoc — **только на английском**, коротко и **только когда без них непонятно**:
  неочевидное «почему», ограничение, обход бага. Не пересказывайте код.
  ```ts
  // Must come before react()
  tanstackRouter({ target: 'react', autoCodeSplitting: true }),
  ```
- Всё, что видит только разработчик, — тоже на английском: тексты `Error`, `console.*`, названия тестов,
  сообщения скриптов. Текст для пользователя — только через `t('...')`.

## Чек-лист перед завершением задачи

1. `npm run lint:fix`, затем `npm run lint` (Biome + токены дизайна) и `npm run lint:fsd` — без ошибок.
2. `npm run typecheck` и `npm test` — зелёные.
3. Менялся API бэкенда — `npm run generate:api`, сгенерированный код в том же изменении.
4. Новые строки интерфейса — в `ru.json`, `kk.json` и `en.json`.
5. Новые цвета, иконки, размеры — через `src/shared/design`, а не по месту.
6. Экран проверен на 320–1920px: ничего не обрезано, нет горизонтального скролла.

## Для ИИ-агентов

- Не коммитьте и не пушьте без явной просьбы пользователя.
- Не редактируйте `src/shared/api/generated/` и `src/routeTree.gen.ts` — они генерируются (Claude Code заблокирует правку).
- Не добавляйте зависимости без необходимости; если добавили — объясните зачем.
- Не создавайте слои, сегменты и папки вне описанной структуры без согласования.
- Комментарии — на английском и только по необходимости (см. «Комментарии и язык кода»).
- Если правило мешает решить задачу — остановитесь и спросите, а не обходите его.
