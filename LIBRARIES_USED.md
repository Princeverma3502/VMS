# Libraries and Modules Used in VMS Project

This document provides a comprehensive list of the libraries, modules, and dependencies used in the Volunteer Management System (VMS) project, categorized by backend and frontend.

---

## Backend (`/backend`)

### Production Dependencies

These libraries are essential for the application to run in a production environment.

| Library | Usage |
|---|---|
| `bcryptjs` | Hashes and compares passwords securely before storing them in the database. |
| `cloudinary` | A cloud service for managing images and video. Used here for uploading and serving media files like user profile pictures. |
| `cors` | A Node.js middleware that enables Cross-Origin Resource Sharing, allowing the frontend (on a different domain) to make API requests to the backend. |
| `dotenv` | Loads environment variables from a `.env` file into `process.env`, keeping sensitive data like API keys and database credentials out of the source code. |
| `express` | The core web application framework for Node.js. Used to build the server, define API routes, and handle HTTP requests and responses. |
| `express-async-handler` | A utility that wraps async route handlers to automatically catch errors and pass them to the Express error-handling middleware. |
| `express-mongo-sanitize` | Middleware that sanitizes user-submitted data to prevent MongoDB query injection attacks. |
| `express-rate-limit` | Middleware used to limit repeated requests to API endpoints, helping to prevent brute-force attacks. |
| `express-validator` | A set of middleware functions for validating and sanitizing incoming request data, ensuring data integrity. |
| `helmet` | Helps secure the Express app by setting various HTTP headers that protect against common web vulnerabilities. |
| `html2canvas` | A library to render HTML content onto a `<canvas>` element. Can be used on the server to generate images from HTML templates. |
| `jsonwebtoken` | Implements JSON Web Tokens (JWT) for creating and verifying stateless authentication tokens, which are used to manage user sessions. |
| `mongoose` | An Object Data Modeling (ODM) library for MongoDB. It provides a schema-based solution to model application data and interact with the database. |
| `multer` | A Node.js middleware for handling `multipart/form-data`, which is primarily used for processing file uploads. |
| `pdfkit` | A PDF generation library for Node.js. Used for dynamically creating PDF documents, such as volunteer resumes or reports. |
| `uuid` | Generates universally unique identifiers (UUIDs), which can be used for creating unique IDs for various database entries. |
| `web-push` | A library to send push notifications to users' browsers, enabling real-time alerts and updates. |
| `xss-clean` | Middleware that sanitizes user input in `req.body`, `req.query`, and `req.params` to prevent Cross-Site Scripting (XSS) attacks. |

### Development Dependencies

These libraries are only used during the development phase.

| Library | Usage |
|---|---|
| `nodemon` | A development tool that automatically restarts the Node.js server whenever it detects file changes, speeding up the development workflow. |

---

## Frontend (`/frontend`)

### Production Dependencies

These libraries are bundled into the final application that is served to the user's browser.

| Library | Usage |
|---|---|
| `axios` | A promise-based HTTP client for the browser, used to make API calls from the React application to the backend server. |
| `clsx` | A tiny utility for constructing `className` strings conditionally, making it easier to manage dynamic styles in React components. |
| `html-to-image` | Converts a DOM node into a vector (SVG) or raster (PNG, JPEG) image. Useful for exporting components like Digital ID cards as images. |
| `html2canvas` | Similar to `html-to-image`, it captures a "screenshot" of a DOM element and renders it on a canvas. |
| `html5-qrcode` | A library to integrate QR code and barcode scanning capabilities directly within the web application. |
| `jspdf` | A client-side library for generating PDF documents directly in the browser. Likely used for the "Download as PDF" feature for resumes. |
| `jsqr` | A pure JavaScript library for reading and decoding QR codes from images. |
| `lucide-react` | A library providing a set of simple, consistent, and customizable icons for React applications. |
| `qrcode` / `qrcode.react` / `react-qr-code` | These libraries are used to generate and render QR codes within the React application, for example, on the Digital ID card for verification. |
| `react` | The core JavaScript library for building the user interface with its component-based architecture. |
| `react-dom` | Provides the DOM-specific methods to render React components into the browser. |
| `react-router-dom` | Handles client-side routing, enabling navigation between different pages in the single-page application without a full page reload. |
| `tailwind-merge` | A utility function to intelligently merge multiple Tailwind CSS classes, resolving conflicts and redundancies. |

### Development Dependencies

These libraries are used for building, developing, and maintaining the frontend code.

| Library | Usage |
|---|---|
| `@vitejs/plugin-react` | The official Vite plugin that enables support for React, including features like Fast Refresh. |
| `autoprefixer` | A PostCSS plugin that automatically adds vendor prefixes to CSS rules, ensuring cross-browser compatibility. |
| `eslint` & Plugins | A suite of tools (`eslint`, `eslint-plugin-react-hooks`, etc.) for static code analysis to find and fix problems in JavaScript code, enforcing code quality and style. |
| `postcss` | A tool for transforming CSS with JavaScript plugins. It's a dependency for `tailwindcss` and `autoprefixer`. |
| `tailwindcss` | A utility-first CSS framework used for rapidly building custom user interfaces. Its configuration is managed in `tailwind.config.js`. |
| `vite` | A modern frontend build tool that serves as the development server and bundles the application for production. It offers a significantly faster and leaner development experience compared to older tools. |
