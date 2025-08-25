# 🎟️ Ticketing System – Spring Boot + Next.js

A full-stack ticketing/helpdesk application built with **Spring Boot (Java)** for the backend and **Next.js (React + TypeScript)** for the frontend.  
Implements role-based access (**User, Agent, Admin**), JWT authentication, and a clean ticket management workflow.

---

## 🚀 Features

- **User Roles**
  - **User** – create/view their own tickets
  - **Agent** – manage assigned tickets, update status
  - **Admin** – manage users, view all tickets
- **Authentication** – Spring Security + JWT
- **Database** – MySQL/PostgreSQL (via JPA/Hibernate)
- **REST API** – CRUD for tickets & user management
- **Frontend** – Next.js with Tailwind CSS
- **Seed Data** – preloaded users (User/Agent/Admin) for testing

---

## 📂 Project Structure

ticketing-system/
│
├── backend/ # Spring Boot backend
│ ├── src/main/java/com/example/ticketing
│ │ ├── controller/ # REST controllers
│ │ ├── model/ # Entities
│ │ ├── repository/ # JPA Repos
│ │ ├── service/ # Business logic
│ │ └── security/ # JWT + Security Config
│ └── src/main/resources
│ ├── application.properties
│ └── data.sql # Seed users
│
├── frontend/ # Next.js frontend
│ ├── pages/
│ │ ├── login.tsx
│ │ ├── dashboard.tsx
│ │ └── tickets/[id].tsx
│ └── components/
│ ├── Layout.tsx
│ └── TicketList.tsx
│
└── README.md

yaml
Copy
Edit

---

## ⚙️ Backend Setup (Spring Boot)

1. Navigate to backend:
   ```bash
   cd backend
Update application.properties with your DB config:

properties
Copy
Edit
spring.datasource.url=jdbc:mysql://localhost:3306/ticketdb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
Run backend:

bash
Copy
Edit
mvn spring-boot:run
Backend runs on: http://localhost:8080

🎨 Frontend Setup (Next.js)
Navigate to frontend:

bash
Copy
Edit
cd frontend
Install dependencies:

bash
Copy
Edit
npm install
Configure API endpoint in .env.local:

env
Copy
Edit
NEXT_PUBLIC_API_URL=http://localhost:8080/api
Run frontend:

bash
Copy
Edit
npm run dev
Frontend runs on: http://localhost:3000

🔑 Seed Users
Role	Email	Password
User	user@example.com	user123
Agent	agent@example.com	agent123
Admin	admin@example.com	admin123

🛠️ Tech Stack
Backend: Java 17, Spring Boot, Spring Security, JWT, JPA/Hibernate

Frontend: Next.js, React, Tailwind CSS

Database: MySQL / PostgreSQL

Build Tools: Maven, npm

📌 Roadmap
 Email notifications for ticket updates

 File attachments in tickets

 Ticket priority & categorization

 Admin dashboard analytics

🤝 Contributing
Pull requests are welcome! Please fork the repo and submit a PR.

