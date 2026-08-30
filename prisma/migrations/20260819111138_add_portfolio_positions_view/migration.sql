-- AlterEnum
ALTER TYPE "RoleUser" ADD VALUE 'ANALYSTE';

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

    AVG(
        CASE
            WHEN transaction_type = 'buy' THEN price
            ELSE NULL
        END
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
