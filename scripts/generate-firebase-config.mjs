import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const envPath = resolve(root, '.env')

const readEnv = () => {
  try {
    const content = readFileSync(envPath, 'utf8')
    return Object.fromEntries(
      content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=')
          return [line.slice(0, index), line.slice(index + 1)]
        }),
    )
  } catch {
    return {}
  }
}

const env = { ...readEnv(), ...process.env }

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'REPLACE_ME',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'REPLACE_ME',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'REPLACE_ME',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_ME',
  appId: env.VITE_FIREBASE_APP_ID || 'REPLACE_ME',
}

const output = `self.firebaseConfig = ${JSON.stringify(config, null, 2)}\n`
writeFileSync(resolve(root, 'public/firebase-config.js'), output, 'utf8')

console.log('public/firebase-config.js generado correctamente.')
