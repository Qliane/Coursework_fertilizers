// test-storages.js
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

async function testStorages() {
    console.log('\n=== Тестирование складов ===');
    let createdId = null;

    // 1. GET список
    console.log('\n📋 GET /storages');
    let res = await request('GET', '/storages');
    if (res.ok) console.log(`   Найдено складов: ${res.data.data.length}`);
    else console.log(`   ❌ ${res.status}`);

    // 2. POST создание
    console.log('\n➕ POST /storages');
    const newStorage = {
        fullName: 'Тестовый склад',
        address: 'г. Тест, ул. Складская, 1',
        phone: '+74951112233',
        capacity: 1000
    };
    res = await request('POST', '/storages', newStorage);
    if (res.ok) {
        createdId = res.data.data.id;
        console.log(`   ✅ Создан склад ID=${createdId}, название=${res.data.data.fullName}`);
    } else {
        console.log(`   ❌ ${res.status} — ${res.data.error}`);
        return;
    }

    // 3. GET by ID
    console.log(`\n🔍 GET /storages/${createdId}`);
    res = await request('GET', `/storages/${createdId}`);
    if (res.ok) console.log(`   ✅ Название: ${res.data.data.fullName}`);
    else console.log(`   ❌ ${res.status}`);

    // 4. PUT обновление
    console.log(`\n✏️ PUT /storages/${createdId}`);
    res = await request('PUT', `/storages/${createdId}`, { fullName: 'Обновлённый склад' });
    if (res.ok) console.log(`   ✅ Обновлено`);
    else console.log(`   ❌ ${res.status}`);

    // 5. DELETE (пока не удаляем, чтобы протестировать работников)
    // удалим позже

    // ---- Работники склада ----
    console.log(`\n=== Работники склада ID=${createdId} ===`);
    // Требуется существующий пользователь с ролью 1 (STOREKEEPER) или 2 (DIRECTOR)
    // Предположим, есть пользователь с id=10
    const testUserId = 7; // замените на реальный ID
    const employeeData = {
        userId: testUserId,
        snils: '123-456-789 00',
        inn: '123456789012'
    };
    // POST назначить
    console.log(`\n➕ POST /storages/${createdId}/employees`);
    res = await request('POST', `/storages/${createdId}/employees`, employeeData);
    if (res.ok) {
        console.log(`   ✅ Работник назначен, userId=${res.data.data.userId}`);
    } else {
        console.log(`   ❌ ${res.status} — ${res.data.error}`);
    }

    // GET список работников
    console.log(`\n📋 GET /storages/${createdId}/employees`);
    res = await request('GET', `/storages/${createdId}/employees`);
    if (res.ok) {
        console.log(`   Найдено работников: ${res.data.data.length}`);
        if (res.data.data.length > 0) console.log(`   Пример: ${res.data.data[0].surname} ${res.data.data[0].name}`);
    } else console.log(`   ❌ ${res.status}`);

    // DELETE уволить
    console.log(`\n🗑️ DELETE /storages/${createdId}/employees/${testUserId}`);
    res = await request('DELETE', `/storages/${createdId}/employees/${testUserId}`);
    if (res.ok) console.log(`   ✅ Работник уволен`);
    else console.log(`   ❌ ${res.status} — ${res.data.error}`);

    // Наконец, удаляем склад
    console.log(`\n🗑️ DELETE /storages/${createdId}`);
    res = await request('DELETE', `/storages/${createdId}`);
    if (res.ok) console.log(`   ✅ Склад удалён`);
    else console.log(`   ❌ ${res.status} — ${res.data.error}`);

    console.log('\n✅ Тестирование завершено');
}

async function run() {
    const user = await login('Анна', 'пароль012');
    if (!user || user.roleId !== 3) {
        console.error('Требуется роль работника офиса (3)');
        return;
    }
    await testStorages();
}

run();