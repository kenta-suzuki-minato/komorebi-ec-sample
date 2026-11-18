-- 調査用の読み取り専用ロール（エージェントのMCPサーバー用。.codex/config.toml の komorebi_db）。
-- 開発環境専用。パスワードは .env.example と同じ値で、ステージング・本番では使わない。
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'komorebi_readonly') THEN
    CREATE ROLE komorebi_readonly LOGIN PASSWORD 'readonly-change-me';
  END IF;
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO komorebi_readonly', current_database());
END
$$;

ALTER ROLE komorebi_readonly SET default_transaction_read_only = on;

GRANT USAGE ON SCHEMA public TO komorebi_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO komorebi_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO komorebi_readonly;

-- 会員の氏名とメールアドレス（個人情報）は読ませない
REVOKE SELECT ON members FROM komorebi_readonly;
GRANT SELECT (id, migrated_from) ON members TO komorebi_readonly;
