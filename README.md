# Food Ordering System

## Overview
This is a project for the Node.js course at KPI, built with Express and Eta as the templating engine. It follows a structured architecture for better maintainability.

## Project Theme: Food Ordering System
### Entities:
- **Menu**
- **Menu Items**
- **Orders**

### Actors:
- **User**
- **Administrator**

### Use Cases:
#### Administrator:
- Create/Delete/View menu items
- View orders
- Process orders

#### User:
- View menu
- Create order
- Add menu items to order
- Submit order

## Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/mcnodelds/node101
   cd node101
   ```
2. Install dependencies:
   ```sh
   pnpm install
   ```

### Running the Project
Start the development server with:
```sh
pnpm dev
```
The application will be available at `http://localhost:3000`.

## Project Structure
```
node101/
│── public/            # Static assets (CSS, JS, images, etc.)
│── src/               # Source code
│   │── views/         # Templates (Eta files)
│   │   │── layouts/   # Layouts
│   │   │── pages/     # The pages themselves
│   │   │── partials/  # Reusable template fragments
│   │── app.js         # Main Express app entry point
│── .env               # Environment variables
│── package.json       # Project metadata and dependencies
│── pnpm-lock.yaml     # Lockfile for dependencies
```

## Configuration
Right now you can only specify the `PORT` in .env
