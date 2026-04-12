# QuerySense

SQL query explainer and optimizer. Paste any query and get a clause-by-clause breakdown, plain English summary, complexity rating, and performance suggestions.

Built for **CS 440 — Database Systems** at Southeast Missouri State University.

## Features

- Plain English explanation of what the query does
- Clause-by-clause breakdown (SELECT, FROM, WHERE, GROUP BY, HAVING, etc.)
- SQL execution order explanation
- Complexity rating: Low / Medium / High with reasoning
- Optimization suggestions with impact level (High / Medium / Low)
- Flags potential issues (missing indexes, cartesian joins, etc.)
- Dialect support: MySQL, PostgreSQL, SQLite, SQL Server
- Live line/column counter

## Project Structure

```
querysense/
├── index.html        # Main HTML structure and layout
├── css/
│   └── style.css     # Styles, light theme, CSS variables
├── js/
│   └── app.js        # Query analysis logic, API calls, result rendering
└── README.md
```

## Tech Stack

- Vanilla HTML / CSS / JavaScript
- LLM inference API for natural language analysis
- Fonts: DM Sans + DM Mono (Google Fonts)

## Running Locally

Open `index.html` directly in a browser. No dependencies to install.

Requires a valid API key in `js/app.js`.

## Why I Built This

In CS 440 I kept writing queries that worked but couldn't always explain exactly why — especially with complex joins, GROUP BY vs HAVING, or window functions. QuerySense is the tool I wished existed during that class. It also helps catch things like N+1 query patterns and missing index hints that you wouldn't notice until a query hits a large dataset in production.

## Example Queries Included

Three built-in examples covering:
1. LEFT JOIN with GROUP BY and HAVING
2. Multi-table JOIN with aggregate filtering and LIMIT
3. Window functions (RANK, AVG OVER PARTITION BY)

## Author

Tarunima Amisha · [github.com/amisha53](https://github.com/amisha53) · SEMO CS 2026
