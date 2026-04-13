*This project has been created as part of the 42 curriculum by agaga, tsomacha, erantala, and ji-hong.*

# 🎬 moviesearchdb (ft_transcendence)

## Description

**"Where Semantic Intelligence Meets Social Connection"**
**moviesearchdb** is a next-generation movie discovery platform designed to bridge the gap between human intuition and database queries. Unlike traditional platforms that rely on rigid keyword matching, we solve the **"vague description" problem using AI-powered Semantic Search**.

Whether you're looking for "a dark thriller with a mind-bending twist" or want to see what your friends are rating in real-time, **moviesearchdb** provides a secure, integrated, and intuitive ecosystem for movie enthusiasts.


## Instructions

### Prerequisites
*To run this project, you only need the following installed on your host machine:*
- **Docker & Docker Compose**: Essential for orchestrating all microservices.
- **TMDB API Key**: Required for fetching movie metadata and images.

### Installation & Setup
1. **Clone the repository**
2. **Set up configuration files**: Copy the environment template.
```bash
cp .env.example .env
```
3. **Configure Secrets(Critical)**: Create a `secrets/` directory in the project root and provide the following files (these are git-ignored for security).
    - `initial_secrets.json`: Fill in your API keys and passwords in this JSON format.
    ```bash
    {
        "POSTGRES_PASSWORD": "your_db_password",
        "MONGO_ROOT_PASSWORD": "your_mongo_password",
        "JWT_SECRET": "your_jwt_signing_key",
        "JWT_REFRESH_SECRET": "your_jwt_refresh_key",
        "GOOGLE_CLIENT_SECRET": "your_oauth_secret",
        "GITHUB_CLIENT_SECRET": "your_oauth_secret",
        "HF_TOKEN": "your_huggingface_token",
        "TMDB_KEY": "your_tmdb_api_key",
        "TMDB_API_KEY": "your_tmdb_api_key",
        "SMTP_PASS": "your_email_app_password"
    }
    ```
    - `Password files (.txt)`: Create these without a trailing newline to avoid login errors. Use the `printf` command for accuracy.
    ```bash
    printf "your_password_here" > secrets/postgres_password.txt
    printf "your_password_here" > secrets/mongo_password.txt
    ```
4. **Deployment**: Run the stack in detached mode.
```bash
docker compose -f docker-compose.dev.yml up --build -d
```


## Team Information
Our team is structured to ensure clear accountability and efficient collaboration throughout the development of **moviesearchdb**.
- **PO (Product Owner)**: `tsomacha`, `agaga` 
    - Defined the product vision, prioritized features and maintained the product backlog.
- **PM (Project Manager)**: `ji-hong`, `agaga`
    - Organized team meetings, tracked progress and ensured team communication.
- **Architect**: `agaga`
    - Defined technical architecture, made technology stack decisions and ensured code quality.
- **Developers**: `agaga`, `tsomacha`, `erantala`, `ji-hong`
    - Implemented core features, participated in code reviews, and tested implementations.


## Project Management

We focused on efficient communication and clear accountability using the following workflow:

- Communication: Daily coordination via Discord and bi-weekly in-person meetings at the campus.
- Task Tracking: Issue-driven development on GitHub; all tasks are assigned and tracked as issues.
- Code Quality: Mandatory peer review (at least 1 reviewer) for all pull requests to the main branch.
- Documentation: All core architectural and team decisions are documented.


## Tech Stack

We selected our stack to balance **high-performance AI processing, secure authentication, and a scalable microservices structure**.

### Frontend
- **React + Vite**: Core library and modern build tool for a fast development workflow.
- **TypeScript**: Used for type-safe development.
- **Tailwind CSS (v4)**: Utility-first CSS framework for rapid and consistent UI styling.
- **Vite PWA**: Implemented to provide a native-like app experience with offline capabilities.

### Backend (Microservices)
- **NestJS (Node.js)**: Acts as the core API Gateway, managing user logic, **secure authentication**, and **real-time chat** services.
- **FastAPI (Python)**: A dedicated service for **high-performance AI processing**, specifically semantic search and data seeding.
- **Prisma ORM**: Provides type-safe database access and streamlined schema management for PostgreSQL.

### Database System
- **PostgreSQL (+ pgvector)**: Consolidates relational data and 384-dimensional AI embeddings into a single system to ensure a **scalable microservices structure**.
- **MongoDB**: Optimized for **Real-time Chat storage** and handling high-frequency, unstructured messaging data.

### Security & Data
- **Auth**: **Passport.js** & **JWT** for stateless authentication; **Bcrypt** for secure password hashing and salting.
- **Secrets**: **HashiCorp Vault** for sensitive credential management (API keys, DB passwords).
- **AI & External**: **Sentence-Transformers** for generating movie embeddings; **TMDB API** for rich metadata and imagery.


## Database Schema

We employ a **Polyglot Persistence** strategy, utilizing the strengths of both Relational and Document-based databases to ensure optimal performance for AI search and real-time messaging.

### PostgreSQL (+ pgvector)
Primary relational store managed via **Prisma ORM**.
- **User & Security**: UUID-based identity, **OAuth** (Google/GitHub), **2FA** secrets, and **Self-referential** friendship relations.
- **Movies & AI**: Metadata storage with **384-dimensional vector embeddings** (`pgvector`) for semantic search.
- **Interactions**: `Review` (including AI Sentiment), `WishList`, and `WatchedList` with strict relational integrity.

### MongoDB (Mongoose)
Document-based store for **Real-time Chat** to handle high-frequency messaging data.
- **ChatRoom**: Manages `participants` (User IDs), `lastMessage` tracking, and activity timestamps.
- **Scalability**: Offloads transient messaging data from the primary relational DB to maintain performance.


## Feature List

### Infrastructure & Backend
- **Docker Compose Orchestration**: Manages the entire ecosystem (NestJS, FastAPI, DBs, WAF) as a single, unified environment for stable deployment.
- **Multi-Backend Strategy**: A balanced backend architecture utilizing **NestJS** for core business logic and **FastAPI** for AI-intensive tasks.
- **Network & Service Resilience**: Integrated **health checks** and private networking to ensure internal security and continuous system availability.

### AI-Powered Movie Search
- **Semantic Discovery**: Supports natural language queries, allowing users to find movies by mood, themes, or descriptive context beyond title matching.
- **Vector Similarity Engine**: Utilizes **Sentence Transformers** and **pgvector** to deliver highly relevant search results based on AI-driven data analysis.
- **Global Metadata Sync**: Automated movie data and media synchronization (posters/backdrops) through integration with the **TMDB API**.
- **Sentiment Insights**: Automated analysis of user review tones to provide a deeper understanding of community sentiment.

### Social & User Engagement
- **Real-time Interaction**: Instant messaging and notification system powered by WebSockets for dynamic user communication.
- **Social Ecosystem**: Comprehensive user profiles and social features that allow for friend management and tracking of shared movie interests.
- **Unified Authentication**: Secure access via JWT-based local login and integrated **OAuth 2.0 (Google/GitHub)** for a streamlined user experience.

### Data Management & Observability
- **Polyglot Persistence**: Strategic dual-database setup using **PostgreSQL** and **MongoDB** to optimize both structured and unstructured data.
- **System Observability**: Full-stack performance monitoring and infrastructure health visualization through the **Prometheus & Grafana** stack.
- **Privacy Compliance**: GDPR-ready features ensuring user data portability and the right to permanent account erasure.

### Security Hardening
- **Edge Protection (WAF)**: Nginx-based **ModSecurity WAF** with **Paranoia Level 3** hardening to defend against sophisticated web exploits.
- **Secret Management**: Centralized protection of sensitive API keys and database credentials via **HashiCorp Vault**.
- **Adaptive Routing**: Strategic traffic management that balances rigorous security for APIs with optimized paths for real-time traffic.

### Modern Web Experience
- **Progressive Web App (PWA)**: An installable, mobile-optimized interface with offline capabilities for seamless movie browsing.
- **Atomic Design System**: A reusable component-based UI framework ensuring a consistent visual experience across all modern browsers.


## Modules

| Module | Pts | Justification | Members |
| :--- | :---: | :--- | :--- |
| Frameworks: React & NestJS [W] | 2 | To build a robust, scalable full-stack application with standardized architecture. | `agaga`, `tsomacha`, `erantala`, `ji-hong` |
| Real-time features: WebSockets [W] | 2 | Enables low-latency, bi-directional communication for a seamless live chat experience. | `agaga`, `erantala` |
| User interaction: chat, profile, friends [W] | 2 | Core social features to facilitate user engagement and community building. | `agaga`, `erantala`, `ji-hong` |
| ORM: Prisma ORM [W] | 1 | Ensures data integrity and developer productivity with type-safe DB queries. | `agaga`, `ji-hong` |
| Notification System [W] | 1 | Real-time alerts for social actions and system updates to keep users engaged. | `agaga` |
| PWA: offline & installability [W] | 1 | Enhances accessibility with service workers and native-like mobile UX. | `agaga`, `tsomacha` |
| Custom design system [W] | 1 | Ensures visual consistency using 10+ reusable atomic design components. | `tsomacha` |
| Multi-browser Support [A] | 1 | Guaranteed full compatibility across Chrome, Firefox, and Safari browsers. | `agaga`, `tsomacha`, `erantala`, `ji-hong` |
| Standard Auth & Management [U] | 2 | Core identity system managing JWT-based profiles, avatars, and status. |  `agaga`, `tsomacha` |
| OAuth 2.0 (Google/GitHub) [U] | 1 | Simplifies onboarding by allowing secure authentication via third-party providers. | `agaga` |
| Two-Factor Authentication (2FA) [U] | 1 | Provides an essential security layer via TOTP-based secondary verification. | `agaga` |
| Sentiment Analysis [AI] | 1 | Automatically evaluates user reviews to provide emotional insights via AI models. | `agaga` |
| WAF & HashiCorp Vault [S] | 2 | Hardened defense against web attacks and isolated secret management. | `ji-hong` |
| Monitoring: Prometheus & Grafana [D] | 2 | Real-time metrics and visualization for system health monitoring. | `tsomacha` |
| Backend as Microservices [D] | 1 | Decouples core NestJS and AI FastAPI services to improve scalability and fault tolerance. | `agaga`, `ji-hong` |
| GDPR Compliance Features [DA] | 1 | Guarantees user privacy via data export and account deletion rights. | `agaga`, `tsomacha` |

**Total Points: 22 pts**

**Module Type Legend:**
`[W]` Web | `[A]` Accessibility | `[U]` User Management | `[AI]` Artificial Intelligence | `[S]` Cybersecurity | `[D]` DevOps | `[DA]` Data and Analytics


## Individual Contributions

### agaga
**Lead Backend**: Core architecture, Authentication (JWT/2FA), and AI service integration.

### tsomacha
**Frontend**: React application structure, UI components, and API integration.

### erantala 
**Real-time & Data**: Chat system (WebSockets) and MongoDB setup.

### ji-hong
**Infrastructure & Security**: HashiCorp Vault, ModSecurity WAF configuration, and Wishlist/WatchedList APIs.


## Resources & AI Usages

### Documentation & Libraries
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Prisma ORM](https://www.prisma.io/docs)
- [HashiCorp Vault](https://developer.hashicorp.com/vault/docs)
- [TMDB API Guide](https://developer.themoviedb.org/docs)

### AI Usage
AI tools (ChatGPT, Claude, Gemini, GitHub Copilot) were used for:
- Assisting learning **TypeScript** usage and syntax.
- Improving **README** wording and technical clarity.
- Conducting asynchronous **Code Reviews**.
- Debugging specific errors.
