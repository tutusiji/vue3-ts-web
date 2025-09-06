# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Vue 3 dynamic form engine (动态表单引擎) - a configurable form builder that allows drag-and-drop form design. The application supports both low-code and no-code configuration approaches for creating dynamic forms with various field types, validation, linking, and styling options.

**Live Demo:** https://tuziki.com/demo/formEngine/

## Development Commands

### Basic Operations
```bash
# Install dependencies
npm install
# or
pnpm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality & Formatting
```bash
# ESLint - Fix linting issues
npm run eslint

# Prettier - Format code
npm run prettier

# Stylelint - Fix CSS/Vue style issues
npm run style

# Pre-commit hook (runs linting/formatting)
npm run pre-commit

# Commit with conventional commit messages
npm run commit
```

### Testing & Build
```bash
# Type check with Vue TSC
vue-tsc

# Run a specific test file
# Note: No test runner is currently configured in package.json
```

## Architecture Overview

### Core Technology Stack
- **Frontend Framework:** Vue 3 with Composition API
- **Build Tool:** Vite 5.2.0
- **Language:** TypeScript (strict mode disabled)
- **State Management:** Pinia
- **UI Framework:** Element Plus with auto-import
- **Routing:** Vue Router 4
- **Styling:** Tailwind CSS + SCSS/LESS support
- **Code Quality:** ESLint + Prettier + Stylelint + Husky + lint-staged + Commitizen

### Key Architectural Patterns

#### 1. Dynamic Component System
The application uses a dynamic component architecture where form components are registered and rendered dynamically:
- Form components live in `src/views/DynamicForm/formComponents/`
- Edit components live in `src/views/DynamicForm/editComponents/`
- Components are resolved using `myComponents[item.comName]` mapping

#### 2. Configuration-Driven Forms
Forms are generated from JSON configurations stored in Pinia state:
- `configStore.createData.baseInfo` - Form metadata (name, size, layout)
- `configStore.createData.comList` - Array of form field configurations
- `configStore.formConfig` - Available form component library
- `configStore.editConfig` - Edit-time component configurations
- `configStore.modelsConfig` - Pre-built form templates

#### 3. Three-Panel Layout Design
The main interface (`DynamicForm/Index.vue`) uses a three-column layout:
1. **Left Panel:** Component library and templates selection
2. **Center Panel:** Form preview with drag-and-drop reordering
3. **Right Panel:** Configuration editor for selected components

#### 4. State Management Pattern
Uses Pinia with a centralized configuration store (`configStore`):
- Reactive form configuration
- Component library definitions
- Current selection state
- Template management

## Project Structure

```
src/
├── assets/           # Static assets, fonts, SVGs
├── fonts/            # Font files and font components
├── router/           # Vue Router configuration
├── store/            # Pinia stores (configStore.ts, config.ts)
├── utils/            # Utility functions (tools.ts)
└── views/
    ├── DynamicForm/  # Main form engine
    │   ├── editComponents/    # Property editor components
    │   ├── formComponents/    # Renderable form components
    │   ├── Index.vue          # Main three-panel interface
    │   └── DragPage.vue       # Drag-and-drop page
    └── SpiderNodes/  # Secondary feature (spider/network nodes)
```

### Component Types

**Form Components** (render in form preview):
- `TextInput.vue` - Single-line text input
- `NumberInput.vue` - Number input with validation  
- `BasicSelect.vue` - Dropdown select
- `CascaderSelect.vue` - Cascading select
- `Texts.vue` - Static text display

**Edit Components** (render in property panel):
- Mirror the form components but focus on configuration editing
- Handle component-specific property modifications

## Development Guidelines

### Adding New Form Components

1. **Create Form Component:** Add to `src/views/DynamicForm/formComponents/`
2. **Create Edit Component:** Add corresponding editor to `editComponents/`
3. **Register in Config:** Add component definition to `configStore.formConfig`
4. **Update Component Mapping:** Ensure component is accessible via dynamic import

### Path Aliases
The project uses several path aliases configured in `vite.config.ts` and `tsconfig.json`:
- `@/` → `src/`
- `Assets/` → `src/assets/`  
- `Components/` → `src/components/`
- `Utils/` → `src/utils/`

### Auto-imports
The project has auto-imports configured for:
- Vue 3 APIs (`ref`, `reactive`, `computed`, etc.)
- Vue Router APIs
- Pinia APIs  
- Element Plus components and icons

### Drag-and-Drop Implementation
The form builder supports drag-and-drop reordering of form fields:
- Uses native HTML5 drag-and-drop API
- Handles `dragstart`, `dragover`, `drop` events
- Visual feedback with CSS classes (`dragging`, `drop-over`)
- Updates `configStore.createData.comList` array order

### Form Validation & Rules
Form components support Element Plus validation rules:
- Rules defined in component configuration (`rules` property)
- Supports required fields, custom validators, trigger events
- Validation state managed through Element Plus form system

## Configuration System

### Base Form Configuration
```typescript
baseInfo: {
  comName: string      // Form template name
  comId: string        // Unique form identifier  
  formSize: string     // 'large' | 'default' | 'small'
  labelPosition: string // 'top' | 'left' | 'right'
  column: number       // Number of columns (1-4)
  gutter: number       // Grid spacing
  spacing: number      // Vertical spacing between fields
}
```

### Field Component Configuration
Each form field has a standardized configuration structure:
```typescript
{
  label: string        // Field label
  key: string          // Data binding key
  comName: string      // Component type identifier
  comType: string      // HTML input type
  dataType: string     // Data type for validation
  required: boolean    // Required field flag
  rules: Array         // Validation rules
  placeholder: string  // Placeholder text
  column: number       // Column span
  // Component-specific properties...
}
```
