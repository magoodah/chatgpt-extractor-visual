# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Pulse Grid**, a real-time ChatGPT prompt visualization application. It displays animated grid visualizations with ripple effects triggered by user prompts, complete with avatars, statistics, and a live feed sidebar.

## Architecture

- **Frontend-only application**: Single HTML file (`index.html`) with embedded CSS and JavaScript
- **Static file server**: Uses `npx http-server .` for local development
- **Grid-based visualization**: Canvas-based animation system with ripple effects
- **Component architecture**: Modular JavaScript classes for different features:
  - `GridManager`: Handles the animated grid canvas
  - `RippleEngine`: Manages ripple effects and animations
  - `StatisticsManager`: Tracks usage metrics
  - `PromptDisplayController`: Shows current prompts
  - `PromptFeed`: Sidebar with scrolling prompt history
  - `ParticleSystem`: Background animation effects
  - `PulseGridApp`: Main application orchestrator

## Development Commands

```bash
# Start development server
npx http-server .

# Server runs on http://localhost:8080
```

## Testing & Debugging

- **Demo Mode**: Application automatically runs in demo mode when Firebase is not configured
- **Settings Panel**: Access via gear icon in top-right to adjust parameters in real-time:
  - Ripple speed (1-20 nodes/second)
  - Grid density (maintaining 1.67 aspect ratio)
  - Toggle avatars and particle effects
- **Visual Debugging**: Statistics in header show live metrics for monitoring performance
- **Auto-generated Test Data**: Demo prompts generated every 3-7 seconds for continuous testing

## Key Features

- **Real-time grid animation**: Breathing grid effect with configurable parameters
- **Ripple system**: Expanding ripples triggered by new prompts with easing animations
- **Avatar display**: User profile pictures appear at ripple centers
- **Statistics dashboard**: Live metrics in header (total prompts, active users, etc.)
- **Settings panel**: Configurable ripple speed, grid density, and visual effects
- **Prompt feed**: Scrolling sidebar showing recent prompt history
- **Demo mode**: Generates realistic test data when Firebase is not configured

## File Structure

- `index.html`: Complete application (HTML, CSS, JavaScript)
- `public/img/`: Static assets (testimonial images for demo)
- `index_backup.html`: Backup version
- `test.html`: Test file (not currently used)

## Configuration

The application uses a `CONFIG` object (lines 647-668 in `index.html`) for adjusting visual parameters:
- **Grid settings**: 50x30 grid, node colors and opacity
- **Ripple behavior**: Speed (5 nodes/second), duration (3s), max radius (15)
- **Visual effects**: Avatar size (60px), display duration (5s), particle count (30)
- **Performance**: Max 10 active ripples, breathing animation speed
- **Demo mode**: Auto-generation timing and test data arrays

Key configurable aspects:
- All timing and animation parameters are centralized
- Settings panel provides live adjustment without restart
- Maintains 1.67 aspect ratio when changing grid density

## Firebase Integration

The app is designed to connect to Firebase for real-time prompt data but currently runs in demo mode. Firebase configuration is placeholder and needs to be updated with actual credentials for production use.