
# Node.js Web Service with Express, TypeScript, and SQLite

This is a Node.js project that uses TypeScript for static typing, Express for building the API, Prisma as the ORM, and SQLite as the database.

## Table of Contents

- [Installation and Starting the Project](#installation-and-starting-the-project)
- [Endpoints](#endpoints)

## Installation and Starting the Project

To set up the project, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/iyanuakins/e-wallet.git
    cd e-wallet
    ```

2. **Rename .env.example to .env**
3. **Prisma DB push and seeding**:
    ```bash
    npm run prisma
    ```

4. **Start the project**:
    ```bash
    npm run build
    npm run dev
    ```

## Endpoints

|  Method        |Endpoint                       |Description           |
|----------------|-------------------------------|----------------------|
|GET			 |`/api/v1/wallet/create`            |Create a wallet account |
|GET			 |`/api/v1/wallet/balance/:walletId` |Retrieve wallet balance |
|GET			 |`/api/v1/wallet/history/:walletId` |Retrieve wallet history |
|POST			 |`/api/v1/wallet/credit`            |Credit a wallet account |
|GET			 |`/api/v1/wallet/create`            |Debit a wallet account  |
