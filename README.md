# DiscordBotAvatar
#### BotAvatar - пример личного бота для публикации сообщений от имени бота, а также для чтения и ответов на личные сообщения.

Фактически исходный код данного бота является доп. материалом для [видео](https://youtu.be/Caq4tgMuZfM) об использовании хандлера команд представленном в [DiscordBotIda](https://github.com/iamnotacoder-djs/DiscordBotIda).

## Установка
- Загрузить репозиторий `git clone https://github.com/iamnotacoder-djs/DiscordBotAvatar.git`
- В папке проекта инициализировать node-проект и загрузить модули `npm init`, `npm i discord.js@14.3.0 fs dotenv quick.db better-sqlite3`
- В *.env* заменить токен бота.
- В *config.json* заменить идентификаторы: `bot_owners` - массив пользователей, которым предоставлен доступ к команде, `controller_logs` - ID канала для логов, `controller_dm` - ID канала для создания веток для ответа на ЛС.
- Пригласить бота с админ-правами на сервер.
- Запустить с помощью `node .`


## Присоединяйся к сообществу

Есть вопросы по боту или программированию в целом? Залетай в **Хаб Не ITшников**: Сообщество разработчиков, программистов и просто людей увлекающихся кодингом.

[Discord сервер](https://discord.gg/YeqrTtpmaH)<br>
[Вконтакте](https://vk.com/iamnotacoderdjs)<br>
[Телеграм](https://t.me/iamnotacoderdjs)
