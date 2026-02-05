FROM node:18-alpine

# Увеличиваем лимит памяти для Node.js
ENV NODE_OPTIONS=--max-old-space-size=4096

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Ставим все зависимости (включая dev) для сборки
RUN npm ci

# Обновляем базу browserslist (убирает warning)
RUN npx update-browserslist-db@latest --yes

# Исправляем warning от babel-preset-react-app
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

RUN npm install @monaco-editor/react

# Копируем исходники
COPY . .

EXPOSE 3000

# Запускаем dev-сервер для hot-reload
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
