# Reviewer

## Why it exists:

It is an application I developed to review university exam content. It exists because I decided to procrastinate studying with the excuse of doing something productive, in this case, building and deploying an application.

In my last semester, I deployed it on azure and shared it with my classmates. Originally, it read the questions from a static JSON file. Then, I updated it to to use MongoDB. It even has an admin login, which allows me to add questions from the website instead of interacting with the db directly.

## Features:

### Tags

You can filter questions based on the Tag

### Questions types:

Supports:

- Multiple Choice (single answer)
- Multiple Choice (multiple answers)
- True or False
- Text Input

### Run locally:

1. Make sure you have Node.js <= 22.x.x
2. Run `npm install`
3. Fill in the credentials in a file called `.env.dev` based on the `.env.example`
4. Run `npm run dev`
5. Navigate to [http://localhost:5173/app](http://localhost:5173/app)
