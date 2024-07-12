import * as Acorn from 'acorn'
import { webcrack } from 'webcrack'

export class Analyze {
  public Code: string
  public AST: ReturnType<typeof Acorn.Parser.parse>

  constructor(Code: string) {
    this.Code = Code
  }

  async Deobfuscate() {
    this.Code = await webcrack(this.Code).then(Result => Result.code)
    this.AST = Acorn.Parser.parse(this.Code, { ecmaVersion: 2022 })
  }
}