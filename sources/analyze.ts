import * as TsMorph from 'ts-morph'
import * as ESToolkit from 'es-toolkit'
import * as Os from 'node:os'
import PLimit from 'p-limit'

export async function ExtractCode(Code: string) {
  const ProjectInstance = new TsMorph.Project({
    compilerOptions: {
      allowJs: true,
      skipLibCheck: true,
      target: TsMorph.ScriptTarget.ES2020
    },
    skipFileDependencyResolution: true,
    useInMemoryFileSystem: true
  })
  const FileInstance = ProjectInstance.createSourceFile('code.js', Code, { overwrite: true })
  const Tokens: string[] = []

  const CbNodes = ESToolkit.chunk(FileInstance.getDescendants(), 2)
  const PLimitInstance = PLimit(Os.cpus().length)
  const PromiseArray: Promise<void>[] = []

  for (const CbNode of CbNodes) {
    PromiseArray.push(PLimitInstance(() => {
      for (const NodeOne of CbNode) {
        if (NodeOne.getKind() === TsMorph.SyntaxKind.VariableDeclaration) {
          const VariableDeclaration = NodeOne.asKind(TsMorph.SyntaxKind.VariableDeclaration)
          const Initalizer = VariableDeclaration.getInitializer()
    
          if (Initalizer && Initalizer.getKind() === TsMorph.SyntaxKind.StringLiteral) {
            const Value = Initalizer.getText().slice(1, -1)
            if (/^eyJ[A-Za-z0-9._-]+$/.test(Value)) {
              VariableDeclaration.findReferencesAsNodes().forEach(Reference => {
                const TokenVars: TsMorph.KindToNodeMappings[TsMorph.ts.SyntaxKind.Identifier][] = []
                Reference.getParent().getChildren().forEach(Child => {
                  TokenVars.push(...Child.getChildrenOfKind(TsMorph.SyntaxKind.Identifier))
                })
                TokenVars.forEach(TokenVar => {
                  TokenVar.getDefinitions()[0].getDeclarationNode().forEachChild(Child => {
                    if (Child.getKind() === TsMorph.SyntaxKind.StringLiteral) {
                      Tokens.push(Child.getText().slice(1, -1))
                    }
                  })
                })
              })
            }
          }
        }
      }
    }))
  }
  await Promise.all(PromiseArray)
  return Tokens.join('')
}