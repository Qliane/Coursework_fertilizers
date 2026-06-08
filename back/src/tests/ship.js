// test-ship.js
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

async function testShip(updId) {
    console.log(`\n=== Отгрузка УПД ${updId} ===`);
    const res = await request('POST', `/upd/${updId}/ship`);
    if (res.ok) {
        console.log(`✅ Отгрузка выполнена`);
        console.log(`   Дата отгрузки: ${res.data.data.upd.shipDate}`);
        console.log(`   Создано ЭТрН: ${res.data.data.electronicBills.length}`);
    } else {
        console.log(`❌ Ошибка: ${res.status} — ${res.data.error}`);
    }
}

async function run() {
    const user = await login('Иван', 'пароль123'); // роль кладовщика (roleId=1)
    if (!user || user.roleId !== 1) {
        console.error('Требуется кладовщик (roleId=1)');
        return;
    }
    const updId = 3; // УПД, принадлежащий складу кладовщика, с созданными накладными
    await testShip(updId);
}

run();