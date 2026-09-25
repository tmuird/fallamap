import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Server-side only: the direct Postgres connection string from the Supabase
// dashboard (Settings → Connect → Session pooler / URI). Never a client value.
const dbUrl = process.env.SUPABASE_DB_URL

if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL — set it to your Supabase Postgres connection string.')
  console.error('  Supabase Dashboard → Project Settings → Connect → Session pooler → URI')
  process.exit(1)
}

async function seed() {
  const client = new Client({ connectionString: dbUrl })
  await client.connect()

  try {
    // 1. Schema first — tables, FKs, RLS, community-content bucket.
    console.log('Applying scripts/schema.sql ...')
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    await client.query(schema)
    console.log('Schema applied.')

    // 2. Seed monuments from the single source of truth in src/components/fallas.json.
    const fallasData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/components/fallas.json'), 'utf8')
    )
    console.log(`Seeding ${fallasData.length} fallas...`)
    const fallasRes = await client.query(
      `insert into fallas (number, name, time, description, is_special, is_burnt, coordinates)
       select m.number, m.name, m.time, m.description, m.is_special, m.is_burnt, m.coordinates
       from jsonb_to_recordset($1::jsonb)
         as m(number text, name text, time text, description text,
              is_special boolean, is_burnt boolean, coordinates jsonb)
       on conflict (number) do update
         set name = excluded.name, time = excluded.time,
             description = excluded.description,
             is_special = excluded.is_special, is_burnt = excluded.is_burnt,
             coordinates = excluded.coordinates`,
      [JSON.stringify(fallasData)]
    )
    console.log(`Fallas upserted (${fallasRes.rowCount} rows touched).`)

    // 3. Seed official event hubs from src/components/official_events.json.
    // The file is one event dataset ({hubs, schedule}); hub `events` ids are
    // derived from schedule[].events[].hubId (T1.5) — the old static refs
    // matched no schedule id and were never read by any code.
    const official = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/components/official_events.json'), 'utf8')
    )
    const hubsData = (official.hubs || []).map((h) => ({
      ...h,
      events: (official.schedule || [])
        .flatMap((d) => d.events)
        .filter((e) => e.hubId === h.id)
        .map((e) => e.id),
    }))
    console.log(`Seeding ${hubsData.length} hubs...`)
    const hubsRes = await client.query(
      `insert into hubs (id, name, description, type, coordinates, events)
       select m.id, m.name, m.description, m.type, m.coordinates, m.events
       from jsonb_to_recordset($1::jsonb)
         as m(id text, name text, description text, type text, coordinates jsonb, events jsonb)
       on conflict (id) do update
         set name = excluded.name, description = excluded.description,
             type = excluded.type, coordinates = excluded.coordinates,
             events = excluded.events`,
      [JSON.stringify(hubsData)]
    )
    console.log(`Hubs upserted (${hubsRes.rowCount} rows touched).`)

    console.log('Seed complete.')
  } finally {
    await client.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
