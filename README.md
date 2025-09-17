# SCA - Static Code Analysis Cloud IDE

Облачная IDE с поддержкой статического анализа кода, с интеграцией функционала github.

##  Архитектура проекта

Проект состоит из двух основных компонентов:

### Frontend (React + TypeScript)
- **SCA Frontend** - веб-интерфейс с редактором кода
- Расположен в папке `sca-frontend/`
- Использует React 18, Material-UI, WebSocket

### Backend (Spring Boot + Java)
- **SCA Backend API** - REST API и WebSocket сервер
- Расположен в папке `sca-backend/`
- Использует Spring Boot 3.2, PostgreSQL, Redis, Docker

### Предварительные требования:
- Node.js 18+
- Java 17+
- Docker & Docker Compose
- Git

### 1. Клонирование репозитория:
```bash
git clone <repository-url>
cd sca
```

### 2. Настройка Frontend:
```bash
cd sca-frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

### 4. Запуск всего проекта с Docker:
```bash
# Из корневой папки проекта
docker-compose up -d
```

### 4. Доступ к приложению:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **SonarQube**: http://localhost:9000
- **Nginx Proxy**: http://localhost:80

## 📋 Основные возможности

### 🔐 Аутентификация
- Регистрация и вход пользователей
- JWT токены для безопасности
- Роли пользователей (USER, ADMIN)

### 📁 Управление проектами
- Создание новых проектов
- Клонирование из GitHub
- Просмотр структуры файлов
- Редактирование файлов

### 🔍 Анализ кода
- **SonarQube** - комплексный анализ
- **PMD** - анализ Java кода
- **Checkstyle** - проверка стиля
- **SpotBugs** - поиск багов

### 📊 Статистика
- Анализ авторов проекта
- Выявление проблемных файлов
- Визуализация данных
- Метрики качества кода

### 🐳 Docker интеграция
- Изоляция пользовательских окружений
- Ограничения ресурсов
- Автоматическая очистка
- Безопасность контейнеров

## 🔧 Конфигурация

### Frontend (sca-frontend/.env):
```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws

# GitHub Configuration
REACT_APP_GITHUB_TOKEN=your-github-token

# Development Configuration
REACT_APP_ENV=development
```

### Backend (sca-backend/application.yml):
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
```

## 🐳 Docker развертывание

### Полное развертывание:
```bash
# Из корневой папки проекта
docker-compose up -d
```
перестроить backend
docker-compose up backend -d --build

### Развертывание отдельных компонентов:
```bash
# Только backend
docker-compose up backend -d

# Только frontend
docker-compose up frontend -d

# Только инфраструктура
docker-compose up postgres redis sonarqube nginx -d
```

## 📊 API документация

### REST API:
- `GET /api/projects` - список проектов
- `POST /api/projects` - создание проекта
- `GET /api/projects/{id}` - получение проекта
- `POST /api/analysis/{id}` - запуск анализа

### WebSocket API:
- `/ws` - WebSocket endpoint
- `/app/analyze` - запрос на анализ
- `/app/problems` - получение проблем
- `/app/file/update` - обновление файла

## 📈 Производительность

### Оптимизации:
- Кэширование с Redis
- Асинхронная обработка
- Connection pooling
- Docker контейнеры

### Мониторинг:
- Spring Boot Actuator
- React DevTools
- Docker статистика

##  Тестирование

### Frontend тесты:
```bash
cd sca-frontend
npm test
npm run test:coverage
```

### Backend тесты:
```bash
cd sca-backend
mvn test
mvn jacoco:report
```

##  Разработка

### Структура разработки:
- **Frontend**: React компоненты, хуки, утилиты
- **Backend**: Spring Boot контроллеры, сервисы, модели
- **Инфраструктура**: Docker, PostgreSQL, Redis, SonarQube

### Технологический стек:
- **Frontend**: React 18, Material-UI, WebSocket
- **Backend**: Spring Boot 3.2, Spring Security, Spring Data JPA
- **База данных**: PostgreSQL 15, Redis 7
- **Анализ кода**: SonarQube, PMD, Checkstyle, SpotBugs
- **Контейнеризация**: Docker, Docker Compose
- **Проксирование**: Nginx

## 📄 Лицензия

Этот проект разработан в рамках дипломной работы. 