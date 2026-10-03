# Monster Fit

Aplicativo web instalável para montar rotinas, registrar sessões de treino e acompanhar a evolução. Interface em português, pensada primeiro para celular.

## Funcionalidades

- Cadastro, login, logout e redefinição local de senha.
- Rotinas sem limite, exercícios personalizados, biblioteca pesquisável, favoritos e edição de séries.
- Agenda semanal ligada às rotinas; execução com timer de descanso; histórico, calendário e evolução.
- Perfil, tema, unidade kg/lb, backup/restauração e ações de conta com confirmação.
- PWA com cache offline, lembrete local diário e 34 GIFs demonstrativos.

## Desenvolvimento local

Requer Node.js 22 e pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm build
```

O preview Manus lê imagens do armazenamento gerenciado pelo Manus. O build público do Pages é selecionado com `DEPLOY_TARGET=github-pages` e grava o frontend em `dist/public`, incluindo os assets de `github-pages-assets/` em `dist/public/media/`.

## GitHub Pages

O arquivo `.github/workflows/deploy.yml` instala dependências pelo lockfile, roda verificação de tipos e testes, compila com o base path `/MONSTER-FIT/` e publica `dist/public` após cada atualização de `main`. Em **Settings → Pages**, a origem de publicação deve estar definida como **GitHub Actions** (não Branch/Jekyll).

## Dados e privacidade

O app não tem backend de conta nem sincronização na nuvem. Credenciais, perfil, rotinas, preferências e histórico ficam no `localStorage` deste navegador, separados por perfil local. Senhas são armazenadas como hashes PBKDF2 com salt aleatório quando Web Crypto está disponível. Redefinição só alcança contas criadas neste mesmo dispositivo. Faça backups regulares: limpar dados do navegador pode apagar registros.

O lembrete notifica uma vez ao abrir o app quando há treino agendado para hoje e nenhuma sessão concluída no dia. Não há serviço push/backend para avisos enquanto o app estiver fechado.

## Mídia

Os GIFs locais do Pages foram derivados do [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), sob a licença declarada pelo projeto de origem. Veja [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).
