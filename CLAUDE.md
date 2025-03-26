# Guidelines for SM3 Alertmanager

## Commands
- **Run backend:** `python app.py`
- **Run frontend:** `cd src && npm start`
- **Lint backend:** `flake8 app.py`
- **Lint frontend:** `cd src && npm run lint`
- **Test backend:** `pytest`
- **Test specific backend file:** `pytest test_app.py::test_function_name`
- **Test frontend:** `cd src && npm test`
- **Test specific frontend component:** `cd src && npm test -- -t "component name"`

## Code Style Guidelines
- **Python**: PEP 8 compliant, docstrings for functions, type hints encouraged
- **JavaScript/React**: ES6 syntax, functional components with hooks
- **Imports**: Group imports (standard lib, third-party, local), alphabetize within groups
- **Error handling**: Use try/except with specific exceptions in Python, try/catch in JavaScript
- **Naming**: snake_case for Python variables/functions, camelCase for JavaScript
- **Types**: Utilize TypeScript types for React components, Python type hints for functions
- **React state management**: Use useState/useEffect hooks appropriately
- **Comments**: Add comments for complex logic, all functions should have docstrings/JSDoc