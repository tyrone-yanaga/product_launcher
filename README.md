This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, setup (from my-app folder):
```
npm install
```
run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

backend setup (from BE folder):
```
python -m venv venv
source venv/bin/activate
pip install requirements.txt
```

to run:
```
uvicorn app.main:app --reload --port 8000
```
