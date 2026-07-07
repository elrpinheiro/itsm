# Vitae ITSM

Central de Atendimentos e Serviços da Vitae — reescrita em React + TypeScript + Vite a
partir do protótipo estático (`vitae_itsm_1.html`), mantendo o visual e o fluxo originais
para evoluir com novos módulos.

## Stack

- React 18 + TypeScript
- Vite
- React Router (navegação entre telas/módulos)
- Zustand (estado de autenticação; base para estado de outros módulos)

Todos os dados (portfólios, templates, usuário) são mockados em memória — não há backend
ainda. A estrutura já foi pensada para plugar uma API real depois.

## Rodando localmente

```bash
npm install
npm run dev
```

Login de demonstração: qualquer usuário/senha preenchidos (os campos já vêm
pré-preenchidos com `admin@vitaebrasil.com.br` / `12345678`).

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — typecheck + build de produção
- `npm run typecheck` — checagem de tipos isolada
- `npm run lint` — ESLint

## Estrutura

```
src/
  components/     # login e layout do shell (TopBar, ModuleTabs, AppShell)
  modules/        # um diretório por módulo do ITSM
    documentos/   # Central de Documentos: portfólios → templates → wizard de assinatura
    assistencia/  # placeholder para o módulo de Assistência (GLPI)
    registry.ts   # registro central dos módulos (abas da barra superior)
  data/           # catálogos mockados (marcas, portfólios, templates)
  store/          # estado global (Zustand)
  types/          # tipos compartilhados
  utils/          # utilidades (ex.: hash ilustrativo da selagem)
```

### Adicionando um novo módulo

1. Crie `src/modules/<novo-modulo>/` com seu componente principal.
2. Registre a rota em `src/App.tsx` dentro de `/app`.
3. Adicione a entrada em `src/modules/registry.ts` — a aba aparece automaticamente
   na barra de módulos.
