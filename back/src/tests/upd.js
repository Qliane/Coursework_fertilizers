// test-upd.js
const API_BASE = 'http://localhost:5000/api';
let authToken = null;

async function request(method, endpoint, data = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };
    if (data) options.body = JSON.stringify(data);
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    const responseData = contentType?.includes('application/json') ? await response.json() : await response.text();
    return { status: response.status, ok: response.ok, data: responseData };
}

async function login(username, password) {
    const res = await request('POST', '/auth/login', { username, password });
    if (res.ok && res.data.token) {
        authToken = res.data.token;
        console.log(`✅ Вход как ${username} (${res.data.user.roleName})`);
        return res.data.user;
    }
    console.error(`❌ Ошибка входа: ${res.status}`);
    return null;
}

async function testUpd() {
    console.log('\n=== Тестирование УПД ===');
    let createdId = null;

    // 1. GET список
    console.log('\n📋 GET /upd');
    let res = await request('GET', '/upd');
    if (res.ok) console.log(`   Найдено УПД: ${res.data.data.length}`);
    else console.log(`   ❌ ${res.status}`);

    // 2. POST создание
    console.log('\n➕ POST /upd');
    const newUpd = {
        conclDate: '2025-06-01',
        partnerId: 6,        // существующий ID партнёра
        storageId: 1         // существующий ID склада
    };
    res = await request('POST', '/upd', newUpd);
    if (res.ok) {
        createdId = res.data.data.id;
        console.log(`   ✅ Создан УПД ID=${createdId}`);
    } else {
        console.log(`   ❌ ${res.status} — ${res.data.error}`);
        return;
    }

    // 3. GET по ID
    console.log(`\n🔍 GET /upd/${createdId}`);
    res = await request('GET', `/upd/${createdId}`);
    if (res.ok) console.log(`   Дата заключения: ${res.data.data.conclDate}`);
    else console.log(`   ❌ ${res.status}`);

    // 4. PUT обновление
    console.log(`\n✏️ PUT /upd/${createdId}`);
    res = await request('PUT', `/upd/${createdId}`, { conclDate: '2025-06-15' });
    if (res.ok) console.log(`   ✅ Обновлено`);
    else console.log(`   ❌ ${res.status} — ${res.data.error}`);

    // 5. Фильтрация по датам
    console.log('\n🔎 GET /upd?dateFrom=2025-06-01&dateTo=2025-06-30');
    res = await request('GET', '/upd?dateFrom=2025-06-01&dateTo=2025-06-30');
    if (res.ok) console.log(`   Найдено записей: ${res.data.data.length}`);
    else console.log(`   ❌ ${res.status}`);

    // 6. DELETE удаление
    // console.log(`\n🗑️ DELETE /upd/${createdId}`);
    // res = await request('DELETE', `/upd/${createdId}`);
    // if (res.ok) console.log(`   ✅ Удалено`);
    // else console.log(`   ❌ ${res.status} — ${res.data.error}`);

    console.log('\n✅ Тестирование завершено');
}

async function run() {
    const user = await login('Анна', 'пароль012');
    if (!user || user.roleId !== 3) {
        console.error('Требуется роль работника офиса (3)');
        return;
    }
    await testUpd();
}

run();