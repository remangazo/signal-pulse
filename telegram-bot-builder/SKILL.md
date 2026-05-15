---
name: telegram-bot-builder
description: Specialized skill for designing, implementing, and maintaining intelligent Telegram bots for appointment management.
---

# Telegram Bot Builder Skill

## Purpose
This skill empowers the AI agent to architect and build robust Telegram bots. It focuses on user experience, command structure, and integration with backend services (like Firebase) to manage professional calendars and client interactions.

## Core Rules
1.  **Natural Interaction:** Design bot flows that feel conversational. Use Inline Keyboards and Reply Markups to guide the user.
2.  **Robust Error Handling:** Always provide feedback if a command fails or if input is invalid.
3.  **State Management:** Properly handle conversation states (e.g., awaiting date, awaiting service).
4.  **Security:** Ensure sensitive data (tokens, client info) is handled according to best practices.
5.  **Branding:** Use the TurnoFácil.io tone of voice in all bot messages.

## Workflows

### /init-bot [name]
Creates a basic bot structure with essential handlers: /start, /help, and error logging.

### /add-command [command_name] [description]
Generates the handler logic and registration for a new bot command.

### /create-menu [menu_type]
Designs an interactive menu (Inline or Reply) with specified options and callback logic.

### /debug-bot-logs
Analyzes bot logs to identify and suggest fixes for common errors or user drop-off points.

## Recommended Libraries
- **Python:** `python-telegram-bot` or `aiogram`.
- **Node.js:** `telegraf` or `node-telegram-bot-api`.
