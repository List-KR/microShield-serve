import * as TsMorph from 'ts-morph'

export function ExtractCode(Code: string) {
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

  FileInstance.forEachDescendant(CbNode => {
    if (CbNode.getKind() === TsMorph.SyntaxKind.VariableDeclaration) {
      const VariableDeclaration = CbNode.asKind(TsMorph.SyntaxKind.VariableDeclaration)
      const Initalizer = VariableDeclaration.getInitializer()

      if (Initalizer && Initalizer.getKind() === TsMorph.SyntaxKind.StringLiteral) {
        const Value = Initalizer.getText().slice(1, -1)
        if (/^eyJ[A-Za-z0-9._]+$/.test(Value)) {
          VariableDeclaration.findReferencesAsNodes().forEach(Reference => {
            const TokenVars: TsMorph.KindToNodeMappings[TsMorph.ts.SyntaxKind.Identifier][] = []
            Reference.getParent().getChildren().forEach(Child => {
              TokenVars.push(...Child.getChildrenOfKind(TsMorph.SyntaxKind.Identifier))
            })
            TokenVars.forEach(TokenVar => {
              Tokens.push(/(?<=")[A-Za-z0-9._]+(?=")/.exec(TokenVar.getDefinitions()[0].getDeclarationNode().getText())[0])
            })
          })
        }
      }
    }
  })
  return Tokens.join('')
}