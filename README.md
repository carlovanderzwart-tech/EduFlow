# EduFlow

EduFlow is een platform voor onderwijsprofessionals die omkomen in de administratie.

Lees eerst de documentatie in [`/docs`](./docs) — die is leidend voor wat er gebouwd wordt (zie
`docs/00 - Project Setup.md`, *Documentatie*).

## Aan de slag

Vereist: Node.js 20+ en npm.

```bash
npm install
npm run dev
```

De app draait daarna op [http://localhost:3000](http://localhost:3000).

Overige scripts:

```bash
npm run build   # productiebuild
npm run start   # productiebuild draaien
npm run lint    # ESLint
```

## Techniek

Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
Zie `docs/03 - Technical Architecture.md` voor de volledige architectuur en
mappenstructuur.
