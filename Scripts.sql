-- Создание приходного ордера --
CREATE OR REPLACE PROCEDURE create_order_with_items(
    p_storage_id INTEGER,
    p_user_id INTEGER,
    p_items JSONB,
    INOUT p_order_id INTEGER DEFAULT NULL
) LANGUAGE plpgsql AS $$
DECLARE
    v_flist_id INTEGER;
    v_item RECORD;
BEGIN
    INSERT INTO FLIST DEFAULT VALUES RETURNING FLIST_ID INTO v_flist_id;

    FOR v_item IN 
        SELECT * FROM jsonb_to_recordset(p_items) 
        AS x(fertilizer_id INTEGER, declared_count INTEGER)
    LOOP
        INSERT INTO FLIST_ITEM (FLIST_ID, FERTIL_ID, FLIST_ITEM_DECL_COUNT)
        VALUES (v_flist_id, v_item.fertilizer_id, v_item.declared_count);
    END LOOP;

    INSERT INTO "ORDER" (STOR_ID, USER_ID, FLIST_ID, ORDER_CREATED_AT)
    VALUES (p_storage_id, p_user_id, v_flist_id, CURRENT_DATE)
    RETURNING ORDER_ID INTO p_order_id;
END;
$$;

-- Триггер --

CREATE OR REPLACE FUNCTION trg_set_created_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_created_at = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_created_at
BEFORE INSERT ON "ORDER"
FOR EACH ROW
EXECUTE FUNCTION trg_set_created_at();


-- Получение текущего состояния склада --
CREATE OR REPLACE FUNCTION get_current_stock(
    p_storage_id INTEGER,
    p_as_of_date DATE DEFAULT NULL
)
RETURNS TABLE (
    fertilizerId   INTEGER,
    fertilizerName TEXT,
    containerType  TEXT,
    containerWeight NUMERIC,
    weight         NUMERIC,
    quantity       BIGINT,
    totalWeight    NUMERIC
)
LANGUAGE sql
STABLE
AS $$
    WITH incoming AS (
        SELECT fi.fertil_id, SUM(fi.flist_item_fact_count) AS total_incoming
        FROM flist_item fi
        JOIN "ORDER" o ON fi.flist_id = o.flist_id
        WHERE o.order_realized_at IS NOT NULL
          AND o.stor_id = p_storage_id
          AND (p_as_of_date IS NULL OR o.order_realized_at <= p_as_of_date)
        GROUP BY fi.fertil_id
    ),
    outgoing AS (
        SELECT fi.fertil_id, SUM(fi.flist_item_fact_count) AS total_outgoing
        FROM flist_item fi
        JOIN bill b ON fi.flist_id = b.flist_id
        JOIN upd u ON b.upd_id = u.upd_id
        JOIN electronic_bill eb ON b.bill_id = eb.bill_id
        WHERE u.stor_id = p_storage_id
          AND eb.electronic_bill_status >= 1
          AND (p_as_of_date IS NULL OR u.upd_ship_date <= p_as_of_date)
        GROUP BY fi.fertil_id
    )
    SELECT
        f.fertil_id,
        trim(f.fertil_name),
        trim(c.co_name),
        coalesce(c.co_weight, 0),
        f.fertil_weight,
        coalesce(i.total_incoming, 0) - coalesce(o.total_outgoing, 0) AS quantity,
        f.fertil_weight * (coalesce(i.total_incoming, 0) - coalesce(o.total_outgoing, 0)) AS totalWeight
    FROM fertilizer f
    LEFT JOIN container c ON f.co_id = c.co_id
    LEFT JOIN incoming i ON f.fertil_id = i.fertil_id
    LEFT JOIN outgoing o ON f.fertil_id = o.fertil_id
    WHERE coalesce(i.total_incoming, 0) - coalesce(o.total_outgoing, 0) > 0
    ORDER BY f.fertil_name;
$$;
