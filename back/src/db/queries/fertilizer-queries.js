// SQL запросы для работы с удобрениями

// Получение всех удобрений с названиями тары
const GET_ALL_FERTILIZERS = `
    SELECT 
        f.FERTIL_ID as id,
        TRIM(f.FERTIL_NAME) as name,
        f.FERTIL_WEIGHT as weight,
        c.CO_ID as containerId,
        TRIM(c.CO_NAME) as containerName
    FROM FERTILIZER f
    INNER JOIN Container c ON f.CO_ID = c.CO_ID
    ORDER BY f.FERTIL_NAME;
`;

// Получение удобрения по ID
const GET_FERTILIZER_BY_ID = `
    SELECT 
        f.FERTIL_ID as id,
        TRIM(f.FERTIL_NAME) as name,
        f.FERTIL_WEIGHT as weight,
        c.CO_ID as containerId,
        TRIM(c.CO_NAME) as containerName
    FROM FERTILIZER f
    INNER JOIN Container c ON f.CO_ID = c.CO_ID
    WHERE f.FERTIL_ID = $1;
`;

module.exports = {
    GET_ALL_FERTILIZERS,
    GET_FERTILIZER_BY_ID
};