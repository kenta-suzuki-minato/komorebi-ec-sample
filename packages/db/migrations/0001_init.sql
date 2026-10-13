-- 商品・注文・会員（技術設計書 6章）
CREATE TABLE products (
  code            text PRIMARY KEY,
  name            text NOT NULL,
  category        text NOT NULL,
  price_incl_tax  integer NOT NULL CHECK (price_incl_tax >= 0),
  tax_rate_code   text NOT NULL DEFAULT 'standard',
  colors          text[] NOT NULL DEFAULT '{}'
);

-- カラーごとの在庫（カラーのない商品は color = ''）
CREATE TABLE inventory (
  product_code  text NOT NULL REFERENCES products (code),
  color         text NOT NULL DEFAULT '',
  stock         integer NOT NULL CHECK (stock >= 0),
  PRIMARY KEY (product_code, color)
);

-- 商品画像（カラー × 幅 400／800／1200）
CREATE TABLE product_images (
  product_code  text NOT NULL REFERENCES products (code),
  color         text NOT NULL DEFAULT '',
  width         integer NOT NULL CHECK (width IN (400, 800, 1200)),
  url           text NOT NULL,
  PRIMARY KEY (product_code, color, width)
);

CREATE TABLE members (
  id             uuid PRIMARY KEY,
  email          text NOT NULL UNIQUE,
  name           text NOT NULL,
  migrated_from  text
);

CREATE TABLE orders (
  id              uuid PRIMARY KEY,
  order_no        text NOT NULL UNIQUE,
  member_id       uuid REFERENCES members (id),
  ordered_at      timestamptz NOT NULL,
  status          text NOT NULL,
  total_incl_tax  numeric(12, 0) NOT NULL
);

CREATE TABLE order_lines (
  id               uuid PRIMARY KEY,
  order_id         uuid NOT NULL REFERENCES orders (id),
  line_type        text NOT NULL CHECK (line_type IN ('product', 'gift_wrap', 'shipping')),
  product_code     text REFERENCES products (code),
  qty              integer NOT NULL CHECK (qty > 0),
  amount_incl_tax  numeric(12, 0) NOT NULL,
  parent_line_id   uuid REFERENCES order_lines (id)
);

CREATE TABLE order_taxes (
  order_id       uuid NOT NULL REFERENCES orders (id),
  tax_rate_code  text NOT NULL,
  taxable_incl   numeric(12, 0) NOT NULL,
  tax_amount     numeric(12, 0) NOT NULL,
  PRIMARY KEY (order_id, tax_rate_code)
);
