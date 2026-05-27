# DRE Plataforma

Plataforma web para gestão de **Demonstração do Resultado do Exercício (DRE)** por projeto.

## Stack

- React 19 + TypeScript + Vite
- Recharts para gráficos
- Tailwind CSS v4
- Persistência via localStorage (MVP)

## Funcionalidades

- **Dashboard** — KPIs consolidados e gráfico comparativo entre projetos
- **Projetos** — múltiplos projetos, cada um com vários períodos mensais
- **Formulário DRE** — estrutura completa: ROB → ROL → Lucro Bruto → EBITDA → EBIT → LAIR → Lucro Líquido
- **Comparativo** — tabela lado a lado de todos os projetos e períodos
- **Recursos Humanos** — cadastro de colaboradores CLT/PJ com salário e horas contratuais
- **Alocação de horas** — aponte horas por recurso em cada período; custos preenchidos automaticamente com snapshot salarial histórico

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
