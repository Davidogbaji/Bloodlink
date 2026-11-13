/**
 * In-memory stand-in for the Supabase client, used only when the Supabase
 * environment variables are missing (a fresh clone, a local preview, or a
 * pitch laptop with no keys). It implements just the calls this app makes:
 *
 *   from(t).select("*").eq().in().order().limit()   — awaitable
 *   from(t).insert(rows) / .update(patch).match(m)   — awaitable
 *   channel(n).on(...).subscribe() / removeChannel()
 *
 * Writes notify subscribed channels, so the board still updates "live"
 * across components in the same tab. Nothing persists past a reload.
 * All names and phone numbers below are sample data, not real people.
 */

const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays) => new Date(Date.now() + offsetDays * day).toISOString();
const date = (offsetDays) => iso(offsetDays).slice(0, 10);

const H = {
  futh: "00000000-0000-4000-8000-000000000001",
  fmc: "00000000-0000-4000-8000-000000000002",
  karu: "00000000-0000-4000-8000-000000000003",
  akwanga: "00000000-0000-4000-8000-000000000004",
  abuja: "00000000-0000-4000-8000-000000000005",
};

let nextId = 1000;

const db = {
  hospitals: [
    { id: H.futh, name: "Federal University Teaching Hospital, Lafia", address: "Lafia, Nasarawa State", state: "Nasarawa", lga: "Lafia", emergency_phone: "+2348000000001", has_generator_backup: true, created_at: iso(-90) },
    { id: H.fmc, name: "Federal Medical Centre, Keffi", address: "Keffi, Nasarawa State", state: "Nasarawa", lga: "Keffi", emergency_phone: "+2348000000002", has_generator_backup: true, created_at: iso(-90) },
    { id: H.karu, name: "General Hospital, Karu", address: "Karu, Nasarawa State", state: "Nasarawa", lga: "Karu", emergency_phone: "+2348000000003", has_generator_backup: false, created_at: iso(-60) },
    { id: H.akwanga, name: "General Hospital, Akwanga", address: "Akwanga, Nasarawa State", state: "Nasarawa", lga: "Akwanga", emergency_phone: "+2348000000004", has_generator_backup: false, created_at: iso(-60) },
    { id: H.abuja, name: "National Hospital Abuja", address: "Central Business District, Abuja", state: "FCT", lga: "AMAC", emergency_phone: "+2348000000005", has_generator_backup: true, created_at: iso(-90) },
  ],
  blood_inventory: [
    [H.futh, "O+", 12, 28], [H.futh, "A+", 6, 20], [H.futh, "B+", 4, 9], [H.futh, "O-", 2, 5],
    [H.fmc, "O+", 9, 25], [H.fmc, "A-", 2, 3], [H.fmc, "AB+", 3, 18], [H.fmc, "B-", 1, 12],
    [H.karu, "O+", 3, 7], [H.karu, "O-", 0, 14], [H.karu, "A+", 2, 2],
    [H.akwanga, "B+", 7, 30], [H.akwanga, "O+", 5, 16],
    [H.abuja, "O+", 20, 30], [H.abuja, "O-", 6, 21],
  ].map(([hospital_id, blood_type, units_available, days], i) => ({
    id: i + 1,
    hospital_id,
    blood_type,
    units_available,
    batch_expiry_date: date(days),
    updated_at: iso(-(i % 5) / 6),
  })),
  donors: [
    ["Sample Donor A", "+2348000000101", "O-"], ["Sample Donor B", "+2348000000102", "O+"],
    ["Sample Donor C", "+2348000000103", "A+"], ["Sample Donor D", "+2348000000104", "B+"],
    ["Sample Donor E", "+2348000000105", "O+"], ["Sample Donor F", "+2348000000106", "AB+"],
  ].map(([full_name, phone, blood_type], i) => ({
    id: `00000000-0000-4000-9000-${String(i + 1).padStart(12, "0")}`,
    full_name,
    phone,
    blood_type,
    state: "Nasarawa",
    lga: ["Lafia", "Keffi", "Karu"][i % 3],
    last_donated: date(-120 - i * 20),
    whatsapp_opt_in: true,
    created_at: iso(-30 + i),
  })),
  outage_logs: [
    { id: 1, hospital_id: H.karu, start_time: iso(-5 / 24), end_time: null, generator_backup: false, notes: "Grid outage" },
  ],
};

const channels = new Set();

function notify(table) {
  for (const ch of channels) {
    for (const { filter, handler } of ch.listeners) {
      if (!filter.table || filter.table === table) {
        try { handler({ table }); } catch { /* a listener's error is its own */ }
      }
    }
  }
}

class Query {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.sort = null;
    this.max = null;
    this.op = "select";
    this.payload = null;
  }

  select() { return this; }
  eq(col, val) { this.filters.push((r) => r[col] === val); return this; }
  in(col, vals) { this.filters.push((r) => vals.includes(r[col])); return this; }
  match(obj) { this.filters.push((r) => Object.entries(obj).every(([k, v]) => r[k] === v)); return this; }
  order(col, opts = {}) { this.sort = { col, asc: opts.ascending !== false }; return this; }
  limit(n) { this.max = n; return this; }

  insert(rows) {
    this.op = "insert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(patch) {
    this.op = "update";
    this.payload = patch;
    return this;
  }

  run() {
    const rows = db[this.table] || (db[this.table] = []);
    const keep = (r) => this.filters.every((f) => f(r));

    if (this.op === "insert") {
      const added = this.payload.map((p) => ({ id: nextId++, ...p, created_at: iso(0), updated_at: iso(0) }));
      rows.push(...added);
      notify(this.table);
      return { data: added, error: null };
    }
    if (this.op === "update") {
      const changed = rows.filter(keep);
      changed.forEach((r) => Object.assign(r, this.payload, { updated_at: iso(0) }));
      notify(this.table);
      return { data: changed, error: null };
    }

    let out = rows.filter(keep).map((r) => ({ ...r }));
    if (this.sort) {
      const { col, asc } = this.sort;
      out.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
    }
    if (this.max != null) out = out.slice(0, this.max);
    return { data: out, error: null };
  }

  then(resolve, reject) {
    return Promise.resolve().then(() => this.run()).then(resolve, reject);
  }
}

export function createDemoClient() {
  return {
    isDemo: true,
    from: (table) => new Query(table),
    channel() {
      const ch = {
        listeners: [],
        on(_type, filter, handler) { ch.listeners.push({ filter: filter || {}, handler }); return ch; },
        subscribe() { channels.add(ch); return ch; },
        unsubscribe() { channels.delete(ch); },
      };
      return ch;
    },
    removeChannel(ch) { if (ch) channels.delete(ch); },
  };
}
