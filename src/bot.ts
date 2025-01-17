import Webhook from "./webhook";
import { InlineQueryResultArticle, addSearchParams } from "./libs";
import { Commands, KV, TelegramUpdate } from "./types";
import Handler from "./handler";

export default class Bot {
  token: string;
  commands: Commands;
  api: string;
  webhook: Webhook;
  kv: KV;
  handler: Handler;

  constructor(config) {
    this.token = config.token || null;
    this.commands = config.commands;
    this.api = "https://api.telegram.org/bot" + config.token;
    this.webhook = new Webhook(this.api, config.token, config.url);
    this.kv = config.kv || null;
    this.handler = config.handler;
  }

  update = async (
    request: Request,
    update: TelegramUpdate
  ): Promise<Response> => {
    console.log({ update });
    if (update.inline_query) {
      await this.executeInlineCommand(request, update).then((response) => {
        response
          .clone()
          .json()
          .then((response) => console.log({ response }));
        return response;
      });
    } else if (update.message) {
      if (update.message.text) {
        await this.executeCommand(request, update).then((response) => {
          response
            .clone()
            .json()
            .then((response) => console.log({ response }));
          return response;
        });
        await this.greetUsers(request, update);
      }
    }
    // return 200 OK response to every update request
    return new Response("True", {
      status: 200,
    });
  };

  // greet new users who join
  greetUsers = async (request, update): Promise<Response> =>
    (update.message.new_chat_members &&
      this.sendMessage(
        update.message.chat.id,
        `Welcome to ${update.message.chat.title}, ${update.message.from.username}`
      )) ??
    new Response();

  _executeCommand = async (update, args) =>
    this.commands[args.shift()]?.(this, update, args) ?? new Response();

  // execute the inline custom bot commands from bot configurations
  executeInlineCommand = async (request, update): Promise<Response> =>
    this._executeCommand(update, update.inline_query.query.split(" "));

  // execute the custom bot commands from bot configurations
  executeCommand = async (request, update): Promise<Response> =>
    this._executeCommand(update, update.message.text.split(" "));

  // trigger answerInlineQuery command of BotAPI
  answerInlineQuery = async (inline_query_id, results, cache_time = 0) =>
    fetch(
      addSearchParams(new URL(`${this.api}/answerInlineQuery`), {
        inline_query_id: inline_query_id.toString(),
        results: JSON.stringify(results),
        cache_time: cache_time.toString(),
      }).href
    );

  // trigger sendMessage command of BotAPI
  sendMessage = async (
    chat_id,
    text,
    parse_mode = "",
    disable_web_page_preview = false,
    disable_notification = false,
    reply_to_message_id = 0
  ): Promise<Response> =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendMessage`), {
        chat_id: chat_id,
        text,
        parse_mode: parse_mode,
        disable_web_page_preview: disable_web_page_preview.toString(),
        disable_notification: disable_notification.toString(),
        reply_to_message_id: reply_to_message_id.toString(),
      }).href
    );

  // trigger forwardMessage command of BotAPI
  forwardMessage = async (
    chat_id,
    from_chat_id,
    disable_notification = false,
    message_id
  ) =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendMessage`), {
        chat_id: chat_id.toString(),
        from_chat_id: from_chat_id.toString(),
        message_id: message_id.toString(),
        disable_notification: disable_notification.toString(),
      }).href
    );

  // trigger sendPhoto command of BotAPI
  sendPhoto = async (
    chat_id,
    photo,
    caption = "",
    parse_mode = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendPhoto`), {
        chat_id: chat_id.toString(),
        photo,
        caption,
        parse_mode,
        disable_notification: disable_notification.toString(),
        reply_to_message_id: reply_to_message_id.toString(),
      }).href
    );

  // trigger sendVideo command of BotAPI
  sendVideo = async (
    chat_id,
    video,
    duration = 0,
    width = 0,
    height = 0,
    thumb = "",
    caption = "",
    parse_mode = "",
    supports_streaming = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendVideo`), {
        chat_id: chat_id.toString(),
        video,
        duration: duration.toString(),
        width: width.toString(),
        height: height.toString(),
        thumb: thumb,
        caption: caption,
        parse_mode: parse_mode,
        supports_streaming: supports_streaming.toString(),
        disable_notification: disable_notification.toString(),
        reply_to_message_id: reply_to_message_id.toString(),
      }).href
    );

  // trigger sendAnimation command of BotAPI
  sendAnimation = async (
    chat_id,
    animation,
    duration = 0,
    width = 0,
    height = 0,
    thumb = "",
    caption = "",
    parse_mode = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendAnimation`), {
        chat_id: chat_id.toString(),
        animation,
        duration: duration.toString(),
        width: width.toString(),
        height: height.toString(),
        thumb,
        caption,
        parse_mode,
        disable_notification: disable_notification.toString(),
        reply_to_message_id: reply_to_message_id.toString(),
      }).href
    );

  // trigger sendLocation command of BotAPI
  sendLocation = async (
    chat_id,
    latitude,
    longitude,
    live_period = 0,
    disable_notification = false,
    reply_to_message_id = 0
  ) =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendLocation`), {
        chat_id: chat_id.toString(),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        live_period: live_period.toString(),
        disable_notification: disable_notification.toString(),
        reply_to_message_id: reply_to_message_id.toString(),
      }).href
    );

  // trigger senPoll command of BotAPI
  sendPoll = async (
    chat_id,
    question,
    options,
    is_anonymous = false,
    type = "",
    allows_multiple_answers = false,
    correct_option_id = 0,
    explanation = "",
    explanation_parse_mode = "",
    open_period = 0,
    close_date = 0,
    is_closed = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendPoll`), {
        chat_id: chat_id.toString(),
        question,
        options: options.toString(),
        is_anonymous: is_anonymous.toString(),
        type,
        allows_multiple_answers: allows_multiple_answers.toString(),
        correct_option_id: correct_option_id.toString(),
        explanation: explanation,
        explanation_parse_mode: explanation_parse_mode,
        open_period: open_period.toString(),
        close_date: close_date.toString(),
        is_closed: is_closed.toString(),
        disable_notification: disable_notification.toString(),
        reply_to_message_id: reply_to_message_id.toString(),
      }).href
    );

  // trigger senDice command of BotAPI
  sendDice = async (
    chat_id,
    emoji = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) =>
    fetch(
      addSearchParams(new URL(`${this.api}/sendDice`), {
        chat_id: chat_id.toString(),
        emoji,
        disable_notification: disable_notification.toString(),
        reply_to_message_id: reply_to_message_id.toString(),
      }).href
    );

  // bot api command to get user profile photos
  getUserProfilePhotos = async (user_id, offset = 0, limit = 0) =>
    fetch(
      addSearchParams(new URL(`${this.api}/getUserProfilePhotos`), {
        user_id: user_id.toString(),
        offset: offset.toString(),
        limit: limit.toString(),
      }).href
    );
}
