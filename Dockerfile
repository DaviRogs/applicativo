FROM node:18

WORKDIR /app

COPY package*.json ./

# Instala o expo-cli global e dependências do projeto
RUN npm install -g expo-cli && npm install

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--web"]