// Коды ролей пользователей
const ROLES = {
    STOREKEEPER: 1,      // Кладовщик
    DIRECTOR: 2,         // Директор/Администратор
    OFFICE_WORKER: 3,    // Работник офиса
    TRUSTED_PERSON: 4,   // Доверенное лицо
    DRIVER: 5            // Водитель
};

// Статусы ЭТрН
const EBILL_STATUSES = {
    DRAFT: 0,           // Черновик
    SIGNED_BY_STORAGE: 1, // Подписан складом
    SIGNED_BY_PARTNER: 2, // Подписан партнером
    COMPLETED: 3        // Завершен
};

// Типы транспорта
const VEHICLE_TYPES = {
    TRUCK: 'T',     // Грузовик
    TRAILER: 'R'    // Прицеп
};

module.exports = {
    ROLES,
    EBILL_STATUSES,
    VEHICLE_TYPES
};
