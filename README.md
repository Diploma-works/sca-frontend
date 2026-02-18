# SCA — Static Code Analysis Cloud IDE

Облачная IDE с поддержкой статического анализа кода и интеграцией с GitHub, GitLab и Bitbucket.

---

## Архитектура проекта

Проект состоит из двух основных компонентов:

### Frontend (React)
- **SCA Frontend** — веб-интерфейс с редактором кода
- Расположен в папке `sca-frontend/`
- React 18, Material-UI, WebSocket

### Backend (Spring Boot + Java)
- **SCA Backend API** — REST API и WebSocket сервер
- Расположен в папке `sca-backend/`
- Spring Boot 3.2, PostgreSQL, Redis, Docker

## Предварительные требования

- Node.js 18+
- Java 17+
- Docker и Docker Compose
- Git

---

## Установка и запуск

Перед запуском проекта необходимо создать файл `.env` в корневой папке проекта с необходимыми переменными окружения.

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd sca
```

### 2. Настройка Frontend

```bash
cd sca-frontend
npm install
npm start
```

### 3. Настройка Backend

```bash
cd sca-backend
mvn clean install
mvn spring-boot:run
```

### 4. Запуск всего проекта через Docker

```bash
docker-compose up -d
```

Пересборка backend:

```bash
docker-compose up backend -d --build
```



## Основные возможности

### Аутентификация
- Регистрация и вход пользователей
- JWT-токены для авторизации
- Роли пользователей (USER, ADMIN)

### Управление проектами
- Создание новых проектов
- Клонирование из GitHub, GitLab и Bitbucket
- Просмотр структуры файлов
- Редактирование файлов в браузере

### Интеграция с Git-платформами

Поддерживаются три провайдера системы контроля версий:

| Возможность                     | GitHub | GitLab | Bitbucket |
|---------------------------------|--------|--------|-----------|
| Аутентификация по токену        | да     | да     | да        |
| Список репозиториев             | да     | да     | да        |
| Просмотр веток                  | да     | да     | да        |
| Клонирование репозитория        | да     | да     | да        |
| Commit / Push / Pull            | да     | да     | да        |
| Создание и переключение веток   | да     | да     | да        |
| Stash / Stash Pop               | да     | да     | да        |
| Reset                           | да     | да     | да        |

Git-операции на уровне проекта (commit, push, pull, branch) унифицированы через паттерн Adapter (`gitProviderAdapters.js`) и единый backend-сервис `ProjectGitService`.

### Анализ кода
- **SonarQube** — комплексный анализ
- **PMD** — анализ Java-кода
- **Checkstyle** — проверка стиля кода
- **SpotBugs** — поиск потенциальных багов

### Статистика
- Анализ авторов проекта
- Выявление проблемных файлов
- Визуализация данных
- Метрики качества кода

### Docker-интеграция
- Изоляция пользовательских окружений
- Ограничения ресурсов (память, CPU)
- Автоматическая очистка контейнеров
- Безопасность контейнеров

## Docker-развёртывание

### Полное развёртывание

```bash
docker-compose up -d
```

### Развёртывание отдельных компонентов

```bash
# Только backend
docker-compose up backend -d

# Только frontend
docker-compose up frontend -d

# Только инфраструктура
docker-compose up postgres redis sonarqube nginx -d
```

---

## API-документация

### Аутентификация

| Метод | Endpoint             | Описание                |
|-------|----------------------|-------------------------|
| POST  | `/api/auth/register` | Регистрация пользователя |
| POST  | `/api/auth/login`    | Авторизация (JWT)       |

### Проекты

| Метод | Endpoint                | Описание                    |
|-------|-------------------------|-----------------------------|
| GET   | `/api/projects`         | Список проектов пользователя |
| POST  | `/api/projects`         | Создание проекта            |
| GET   | `/api/projects/{id}`    | Получение проекта           |
| POST  | `/api/projects/clone/gitlab` | Клонирование из GitLab |
| POST  | `/api/projects/clone/bitbucket` | Клонирование из Bitbucket |

### Git-операции (проект)

Базовый путь: `/api/projects/{projectId}/git`

| Метод | Endpoint                          | Описание                           |
|-------|-----------------------------------|------------------------------------|
| GET   | `/info`                           | Информация о репозитории           |
| GET   | `/status`                         | Статус файлов (modified, added...) |
| POST  | `/commit`                         | Создание коммита                   |
| POST  | `/push`                           | Push в удалённый репозиторий       |
| POST  | `/pull`                           | Pull из удалённого репозитория     |
| GET   | `/branches`                       | Список веток                       |
| GET   | `/graph`                          | Граф коммитов                      |
| POST  | `/branches`                       | Создание ветки                     |
| POST  | `/branches/{branchName}/checkout` | Переключение ветки                 |
| POST  | `/sync`                           | Синхронизация                      |
| POST  | `/stash`                          | Stash изменений                    |
| POST  | `/stash/pop`                      | Stash Pop                          |
| GET   | `/stash/status`                   | Статус стека stash                 |
| POST  | `/reset`                          | Сброс изменений                    |
| POST  | `/merge`                          | Слияние веток                      |
| POST  | `/tags`                           | Создание тега                      |

### GitHub

| Метод  | Endpoint                                      | Описание            |
|--------|-----------------------------------------------|---------------------|
| POST   | `/api/github/token`                           | Сохранение токена   |
| GET    | `/api/github/status`                          | Статус подключения  |
| GET    | `/api/github/repositories`                    | Список репозиториев |
| GET    | `/api/github/repositories/{owner}/{repo}/branches` | Список веток   |

### GitLab

| Метод  | Endpoint                                       | Описание            |
|--------|------------------------------------------------|---------------------|
| POST   | `/api/gitlab/token`                            | Сохранение токена   |
| GET    | `/api/gitlab/status`                           | Статус подключения  |
| GET    | `/api/gitlab/repositories`                     | Список репозиториев |
| GET    | `/api/gitlab/repositories/{owner}/{repo}/branches` | Список веток   |
| POST   | `/api/gitlab/repositories/{owner}/{repo}/clone`    | Клонирование    |
| DELETE | `/api/gitlab/token`                            | Удаление токена     |

### Bitbucket

| Метод  | Endpoint                                          | Описание                   |
|--------|---------------------------------------------------|----------------------------|
| POST   | `/api/bitbucket/token`                            | Сохранение токена (+username) |
| GET    | `/api/bitbucket/status`                           | Статус подключения         |
| GET    | `/api/bitbucket/repositories`                     | Список репозиториев        |
| GET    | `/api/bitbucket/repositories/{owner}/{repo}/branches` | Список веток           |
| POST   | `/api/bitbucket/repositories/{owner}/{repo}/clone`    | Клонирование           |
| DELETE | `/api/bitbucket/token`                            | Удаление токена            |
| GET    | `/api/bitbucket/ssh-key/status`                   | Статус SSH-ключа           |
| POST   | `/api/bitbucket/ssh-key`                          | Сохранение SSH-ключа       |
| DELETE | `/api/bitbucket/ssh-key`                          | Удаление SSH-ключа         |
| POST   | `/api/bitbucket/ssh-key/test`                     | Тест SSH-соединения        |

### WebSocket API

| Endpoint           | Описание                |
|--------------------|-------------------------|
| `/ws`              | WebSocket endpoint       |
| `/app/analyze`     | Запрос на анализ         |
| `/app/problems`    | Получение проблем        |
| `/app/file/update` | Обновление файла         |

---

## Производительность

### Оптимизации
- Кэширование с Redis
- Асинхронная обработка
- Connection pooling (PostgreSQL)
- Изоляция в Docker-контейнерах

### Мониторинг
- Spring Boot Actuator
- React DevTools
- Docker статистика

---

### Backend-тесты

```bash
cd sca-backend
mvn test
mvn jacoco:report
```

Тесты расположены в `src/test/java/com/sca/`:
- `service/CloneUrlAuthTest.java` — тесты формирования authenticated clone URL (GitLab, Bitbucket, percent-encoding)
- `service/GitHubServiceTest.java` — тесты сервиса GitHub
- `controller/GitHubControllerTest.java` — тесты контроллера GitHub
- `repository/GitHubTokenRepositoryTest.java` — тесты репозитория токенов

Используются: JUnit 5, Spring Boot Test.

---

## Технологический стек

| Слой             | Технологии                                          |
|------------------|-----------------------------------------------------|
| Frontend         | React 18, Material-UI, WebSocket                    |
| Backend          | Spring Boot 3.2, Spring Security, Spring Data JPA   |
| База данных      | PostgreSQL 15, Redis 7                              |
| Анализ кода      | SonarQube, PMD, Checkstyle, SpotBugs                |
| Контейнеризация  | Docker, Docker Compose                              |
| Проксирование    | Nginx                                               |
| Тестирование     | JUnit 5, Jest, React Testing Library                |

---

## Лицензия

Этот проект разработан в рамках дипломной работы. 