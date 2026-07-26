/**
 * Lista los colores literales que quedan en bloques de estilo fuera del
 * sistema de diseño. Los tokens (`src/styles/design-system/`) y las variables
 * de compilación de CoreUI (`_variables.scss`) son los únicos lugares donde se
 * admiten valores de color literales.
 *
 *   node scripts/check-literal-colors.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const ALLOWED = ['design-system', '_variables.scss']
const rows = []
let total = 0

for (const file of walk('src')) {
  if (!/\.(vue|css|scss)$/.test(file)) continue
  if (ALLOWED.some((a) => file.includes(a))) continue

  const source = fs.readFileSync(file, 'utf8')
  let css = ''
  if (file.endsWith('.vue')) {
    for (const block of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += block[1]
  } else {
    css = source
  }

  const literals = (css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) || []).filter(
    (value) => !value.includes('var('),
  )
  if (!literals.length) continue

  rows.push({ count: literals.length, file, values: [...new Set(literals)] })
  total += literals.length
}

rows.sort((a, b) => b.count - a.count)

console.log(`colores literales fuera del sistema de diseño: ${total}`)
for (const row of rows) {
  console.log(`  ${String(row.count).padStart(3)}  ${row.file}  ->  ${row.values.join(' ')}`)
}
