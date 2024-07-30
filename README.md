# Portfolio Server

This project is a backend system that connects to an AWS S3 database, allowing for file CRUD operations. It integrates with Quill to create posts for my portfolio website, enabling easy image uploads to S3 for use in Quill posts. My API then sends this data to the frontend, generating project pages. Additionally, it uses an SQL Sequelize database to store text-related data.

🌐 Frontend Website : [https://www.lukuoyu.com](https://www.lukuoyu.com)
🌐 Frontend github : [https://www.lukuoyu.com](https://www.lukuoyu.com)


## Table of Contents 📖

1. [Screenshots](#1-screenshots-)
2. [Features](#2-features-%EF%B8%8F)
3. [Technologies](#3-technologies-)
4. [Getting Started](#4-getting-started-)
5. [Contact Me](#5-contact-me-)

## 1. Screenshots 📷

![editor](/public/images/screenshots/editor-full.png)
![posts](/public/images/screenshots/post-page.png)
![bucket](/public/images/screenshots/bucket.png)

## 2. Features ⭐️

- **Post Editing:** Utilize Quill for rich text editing in posts.
- **Database Management:** Handle database with sequelize
- **API:** Provide API to my portfolio react frontend.
- **AWS:** Upload and manage files with AWS S3.
- **YouTube Integration:** Use YouTube API to allow video embed on post
- **Data Compression:** Compress images using TinyPNG/TinyJPG.

## 3. Technologies 🤓

- **Express:** Web framework for Node.js.
- **Sequelize:** ORM for database management.
- **MySQL:** Database client.
- **AWS SDK:** Interact with AWS services.
- **Day.js:** Date manipulation library.
- **Dotenv:** Load environment variables.
- **Multer:** Middleware for file uploads.

## 4. Getting Started 🚀

### Prerequisites

- Node.js installed on your machine.
- MySQL database set up.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/portfolio-backend.git
```

2. Navigate to the project directory:

```
cd portfolio-backend
```

3. Install npm modules:

```
npm install
```

4. Set up .env file environment variables:

```
AWS_BUCKET=
AWS_REGION=a
AWS_PUBLIC_BUCKET_URL=
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
TINY_PNG_KEY=
```

5. Running the Application

```
npm run dev
```

## 5. Contact Me 👋

If you have any questions, feedback, or suggestions, feel free to reach out:

- **Email:** [lukuoyu@gmail.com](mailto:your.email@example.com)
- **GitHub:** [klu0926](https://github.com/klu0926)
