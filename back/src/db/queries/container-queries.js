// SQL запросы для работы с тарой

// Получение всей тары
const GET_ALL_CONTAINERS = `
    SELECT 
        CO_ID as id,
        TRIM(CO_NAME) as name,
        CO_WEIGHT as weight,
        CO_WIDTH as width,
        CO_HEIGHT as height
    FROM Container
    ORDER BY CO_NAME;
`;

// Получение тары по ID
const GET_CONTAINER_BY_ID = `
    SELECT 
        CO_ID as id,
        TRIM(CO_NAME) as name,
        CO_WEIGHT as weight,
        CO_WIDTH as width,
        CO_HEIGHT as height
    FROM Container
    WHERE CO_ID = $1;
`;

module.exports = {
    GET_ALL_CONTAINERS,
    GET_CONTAINER_BY_ID
};