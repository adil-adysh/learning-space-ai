# Architecture Quick Reference

## 🎯 Core Concepts

### **1. EventBus: Decoupled Communication**

```typescript
import { eventBus } from './ui/eventBus';

// Emit an event
eventBus.emit('card:added');
eventBus.emit('form:error', { message: 'Error message' });

// Listen to an event
const unsubscribe = eventBus.on('card:added', () => {
  console.log('Card was added!');
});

// Unsubscribe
unsubscribe();

// Listen once
eventBus.once('form:success', ({ title }) => {
  console.log(`Card "${title}" was added!`);
});
```

**Available Events:**

- `form:open` - Form opened
- `form:close` - Form closed
- `form:submit` - Form submitted with data
- `form:success` - Form submission successful
- `form:error` - Form submission error
- `card:added` - Card added to list
- `card:toggled` - Card status changed
- `list:updated` - Card list was updated

---

### **2. AppState: Centralized State**

```typescript
import { appState } from './ui/appState';

// Get full state
const state = appState.getState();
console.log(state);
// { cards: [], isLoading: false, error: null, isFormOpen: false }

// Get specific value
const cards = appState.getValue('cards');
const isFormOpen = appState.getValue('isFormOpen');

// Update state
appState.setCards([...cards, newCard]);
appState.setLoading(true);
appState.setError('Something went wrong');
appState.setFormOpen(true);

// Semantic methods
appState.addCard(newCard); // Adds card to beginning
appState.updateCardStatus(cardId, 'done'); // Updates card status
```

---

### **3. AddForm Component: Class-Based**

```typescript
import { AddForm } from './ui/addFormComponent';

// Create component with dependency injection
const addForm = new AddForm({
  onSubmit: async (data) => {
    const newCard = await window.api.addCard(data);
    appState.addCard(newCard);
  },
});

// Component is automatically initialized with:
// - DOM elements validated
// - Event listeners attached
// - Event subscriptions set up
// - Logging enabled
```

---

### **4. CardList Component: Class-Based**

```typescript
import { CardList } from './ui/cardListComponent';

// Create component with dependency injection
const cardList = new CardList({
  onCardStart: async (card) => {
    await window.api.runPrompt(card.prompt);
  },
  onCardToggle: async (card) => {
    const newStatus = card.status === 'done' ? 'todo' : 'done';
    await window.api.toggleCard(card.id, newStatus);
    appState.updateCardStatus(card.id, newStatus);
  },
});

// Render list (automatically called on state changes)
cardList.render();
```

---

## 🔄 How Components Interact

### **Scenario: User Adds a Card**

```
1. User clicks "Add learning card" button
   ↓
   AddForm.toggle.click()
   → AddForm.show()
   → appState.setFormOpen(true)
   → eventBus.emit('form:open')

2. User fills form and clicks "Save card"
   ↓
   AddForm.form.submit()
   → AddForm.handleSubmit()
   → window.api.addCard(data)
   → handleFormSubmit() in init()
   → appState.addCard(newCard)
   → eventBus.emit('card:added')
   → eventBus.emit('list:updated')

3. CardList hears 'list:updated' event
   ↓
   eventBus.on('list:updated', () => cardList.render())
   → cardList.render()
   → Gets cards from appState.getValue('cards')
   → Renders each card
   → Restores focus
```

---

## 📝 Adding a New Feature

### **Example: Add a "Favorite" Toggle**

1. **Update AppState to track favorites**

```typescript
// In appState.ts
interface AppState {
  cards: LearningCard[];
  favorites: Set<string>;  // NEW
  // ...
}

// Add method to toggle favorite
toggleFavorite(cardId: string): void {
  const favorites = this.state.favorites;
  if (favorites.has(cardId)) {
    favorites.delete(cardId);
  } else {
    favorites.add(cardId);
  }
  eventBus.emit('favorites:updated', { cardId });
}
```

2. **Add event to EventBus**

```typescript
// In eventBus.ts
interface AppEvents {
  'favorites:updated': { cardId: string };
  // ...
}
```

3. **Add favorite button to CardItem**

```typescript
// In cardItem.ts
const favoriteBtn = document.createElement('button');
favoriteBtn.addEventListener('click', async () => {
  const isFavorite = appState.getValue('favorites').has(card.id);
  appState.toggleFavorite(card.id);
  eventBus.emit('favorites:updated', { cardId: card.id });
});
```

4. **Listen for changes in CardList**

```typescript
// In cardListComponent.ts
private subscribeToEvents(): void {
  eventBus.on('favorites:updated', ({ cardId }) => {
    console.log('Favorite toggled:', cardId);
    this.render(); // Re-render with updated state
  });
}
```

---

## 🧪 Testing Components

### **Test AddForm Submission**

```typescript
import { AddForm } from './ui/addFormComponent';

describe('AddForm', () => {
  it('should call onSubmit when form is submitted', async () => {
    const mockSubmit = jest.fn();

    const addForm = new AddForm({
      onSubmit: mockSubmit,
    });

    // Simulate form submission
    const form = document.querySelector('#add-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### **Test CardList Rendering**

```typescript
import { CardList } from './ui/cardListComponent';
import { appState } from './ui/appState';

describe('CardList', () => {
  it('should render cards from app state', () => {
    const mockStart = jest.fn();
    const mockToggle = jest.fn();

    const cardList = new CardList({
      onCardStart: mockStart,
      onCardToggle: mockToggle,
    });

    // Set test data in state
    appState.setCards([{ id: '1', title: 'Test Card' /* ... */ }]);

    cardList.render();

    const cards = document.querySelectorAll('article.card');
    expect(cards.length).toBe(1);
  });
});
```

---

## 🐛 Debugging

### **Enable Full Logging**

All components log to console with `[ComponentName]` prefix:

```
[Init] Starting application initialization
[Init] Loading initial data from API
[AddForm] Component initialized
[CardList] Component initialized
[AddForm] Toggle button clicked
[AddForm] show() called
[AppState] State updated: { isFormOpen: true }
[EventBus] Emitting event: form:open
[EventForm] Form is now visible
```

### **Check App State**

```javascript
// In browser console
window.appState?.getState();
// { cards: [...], isLoading: false, isFormOpen: false }

window.appState?.getValue('cards');
```

### **Monitor Events**

```javascript
// In browser console
const originalEmit = window.eventBus.emit;
window.eventBus.emit = function (event, data) {
  console.log('EVENT:', event, data);
  return originalEmit.call(this, event, data);
};
```

---

## 📂 File Structure Summary

```
src/ui/
├── eventBus.ts          ← Type-safe event emitter
├── appState.ts          ← Centralized state manager
├── addFormComponent.ts   ← AddForm class (NEW)
├── cardListComponent.ts  ← CardList class (NEW)
├── addForm.ts           ← DEPRECATED function version
├── cardList.ts          ← DEPRECATED function version
├── cardItem.ts          ← Card rendering (unchanged)
├── index.ts             ← App bootstrap (REFACTORED)
├── utils.ts             ← Helper functions
└── logger.ts            ← Diagnostics
```

---

## ✅ Migration Checklist

- ✅ EventBus created for decoupled communication
- ✅ AppState created for centralized state
- ✅ AddForm converted to class (AddFormComponent)
- ✅ CardList converted to class (CardListComponent)
- ✅ Init function refactored to use new services
- ✅ Dependency injection implemented
- ✅ Event subscriptions set up
- ✅ TypeScript types defined
- ✅ Logging added throughout
- ✅ Backward compatibility maintained
- ✅ Build passing without errors

---

## 🚀 Next Steps

1. **Test the app** - All features should work as before
2. **Review logging** - Open DevTools console to see trace
3. **Extend features** - Use new architecture for any additions
4. **Remove deprecated code** - `addForm.ts` and `cardList.ts` can be deleted when ready

The architecture is now **production-ready** and **future-proof**! 🎉
