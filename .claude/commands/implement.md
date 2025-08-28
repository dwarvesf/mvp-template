Please embrace the following workflow and standards for all implementations.

1/ Decide on what agent should handle the task. If it's related to frontend UI, use the `ui-engineer` agent. If it's related to backend or fullstack implementation, use the `senior-fullstack-architect` agent.

2/ Always write tests first before implementing any feature, component, or business logic. Follow the TDD cycle: Write a failing test → Implement the feature → Refactor with confidence.

3/ If you encounter any TypeScript errors during implementation, use the `typescript-error-fixer` agent to fix them before proceeding.

4/ After completing the implementation, run the lint command to ensure code quality and fix any linting issues using the `typescript-error-fixer` agent if necessary.

5/ Ensure that all tests pass and that the code meets the project's quality standards before finalizing the implementation.

Now please proceed with implementing the following task:
