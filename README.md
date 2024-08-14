# PrettyLogger

PrettyLogger is a simple utility that brings console.log-like functionality to a specified div element in your web page. It allows you to log messages, objects, and DOM elements directly into your page for easy debugging.

## Usage Example

```javascript
const logger = new AdvancedDebugLogger('debugLogPanel');

// Log different types of messages
logger.info('Application started');
logger.debug({ config: { env: 'production', debug: false } });
logger.warn('Deprecated function called');
logger.error(new Error('Something went wrong'));

// Log DOM elements
const element = document.createElement('div');
element.innerHTML = '<p>Hello <strong>World</strong></p>';
logger.info(element);
```

This logger provides a convenient way to display debug information directly in your web page, similar to using the browser's console but with the added benefit of in-page visibility.
