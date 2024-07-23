import { webcrack } from "webcrack"

export async function Deobfuscate(Code: string) {
  const DeobfuscatedCode = await webcrack(Code)
  return DeobfuscatedCode.code
}