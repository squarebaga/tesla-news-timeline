# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Project Architecture

This is a React-based Tesla news timeline application built with Vite, React 18, and Tailwind CSS.

### Core Structure
- **Entry Point**: `src/main.jsx` renders the `TeslaNewsTimeline` component directly
- **Main Component**: `src/TeslaNewsTimeline.jsx` contains the entire timeline implementation with hardcoded news data
- **App Wrapper**: `src/App.jsx` is a simple wrapper that renders `TeslaNewsTimeline`

### Key Technical Details
- **Styling**: Uses Tailwind CSS with a red theme (`bg-red-700`) and white text
- **Data**: News items are hardcoded in the `TeslaNewsTimeline` component as a static array
- **Timeline Design**: Vertical timeline with left border, circular markers, date tags, and "Read More" links
- **Build Tool**: Vite with standard React configuration

The application is a single-page component displaying Tesla news in a timeline format with no external data sources or routing.