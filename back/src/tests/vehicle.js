// test-vehicles.js
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

async function testVehicles(partnerId) {
    console.log(`\n=== Тестирование ТС для партнёра ${partnerId} ===`);
    let createdId = null;

    // 1. GET список
    console.log(`\n📋 GET /partners/${partnerId}/vehicles`);
    let res = await request('GET', `/partners/${partnerId}/vehicles`);
    if (res.ok) console.log(`   Найдено ТС: ${res.data.data.length}`);
    else console.log(`   ❌ ${res.status}`);

    // 2. POST создание
    console.log(`\n➕ POST /partners/${partnerId}/vehicles`);
    const newVehicle = {
        registrationMark: 'А123ВС77',
        type: 'T',
        capacity: 5000.00
    };
    res = await request('POST', `/partners/${partnerId}/vehicles`, newVehicle);
    if (res.ok) {
        createdId = res.data.data.id;
        console.log(`   ✅ Создано ТС ID=${createdId}, номер=${res.data.data.registrationMark}`);
    } else {
        console.log(`   ❌ ${res.status} — ${res.data.error}`);
        return;
    }

    // 3. GET по ID
    console.log(`\n🔍 GET /partners/${partnerId}/vehicles/${createdId}`);
    res = await request('GET', `/partners/${partnerId}/vehicles/${createdId}`);
    if (res.ok) console.log(`   Грузоподъёмность: ${res.data.data.capacity} кг`);
    else console.log(`   ❌ ${res.status}`);

    // 4. PUT обновление
    console.log(`\n✏️ PUT /partners/${partnerId}/vehicles/${createdId}`);
    res = await request('PUT', `/partners/${partnerId}/vehicles/${createdId}`, { capacity: 6000 });
    if (res.ok) console.log(`   ✅ Обновлено`);
    else console.log(`   ❌ ${res.status} — ${res.data.error}`);

    // 5. DELETE
    console.log(`\n🗑️ DELETE /partners/${partnerId}/vehicles/${createdId}`);
    res = await request('DELETE', `/partners/${partnerId}/vehicles/${createdId}`);
    if (res.ok) console.log(`   ✅ Удалено`);
    else console.log(`   ❌ ${res.status} — ${res.data.error}`);

    console.log('\n✅ Тестирование завершено');
}

async function run() {
    // Для CRUD нужен работник офиса. Для чтения можно партнёра.
    const user = await login('Анна', 'пароль012');
    if (!user || user.roleId !== 3) {
        console.error('Требуется роль работника офиса');
        return;
    }
    const partnerId = 6; // существующий партнёр
    await testVehicles(partnerId);
}

run();