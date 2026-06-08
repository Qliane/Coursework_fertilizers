// test-partners.js — запуск: node test-partners.js
// Требуется Node.js 18+ (для fetch) или запуск в браузере с заменой адреса

const API_BASE = 'http://localhost:5000/api';  // измените при необходимости
let authToken = null;

// --- Вспомогательная функция запроса (без axios) ---
async function request(method, endpoint, data = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  let responseData;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  return {
    status: response.status,
    ok: response.ok,
    data: responseData
  };
}

// --- Логин и получение токена ---
async function login(username, password) {
  console.log(`🔐 Логин: ${username}`);
  const result = await request('POST', '/auth/login', { username, password });
  if (result.ok && result.data.token) {
    authToken = result.data.token;
    console.log(`✅ Успешный вход. Роль: ${result.data.user.roleName} (id=${result.data.user.roleId})`);
    return result.data.user;
  } else {
    console.error(`❌ Ошибка входа: ${result.status} — ${JSON.stringify(result.data)}`);
    return null;
  }
}

// --- Основные тесты ---
async function testPartnersCRUD() {
  let createdId = null;

  // 1. GET /partners (список)
  console.log('\n📋 1. GET /partners');
  let res = await request('GET', '/partners');
  if (res.ok) {
    console.log(`   Статус: ${res.status}, записей: ${res.data.data?.length || 0}`);
    console.log(`   Пагинация: стр.${res.data.pagination?.page}, всего ${res.data.pagination?.total}`);
  } else {
    console.log(`   ❌ Ошибка: ${res.status}`, res.data);
  }

  // 2. POST /partners (создание)
  console.log('\n➕ 2. POST /partners');
  // test-partners.js (фрагмент)
  const newPartner = {
    inn: '771234567890',
    fullName: 'ООО "ТестПартнёр"',
    phone: '+74991112233',
    factAddress: 'г. Москва, тестовая',
    postAddress: 'г. Москва, юр. адрес',
    userId: 5   // <-- указываем ID существующего пользователя
  };
  res = await request('POST', '/partners', newPartner);
  if (res.ok) {
    createdId = res.data.data.id;
    console.log(`   ✅ Создан ID=${createdId}, ИНН=${res.data.data.inn}`);
  } else {
    console.log(`   ❌ Ошибка: ${res.status} — ${res.data.error || JSON.stringify(res.data)}`);
    if (res.status === 403) console.log('   → Недостаточно прав. Убедитесь, что используется роль Работник офиса (roleId=3)');
    return;
  }

  // 3. GET /partners/:id
  console.log(`\n🔍 3. GET /partners/${createdId}`);
  res = await request('GET', `/partners/${createdId}`);
  if (res.ok) {
    console.log(`   ✅ ${res.data.data.fullName}, ИНН=${res.data.data.inn}`);
  } else {
    console.log(`   ❌ Ошибка: ${res.status}`);
  }

  // 4. PUT /partners/:id
  console.log(`\n✏️ 4. PUT /partners/${createdId}`);
  const updateData = { fullName: 'ООО "Обновлённый партнёр"' };
  res = await request('PUT', `/partners/${createdId}`, updateData);
  if (res.ok) {
    console.log(`   ✅ Обновлено → новое имя: ${res.data.data.fullName}`);
  } else {
    console.log(`   ❌ Ошибка: ${res.status} — ${res.data.error}`);
  }

  // 5. DELETE /partners/:id
  // console.log(`\n🗑️ 5. DELETE /partners/${createdId}`);
  // res = await request('DELETE', `/partners/${createdId}`);
  // if (res.ok) {
  //   console.log(`   ✅ Удалено`);
  // } else {
  //   console.log(`   ❌ Ошибка: ${res.status} — ${res.data.error}`);
  //   if (res.data.error?.includes('связанные записи')) {
  //     console.log('   → Партнёр имеет связанные данные (транспорт, водители, УПД). Удалите их вручную.');
  //   }
  // }

  // 6. Фильтрация
  console.log('\n🔎 6. GET /partners?search=Тестовый');
  res = await request('GET', '/partners?search=Тестовый');
  if (res.ok) {
    console.log(`   Найдено записей: ${res.data.data.length}`);
  } else {
    console.log(`   ❌ Ошибка фильтрации: ${res.status}`);
  }

  console.log('\n✅ Тестирование завершено.\n');
}

// --- Запуск с пользователем, имеющим роль "Работник офиса" ---
async function run() {
  // Измените логин/пароль на реальные данные пользователя с roleId=3
  const user = await login('Анна', 'пароль012');
  if (!user) {
    console.error('Не удалось выполнить вход. Проверьте учётные данные и доступность сервера.');
    return;
  }
  if (user.roleId !== 3) {
    console.warn(`⚠️  Внимание: текущая роль ${user.roleName} (id=${user.roleId}) не является "Работник офиса". CRUD операции могут вернуть 403.`);
  }
  await testPartnersCRUD();
}

run().catch(err => console.error('Ошибка выполнения:', err));