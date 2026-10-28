# Sheber Frontend — правила для разработчиков и ИИ-агентов

Sheber — платформа заказа корпусной мебели (шкафы, стеллажи, комоды). **Клиент** собирает мебель в онлайн
**3D-конструкторе** из шаблона (позже — по ссылке или фото с помощью ИИ) и публикует **заказ**.
**Мастерские** после модерации видят заказы своего города, откликаются ценой и сроком; клиент выбирает
одну, и стороны видят контакты друг друга. Оплаты на платформе пока нет.

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

### Слайсы

| Слой | Слайсы |
|---|---|
| `entities` | `viewer` (текущий пользователь), `city` (справочник городов, `CitySelect`), `furniture` (документ мебели, ядро конструктора, 3D, чертёж, превью), `order`, `offer`, `workshop` (бейджи статусов, карточки), `review` (`RatingStars`, `ReviewItem`) |
| `features` | `start-design` (шаблоны, импорт по ссылке/фото), `publish-order`, `send-offer`, `accept-offer`, `manage-order`, `delete-design`, `edit-profile`, `workshop-application`, `moderate-workshop`, `order-chat` (переписка по заказу в боковой панели, опрос раз в 10 с), `review-workshop` (отзыв клиента о мастерской по выполненному заказу), `manage-attachments` (`AttachmentGallery`: загрузка с прогрессом, повтор, удаление, обложка, порядок, подписи; один компонент для мастерской, проекта и заказа) |
| `widgets` | `app-header` (навигация по ролям, мобильное меню, колокольчик уведомлений — опрос `summary` раз в 30 с), `design-editor` (конструктор) |
| `pages` | `landing`, `welcome` (онбординг), `projects`, `project-new`, `project-editor`, `orders`, `order-details`, `market` (лента мастерских), `my-offers`, `workshop`, `admin-workshops`, `profile`, `design-system` (dev) |

### Справочники и перечисления

- **Справочники из БД** (города) — сущность в `entities/<что>`: хук над сгенерированным запросом и UI выбора
  (`useCities`, `CitySelect` из `@/entities/city`). В формах храним `id`, в ответах API приходит объект
  `{ id, name }` с названием уже на языке пользователя — локали фронтенда названия не дублируют.
- **Перечисления в коде** (статусы, типы мебели, материалы) — тип и константы генерирует Orval из OpenAPI
  (`FurnitureTypeEnum` из `@/shared/api/generated/model`), подписи — ключи i18n (`furnitureTypes.*`, `orderStatus.*`).
  Свои копии значений не заводим.
- Язык уходит на бэкенд заголовком `Accept-Language` (interceptor в `http-client.ts`); при смене языка
  кэш запросов сбрасывается (`app/entrypoint`), и данные приходят в новом языке.

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
- Текущий пользователь и роли — `useViewer()` из `@/entities/viewer` (профиль с бэкенда `/users/me`:
  телефон, город, роли, статус мастерской). Проверка роли — `hasRole(viewer, 'contractor')`,
  подтверждённая мастерская — `isWorkshop(viewer)`.
- Новый пользователь без телефона и города попадает на `/welcome` (`OnboardingGate` в `app/layout`).
- Роль `contractor` выдаёт бэкенд при одобрении мастерской; в токене она появится после `refreshSession()`.
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
- В основной бандл входит только `ru` (язык по умолчанию и источник типов ключей); `kk` и `en` подгружаются
  чанками при выборе языка (backend-модуль i18next в `app/i18n`), `main.tsx` ждёт `i18nReady` перед рендером.

## Конструктор и 3D

Мебель — это **документ** (`entities/furniture/model/document.ts`, размеры в мм), бэкенд хранит его как JSON и
валидирует той же схемой (`backend/schemas/designs/sch_document.py`) — меняете формат, меняйте оба места.

- **Дерево разбиений**: узел — либо `split` (ось `x` — колонки слева направо, `y` — ярусы сверху вниз,
  размер ребёнка в мм или `null` = «авто»), либо `cell` с наполнением (`empty`, `shelves`, `rod`, `drawers`).
  Двери (`door`) висят на любом узле, но не перекрываются: `setDoor` снимает двери у предков и потомков.
  Тип фасада (`open`/`hinged`/`sliding`) — на весь документ.
- **Ядро** — чистые функции без React: `computeLayout` (координаты узлов и перегородок),
  `buildParts` (детали для 3D и чертежа), `validateDocument` (ошибки и замечания с кодами `issues.*`),
  `summarizeDesign` (характеристики), операции в `operations.ts` (всегда возвращают новый документ).
  Новое правило или наполнение — с тестом в `kernel.test.ts`.
- **Шаблоны** — `model/templates.ts`, тексты — `templates.<id>` в локалях; каждый шаблон проходит проверку без ошибок (тест).
- **Отрисовка**: `DesignScene` (R3F, грузится лениво), `DesignDrawing` (SVG: `blueprint` с размерными цепочками,
  `facade` — превью), `DesignViewport` (переключатель 3D/чертёж, двери, размеры). Подписи в 3D — спрайты
  с canvas-текстурой (`lib/label-texture.ts`), не `Html` из drei.
- Редактор (`widgets/design-editor`): история undo/redo с объединением шагов слайдера (`useEditorState`),
  автосохранение с задержкой (`useAutosave`), `flush()` перед публикацией.
- Импорт по ссылке/фото пока без ИИ: ссылка сохраняется в `designs.source_url` и показывается мастерской.
  Место для ИИ-разбора — `features/start-design/ui/link-import-card.tsx` и `photo-import-card.tsx`
  (на бэкенде — будущий домен `imports`).
- Лендинг использует свой лёгкий изометрический `WardrobeDrawing` (`model/sketch.ts`) — это не документ конструктора.
- Цвета материалов — только `MATERIALS` из `@/shared/design`; их имена совпадают с `MaterialEnum` на бэкенде.
- Покадровые изменения — в `useFrame` через ref, а не через `setState`.
- Внешние ассеты (HDRI-пресеты drei `Environment`, шрифты troika) не используем — они тянутся с CDN.

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
