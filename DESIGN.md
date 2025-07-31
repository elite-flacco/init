## Styling and UI

- **Tailwind CSS**: Primary styling framework with custom color palette
- **Dark mode support**: Enabled using the `class` strategy in tailwind (e.g., `dark:` variants).
- **Responsive design**: Web-first approach with responsive breakpoints
- **Custom theme**: Defined in `tailwind.config.js` by extending color palette with primary/secondary brand colors
- **Semantic colors**: Success, warning, error, info and action colors defined

## Design Philosophy

> Clean, friendly, and slightly playful. Prioritize clarity and speed, but don’t forget joy.

- **Minimalist, uncluttered UI** — everything on screen should have a reason.
- **Clean typography with good vertical rhythm**
- **Ample white space and consistent spacing**
- **Whitespace is intentional** — use `gap-*`, `space-*`, and `p-*` to create calm layouts.
- **Rounded corners and soft shadows for components** — use `rounded-lg`, `shadow-md` by default.
- **Subtle transitions and animations for hover and focus states** — all hover/focus states should feel responsive (`transition-all duration-150`).
- **A balanced color palette with a strong primary color and neutral backgrounds**
- **Tailwind's dark mode support to ensure a polished dark theme**
- **Fun is okay** — light motion, playful microcopy, and celebratory effects are welcome where appropriate.

## Semantic Component Classes

- All components should use **semantic class names** defined in a global CSS file like `components.css`. The AI should not apply raw Tailwind utility classes inline unless absolutely needed.
- All components should use theme colors only
- Use theme colors only, and not default tailwind colors inline, e.g. text-gray-500.

## Iconography

- Use [Lucide](https://lucide.dev/) or [Heroicons](https://heroicons.com/).
- Standard size: `w-5 h-5` or `w-4 h-4`
- Apply spacing using `ml-2`, `mr-1` when next to text
- Accent icons with `text-primary`, `text-info`, or `text-danger` when conveying state

## Accessibility & Best Practices

- Always use `aria-*`, `role`, and `tabindex` for interactive components.
- All components must be keyboard accessible.
- Use `focus-visible:outline-*` to support focus styles.
- Don’t rely on color alone — pair errors/success with icons and text.
- All dynamic components (e.g. modals, toasts) must manage focus appropriately.

## Delight & Personality

Inject subtle playfulness into the app where it enhances the experience.

- **Button microcopy**: Use light emojis or playful phrases.
- **Micro-animations**:
  - Success confetti on key actions
  - Fun loading messages or typing animations
- **Easter eggs** (optional):
  - Hidden keyboard shortcut?
  - A fun 404 page: “Oops. You wandered too far.”

## Progressive Design

I want to build a progressive form interface where the user answers **one question at a time**, like a step-by-step conversational UI.

### UX Goals:

- Only **one question is visible at a time** in the viewport
- When the user completes the current step (e.g., types an answer and presses Enter or clicks Continue), the **next question slides in from the bottom**, replacing the current one. Users should be able to scroll up naturally to see and edit previous answers
- If the user **scrolls up**, they can **see and edit previous answers**
- The previous questions should be reasonably spaced (i.e. NO giant gaps between questions)
- Previous steps AUTOMATICALLY become editable as soon as they’re in view
- Scrolling back down continues from the most recent unanswered or incomplete question
- The whole flow should feel fluid and interactive — like a smart assistant or chatbot UX
- Do not stack all questions inside a scrollable container with multiple questions visible at once. I want **only one question visible in the viewport at a time**. the entire page should scroll naturally, like a normal website.

### Technical constraints:

- Use **React + Tailwind CSS**
- Each question can be its own component, e.g., `<QuestionStep />`
- Form state should be persisted (using React state, context, or Zustand is fine)
- Animations should use **Framer Motion** for smooth sliding transitions
- It should work well on mobile and desktop
- The UX should be the same in DestinationPickFlow and TripPlanningPrompts steps

### Please:

1. Use Tailwind for styling
2. Use Framer Motion for enter/exit transitions
3. Make each step editable if revisited
4. Suggest how to manage scroll behavior or anchoring to the current step

Do not hardcode layout for each question manually — build it so we can define an array of questions and loop over them.
