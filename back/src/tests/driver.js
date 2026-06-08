// test-drivers.js
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
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
    } else {
        responseData = await response.text();
    }
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

async function testDrivers(partnerId) {
    console.log(`\n=== Тестирование водителей для партнёра ${partnerId} ===`);
    let createdUserId = null;

    // 1. GET список
    console.log('\n📋 GET /partners/' + partnerId + '/drivers');
    let res = await request('GET', `/partners/${partnerId}/drivers`);
    if (res.ok) console.log(`   Найдено: ${res.data.data.length}`);
    else console.log(`   ❌ ${res.status}`);

    // 2. POST – создать водителя (нужен существующий пользователь с ролью DRIVER)
    console.log('\n➕ POST /partners/' + partnerId + '/drivers');
    const newDriver = {
        userId: 6,  // замените на реальный ID пользователя с role=5
        license: '77AA123456',
        categories: 2  // например, категория B
    };
    res = await request('POST', `/partners/${partnerId}/drivers`, newDriver);
    console.log(res.data.data)
    if (res.ok) {
        createdUserId = res.data.data.userid;
        console.log(`   ✅ Создан водитель user_id=${createdUserId}`);
    } else {
        console.log(`   ❌ ${res.status} — ${res.data.error}`);
        return;
    }

    // 3. GET по ID
    console.log(`\n🔍 GET /partners/${partnerId}/drivers/${createdUserId}`);
    res = await request('GET', `/partners/${partnerId}/drivers/${createdUserId}`);
    if (res.ok) console.log(`   ✅ Данные: ${res.data.data.surname} ${res.data.data.name}`);
    else console.log(`   ❌ ${res.status}`);

    // 4. PUT обновление
    console.log(`\n✏️ PUT /partners/${partnerId}/drivers/${createdUserId}`);
    res = await request('PUT', `/partners/${partnerId}/drivers/${createdUserId}`, { license: '77BB654321' });
    if (res.ok) console.log(`   ✅ Обновлено`);
    else console.log(`   ❌ ${res.status}`);

    // 5. DELETE
    console.log(`\n🗑️ DELETE /partners/${partnerId}/drivers/${createdUserId}`);
    res = await request('DELETE', `/partners/${partnerId}/drivers/${createdUserId}`);
    if (res.ok) console.log(`   ✅ Удалено`);
    else console.log(`   ❌ ${res.status} — ${res.data.error}`);

    console.log('\n✅ Тестирование завершено');
}

async function run() {
  const user = await login('Анна', 'пароль012');
    if (!user || user.roleId !== 3) {
        console.error('Нужен работник офиса');
        return;
    }
    const partnerId = 6; // укажите существующий ID партнёра
    await testDrivers(partnerId);
}

run();