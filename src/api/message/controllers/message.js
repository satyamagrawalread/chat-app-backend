"use strict";

/**
 * message controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::message.message", ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;
    const message = ctx.request.body["text"] || "";
    const sessionId = ctx.request.body["session"];
    if (!message) {
      return ctx.badRequest("Message is required");
    }
    if (!sessionId) {
      return ctx.badRequest("Session ID is required");
    }
    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { id: userId },
      populate: ["sessions"],
    });
    if (!user) {
      return ctx.badRequest("User not found");
    }

    const sessionExists = user.sessions.some(
      (session) => session.id === sessionId
    );
    if (!sessionExists) {
      return ctx.badRequest("Session ID is incorrect");
    }

    const createdMessage = await strapi.service("api::message.message").create({
      data: {
        text: message,
        sender: userId,
        receiver: 2,
        session: sessionId,
      },
    });
    await strapi.service("api::session.session").update(sessionId, {
      data: {
        lastMessage: message,
      },
    });

    return createdMessage;
  },
}));
