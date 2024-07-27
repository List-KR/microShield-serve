import * as Commander from 'commander'
import got from 'got'
import Fastify from 'fastify'
import * as MemFs from 'memfs'
import { Deobfuscate } from './webcrack.js'
import { ExtractCode } from './analyze.js'
import { PushTokenToRepo } from './git.js'

const Program = new Commander.Command()
Program.option('--auth <token>', 'GitHub token')
Program.option('--repo <repo>', 'GitHub repository')
Program.option('--host <host>', 'Host')
Program.parse(process.argv)
// eslint-disable-next-line @typescript-eslint/naming-convention
const ProgramOptions = Program.opts() as { auth: string, repo: string, host: string }

const FastifyInstance = Fastify()

FastifyInstance.post('/token', async (FRequest, FResponse) => {
  const CurrentDate = new Date()
  if (typeof FRequest.body !== 'string') {
    FResponse.status(400).send('Invalid request')
    return
  }
  const SHA = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(FRequest.body)))).map(Block =>Block.toString(16).padStart(2, '0')).join('')
  try {
    await got.get(`https://cdn.jsdelivr.net/gh/List-KR/microShield-token@latest/${CurrentDate.getUTCFullYear()}/${CurrentDate.getUTCMonth()}/${CurrentDate.getUTCDate()}/${SHA}.token`, {
      http2: true,
      https: {
        minVersion: 'TLSv1.3',
        ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256'
      }
    }).text()
    FResponse.status(301).redirect(`https://cdn.jsdelivr.net/gh/List-KR/microShield-token@latest/${CurrentDate.getUTCFullYear()}/${CurrentDate.getUTCMonth()}/${CurrentDate.getUTCDate()}/${SHA}.token`)
  } catch {
    MemFs.fs.writeFileSync('/code.js', await Deobfuscate(FRequest.body))
    const Token = await ExtractCode(MemFs.fs.readFileSync('/code.js', 'utf8') as string)
    FResponse.status(200).send(Token)
    await PushTokenToRepo(ProgramOptions.repo, Token, SHA, ProgramOptions.auth, CurrentDate)
  }
})

await FastifyInstance.listen({ port: 3000 , host: ProgramOptions.host })