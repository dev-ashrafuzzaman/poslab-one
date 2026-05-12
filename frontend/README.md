# 💼 Chart of Accounts (COA) Management System

A modern **Chart of Accounts (COA)** management software designed to streamline accounting operations, built using **React.js** for the frontend and **Django** for the backend.
This system enables businesses to organize, manage, and analyze their financial accounts efficiently, ensuring better visibility and compliance in financial reporting.

---

## 🚀 Tech Stack

### **Frontend**

* ⚛️ **React.js** — Modern UI library for building dynamic, interactive user interfaces
* ⚡ **Vite** — Next-generation build tool for lightning-fast development
* 🎨 **Tailwind CSS** — Utility-first CSS framework for responsive and consistent styling
* 🔄 **Axios** — For secure and efficient API communication

### **Backend**

* 🐍 **Django** — High-level Python web framework for clean and maintainable development
* 🔗 **Django REST Framework (DRF)** — RESTful API support for seamless frontend-backend communication
* 🗄️ **PostgreSQL / SQLite** — Robust relational database for structured accounting data
* 🔐 **JWT Authentication** — Secure user and role-based access management

---

## 📁 Project Structure

```
COA_Project/
│
├── backend/                      # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── coa_app/                  # Core COA app (models, views, serializers)
│   ├── users/                    # Authentication and user roles
│   └── settings.py
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Pages (Dashboard, Accounts, Reports)
│   │   ├── services/             # API integration
│   │   ├── context/              # State management
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/dev-ashrafuzzaman/django-frontend.git
cd django-frontend
```

### **2️⃣ Backend Setup (Django)**

```bash
cd backend
python -m venv venv
source venv/bin/activate     # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

> Backend runs at: **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

### **3️⃣ Frontend Setup (React)**

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs at: **[http://localhost:5173/](http://localhost:5173/)**

---

## 🔗 API Configuration

In your React `.env` file:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

Use this environment variable in your Axios configuration to connect the frontend to the Django backend APIs.

---

## 💡 Key Features

* 📘 **Chart of Accounts Management** – Create, view, and manage account hierarchies (Assets, Liabilities, Income, Expenses, etc.)
* 💰 **Transaction Recording** – Record journal entries and maintain debit/credit balances
* 📊 **Financial Reporting** – Generate real-time balance sheets, income statements, and trial balances
* 👥 **User Roles & Permissions** – Admin, Accountant, and Viewer roles with controlled access
* 🧾 **API-driven Architecture** – Clean separation between frontend and backend for scalability
* 🔒 **Authentication & Authorization** – Secure login using JWT tokens
* 💻 **Responsive Dashboard** – Modern UI with charts, tables, and analytics

---

## 🧠 Future Enhancements

* 📈 Integrate dashboards with real-time financial KPIs
* 🧮 Add budget planning and forecasting modules
* 🪙 Multi-currency and localization support
* 📦 Export reports to PDF/Excel
* ☁️ Deploy with Docker and CI/CD pipelines

---

## 🧑‍💻 Development Commands

### Frontend

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run lint`  | Run code linting         |

### Backend

| Command                           | Description                |
| --------------------------------- | -------------------------- |
| `python manage.py runserver`      | Start Django server        |
| `python manage.py makemigrations` | Create database migrations |
| `python manage.py migrate`        | Apply database changes     |

---

## 🌍 Deployment

* **Frontend:** Host on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
* **Backend:** Deploy on [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://www.heroku.com/)
* **Database:** Use [PostgreSQL](https://www.postgresql.org/) (via Railway, ElephantSQL, etc.)

---

## 🧾 License

Licensed under the **MIT License** — feel free to modify and use for educational or commercial purposes.

---

## 📞 Contact

**Developer:** [Ashrafuzzaman]
📧 Email: [[dev.ashrafuzzaman@gmail.com](mailto:dev.ashrafuzzaman@gmail.com)]
🔗 GitHub: [https://github.com/dev-ashrafuzzaman](https://github.com/dev-ashrafuzzaman)

---

> “Empowering financial clarity through smart, connected accounting technology.”
