# Teamtailor Assignment

## Overview

This project is a Node.js web application built for the Teamtailor backend developer trainee assignment. The application connects to the Teamtailor API to fetch candidate data along with their respective job applications and converts this data into a downloadable CSV formatted file.

The core motivation behind the design is to ensure a performant, reliable, and memory-efficient extraction process, strictly utilizing Teamtailor's JSON:API specification.

## Features

- **Data Fetching:** Retrieves all candidates and their job applications from the Teamtailor API.
- **JSON:API Integration:** Leverages sparse fieldsets and the `include` parameter to fetch all necessary relational data efficiently, avoiding the N+1 query problem.
- **CSV Export:** Converts the API response into a strictly formatted CSV, mapping candidates mapping to their respective job applications.
- **Server-side Streaming:** Streams the generated CSV chunks directly to the HTTP response to keep memory footprint extremely lightweight, making it resilient to thousands of records.
- **Rate Limiting:** Employs a robust, custom-built rate limiter to mitigate `429 Too Many Requests` errors during the extraction of heavily paginated routes.
- **Validation:** Utilizes Zod to provide strict runtime data validation against the Teamtailor JSON:API payload responses.
- **Frontend UI:** Provides a clean and responsive web interface to trigger the download directly from the browser.

## Technologies Used

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Data Streaming:** `fast-csv`
- **Validation:** `zod`
- **Logging:** `pino` and `pino-http`
- **Testing:** `vitest` and `supertest`

## Project Architecture

- **`src/api`:** Contains the API client connecting to Teamtailor via `fetch`.
- **`src/controllers`:** Handles the HTTP endpoints for initiating the CSV stream.
- **`src/services`:** Orchestrates the flow of pagination, rate-limiting, and piping data chunks to the client.
- **`src/utils`:** Shared utilities for CSV mapping and system rate limit adjustments.
- **`src/__tests__`:** Unit and integration testing suites to ensure stability.
- **`src/public`:** Static assets for the user-facing web interface.

## Setup and Running

### Prerequisites

- Node.js (v18 or higher recommended)
- A valid Teamtailor API Key with appropriate permissions.

### Installation

1. Install all dependencies:

```bash
npm install
```

2. Duplicate the example environment file and rename it:

```bash
cp .env.example .env
```

3. Provide your environment configuration within `.env`:

```
API_SECRET=your_teamtailor_api_key_here
PORT=3000
HOST_URL=https://api.teamtailor.com
API_VERSION=20210218
```

### Development

Run the development server natively with live reloading:

```bash
npm run dev
```

### Production Build

Compile the TypeScript code and start the project:

```bash
npm run build
npm start
```

### Docker (Recommended for Reviewers)

To run the application inside a Docker container without relying on a local Node.js environment:

1. Build the Docker image:

```bash
docker build -t teamtailor-app .
```

2. Run the Docker container (ensure you have provided the `.env` file from `.env.example`):

```bash
docker run -p 3000:3000 --env-file .env teamtailor-app
```

## AI Usage

AI tools were utilized during the development of this assignment for planning, consulting, testing edge cases, analyzing project requirements, and writing simple code structures. The core architecture, implementation logic, and final decisions demonstrate my personal understanding and approach. Tools used: Gemini, Claude, Google Antigravity IDE.

### Testing

Run the Vitest test suite to execute all unit and integration checks:

```bash
npm run test
```
