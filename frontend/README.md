# CRMFlow Frontend

Next.js 15 application with TypeScript, Tailwind CSS, and dark theme.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

Build the production application:

```bash
npm run build
```

### Start Production Server

Start the production server:

```bash
npm start
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Type check TypeScript
- `npm test` - Run tests (type-check + lint)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx        # Root layout with dark theme
│       ├── page.tsx           # Home page
│       └── globals.css        # Global styles with Tailwind
├── public/                    # Static assets
├── packages/
│   └── ui/                    # Shared UI components (optional)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Features

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Dark theme enabled by default
- ESLint and Prettier configured
- Monorepo structure with packages/ui

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
