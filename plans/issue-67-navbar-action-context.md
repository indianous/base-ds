# Plano: ações do `Navbar` sabem se estão no drawer e podem fechá-lo (issue #67)

## Contexto

No celular, com mais de uma ação, o `Navbar` renderiza cada elemento de `actions` duas vezes: no
header (`hidden md:flex`) e no drawer de ações (`side="right"`). Com uma só ação, ela fica no
header também no celular. A ação não sabe em qual dos lugares está, nem consegue fechar o drawer.

No ecommerce, o `UserMenu` (`components/layout/UserMenu.tsx`) contorna os dois problemas com
detalhes internos do base-ds:

- descobre se está no drawer com `closest('[role="dialog"]')` num `useLayoutEffect`, para abrir o
  `DropdownMenu` com `align="start"` no drawer e `align="end"` no header. Na primeira
  renderização ele ainda não sabe onde está;
- fecha o drawer depois de navegar ou de "Sair" clicando no botão
  `button[aria-label="<drawerCloseLabel>"]`.

## Decisão: contexto, e não `actions` como função

A issue propõe as duas opções. Recomendo o **contexto**:

- **Server Components.** O `Navbar` é um client component, e o layout que o monta costuma ser um
  Server Component. Uma função em `actions` não passa de um Server Component para um Client
  Component (`Functions cannot be passed directly to Client Components`, o mesmo problema do
  `linkComponent`, que exige o `AppLink`). Com o contexto, `actions` continua um array de
  elementos, e só a ação que precisa (já um client component, como o `UserMenu`) chama o hook.
- **Sem mudar o tipo de `actions`.** Nada muda para quem não usa, e o tipo continua
  `ReactNode[]`.
- **Chega a qualquer profundidade.** Um botão dentro de um menu dentro da ação também lê o
  contexto.

## Mudanças

### 1. Hook `useNavbarAction`

```ts
export interface NavbarActionContextValue {
  /** `true` when the action is rendered inside the mobile actions drawer. */
  inDrawer: boolean
  /** Closes the actions drawer. Does nothing when the action is not in the drawer. */
  closeDrawer: () => void
}

export function useNavbarAction(): NavbarActionContextValue
```

- O nome segue o `useToast`. A issue sugere `useNavbarActionContext`; prefiro o mais curto, mas o
  nome é com você.
- Fora de um `Navbar` (ação testada sozinha, ou o mesmo componente usado em outro lugar), o hook
  devolve `{ inDrawer: false, closeDrawer: () => {} }` e não lança erro. Assim o `UserMenu` pode
  ser renderizado e testado sem o `Navbar`.
- O `Navbar` envolve cada ação com um provider: no header, `inDrawer: false` e um `closeDrawer`
  que não faz nada; no drawer, `inDrawer: true` e
  `closeDrawer: () => setIsActionsDrawerOpen(false)`. O valor é memoizado, para não renderizar as
  ações de novo à toa.
- Uma ação sozinha no celular fica no header e recebe `inDrawer: false`.

### 2. Onde fica o contexto

Num arquivo próprio, `src/components/organisms/Navbar/NavbarActionContext.ts` (`.ts`, não uma
entrada do tsup), importado pelo `Navbar.tsx`. Com o `splitting`, ele vira um chunk compartilhado,
com uma única instância do contexto para o `Navbar` e para o hook. Um app que importa só o hook não
puxa o `Navbar`, o `Drawer` nem o `DropdownMenu`. Confiro isso no `check:dist` e, se fizer
sentido, com um caso no `src/bundle.test.ts`.

O arquivo do hook precisa receber o `'use client'` (usa `useContext`). O pós-build já coloca a
diretiva em todo `.js` de `dist` exceto o `index.js`, e o chunk compartilhado é um desses.

### 3. Exportação

`useNavbarAction` e o tipo `NavbarActionContextValue` no `src/index.ts`, junto do `Navbar`.

### 4. Fora de escopo

- Fechar o drawer automaticamente a cada clique numa ação: quebraria ações que abrem um menu (o
  próprio caso do `UserMenu`). O app decide quando fechar.
- O drawer de menu (`items`/`search`): os links já fecham sozinhos (`onNavigate`). A `search` não
  tem como fechá-lo, mas ninguém pediu. Se aparecer a necessidade, o mesmo contexto pode passar a
  valer ali, em outra issue.

## Testes (TDD, escritos antes)

Com uma ação de teste que mostra `inDrawer` e tem um botão que chama `closeDrawer`:

- no header (desktop), a ação recebe `inDrawer: false`;
- no drawer de ações aberto, a cópia de dentro do drawer recebe `inDrawer: true`, já na primeira
  renderização (sem efeito);
- `closeDrawer` chamado de dentro do drawer fecha o drawer (o `dialog` some);
- `closeDrawer` chamado no header não lança erro nem muda nada;
- com uma só ação, ela recebe `inDrawer: false`;
- fora do `Navbar`, o hook devolve o padrão sem lançar erro;
- `jest-axe` sem violações com o drawer aberto e a ação de teste;
- importar `useNavbarAction` e `NavbarActionContextValue` do `src/index.ts`.

Story `ActionsAwareOfDrawer`: um menu de usuário (avatar + `DropdownMenu`) com
`align={inDrawer ? 'start' : 'end'}` e um item que fecha o drawer. Uma interaction test no
viewport de celular abre o drawer, abre o menu, confere que ele cabe no drawer e, ao clicar no
item, que o drawer fecha.

## README

Na seção do `Navbar`, um exemplo do `useNavbarAction` com o menu de usuário, e o aviso de que o
componente que chama o hook precisa ser um client component (`'use client'`).

## Depois, no ecommerce (fora deste repo)

O `UserMenu` troca o `closest` e o clique no botão pelo hook. Fica no plano do próprio app, com a
nova versão.

## Versão e changelog

API nova e opcional: **patch**, v0.5.12 se sair depois das outras. "Adicionado":
`useNavbarAction` (`inDrawer` e `closeDrawer`). "Ajustes necessários nos apps": nenhum, com a nota
de que o contorno com `closest('[role="dialog"]')` pode sair.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build`
e `npm run check:dist`.

## Resultado (implementação)

Entregue como planejado, com o nome `useNavbarAction`.

- O contexto ficou em `NavbarActionContext.ts`. O `src/bundle.test.ts` ganhou um caso: importar só
  o hook não traz o `Navbar.tsx`, o `Drawer` nem ícones do lucide.
- Só o drawer de ações tem provider. As cópias do header usam o valor padrão do contexto
  (`inDrawer: false` e um `closeDrawer` que não faz nada), o mesmo de fora do `Navbar`.
- Com uma só ação, ela aparece duas vezes no DOM (linha do desktop e header do celular), e as duas
  recebem `inDrawer: false`.
- A story `ActionsAwareOfDrawer` roda no viewport `mobile1`, abre o menu do usuário dentro do
  drawer, confere que ele cabe no drawer e que "Sign out" fecha o drawer. Com `align="end"`
  forçado, a checagem falha (o menu sai 87px pela esquerda), então ela de fato pega o problema da
  issue.
- **Correção no build, achada na verificação do `dist`:** o plano supunha que o contexto num `.ts`
  viraria um chunk próprio, mas o esbuild o colocou no chunk do `Navbar`, porque só o `Navbar.tsx`
  o importava. O `bundle.test.ts` não percebe, porque lê o `src` com tree-shaking, e o Next.js
  entrega um módulo `'use client'` inteiro. O `tsup.config.ts` passou a ter como entrada também os
  `.ts` de `src/components` (menos os testes). Com isso, `NavbarActionContext.js` e `useToast.js`
  ganham arquivos próprios, e o contexto fica num chunk de 238 bytes compartilhado com o `Navbar`.
  O `check:dist` ganhou a guarda 6: o arquivo que define `useNavbarAction` não pode definir o
  `Navbar`. Com a configuração antiga, ela falha.
