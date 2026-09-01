-- Fix PRU calculation in portfolio_positions view to use volume-weighted average price (CMP / PRU)
CREATE OR REPLACE VIEW portfolio_positions AS
SELECT
    portfolio_id,
    instrument_id,

    SUM(
        CASE
            WHEN transaction_type = 'buy' THEN quantity
            WHEN transaction_type = 'sell' THEN -quantity
            WHEN transaction_type = 'dividend' THEN 0
        END
    ) AS quantity,

    SUM(
        CASE
            WHEN transaction_type = 'buy' THEN quantity * price
            ELSE 0
        END
    ) / NULLIF(
        SUM(
            CASE
                WHEN transaction_type = 'buy' THEN quantity
                ELSE 0
            END
        ), 0
    ) AS average_price

FROM transactions

GROUP BY
    portfolio_id,
    instrument_id

HAVING
    SUM(
        CASE
            WHEN transaction_type = 'buy' THEN quantity
            WHEN transaction_type = 'sell' THEN -quantity
            WHEN transaction_type = 'dividend' THEN 0
        END
    ) > 0;
