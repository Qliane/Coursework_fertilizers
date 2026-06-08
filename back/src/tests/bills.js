// test-bills.js
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

async function testBills(updId) {
    console.log(`\n=== Тестирование накладных для УПД ${updId} ===`);
    let createdBillId = null;

       console.log(`\n📋 GET /upd/${updId}/bills`);
    let res = await request('GET', `/upd/${updId}/bills`);
    if (res.ok) console.log(`   Найдено накладных: ${res.data.data.length}`);
    else console.log(`   ❌ ${res.status}`);

       console.log(`\n➕ POST /upd/${updId}/bills`);
    const newBill = {
        driverId: 6,
        vehicleIds: [2,4,7],   
        items: [
            { fertilizerId: 1, declaredCount: 10 }
        ]
    };
    res = await request('POST', `/upd/${updId}/bills`, newBill);
    if (res.ok) {
        createdBillId = res.data.data.id;
        console.log(`   ✅ Создана накладная ID=${createdBillId}`);
    } else {
        console.log(`   ❌ ${res.status} — ${res.data.error}`);
        return;
    }

   
    console.log(`\n🔍 GET /upd/${updId}/bills/${createdBillId}`);
    res = await request('GET', `/upd/${updId}/bills/${createdBillId}`);
    if (res.ok) console.log(`   Водитель: ${res.data.data.driverName}, товаров: ${res.data.data.items.length}`);
    else console.log(`   ❌ ${res.status}`);

   
    console.log(`\n✏️ PUT /upd/${updId}/bills/${createdBillId}`);
    const updateData = {
        items: [{ fertilizerId: 1, declaredCount: 20 }]
    };
    res = await request('PUT', `/upd/${updId}/bills/${createdBillId}`, updateData);
    if (res.ok) console.log(`   ✅ Обновлено`);
    else console.log(`   ❌ ${res.status} — ${res.data.error}`);

   
   
   
   
   

    console.log('\n✅ Тестирование завершено');
}

async function run() {
    const user = await login('Пётр', '1');
    if (!user || user.roleId !== 1) {
        console.error('Требуется роль кладовщика (1)');
        return;
    }
    const updId = 3;
    await testBills(updId);
}

run();