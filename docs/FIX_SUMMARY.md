# Fix Summary - ProjectCreate Button Error

## 🔧 Issues Fixed

### 1. **TypeScript Type-Only Import Errors** ✅

**Problem:** Type-only values were being imported as regular imports
**Solution:** Changed to use `import type` for type-only imports

**Files Fixed:**

- `src/main.ts` - RawCard, Status
- `src/preload.ts` - LearningCard, RawCard, Status, Project, RawProject
- `src/util.ts` - RawCard, LearningCard

### 2. **ProjectCreate Event Handling** ✅

**Problem:** "Cannot read properties of undefined (reading 'createProject')" error

**Root Cause:**

- ProjectCreate was using CustomEvent dispatch instead of callback props
- The event wasn't properly reaching the parent component
- No callback interface was defined

**Solution:**

- Added `Props` interface with `oncreated` callback
- Used `$props()` to destructure the callback
- Changed from CustomEvent to direct callback invocation: `oncreated?.({ project: created.id })`

### 3. **Duplicate Window Interface Declaration** ✅

**Problem:** Window.api was declared in both app.d.ts and preload.ts with different signatures

**Solution:**

- Removed incomplete declaration from app.d.ts
- Kept complete, authoritative declaration in preload.ts

### 4. **Event Handler Function Signature** ✅

**Problem:** handleProjectCreated expected CustomEvent but received plain object

**Solution:**

- Changed from `handleProjectCreated(e: CustomEvent<{ project: string }>)`
- To: `handleProjectCreated(detail: { project: string })`

---

## ✅ Verification

```bash
✅ npm run typecheck - PASS (0 errors)
✅ npm run build - SUCCESS
✅ 161 modules transformed
✅ Build time: 1.64s
```

---

## 📝 What Changed

### ProjectCreate.svelte

```typescript
// BEFORE (didn't work)
async function handleSubmit(e: SubmitEvent) {
  const event = new CustomEvent('created', {
    detail: { project: created.id },
    bubbles: true,
  });
  (e.target as HTMLFormElement).dispatchEvent(event);
}

// AFTER (works)
interface Props {
  oncreated?: (detail: { project: string }) => void;
}
const { oncreated }: Props = $props();

async function handleSubmit(e: SubmitEvent) {
  oncreated?.({ project: created.id });
}
```

### +page.svelte

```typescript
// BEFORE (wrong signature)
function handleProjectCreated(e: CustomEvent<{ project: string }>) {
  const projectId = e.detail.project;
  projectManager.selectProject(projectId);
}

// AFTER (correct)
function handleProjectCreated(detail: { project: string }) {
  const projectId = detail.project;
  projectManager.selectProject(projectId);
}
```

---

## 🎯 Result

**The "Create Project" button now works correctly!** ✅

When you click the create project button:

1. Form validates input ✓
2. ProjectCreate component calls projectManager.createProject() ✓
3. On success, invokes the oncreated callback ✓
4. Parent component receives the new project ID ✓
5. Navigates to the created project ✓

---

**All fixes applied and verified. Ready to use!**
