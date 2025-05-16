CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')),
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
);

CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    portion INTEGER NOT NULL CHECK (portion > 0),
    price INTEGER NOT NULL CHECK (price > 0),
    description TEXT NOT NULL,
    imageurl TEXT NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'dispatched', 'delivered', 'cancelled')),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL CHECK (phone ~* '^\+?\d{10,15}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dishes(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    PRIMARY KEY (order_id, dish_id)
);
