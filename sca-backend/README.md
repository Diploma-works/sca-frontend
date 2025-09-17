# SCA Backend API - Модуль GitHub интеграции для облачной IDE

## 🏗 Архитектура

### Технологический стек:
- **Spring Boot 3.2** - основной фреймворк
- **Spring Security** - аутентификация и авторизация
- **Spring WebSocket** - real-time коммуникация
- **Spring Data JPA** - работа с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и сессии
- **Docker** - контейнеризация и изоляция
- **SonarQube** - статический анализ кода

### Основные компоненты модуля GitHub интеграции:
1. **GitHub Authentication** - аутентификация через GitHub OAuth
2. **Repository Management** - управление репозиториями GitHub
3. **Project Cloning** - клонирование проектов из GitHub
4. **Token Management** - управление GitHub токенами
5. **WebSocket Integration** - real-time коммуникация с frontend
6. **GitHub API Integration** - интеграция с GitHub REST API

## 🚀 Быстрый старт

### Предварительные требования:
- Java 17+
- Maven 3.6+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Локальная разработка:

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd backend
```

2. **Настройте базу данных:**
```bash
# Запустите PostgreSQL и Redis
docker-compose up postgres redis -d
```

3. **Настройте переменные окружения:**
```bash
cp application.yml.example application.yml
# Отредактируйте application.yml
```

4. **Запустите приложение:**
```bash
mvn spring-boot:run
```

### Развертывание с Docker:

1. **Из корневой папки проекта:**
```bash
# Запуск всех сервисов
docker-compose up -d

# Или только backend и его зависимости
docker-compose up backend postgres redis sonarqube -d
```

2. **Проверьте статус:**
```bash
docker-compose ps
```

3. **Просмотрите логи:**
```bash
docker-compose logs -f backend
# Или для конкретного сервиса:
docker-compose logs -f sca-backend-api
```

## 📋 API Endpoints модуля GitHub интеграции

### GitHub аутентификация:
- `GET /api/github/auth` - получение URL для GitHub OAuth
- `POST /api/github/callback` - обработка callback от GitHub
- `GET /api/github/user` - получение информации о пользователе GitHub

### Управление репозиториями:
- `GET /api/github/repositories` - список репозиториев пользователя
- `GET /api/github/repositories/{owner}/{repo}` - информация о репозитории
- `POST /api/github/repositories/clone` - клонирование репозитория
- `GET /api/github/repositories/{owner}/{repo}/branches` - список веток

### Управление токенами:
- `POST /api/github/tokens` - сохранение GitHub токена
- `GET /api/github/tokens` - получение токенов пользователя
- `DELETE /api/github/tokens/{id}` - удаление токена

### WebSocket endpoints:
- `/ws` - WebSocket endpoint для real-time коммуникации
- `/app/github/repositories` - получение списка репозиториев
- `/app/github/clone` - клонирование репозитория

## 🔧 Конфигурация

### Основные настройки (application.yml):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sca_ide
    username: postgres
    password: password
  
  redis:
    host: localhost
    port: 6379

docker:
  host: tcp://localhost:2375
  containers:
    memory-limit: 512m
    cpu-limit: 0.5

websocket:
  endpoint: /ws
  allowed-origins:
    - http://localhost:3000
    - https://diploma-works.github.io
```

### Переменные окружения:

```bash
# База данных
DB_USERNAME=postgres
DB_PASSWORD=password
DB_HOST=localhost

# Redis
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-here

# GitHub
GITHUB_TOKEN=your-github-token

# Docker
DOCKER_HOST=tcp://localhost:2375
```

## 🐳 Docker

### Сборка образа:
```bash
docker build -t sca-backend .
```

### Запуск с docker-compose:
```bash
# Из корневой папки проекта
# Все сервисы
docker-compose up -d

# Только backend и его зависимости
docker-compose up backend postgres redis sonarqube -d

# С пересборкой
docker-compose up --build
```

### Просмотр логов:
```bash
docker-compose logs -f backend
```

## 🔗 GitHub интеграция

### Функциональность модуля:
1. **OAuth аутентификация** - безопасная авторизация через GitHub
2. **Управление репозиториями** - просмотр и выбор репозиториев
3. **Клонирование проектов** - автоматическое клонирование в IDE
4. **Управление токенами** - безопасное хранение GitHub токенов
5. **Real-time коммуникация** - WebSocket для обновлений в реальном времени

### Процесс интеграции:
1. Пользователь авторизуется через GitHub OAuth
2. Получение списка доступных репозиториев
3. Выбор репозитория для работы
4. Клонирование репозитория в рабочую среду IDE
5. Интеграция с существующими инструментами анализа кода

## 🔐 Безопасность GitHub интеграции

### GitHub OAuth:
- Безопасная авторизация через GitHub OAuth 2.0
- Временные токены доступа
- Автоматическое обновление токенов

### Управление токенами:
- Шифрование GitHub токенов в базе данных
- Проверка прав доступа к репозиториям
- Автоматическая очистка недействительных токенов

### Безопасность API:
- Валидация всех входящих запросов
- Проверка прав доступа к репозиториям
- Rate limiting для GitHub API

## 📊 Мониторинг

### Health checks:
- `GET /actuator/health` - состояние приложения
- `GET /actuator/info` - информация о приложении
- `GET /actuator/metrics` - метрики

### Логирование:
- Структурированные логи
- Различные уровни логирования
- Ротация логов

## 🧪 Тестирование

### Запуск тестов:
```bash
# Все тесты
mvn test

# Только unit тесты
mvn test -Dtest=UnitTest

# Интеграционные тесты
mvn test -Dtest=IntegrationTest
```

### Тестовое покрытие:
```bash
mvn jacoco:report
```

## 📈 Производительность

### Оптимизации:
- Кэширование с Redis
- Асинхронная обработка
- Connection pooling
- Docker контейнеры с ограничениями

### Мониторинг:
- Spring Boot Actuator
- Micrometer метрики
- Docker статистика

## 🤝 Интеграция с Frontend

### WebSocket сообщения для GitHub:
```javascript
// Подключение
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

// Получение списка репозиториев
stompClient.send("/app/github/repositories", {}, {
    token: githubToken
});

// Клонирование репозитория
stompClient.send("/app/github/clone", {}, {
    repositoryUrl: 'https://github.com/user/repo.git',
    projectName: 'my-project'
});

// Получение результатов
stompClient.subscribe('/user/queue/github-results', function(response) {
    const results = JSON.parse(response.body);
    // Обработка результатов
});
```

### REST API для GitHub:
```javascript
// Получение репозиториев
fetch('/api/github/repositories', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});

// Клонирование репозитория
fetch('/api/github/repositories/clone', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        repositoryUrl: 'https://github.com/user/repo.git',
        projectName: 'my-project'
    })
});
```

## 🚀 Развертывание в продакшене

### Рекомендации:
1. Используйте HTTPS
2. Настройте SSL сертификаты
3. Используйте внешнюю базу данных
4. Настройте мониторинг
5. Настройте backup стратегию
6. Используйте load balancer

### Команды для продакшена:
```bash
# Сборка production образа
docker build -t sca-backend:prod .

# Запуск с production конфигурацией
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Лицензия

MIT License 