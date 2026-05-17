CREATE TABLE energy_data (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL,
    room_id     INT NOT NULL,
    date        DATE NOT NULL,
    consumption_kwh DECIMAL(10, 4) NOT NULL DEFAULT 0,
    peak_load   DECIMAL(10, 4) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_energy_user_room_date UNIQUE (user_id, room_id, date)
);