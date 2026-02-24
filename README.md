# Maruti Blinds Management System - Frontend

This is the frontend client for the Maruti Blinds Management System, built with modern web technologies to provide a fast, responsive, and dynamic user interface.

## 🚀 Technologies Used

- **React 19**
- **Vite** (Next Generation Frontend Tooling)
- **React Router DOM** (Declarative Routing)
- **Tailwind CSS** (Utility-first CSS Framework)
- **Framer Motion** (Production-ready Animations)
- **Axios** (Promise based HTTP client)
- **Vercel Analytics** 

## 🎨 Responsive Design & UI/UX

The frontend is built with a **Mobile-First** approach ensuring a seamless experience across all device sizes. We utilize Tailwind CSS's utility classes to manage breakpoints contextually:

- **Mobile First**: All baseline styles are targeted at mobile screens.
- **Tablet (`sm:` & `md:`)**: Adjusted padding, font sizing, and multi-column grid layouts for mid-sized screens.
- **Desktop (`lg:` & `xl:`)**: Expanded navigation, larger imagery, and sophisticated dense grid structures tailored to larger real estate.
- **Dark/Light Mode**: Full support for CSS user preference media queries, providing high-contrast dark mode interfaces where applicable.
- **Micro-Animations**: Uses Framer Motion for subtle entry scale, fade-in animations on scroll, and soft hovering states that enhance the feel without impacting performance.

## 📂 Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Main application views (Home, Portfolio, etc.)
- `src/layout`: Application layouts (MainLayout, Sidebar, Header, etc.)
- `src/context` or `src/store`: State management (Redux/Context API)
- `src/assets`: Images, icons, and global styles
- `public`: Static assets

## ⚙️ Environment Variables

Create a `.env` file in the root of the `client` directory and configure the following:

```env
# The base URL of your backend server API
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🛠️ Scripts & Usage

In the project directory, you can run:

### `npm install`
Installs all required dependencies.

### `npm run dev`
Runs the app in the development mode.
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.
The page will reload when you make changes.

### `npm run build`
Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`
Runs ESLint to find and fix problems in the JavaScript code.

### `npm run preview`
Boot up a local static web server that serves the files from `dist` to preview the production build locally.

## 🚀 Deployment

The frontend is optimized and ready to be deployed on **Vercel**. Simply connect the repository to Vercel and set the build command to `npm run build` and the output directory to `dist`. Ensure to set the required Environment Variables in the Vercel dashboard.
