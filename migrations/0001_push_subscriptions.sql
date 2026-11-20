CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  postcode TEXT NOT NULL,
  selected_bins TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_delivery_at TEXT
);

CREATE TABLE IF NOT EXISTS reminder_deliveries (
  subscription_id TEXT NOT NULL,
  collection_date TEXT NOT NULL,
  bin_keys TEXT NOT NULL,
  delivered_at TEXT NOT NULL,
  PRIMARY KEY (subscription_id, collection_date),
  FOREIGN KEY (subscription_id) REFERENCES push_subscriptions(id) ON DELETE CASCADE
);
