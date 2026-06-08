const db = require('../config/database');
const driverQueries = require('../db/queries/driver-queries');
const { ROLES } = require('../utils/constants');

async function getDriversByPartner(partnerId, userRoleId) {
    if (![ROLES.OFFICE_WORKER, ROLES.DIRECTOR, ROLES.STOREKEEPER, ROLES.TRUSTED_PERSON].includes(userRoleId)) {
        throw new Error('Недостаточно прав для просмотра водителей');
    }
    const result = await db.query(driverQueries.GET_DRIVERS_BY_PARTNER, [partnerId]);
    return result.rows;
}

async function getDriverById(partnerId, driverUserId, userRoleId) {
    if (![ROLES.OFFICE_WORKER, ROLES.DIRECTOR].includes(userRoleId)) {
        throw new Error('Недостаточно прав для просмотра водителя');
    }
    const result = await db.query(driverQueries.GET_DRIVER_BY_ID, [partnerId, driverUserId]);
    return result.rows[0] || null;
}

async function createDriver(partnerId, driverData, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для создания водителя');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

       
        const partnerCheck = await client.query(
            'SELECT PARTNER_ID FROM PARTNER WHERE PARTNER_ID = $1',
            [partnerId]
        );
        if (partnerCheck.rows.length === 0) {
            throw new Error('Партнёр не найден');
        }

       
        const userCheck = await client.query(
            'SELECT USER_ID, ROLE_ID FROM "USER" WHERE USER_ID = $1',
            [driverData.userId]
        );
        if (userCheck.rows.length === 0) {
            throw new Error('Пользователь не найден');
        }
        if (userCheck.rows[0].role_id !== ROLES.DRIVER) {
            throw new Error('Указанный пользователь не имеет роли "Водитель" (role_id = 5)');
        }

       
        const existing = await client.query(
            'SELECT USER_ID FROM DRIVER WHERE PARTNER_ID = $1 AND USER_ID = $2',
            [partnerId, driverData.userId]
        );
        if (existing.rows.length > 0) {
            throw new Error('Этот водитель уже связан с данным партнёром');
        }

       
        await client.query(driverQueries.CREATE_DRIVER, [
            driverData.userId,
            partnerId,
            driverData.license,
            driverData.categories || null
        ]);

        await client.query('COMMIT');
        
       
        const newDriver = await getDriverById(partnerId, driverData.userId, ROLES.OFFICE_WORKER);
        return newDriver;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе создания водителя:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updateDriver(partnerId, driverUserId, updateData, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для обновления водителя');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

       
        const driver = await getDriverById(partnerId, driverUserId, ROLES.OFFICE_WORKER);
        if (!driver) {
            throw new Error('Водитель не найден');
        }

        await client.query(driverQueries.UPDATE_DRIVER, [
            updateData.license || null,
            updateData.categories || null,
            partnerId,
            driverUserId
        ]);

        await client.query('COMMIT');
        return await getDriverById(partnerId, driverUserId, userRoleId);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе обновления водителя:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function deleteDriver(partnerId, driverUserId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для удаления водителя');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

       
        const driver = await getDriverById(partnerId, driverUserId, ROLES.OFFICE_WORKER);
        if (!driver) {
            throw new Error('Водитель не найден');
        }

       
        const usage = await client.query(driverQueries.CHECK_DRIVER_IN_BILL, [driverUserId]);
        if (parseInt(usage.rows[0].count) > 0) {
            throw new Error('Невозможно удалить водителя, так как он указан в транспортных накладных');
        }

        await client.query(driverQueries.DELETE_DRIVER, [partnerId, driverUserId]);
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе удаления водителя:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function getUpdsForDriver(driverUserId, ebStatusFilter = null, dateFrom = null, dateTo = null) {
   
    const driverInfo = await db.query(`
        SELECT 
            d.USER_ID as id,
            TRIM(u.USER_NAME) as name,
            TRIM(u.USER_SECONDNAME) as surname,
            TRIM(u.USER_PATRONYMIC) as patronymic,
            TRIM(d.DRIVER_LICENSE) as license,
            d.DRIVER_CATEGORIES as categories,
            d.PARTNER_ID as partnerId,
            TRIM(p.PARTNER_FULLNAME) as partnerName
        FROM DRIVER d
        JOIN "USER" u ON d.USER_ID = u.USER_ID
        LEFT JOIN PARTNER p ON d.PARTNER_ID = p.PARTNER_ID
        WHERE d.USER_ID = $1
    `, [driverUserId]);
    if (driverInfo.rows.length === 0) {
        throw new Error('Водитель не зарегистрирован в системе');
    }
    const driver = driverInfo.rows[0];

   
    let updQuery = `
        SELECT DISTINCT 
            u.UPD_ID as updId,
            u.UPD_CONCL_DATE as conclDate,
            u.UPD_SHIP_DATE as shipDate,
            p.PARTNER_ID as partnerId,
            TRIM(p.PARTNER_FULLNAME) as partnerName,
            TRIM(p.PARTNER_INN) as partnerInn,
            s.STOR_ID as storageId,
            TRIM(s.STOR_FULLNAME) as storageName,
            TRIM(s.STOR_ADDRESS) as storageAddress,
            TRIM(s.STOR_PHONE) as storagePhone
        FROM UPD u
        JOIN BILL b ON u.UPD_ID = b.UPD_ID
        JOIN PARTNER p ON u.PARTNER_ID = p.PARTNER_ID
        JOIN STORAGE s ON u.STOR_ID = s.STOR_ID
        LEFT JOIN ELECTRONIC_BILL eb ON b.BILL_ID = eb.BILL_ID
        WHERE b.USER_ID = $1
    `;
    const params = [driverUserId];
    let paramIndex = 2;

   
    if (ebStatusFilter !== null) {
        updQuery += ` AND eb.ELECTRONIC_BILL_STATUS = $${paramIndex}`;
        params.push(ebStatusFilter);
        paramIndex++;
    }

   
    if (dateFrom) {
        updQuery += ` AND u.UPD_CONCL_DATE >= $${paramIndex}`;
        params.push(dateFrom);
        paramIndex++;
    }

   
    if (dateTo) {
        updQuery += ` AND u.UPD_CONCL_DATE <= $${paramIndex}`;
        params.push(dateTo);
        paramIndex++;
    }

    updQuery += ` ORDER BY u.UPD_CONCL_DATE DESC`;

    const updResult = await db.query(updQuery, params);
    const upds = updResult.rows;

    const resultUpds = [];
    for (const upd of upds) {
       
        const billsQuery = `
            SELECT 
                b.BILL_ID as billId,
                b.BILL_CREATED_AT as createdAt,
                b.USER_ID as driverId,
                TRIM(driver.USER_NAME) || ' ' || TRIM(driver.USER_SECONDNAME) as driverName,
                b.FLIST_ID as flistId,
                eb.ELECTRONIC_BILL_STATUS as ebStatus,
                eb.ELECTRONIC_BILL_ID as ebId
            FROM BILL b
            LEFT JOIN "USER" driver ON b.USER_ID = driver.USER_ID
            LEFT JOIN ELECTRONIC_BILL eb ON b.BILL_ID = eb.BILL_ID
            WHERE b.UPD_ID = $1
        `;
        const billsRes = await db.query(billsQuery, [upd.updid]);

        const bills = [];
        for (const bill of billsRes.rows) {
           
            const vehiclesQuery = `
                SELECT 
                    v.VEHICLE_ID as id,
                    TRIM(v.VEHICLE_REGISTRATION_MARK) as registrationMark,
                    v.VEHICLE_TYPE as type,
                    v.VEHICLE_CAPACITY as capacity
                FROM tn_link_vehicle tlv
                JOIN VEHICLE v ON tlv.VEHICLE_ID = v.VEHICLE_ID
                WHERE tlv.BILL_ID = $1
            `;
            const vehiclesRes = await db.query(vehiclesQuery, [bill.billid]);

           
            const itemsQuery = `
                SELECT 
                    fi.FERTIL_ID as fertilizerId,
                    TRIM(f.FERTIL_NAME) as fertilizerName,
                    fi.FLIST_ITEM_DECL_COUNT as declaredCount,
                    fi.FLIST_ITEM_FACT_COUNT as factCount
                FROM FLIST_ITEM fi
                JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID
                WHERE fi.FLIST_ID = $1
            `;
            const itemsRes = await db.query(itemsQuery, [bill.flistid]);

            bills.push({
                billId: bill.billid,
                createdAt: bill.createdat,
                driver: {
                    id: bill.driverid,
                    name: bill.drivername
                },
                electronicBill: bill.ebid ? {
                    id: bill.ebid,
                    status: bill.ebstatus
                } : null,
                vehicles: vehiclesRes.rows,
                items: itemsRes.rows
            });
        }

       
        const allDriversQuery = `
            SELECT DISTINCT 
                u.USER_ID as id,
                TRIM(u.USER_NAME) as name,
                TRIM(u.USER_SECONDNAME) as surname
            FROM BILL b
            JOIN "USER" u ON b.USER_ID = u.USER_ID
            WHERE b.UPD_ID = $1
        `;
        const allDriversRes = await db.query(allDriversQuery, [upd.updid]);

        resultUpds.push({
            updId: upd.updid,
            conclDate: upd.concldate,
            shipDate: upd.shipdate,
            partner: {
                id: upd.partnerid,
                fullName: upd.partnername,
                inn: upd.partnerinn
            },
            storage: {
                id: upd.storageid,
                fullName: upd.storagename,
                address: upd.storageaddress,
                phone: upd.storagephone
            },
            bills: bills,
            allDriversInvolved: allDriversRes.rows
        });
    }

    return {
        driver: {
            id: driver.id,
            name: driver.name,
            surname: driver.surname,
            patronymic: driver.patronymic,
            license: driver.license,
            categories: driver.categories,
            partnerId: driver.partnerid,
            partnerName: driver.partnername
        },
        upds: resultUpds
    };
}

module.exports = {
    getDriversByPartner,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    getUpdsForDriver
};