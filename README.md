# 🏢 WORKNOON — AI-Powered Customer Support Refund System

A containerized, full-stack e-commerce support application that automates refund claim evaluation using a **hybrid deterministic policy engine + LLM reasoning layer** with built-in defense-in-depth security guardrails.

---

## 🏗️ Architecture Overview

The system employs a **Defense-in-Depth and Deterministic-First architecture**. Rather than delegating critical financial decisions entirely to non-deterministic AI models, the application enforces business rules before consulting the LLM.

                ┌────────────────────────┐
                │ Customer / Support UI  │
                │   (React 18 + Vite)    │
                └───────────┬────────────┘
                            │ HTTP / JSON
                            ▼
                ┌────────────────────────┐
                │  Express.js API Layer  │
                │ (Security & Rate Limit)│
                └───────────┬────────────┘
                            │
    ┌───────────────────────┴───────────────────────┐
    ▼                       |                       ▼
                            |
                            |

┌──────────────┐ ┌─────────────────────┐
│ MongoDB DB │ │ Deterministic │
│ (Orders & │ │ Policy Engine │
│ Customers) │ └──────────┬──────────┘
└──────────────┘ │
▼
┌─────────────────────┐
│ AI Guardrails Layer │
│ (Injection Defense) │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│ Groq AI LLM Layer │
│ (Llama 3.3 / Auto) │
└─────────────────────┘

### Key Architectural Layers:

1. **Frontend (React 18 + Vite):**
   - **Customer Portal (`/`):** Interactive refund submission flow with a Quick-Test Scenario Picker for rapid edge-case evaluation.
   - **Admin Operations Dashboard (`/admin`):** KPI summary metrics, detailed audit logs of AI reasoning vs. deterministic rule checks, and supervisor manual override controls.
   - **Theme Engine:** Built-in Light/Dark mode with local preference persistence.

2. **Backend API (Node.js + Express):**
   - Centralized error handling and structured JSON responses.
   - Dual-tier rate limiting: General API protection (150 req/15m) and AI cost protection (20 req/15m).
   - HTTP security headers powered by Helmet.

3. **Deterministic Policy Engine (`policyEngine.js`):**
   - Evaluates hard constraints before invoking external AI:
     - **Final Sale Rules:** Immediate auto-denial for clearance, personalized, or gift card items.
     - **30-Day Window:** Immediate auto-denial for expired order windows.
     - **High-Value Cap (>$500):** Automatic escalation for supervisor sign-off.
     - **Velocity & Fraud Rules:** Automatic escalation for accounts with elevated refund history or active review flags.

4. **AI Reasoning & Security Layer (`aiService.js` & `aiGuardrails.js`):**
   - **Dynamic Model Auto-Discovery:** Automatically queries and uses active LLMs from Groq (with preferred ranking: Llama 3.3 70B, Llama 3.1, Mixtral, Gemma).
   - **Structured JSON Mode:** Enforces strict output schemas preventing hallucinated formats.
   - **Input Sanitization & Injection Defense:** Regex pattern scanning for prompt injection, jailbreak attempts, and system override phrases (`[INST]`, `<<SYS>>`, `ignore previous instructions`).
   - **Fail-Safe Fallbacks:** Any AI timeout, malformed JSON, or provider error automatically degrades safely to human escalation rather than failing or auto-approving.

---

## 🚀 Quick Start (Single Command)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A free [Groq API Key](https://console.groq.com/keys).

### 1. Clone and Configure Environment

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/worknoon-refund-system.git
cd worknoon-refund-system

# Create .env from example
cp .env.example .env
```
