# Family Tree Builder

A family tree builder that runs entirely in the browser, made with React, TypeScript and React Flow in October 2025. You add people, link them as parents, children and spouses, and the app lays them out by generation. Everything is saved in the browser's `localStorage`, and the tree can be exported to and imported from a JSON file. There is no back end.

Live site: https://mdarikrayhan.github.io/family-tree/

## Features

- **Members:** add or edit a person with name, gender (male, female or other), birth date, death date, father, mother and spouse. A list view shows every member as a card with **Edit** and **Delete** buttons. Deleting a member removes every reference to them.
- **Linked relationships:** choosing a spouse sets the link on both people. When a new member is added with a father or mother, that parent's list of children is updated too.
- **Tree view:** an interactive [React Flow](https://reactflow.dev/) diagram with zoom, pan, a minimap and draggable nodes.
  - Members are placed by generation. Couples sit side by side, and siblings are ordered from oldest to youngest by birth date.
  - Parent-child links are solid blue lines that run through a junction point under each couple. Spouse links are dashed, animated pink lines.
  - Cards are colour-coded by gender.
- **Controls:**
  - **Export** downloads the tree as `familyTree.json`. **Import** loads such a file and replaces the current data after asking you to confirm.
  - **Sample Data** adds a three-generation example family.
  - **Reset Layout** recalculates the positions.
  - **Clear All** deletes everything from `localStorage`.

## Tech stack

- React 19 and TypeScript, built with Vite (with the React Compiler Babel plugin)
- React Flow 11 for the diagram
- Zustand for state, persisted to `localStorage`
- Tailwind CSS 3

## Getting started

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Vite serves the app under the `/family-tree/` base path (set in [`vite.config.ts`](vite.config.ts)), so open the URL that `npm run dev` prints.

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build, then publish `dist/` to the `gh-pages` branch (the live site) |

## Data format

Each member is stored like this ([`src/store/useFamilyStore.ts`](src/store/useFamilyStore.ts)):

```typescript
interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  relations: {
    fatherId?: string;
    motherId?: string;
    spouseId?: string;
    childrenIds: string[];
  };
}
```

An exported file is a JSON array of these objects.

## Project structure

```
src/App.tsx                     tree/list view switch and the member form modal
src/components/Toolbar.tsx      title, member count, import and export
src/components/TreeControls.tsx add member, sample data, clear all, reset layout
src/components/TreeView.tsx     React Flow canvas
src/components/MemberNode.tsx   a person in the tree
src/components/JunctionNode.tsx the point where a couple's line splits to their children
src/components/MemberCard.tsx   a person in the list view
src/components/MemberForm.tsx   add/edit form and relationship updates
src/store/useFamilyStore.ts     Zustand store and localStorage persistence
src/utils/helpers.ts            generation map, layout, edges, JSON import/export
```

## Author

Md Arik Rayhan — [mdarikrayhan.com](https://mdarikrayhan.com)
