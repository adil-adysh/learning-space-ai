# Before & After: Code Examples

## 1️⃣ Form State Management

### ❌ BEFORE: Procedural (Scattered State)
```typescript
// src/ui/addForm.ts
let isSaving = false;

function createAddForm(onSave) {
  let isSaving = false;  // State inside function closure
  
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (isSaving) return;  // Manual race condition handling
    
    try {
      isSaving = true;  // Update closure state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      
      await onSave({ title, topic, prompt });
      
      if (status) status.textContent = 'Success!';  // Direct DOM mutation
      clearForm();
      hide();
    } catch (err) {
      if (status) status.textContent = 'Error!';  // Another DOM mutation
    } finally {
      isSaving = false;  // Manual cleanup
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save card';
    }
  });
  
  return { show, hide };
}

// Usage: Component doesn't know about state, no visibility
const addForm = createAddForm(onSave);
```

**Problems:**
- State is implicit (hidden in closure)
- Multiple DOM mutations without clear pattern
- Hard to track state changes
- Race condition handling manual
- No visibility into component state

---

### ✅ AFTER: Class-Based (Centralized State)
```typescript
// src/ui/addFormComponent.ts
class AddForm {
  private isSaving = false;  // Explicit private state
  
  constructor(private dependencies: AddFormDependencies) {
    this.validateElements();
    this.attachListeners();
  }
  
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    // Guard clause
    if (this.isSaving) {
      console.warn('[AddForm] Submission already in progress');
      return;
    }
    
    try {
      this.isSaving = true;
      this.setUIBusy(true);
      
      await this.dependencies.onSubmit({ title, topic, prompt });
      
      this.showStatus('Success!', 'success');
      this.clearForm();
      this.hide();
      
      // Emit event for other components to react
      eventBus.emit('form:success', { title });
    } catch (err) {
      this.showStatus('Error!', 'error');
      eventBus.emit('form:error', { message: err });
    } finally {
      this.isSaving = false;
      this.setUIBusy(false);
    }
  }
  
  private showStatus(message: string, type: 'error' | 'success'): void {
    this.statusDiv!.textContent = message;
    this.statusDiv!.className = `form-status ${type}`;
    eventBus.emit(type === 'success' ? 'form:success' : 'form:error', { message });
  }
  
  private setUIBusy(isBusy: boolean): void {
    this.submitBtn!.disabled = isBusy;
    this.submitBtn!.textContent = isBusy ? 'Saving...' : 'Save card';
  }
}

// Usage: State is explicit, dependencies clear
const addForm = new AddForm({
  onSubmit: handleFormSubmit,
});
```

**Improvements:**
- ✅ State is explicit and visible
- ✅ DOM mutations in helper methods
- ✅ Events emitted for state changes
- ✅ Clear error handling
- ✅ Self-documenting through types

---

## 2️⃣ Component Communication

### ❌ BEFORE: Tight Coupling
```typescript
// src/ui/index.ts
const cardList = createCardList();

const addForm = createAddForm(async (data) => {
  await window.api.addCard(data);
  
  // Direct call to CardList's refresh logic
  // Tightly coupled: AddForm knows about CardList
  await refreshUI();
});

async function refreshUI() {
  const cards = await window.api.getCards();
  
  // Hard-coded refresh: CardList depends on this
  // If we add another component, we need another refresh call
  cardList.render(cards, { onStart: handleStart, onToggle: handleToggle });
}
```

**Problems:**
- AddForm calls refreshUI() directly
- CardList doesn't know it should update on form submit
- Adding new components requires modifying existing code
- No separation of concerns

---

### ✅ AFTER: Decoupled via EventBus
```typescript
// src/ui/index.ts

// Initialize components
const addForm = new AddForm({
  onSubmit: handleFormSubmit,  // Dependency injected
});

const cardList = new CardList({
  onCardStart: handleCardStart,
  onCardToggle: handleCardToggle,
});

// Event-driven communication
async function handleFormSubmit(data: FormData) {
  const newCard = await window.api.addCard(data);
  appState.addCard(newCard);
  // CardList automatically hears 'list:updated' event ↓
  eventBus.emit('list:updated');
}

// In cardListComponent.ts
class CardList {
  constructor(dependencies) {
    eventBus.on('list:updated', () => this.render());
    // Automatically re-renders when state changes
  }
}
```

**Improvements:**
- ✅ Components don't reference each other
- ✅ AddForm doesn't know about CardList
- ✅ CardList can add itself as a listener independently
- ✅ Easy to add new listeners without modifying existing code
- ✅ Clear event flow

---

## 3️⃣ State Management

### ❌ BEFORE: No Central State
```typescript
// src/ui/index.ts
let formOpen = false;  // Where is this state? Scattered.
let cards = [];        // Multiple sources of truth
let isLoading = true;

async function refreshUI() {
  cards = await loadCards();  // Manual state update
  cardList.render(cards, handlers);
}

function toggleForm() {
  formOpen = !formOpen;  // Manual state toggle
  if (formOpen) {
    form.hidden = false;
  } else {
    form.hidden = true;
  }
}

// How do we know what the current state is?
// No visibility, hard to debug
```

**Problems:**
- State scattered across functions
- Multiple sources of truth (cards, formOpen, isLoading)
- Manual synchronization between state and UI
- No event emissions
- Hard to debug "what is the current state?"

---

### ✅ AFTER: Single Source of Truth
```typescript
// src/ui/appState.ts
class AppStateManager {
  private state: AppState = {
    cards: [],
    isLoading: true,
    error: null,
    isFormOpen: false,
  };
  
  getState(): AppState { return { ...this.state }; }
  
  setCards(cards: LearningCard[]): void {
    this.setState({ cards });
    eventBus.emit('list:updated');  // Automatic event
  }
  
  setFormOpen(isOpen: boolean): void {
    this.setState({ isFormOpen: isOpen });
    eventBus.emit(isOpen ? 'form:open' : 'form:close');
  }
}

// Usage
appState.setCards(cards);           // State + event
appState.setFormOpen(true);         // State + event
appState.updateCardStatus(id, status);  // State + event

// Check state anytime
const currentCards = appState.getValue('cards');
const isFormOpen = appState.getValue('isFormOpen');
```

**Improvements:**
- ✅ Single source of truth
- ✅ Automatic event emissions
- ✅ Type-safe state access
- ✅ Visible, traceable state updates
- ✅ Easy to add persistence/sync later

---

## 4️⃣ Error Handling

### ❌ BEFORE: Inconsistent
```typescript
// src/ui/addForm.ts
form.addEventListener('submit', async (ev) => {
  try {
    await onSave(data);
    if (status) status.textContent = 'Success!';  // Direct DOM
    clearForm();
    hide();
  } catch (err) {
    const errorMsg = 'Failed to save card. Please try again.';
    if (status) status.textContent = errorMsg;  // Direct DOM
    srAnnounce(errorMsg);  // Also announce to SR
  } finally {
    // Cleanup
  }
});

// Errors are printed but not tracked
console.error('Error:', err);  // Unclear what component this is from
```

**Problems:**
- Error handling scattered
- No clear error tracking
- Component name not in logs
- No event emission for errors

---

### ✅ AFTER: Structured & Tracked
```typescript
// src/ui/addFormComponent.ts
private async handleSubmit(e: Event): Promise<void> {
  try {
    await this.dependencies.onSubmit(data);
    this.showStatus('Success!', 'success');
    eventBus.emit('form:success', { title });
  } catch (err) {
    const errorMsg = 'Failed to save card. Please try again.';
    console.error('[AddForm] Submission error:', err);  // Prefixed logs
    this.showStatus(errorMsg, 'error');
    eventBus.emit('form:error', { message: errorMsg });  // Event
  } finally {
    this.isSaving = false;
    this.setUIBusy(false);
  }
}

// Usage: Other components can listen for errors
eventBus.on('form:error', ({ message }) => {
  // Handle errors globally
  console.error('[App] Form error:', message);
});
```

**Improvements:**
- ✅ Structured error handling
- ✅ Prefixed console logs for tracing
- ✅ Errors emitted as events
- ✅ Global error handling possible
- ✅ Easy to add error persistence

---

## 5️⃣ Testing

### ❌ BEFORE: Hard to Test
```typescript
// src/ui/addForm.ts
export function createAddForm(onSave) {
  const toggle = document.querySelector('#toggle-add');  // Hard-coded
  const form = document.querySelector('#add-form');      // Hard-coded
  
  form.addEventListener('submit', async (ev) => {
    await onSave(data);  // Can't mock without modifying
  });
}

// Test is nearly impossible
test('add form submits', () => {
  const form = createAddForm((data) => {
    // This callback is called, but:
    // 1. Can't verify it was called with correct args
    // 2. Can't mock window.api
    // 3. Can't verify UI updates
  });
});
```

**Problems:**
- DOM selectors hard-coded
- Dependencies not injectable
- Can't mock window.api
- Can't verify state updates

---

### ✅ AFTER: Easy to Test
```typescript
// src/ui/addFormComponent.ts
export class AddForm {
  constructor(private dependencies: AddFormDependencies) {
    // Dependencies injected - can be mocked
  }
}

// Test is straightforward
test('add form calls onSubmit', async () => {
  const mockSubmit = jest.fn();
  
  const form = new AddForm({
    onSubmit: mockSubmit,  // Mock injected
  });
  
  // Simulate form submission
  const submitEvent = new Event('submit');
  document.querySelector('#add-form')!.dispatchEvent(submitEvent);
  
  // Verify
  expect(mockSubmit).toHaveBeenCalledWith({
    title: 'Test',
    topic: 'Test',
    prompt: 'Test',
  });
});
```

**Improvements:**
- ✅ Dependencies injectable
- ✅ Can mock all dependencies
- ✅ Easy to verify behavior
- ✅ Can test in isolation

---

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| **State Location** | Scattered closures | Centralized manager |
| **State Updates** | Manual | Automatic + events |
| **Component Communication** | Direct calls | Event bus |
| **Testing** | Hard | Easy |
| **Debugging** | Scattered logs | Structured logs |
| **Error Handling** | Inconsistent | Structured + events |
| **Extensibility** | Modify existing code | Add listeners |
| **Type Safety** | Partial | Full |
| **Maintainability** | Hard | Easy |
| **Lines of Code** | Fewer but scattered | More but organized |

---

## Key Takeaway

The refactoring trades some additional code organization (4 new files) for **massive improvements** in:
- Maintainability
- Testability
- Debuggability
- Extensibility
- Type safety
- Error handling

**Result:** Production-ready, enterprise-grade code! 🚀
