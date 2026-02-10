# Orbit 🪐

**The All-In-One Workspace for Modern Teams.**

[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![NextJS](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)

## 🌟 Overview

Orbit is an ambitious SaaS platform designed to replace fragmented team toolstacks. It combines the core functionalities of the industry's most popular productivity apps into a single, unified workspace.

**No more context-switching. Orbit acts as your:**

- **Slack Alternative:** Real-time team communication, channels, and direct messaging.
- **Jira Alternative:** Agile project management, issue tracking, and sprint planning.
- **Notion Alternative:** Collaborative documentation, wikis, and knowledge bases.
- **Google Meet Alternative:** Integrated video and audio conferencing.

Currently in its **early development phase**, built with enterprise-grade architecture for scalability and maintainability.

---

## 🏗️ Architecture

Orbit uses **Clean Architecture + Domain-Driven Design (DDD)** to handle business complexity:

**Layered approach:**

1. **Domain Layer:** Pure business logic (Entities, Value Objects)
2. **Application Layer:** Use cases and orchestration
3. **Infrastructure Layer:** Databases, external APIs
4. **Presentation Layer:** Controllers, WebSockets, GraphQL

**Monorepo powered by Turborepo** for optimal developer experience.

---

## 🛠️ Tech Stack

**Language:** TypeScript

**Backend:**

- **Framework:** NestJS
- **Architecture:** Clean Architecture + DDD
- **Validation:** class-validator & class-transformer

**Frontend:**

- **Framework:** Next.js
- **UI:** Shadcn/ui + Tailwind CSS

**Tooling:**

- **Monorepo:** Turborepo + pnpm
- **Code Quality:** ESLint + Prettier

  ***
