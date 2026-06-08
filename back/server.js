const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Проверка подключения к БД
db.pool.connect((err, client, release) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.stack);
        process.exit(1);
    }
    console.log('Успешное подключение к базе данных');
    release();
    
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
    });
});