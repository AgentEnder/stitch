import { GmlFile, GmlSymbolType, ProjectSymbolType } from '@bscotch/gml-parser';
import vscode from 'vscode';
import { debounce } from './debounce.mjs';
import { config } from './extension.config.mjs';
import { StitchYyFormatProvider } from './extension.formatting.mjs';
import { GameMakerProject } from './extension.project.mjs';
import { GameMakerSemanticTokenProvider } from './extension.semanticTokens.mjs';
import { GameMakerWorkspaceSymbolProvider } from './extension.symbols.mjs';
import { GameMakerFolder } from './extension.tree.mjs';
import { locationOf, pathyFromUri } from './lib.mjs';

const jsdocCompletions = [
  '@param',
  '@returns',
  '@description',
  '@self',
  '@function',
  '@ignore',
  '@pure',
  '@deprecated',
].map(
  (tag) => new vscode.CompletionItem(tag, vscode.CompletionItemKind.Property),
);

export class StitchProvider
  implements
    vscode.HoverProvider,
    vscode.CompletionItemProvider,
    vscode.SignatureHelpProvider,
    vscode.DefinitionProvider,
    vscode.ReferenceProvider
{
  readonly signatureHelpStatus = vscode.window.createStatusBarItem(
    config.functionSignatureStatusAlignment,
    config.functionSignatureStatusAlignment === vscode.StatusBarAlignment.Left
      ? -Infinity
      : Infinity,
  );

  protected projects: GameMakerProject[] = [];
  static config = config;

  protected constructor() {
    this.signatureHelpStatus.hide();
  }

  clearProjects() {
    this.projects = [];
    void vscode.commands.executeCommand(
      'setContext',
      'stitch.projectCount',
      this.projects.length,
    );
  }

  async loadProject(yypPath: vscode.Uri) {
    const project = await GameMakerProject.from(yypPath);
    this.projects.push(project);
    void vscode.commands.executeCommand(
      'setContext',
      'stitch.projectCount',
      this.projects.length,
    );
    return project;
  }

  provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Location[]> {
    const symbol = this.getSymbol(document, position);
    if (!symbol) {
      return;
    }
    return [...symbol.refs.values()]
      .map((ref) => {
        return locationOf(ref);
      })
      .filter((loc) => !!loc) as vscode.Location[];
  }

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    const symbol = this.getSymbol(document, position);
    if (symbol && !symbol.native) {
      return locationOf(symbol);
    }
    return;
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Hover> {
    const symbol = this.getSymbol(document, position);
    if (!symbol) {
      return;
    }
    const hoverContents = new vscode.MarkdownString();
    let hasSomething = false;
    if (symbol.code) {
      hoverContents.appendCodeblock(symbol.code, 'gml');
      hasSomething = true;
    }
    if (symbol.description) {
      hoverContents.appendMarkdown(symbol.description);
      hasSomething = true;
    }
    if (!hasSomething) {
      return;
    }
    return new vscode.Hover(hoverContents);
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionItem[] | vscode.CompletionList {
    const gmlFile = this.getGmlFile(document);
    const offset = document.offsetAt(position);
    if (!gmlFile) {
      return [];
    }
    const symbols = gmlFile.getInScopeSymbolsAt(offset);
    const completions: vscode.CompletionItem[] = [];
    for (const symbol of symbols) {
      if (!symbol.name) {
        continue;
      }
      const shouldHide =
        symbol.name!.startsWith('_') &&
        'location' in symbol &&
        !symbol.location?.file.path.equals(document.uri.fsPath);
      if (shouldHide) {
        continue;
      }
      const item = new vscode.CompletionItem(
        symbol.name!,
        vscode.CompletionItemKind.Constant,
      );
      switch (symbol.kind) {
        case 'enum':
          item.kind = vscode.CompletionItemKind.Enum;
          break;
        case 'globalFunction':
          item.kind = symbol.isConstructor
            ? vscode.CompletionItemKind.Constructor
            : vscode.CompletionItemKind.Function;
          item.detail = 'global';
          break;
        case 'gmlFunction':
          item.kind = vscode.CompletionItemKind.Function;
          item.detail = 'gml';
          break;
        case 'globalVariable':
          item.kind = vscode.CompletionItemKind.Variable;
          item.detail = 'global';
          break;
        case 'localVariable':
          item.kind = vscode.CompletionItemKind.Variable;
          item.detail = 'local';
          break;
        case 'macro':
          item.detail = 'macro';
          break;
      }
      completions.push(item);
    }
    return completions;
  }

  provideSignatureHelp(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.SignatureHelp | undefined {
    return;
    // const project = this.getProject(document);
    // let leftParensNeeded = 1;
    // let offset = document.offsetAt(position);
    // let param = 0;
    // while (leftParensNeeded > 0 && offset > 0) {
    //   if (!leftParensNeeded) {
    //     break;
    //   }
    //   offset--;
    //   const pos = document.positionAt(offset);
    //   const char = document.getText(new vscode.Range(pos, pos.translate(0, 1)));
    //   if (char === '(') {
    //     leftParensNeeded--;
    //   } else if (char === ')') {
    //     leftParensNeeded++;
    //   } else if (char === ',' && leftParensNeeded === 1) {
    //     param++;
    //   }
    // }
    // const func = StitchProvider.positionToWord(
    //   document,
    //   document.positionAt(offset),
    // );
    // const help =
    //   this.globalSignatures.get(func) || project?.signatures.get(func);
    // if (!help) {
    //   return;
    // }
    // help.activeSignature = 0;
    // help.activeParameter = param;
    // return help;
  }

  /**
   * Determine the project the file belongs to,
   * and pass an update request to that project.
   */
  async updateFile(document: vscode.TextDocument) {
    await this.getGmlFile(document)?.reload(document.getText());
  }

  getProject(
    document: vscode.TextDocument | vscode.Uri,
  ): GameMakerProject | undefined {
    if (!document) {
      return;
    }
    return this.projects.find((p) => p.includesFile(document));
  }

  getSymbol(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): GmlSymbolType | ProjectSymbolType | undefined {
    const offset = document.offsetAt(position);
    const file = this.getGmlFile(document);
    const ref = file?.getReferenceAt(offset);
    if (!ref) {
      console.error(`Could not find reference at ${offset}`);
      return;
    }
    const symbol = ref?.symbol;
    if (!symbol) {
      console.error(`Could not find symbol for ${ref}`);
      return;
    }
    return symbol;
  }

  getGmlFile(document: vscode.TextDocument | vscode.Uri): GmlFile | undefined {
    const project = this.getProject(document);
    if (!project) {
      console.error(`Could not find project for ${document}`);
      return;
    }
    const file = project.getGmlFile(pathyFromUri(document));
    if (!file) {
      console.error(`Could not find file for ${document}`);
      return;
    }
    return file;
  }

  static positionToWord(
    document: vscode.TextDocument,
    position: vscode.Position,
  ) {
    const range = document.getWordRangeAtPosition(
      position,
      /(#macro|@?[a-zA-Z0-9_]+)/,
    );
    return document.getText(range);
  }

  /**
   * Only allow a single instance at a time.
   */
  protected static provider: StitchProvider;
  protected static ctx: vscode.ExtensionContext;

  static async activate(ctx: vscode.ExtensionContext) {
    this.ctx ||= ctx;
    if (!this.provider) {
      this.provider = new StitchProvider();
      const onChangeDoc = debounce((event: vscode.TextDocumentChangeEvent) => {
        const doc = event.document;
        if (doc.languageId !== 'gml') {
          return;
        }
        void StitchProvider.provider.updateFile(event.document);
      }, 100);

      vscode.workspace.onDidChangeTextDocument(onChangeDoc);
    }

    // Dispose any existing subscriptions
    // to allow for reloading the extension
    this.ctx.subscriptions.forEach((s) => s.dispose());

    this.provider.clearProjects();

    const yypFiles = await vscode.workspace.findFiles(`**/*.yyp`);

    for (const yypFile of yypFiles) {
      await StitchProvider.provider.loadProject(yypFile);
    }

    ctx.subscriptions.push(
      // new GameMakerTreeProvider(this.provider.projects).register(),
      vscode.languages.registerHoverProvider('gml', this.provider),
      vscode.languages.registerCompletionItemProvider(
        'gml',
        this.provider,
        // '.',
        // '"',
      ),
      vscode.languages.registerSignatureHelpProvider(
        'gml',
        this.provider,
        '(',
        ',',
      ),
      vscode.languages.registerDocumentFormattingEditProvider(
        'yy',
        new StitchYyFormatProvider(),
      ),
      vscode.languages.registerDefinitionProvider('gml', this.provider),
      vscode.languages.registerReferenceProvider('gml', this.provider),
      vscode.languages.registerWorkspaceSymbolProvider(
        new GameMakerWorkspaceSymbolProvider(this.provider.projects),
      ),
      vscode.commands.registerCommand(
        'stitch.run',
        (uriOrFolder: string[] | GameMakerFolder) => {
          // Identify the target project
          let project: GameMakerProject | undefined;
          if (this.provider.projects.length === 1) {
            project = this.provider.projects[0];
          } else if (uriOrFolder instanceof GameMakerFolder) {
            // Then we clicked in the tree view
            project = this.provider.projects.find(
              (p) => p.name === uriOrFolder.name,
            );
          } else {
            const uriString =
              uriOrFolder[0] ||
              vscode.window.activeTextEditor?.document.uri.toString();
            if (uriString) {
              const uri = vscode.Uri.parse(uriString);
              project = this.provider.getProject(uri);
            }
          }

          if (!project) {
            void vscode.window.showErrorMessage('No project found to run!');
            return;
          }
          project.run();
        },
      ),
      vscode.commands.registerCommand('stitch.openIde', (...args) => {
        const uri = vscode.Uri.parse(
          args[0] || vscode.window.activeTextEditor?.document.uri.toString(),
        );
        this.provider.getProject(uri)?.openInIde();
      }),
      new GameMakerSemanticTokenProvider(this.provider).register(),
      this.provider.signatureHelpStatus,
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.provider.signatureHelpStatus.text = '';
        this.provider.signatureHelpStatus.hide();
        if (!config.enableFunctionSignatureStatus) {
          return;
        }
        // If something is actually selected, versus
        // just the cursor being in a position, then
        // we don't want to do anything.
        if (e.selections.length !== 1) {
          return;
        }
        // Get the signature helper.
        const signatureHelp = this.provider.provideSignatureHelp(
          e.textEditor.document,
          e.selections[0].start,
        );
        if (!signatureHelp) {
          return;
        }
        // Update the status bar with the signature.
        // We can't do any formatting, so we'll need
        // to upper-case the current parameter.
        const signature =
          signatureHelp.signatures[signatureHelp.activeSignature];
        const name = signature.label.match(/^function\s+([^(]+)/i)?.[1];
        if (!name) {
          return;
        }
        const asString = `${name}(${signature.parameters
          .map((p, i) => {
            if (
              typeof p.label === 'string' &&
              i === signatureHelp.activeParameter
            ) {
              return p.label.toUpperCase();
            }
            return p.label;
          })
          .join(', ')})`;
        this.provider.signatureHelpStatus.text = asString;
        this.provider.signatureHelpStatus.show();
      }),
    );

    return this.provider;
  }
}
