# Changelog

Todas as mudanças relevantes do base-ds são registradas aqui. O formato segue o
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[Versionamento Semântico](https://semver.org/lang/pt-BR/). Enquanto a versão for `0.x`, uma
mudança que exige ajuste nos apps sobe o _minor_ (`0.1.0 → 0.2.0`); correções e componentes
novos sem impacto sobem o _patch_.

## [0.2.0] - 2026-09-23

### Alterado

- `react` e `react-dom` passam a ser só `peerDependencies` (antes também estavam em
  `dependencies`), evitando uma segunda instância de React nos apps
  ([#38](https://github.com/indianous/base-ds/issues/38)).

### Adicionado

- Script `npm run pack:local`, que gera `.pack/base-ds-<versão>.tgz` para instalação nos apps.
- `README.md` com instalação, estilos, atualização e regras de uso, e este `CHANGELOG.md`.

### Ajustes necessários nos apps

- Trocar a dependência `"base-ds": "file:../base-ds"` (symlink) por
  `"base-ds": "file:../base-ds/.pack/base-ds-0.2.0.tgz"`, depois de rodar
  `npm run pack:local` no base-ds, e rodar `npm install`.
- Remover o paliativo de symlink manual em `base-ds/node_modules/{react,react-dom}`, se existir.
- Opcional: copiar para o `CLAUDE.md` do app o trecho indicado no README.

## [0.1.0]

- Versão inicial: todos os componentes, tokens e o suporte a Tailwind v4 entregues até a
  [#37](https://github.com/indianous/base-ds/issues/37).

[0.2.0]: https://github.com/indianous/base-ds/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/indianous/base-ds/releases/tag/v0.1.0
