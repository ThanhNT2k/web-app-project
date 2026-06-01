## Step 1: Hello GitHub Copilot - Prepare CMC Truyện Development Environment

Welcome to **"Build CMC Truyện - Online Story Reading Platform with GitHub Copilot"** exercise! 📖✨

In this exercise, you will be using GitHub Copilot agent mode to build a complete full-stack application for reading Vietnamese stories online with AI-powered personalization.

### What We're Building

**CMC Truyện** is an online story reading platform that includes:
- 📖 Story management and chapter reading interface
- 🔐 User authentication with role-based access control (Admin, Uploader, User, Guest)
- 📚 Reading history tracking and auto-bookmark features
- 🤖 AI-powered chapter summaries using Gemini API
- 💬 Comment system for stories and chapters
- ⭐ Follow/favorite stories functionality
- 🎨 Dark mode and customizable reading settings

### What is GitHub Copilot Agent Mode?

Copilot agent mode can create apps from scratch, perform refactorings across multiple files, write and run tests, and migrate code. It can automatically generate documentation, integrate new libraries, or help answer questions about a complex codebase.

Copilot agent mode operates autonomously by:
1. **Analyzing context** — Understanding relevant files and the overall structure
2. **Making changes** — Offering code changes and terminal commands to complete tasks
3. **Iterating** — Monitoring correctness and fixing issues automatically

> 💡 **Tip:** Learn more about Copilot agent mode in the [VS Code documentation](https://code.visualstudio.com/docs/copilot/copilot-edits#_use-agent-mode-preview).

---

## 🎯 Activity 1: Familiarize with the Project Structure

1. **Review the project layout** in your file explorer:
   - `.github/steps/` — This guided tutorial
   - `TRACKER_PROMPT.md` — Complete development blueprint
   - `README.md` — Project overview
   - `ROLE_BASED_ACCESS_CONTROL.md` — Permission system details

2. **Take note of the stack:**
   - **Backend:** Node.js + Express.js with PostgreSQL/Supabase
   - **Frontend:** React.js + Tailwind CSS + Bootstrap
   - **Database:** PostgreSQL (Supabase)
   - **AI Integration:** Google Gemini API
   - **Authentication:** JWT + bcryptjs

---

## 🚀 Activity 2: Open GitHub Copilot and Create Development Branch

1. **Open VS Code** and locate the **Copilot icon** in the top bar to open the Copilot Chat panel.

2. **If this is your first time using Copilot:**
   - Click **Accept** to agree to the usage terms
   - Wait for the panel to fully load

3. **Create and publish a new development branch** by copying this prompt into Copilot Chat:

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > I want to create and publish a new Git branch called "setup-cmc-truyen-backend". 
   > Can you show me the commands to create and push this branch?
   > ```

4. **Select "Agent" mode** from the dropdown (not "Ask" or "Edit")

5. **Press Continue** to execute the commands suggested by Copilot

---

## ✅ What You've Accomplished

- ✨ Opened GitHub Copilot in VS Code
- 🌿 Created a development branch `setup-cmc-truyen-backend`
- 📁 Familiarized yourself with the project structure

---

## 📝 Next Steps

Proceed to **Step 2: Backend Initial Setup** when you're ready to begin building the backend API with Copilot agent mode!

**Ready?** → [Go to Step 2](./2-backend-initial-setup.md)
