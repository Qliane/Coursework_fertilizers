// test-sign.js
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

async function testSign(billId, role) {
    console.log(`\n=== Подписание ЭТрН для накладной ${billId} от лица ${role} ===`);
    const res = await request('POST', `/bills/${billId}/sign`);
    if (res.ok) {
        console.log(`✅ Подписано, новый статус: ${res.data.data.status}`);
    } else {
        console.log(`❌ Ошибка: ${res.status} — ${res.data.error}`);
    }
}

async function testAccept(billId) {
    console.log(`\n=== Принятие ЭТрН для накладной ${billId} ===`);
    const res = await request('POST', `/bills/${billId}/accept`);
    if (res.ok) {
        console.log(`✅ Принято, новый статус: ${res.data.data.status}`);
    } else {
        console.log(`❌ Ошибка: ${res.status} — ${res.data.error}`);
    }
}

async function run() {
    // Сначала директор подписывает (статус 0→1)
    let user = await login('Сергей', '1');
    if (user && user.roleId === 2) {
        await testSign(5, 'директор');
    } else {
        console.log('Нужен директор для первого подписания');
    }
    // Затем партнёр подписывает (статус 1→2)
    user = await login('romashka_partner', '1');
    if (user && user.roleId === 4) {
        await testSign(5, 'партнёр');
        // Дополнительно принимает (статус 2→3)
        await testAccept(5);
    } else {
        console.log('Нужен партнёр для второго подписания и принятия');
    }
}

run();