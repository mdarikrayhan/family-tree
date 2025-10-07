# 🌳 Family Tree Builder

A modern, interactive family tree builder built with React, TypeScript, and React Flow. Create, visualize, and manage your family relationships with an intuitive interface.

## ✨ Features

### 🔗 Smart Relationship Visualization
- **Hierarchical Layout**: Family members are automatically arranged by generation (grandparents → parents → children)
- **Visual Connections**: Different edge types for different relationships:
  - **Blue solid lines**: Parent-child relationships
  - **Pink dashed lines**: Marriage/spouse relationships (animated)
- **Intelligent Positioning**: Spouses are positioned close together, and families are grouped logically

### 👥 Comprehensive Member Management
- Add family members with detailed information (name, gender, birth/death dates)
- Establish relationships: parents, children, spouses
- **Bidirectional Relationships**: When you set someone as a spouse, the relationship is automatically reciprocated
- **Smart Parent-Child Linking**: Adding a parent automatically adds the child to their children list

### 💾 Data Persistence
- **Local Storage**: All data is saved locally in your browser
- **Export/Import**: Backup your family tree as JSON files
- **No Backend Required**: Works entirely offline

### 🎨 Modern UI
- **Responsive Design**: Works on desktop and mobile
- **Gender-coded Colors**: Visual distinction between male (blue), female (pink), and other (gray)
- **Interactive Tree**: Zoom, pan, and explore your family tree
- **Spouse Indicators**: See marriage connections directly on member cards

## 🚀 Getting Started

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/mdarikrayhan/family-tree.git
cd family-tree
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📱 Usage

### Adding Family Members
1. Click "Add Member" to open the form
2. Fill in basic information (name, gender, dates)
3. Select relationships (father, mother, spouse) from existing members
4. Click "Add Member" to save

### Building Relationships
- **Parent-Child**: Select parents when adding a new member
- **Spouse**: Select a spouse from the dropdown (relationship will be bidirectional)
- **Multiple Generations**: Build up from grandparents down to grandchildren

### Visualizing the Tree
- The tree automatically arranges members by generation
- Use the minimap to navigate large family trees
- Zoom in/out with mouse wheel or controls
- Different line types show different relationship types

### Data Management
- **Export**: Click "Export Tree" to download your family data as JSON
- **Import**: Click "Import Tree" to load previously exported data
- **Local Persistence**: Data is automatically saved in your browser

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Flow** for interactive tree visualization
- **Zustand** for lightweight state management
- **Tailwind CSS** for styling

### Key Components
- \`TreeView\`: Interactive family tree visualization
- \`MemberForm\`: Add/edit family member details
- \`MemberNode\`: Individual family member display
- \`MemberCard\`: Member information cards
- \`Toolbar\`: Import/export and tree management

### Data Structure
\`\`\`typescript
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
\`\`\`

## 🔮 Future Enhancements

- [ ] Photo support for family members
- [ ] Multiple spouse support (for historical trees)
- [ ] Adoption and step-family relationships
- [ ] Tree export as image/PDF
- [ ] Search and filter functionality
- [ ] Multiple family tree management
- [ ] Cloud sync integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [React Flow](https://reactflow.dev/) for tree visualization
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
