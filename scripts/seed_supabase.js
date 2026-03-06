import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  const fallasData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/components/fallas.json'), 'utf8'))

  console.log(`Seeding ${fallasData.length} fallas...`)

  const { data, error } = await supabase
    .from('fallas')
    .upsert(fallasData, { onConflict: 'number' })

  if (error) {
    console.error('Error seeding fallas:', error)
  } else {
    console.log('Successfully seeded fallas')
  }
}

seed()
