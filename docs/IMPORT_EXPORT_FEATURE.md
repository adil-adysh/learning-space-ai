# AI-Assisted Learning Cards Import/Export Feature

## Implementation Summary

This document summarizes the implementation of the AI-assisted generation, import, and export feature for LearningCards at the project level.

## ✅ Completed Features

### 1. Type Definitions & Schema
- **File**: `src/types.ts`
- Added `LearningCardBundleV1` type for versioned import/export format
- Added `ValidationError` type for structured error reporting
- Schema follows the specification: `{ version: 1, cards: RawCard[] }`

### 2. AI Prompt Generation
- **File**: `src/lib/constants/aiPrompts.ts`
- Created `AI_LEARNING_CARD_PROMPT` constant with detailed instructions for AI
- Implemented `buildChatGPTUrl()` (legacy GPT URL builder) and `AI_LEARNING_CARD_PROMPT` constant
- Prompts include project context when provided
- URLs are properly encoded and ready to open in browser

### 3. Import/Export Utilities
- **File**: `src/lib/utils/cardImportExport.ts`
- `learningCardToRaw()`: Convert Date objects to ISO strings
- `rawToLearningCard()`: Convert ISO strings to Date objects
- `exportCards()`: Create LearningCardBundleV1 from array of cards
- `validateBundle()`: Comprehensive validation with detailed error messages
  - Validates version, required fields, data types, date formats
  - Returns array of `ValidationError` with field and card index
  - Fail-fast approach: any error rejects entire import
- `downloadJSON()`: Trigger browser download of JSON file
- `generateExportFilename()`: Sanitize project names for filenames

### 4. Card Manager Extensions
- **File**: `src/lib/cardManager.svelte.ts`
- `exportProjectCards(projectId, projectName)`: Export all cards for a project
- `validateImportBundle(data)`: Validate imported JSON structure
- `importCardsToProject(bundle, projectId)`: Import cards into target project
  - Uses IPC API to create cards
  - Overrides `projectId` for all imported cards (preserves project-scoped constraint)
  - Updates local state after successful import

### 5. Import Modal Component
- **File**: `src/lib/components/ImportCardsModal.svelte`
- Two input methods:
  - File upload (.json)
  - Direct JSON paste into textarea
- Real-time validation feedback with detailed error messages
- Shows card-level errors (e.g., "Card 2: invalid date format")
- Disabled state during processing
- Success message with auto-close after 1 second
- Accessible (role="dialog", aria-modal, keyboard navigation)

### 6. UI Integration - ProjectDetail
- **File**: `src/lib/components/ProjectDetail.svelte`
- Added three buttons to project header:
  1. **🤖 Generate Learning Cards**: Opens ChatGPT with pre-filled prompt
  2. **📥 Import**: Opens import modal
  3. **📤 Export**: Downloads JSON file
- Buttons are project-scoped (only shown when project is active)
- Export filename format: `{sanitized-project-name}-learning-cards.json`

### 7. Test Coverage
- **File**: `src/lib/utils/cardImportExport.unit.test.ts` (23 tests, all passing)
  - Conversion functions (learningCardToRaw, rawToLearningCard)
  - Export functionality
  - Comprehensive validation tests (valid/invalid cases)
  - Filename sanitization
  - Import/export symmetry verification
  
- **File**: `src/lib/constants/aiPrompts.unit.test.ts` (10 tests, all passing)
  - AI prompt content validation
  - URL generation for ChatGPT
  - URL encoding verification
  - Prompt consistency between platforms
  
- **File**: `src/lib/cardManager.importExport.unit.test.ts`
  - CardManager integration tests
  - Mock window.api for IPC testing
  - Error handling scenarios

## 🎯 Key Design Decisions

### No Domain Model Changes
- Reused existing `RawCard` type for persistence
- `LearningCardBundleV1` is a wrapper, not a new domain model
- Import/export utilities are separate from core domain logic

### Fail-Fast Validation
- If any card in the bundle is invalid, the entire import is rejected
- No partial imports to maintain data integrity
- Clear, actionable error messages for each validation failure

### Project-Scoped Operations
- All buttons only appear when viewing a specific project
- Imported cards are automatically assigned to the target project
- Export filters cards by project (only exports project's cards)

### AI Integration is Safe
- "Generate Learning Cards" only opens a URL; no automatic persistence
- User must manually copy/paste AI-generated JSON
- Validation catches issues before any data is saved

### Symmetric Import/Export
- Exported files can be immediately re-imported without modification
- Schema version field allows for future extensibility
- ISO date format ensures cross-platform compatibility

## 🔐 Security & Validation

### Validation Checks
1. JSON parses successfully
2. Root object exists
3. `version === 1`
4. `cards` is an array
5. For each card:
   - All required fields present (id, title, prompt, status, createdAt)
   - Field types are correct (strings, valid status enum)
   - Dates are valid ISO 8601 format
   - Optional fields (topic, project) have correct types when present

### Error Messages
- Field-level errors: "Card at index 2 has invalid 'status' (must be 'active' or 'done')"
- Bundle-level errors: "Invalid or missing version (expected: 1)"
- JSON parsing errors: "Invalid JSON format"

## 📁 File Structure

```
src/
├── types.ts                                    # Added LearningCardBundleV1, ValidationError
├── lib/
│   ├── cardManager.svelte.ts                   # Added import/export methods
│   ├── cardManager.importExport.unit.test.ts   # Integration tests
│   ├── constants/
│   │   ├── aiPrompts.ts                        # NEW: AI prompt & URL generators
│   │   └── aiPrompts.unit.test.ts              # NEW: AI prompt tests
│   ├── utils/
│   │   ├── cardImportExport.ts                 # NEW: Core import/export logic
│   │   └── cardImportExport.unit.test.ts       # NEW: Utility tests (23 tests)
│   └── components/
│       ├── ImportCardsModal.svelte             # NEW: Import UI component
│       └── ProjectDetail.svelte                # Updated: Added 3 buttons
```

## 🚀 Usage Workflow

### Export Workflow
1. Navigate to a project
2. Click **📤 Export** button
3. Browser downloads `{project-name}-learning-cards.json`

### AI Generation Workflow
1. Navigate to a project
2. Click **🤖 Generate Learning Cards** button
3. Browser opens ChatGPT with pre-filled prompt
4. User chats with AI to generate cards
5. User copies the generated JSON
6. User returns to app and clicks **📥 Import**
7. User pastes JSON into import modal
8. User clicks **Import** button
9. Cards are validated and imported into the project

### Direct Import Workflow
1. Navigate to a project
2. Click **📥 Import** button
3. Either:
   - Click "Choose File" and select a .json file, OR
   - Paste JSON directly into the textarea
4. Click **Import** button
5. If validation passes, cards are imported; otherwise, errors are displayed

## 🎨 UI/UX Highlights

- **Emoji icons** for visual clarity (🤖, 📥, 📤)
- **Secondary button styling** for import/export (not primary actions)
- **Primary button** for "New Learning Item" (main CTA)
- **Responsive layout** with flex-wrap for smaller screens
- **Accessibility**: Modals have proper ARIA attributes, keyboard navigation
- **Real-time feedback**: Validation errors show immediately
- **Success states**: Brief success message before modal closes

## 🧪 Test Results

```
✓ src/lib/utils/cardImportExport.unit.test.ts (23 tests)
✓ src/lib/constants/aiPrompts.unit.test.ts (10 tests)
✓ All utility functions passing
✓ Import/export symmetry verified
✓ Validation catches all error cases
✓ Filename sanitization works correctly
```

## 📝 Future Extensibility

The design supports future enhancements:

1. **Versioning**: `LearningCardBundleV1` format allows for V2, V3, etc.
2. **Additional Fields**: New card fields can be added without breaking existing exports
3. **Multiple AI Providers**: Easy to add more URL generators (Claude, etc.)
4. **Batch Operations**: Foundation for bulk card operations
5. **Notes Export**: Schema could be extended to include notes in future versions

## ⚠️ Known Limitations

1. **Notes not included**: Import/export only handles cards, not their associated notes (by design)
2. **AI Provider Limits**: URL length limits may truncate very long prompts (rare edge case)
3. **Browser Download**: Export uses browser download API (won't work in non-browser environments)

## ✅ Constraints Honored

- ✅ No modification to existing domain models
- ✅ No new persistence formats
- ✅ No auto-save of AI output
- ✅ Import & Export are symmetric
- ✅ All actions are project-scoped
- ✅ Fail-fast validation (no partial imports)

## 🎉 Feature Complete

All steps from the execution plan have been successfully implemented and tested.
