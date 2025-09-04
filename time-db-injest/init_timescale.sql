-- 1. Enable the extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 2. Create the raw data table
CREATE TABLE IF NOT EXISTS quotes (
  time        TIMESTAMPTZ       NOT NULL,
  symbol      TEXT              NOT NULL,
  bid_price   DOUBLE PRECISION  NOT NULL,
  ask_price   DOUBLE PRECISION  NOT NULL,
  real_price  DOUBLE PRECISION  NOT NULL
);

-- 3. Convert to hypertable
SELECT create_hypertable(
  'quotes',
  'time',
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 hour' -- Suggesion is to change this to 1 minute
);

-- 4. Continuous aggregates: define OHLC for each timeframe

-- 1-minute chart
CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_1m
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 minute', time) AS bucket,
  symbol,
  FIRST( real_price, time )   AS open,
  max( real_price )           AS high,
  min( real_price )           AS low,
  LAST(  real_price, time )   AS close
FROM quotes
GROUP BY bucket, symbol
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
  'candlestick_1m',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute'
);

-- 5-minute chart
CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_5m
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('5 minutes', time) AS bucket,
  symbol,
  FIRST( real_price , time )   AS open,
  MAX( real_price  )           AS high,
  MIN( real_price  )           AS low,
  LAST(  real_price , time )   AS close
FROM quotes
GROUP BY bucket, symbol
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
  'candlestick_5m',
  start_offset => INTERVAL '2 hours',
  end_offset => INTERVAL '5 minutes',
  schedule_interval => INTERVAL '5 minutes'
);

-- 15-minute chart
CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_15m
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('15 minutes', time) AS bucket,
  symbol,
  FIRST( real_price , time )   AS open,
  MAX( real_price  )           AS high,
  MIN( real_price  )           AS low,
  LAST(  real_price , time )   AS close
FROM quotes
GROUP BY bucket, symbol
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
  'candlestick_15m',
  start_offset => INTERVAL '4 hours',
  end_offset => INTERVAL '15 minutes',
  schedule_interval => INTERVAL '15 minutes'
);

-- 30-minute chart
CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_30m
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('30 minutes', time) AS bucket,
  symbol,
  FIRST( real_price , time )   AS open,
  MAX( real_price  )           AS high,
  MIN( real_price  )           AS low,
  LAST(  real_price , time )   AS close
FROM quotes
GROUP BY bucket, symbol
WITH NO DATA;


-- policy populate and periodically update it required tables86
SELECT add_continuous_aggregate_policy(
  'candlestick_30m',
  start_offset => INTERVAL '6 hours',
  end_offset => INTERVAL '30 minutes',
  schedule_interval => INTERVAL '30 minutes'
);


-- Can write policies to compress older records to save storage and still comply to compliances
