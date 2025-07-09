# GPT UI - AI Chat Interface

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Features

- 🤖 **AI Chat**: Intelligent conversational AI interface
- 📱 **PWA Support**: Full-screen mobile app experience
- 💬 **Real-time Chat**: Streaming responses with markdown support
- 🌙 **Dark Mode**: Automatic theme switching
- 📚 **Chat History**: Persistent conversation storage
- 🔄 **Offline Support**: Service worker with caching
- 🎯 **Multiple Models**: Support for various AI models

## Setup

### 1. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 2. Run Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Models

- **GPT-4o**: Najnowszy model GPT-4o z zaawansowanym rozumowaniem
- **GPT-4o Mini**: Szybsza i bardziej ekonomiczna wersja modelu GPT-4
- **GPT-3.5 Turbo**: Szybki i wydajny model dla większości zadań

## Features

The AI interface includes:
- **Context-aware responses** based on conversation history
- **Programming assistance** for code-related questions
- **Math support** for calculations and equations
- **Creative writing** help
- **General knowledge** responses
- **Streaming text** for real-time interaction

## Deployment

Your project is live at:

**[https://vercel.com/chatgpts-projects-aad7590a/v0-gptui](https://vercel.com/chatgpts-projects-aad7590a/v0-gptui)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/SLyHwSPsQpL](https://v0.dev/chat/projects/SLyHwSPsQpL)**

## PWA Installation

The app supports Progressive Web App (PWA) installation:
1. Visit the app in your mobile browser
2. Look for the "Install" button or browser prompt
3. Add to home screen for full-screen experience
4. Enjoy offline functionality with service worker caching

## Architecture

- **Frontend**: Next.js 14 with App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **AI Integration**: Advanced response system
- **State Management**: React hooks + localStorage
- **PWA**: Service Worker with caching strategies
- **Deployment**: Vercel with automatic deployments
