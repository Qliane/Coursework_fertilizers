// Получение всех складов
const GET_ALL_STORAGES = `
    SELECT 
        STOR_ID as id,
        TRIM(STOR_FULLNAME) as fullName,
        TRIM(STOR_ADDRESS) as address,
        STOR_PHONE as phone,
        STOR_CAPACITY as capacity
    FROM STORAGE
    ORDER BY STOR_FULLNAME
`;

// Получение склада по ID
const GET_STORAGE_BY_ID = `
    SELECT 
        STOR_ID as id,
        TRIM(STOR_FULLNAME) as fullName,
        TRIM(STOR_ADDRESS) as address,
        STOR_PHONE as phone,
        STOR_CAPACITY as capacity
    FROM STORAGE
    WHERE STOR_ID = $1
`;

// Создание склада
const CREATE_STORAGE = `
    INSERT INTO STORAGE (STOR_FULLNAME, STOR_ADDRESS, STOR_PHONE, STOR_CAPACITY)
    VALUES ($1, $2, $3, $4)
    RETURNING STOR_ID
`;

// Обновление склада
const UPDATE_STORAGE = `
    UPDATE STORAGE
    SET STOR_FULLNAME = COALESCE($1, STOR_FULLNAME),
        STOR_ADDRESS = COALESCE($2, STOR_ADDRESS),
        STOR_PHONE = COALESCE($3, STOR_PHONE),
        STOR_CAPACITY = COALESCE($4, STOR_CAPACITY)
    WHERE STOR_ID = $5
    RETURNING STOR_ID
`;

// Удаление склада
const DELETE_STORAGE = `
    DELETE FROM STORAGE WHERE STOR_ID = $1
`;

// Проверка зависимостей склада (ордера, работники)
const CHECK_STORAGE_DEPENDENCIES = `
    SELECT 
        (SELECT COUNT(*) FROM "ORDER" WHERE STOR_ID = $1) as orderCount,
        (SELECT COUNT(*) FROM EMPLOYER WHERE STOR_ID = $1) as employeeCount
`;

// --- Работники склада ---
// Список работников склада с данными пользователя
const GET_EMPLOYEES_BY_STORAGE = `
    SELECT 
        e.USER_ID as userId,
        e.STOR_ID as storageId,
        e.EMP_SNILS as snils,
        e.EMP_INN as inn,
        u.USER_NAME as name,
        u.USER_SECONDNAME as surname,
        u.USER_PATRONYMIC as patronymic,
        u.ROLE_ID as roleId,
        TRIM(r.ROLE_NAME) as roleName
    FROM EMPLOYER e
    INNER JOIN "USER" u ON e.USER_ID = u.USER_ID
    INNER JOIN ROLE r ON u.ROLE_ID = r.ROLE_ID
    WHERE e.STOR_ID = $1
    ORDER BY u.USER_SECONDNAME, u.USER_NAME
`;

// Проверка, является ли пользователь уже работником (любого склада)
const CHECK_EMPLOYEE_EXISTS_ANYWHERE = `
    SELECT STOR_ID FROM EMPLOYER WHERE USER_ID = $1
`;

// Добавление работника на склад
const ADD_EMPLOYEE = `
    INSERT INTO EMPLOYER (USER_ID, STOR_ID, EMP_SNILS, EMP_INN)
    VALUES ($1, $2, $3, $4)
    RETURNING USER_ID, STOR_ID
`;

// Удаление работника со склада
const REMOVE_EMPLOYEE = `
    DELETE FROM EMPLOYER WHERE STOR_ID = $1 AND USER_ID = $2
`;

const CHECK_USER_ROLE_FOR_EMPLOYEE = `
    SELECT ROLE_ID FROM "USER" WHERE USER_ID = $1
`;
const ALLOWED_EMPLOYEE_ROLES = [1, 2];

module.exports = {
    GET_ALL_STORAGES,
    GET_STORAGE_BY_ID,
    CREATE_STORAGE,
    UPDATE_STORAGE,
    DELETE_STORAGE,
    CHECK_STORAGE_DEPENDENCIES,
    GET_EMPLOYEES_BY_STORAGE,
    CHECK_EMPLOYEE_EXISTS_ANYWHERE,
    ADD_EMPLOYEE,
    REMOVE_EMPLOYEE,
    CHECK_USER_ROLE_FOR_EMPLOYEE,
    ALLOWED_EMPLOYEE_ROLES
};