import logging
from telegram import Update, ForceReply
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Configuración de logs
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)
logger = logging.getLogger(__name__)

def start(update: Update, context: CallbackContext) -> None:
    """Enviar un mensaje cuando se emite el comando /start."""
    user = update.effective_user
    update.message.reply_markdown_v2(
        fr'¡Hola {user.mention_markdown_v2()}\! 👋' + '\n'
        r'Bienvenido a *TurnoFácil\.io*\. ¿En qué puedo ayudarte hoy?',
        reply_markup=ForceReply(selective=True),
    )

def help_command(update: Update, context: CallbackContext) -> None:
    """Enviar un mensaje cuando se emite el comando /help."""
    update.message.reply_text('Usa /start para comenzar o simplemente dime qué turno necesitas.')

def echo(update: Update, context: CallbackContext) -> None:
    """Eco del mensaje del usuario (para testeo)."""
    update.message.reply_text(f"Has dicho: {update.message.text}")

def main() -> None:
    """Ejecutar el bot."""
    # Reemplaza 'TU_TOKEN' con el token que te da @BotFather
    updater = Updater("TU_TOKEN")

    dispatcher = updater.dispatcher
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("help", help_command))
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, echo))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
