# Clean Code Skill

## Principle

Code must be readable, maintainable, and robust.

## Rules

1. **Meaningful Names**: Variables and functions must clearly state their intent.
   - `const t = 10;` // Bad
   - `const timeoutSeconds = 10;` // Good
2. **Single Responsibility**: Each function should do one thing well.
3. **DRY (Don't Repeat Yourself)**: Extract common logic into utils or hooks.
4. **Early Returns**: Reduce nesting by returning early.
5. **Types**: Use TypeScript interfaces/types explicitly. Avoid `any`.
6. **Comments**: Comment *why*, not *what*. The code says *what*.
