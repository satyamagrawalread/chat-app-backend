"use strict";

/**
 * session controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::session.session", ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;
    const name = ctx.request.body["name"] || "";
    if (!name) {
      return ctx.badRequest("Name is required");
    }
    return await strapi.service("api::session.session").create({
      data: {
        name: name,
        owner: userId,
      },
    });
  },
  async delete(ctx) {
    const userId = ctx.state.user.id;
    const { id: sessionId } = ctx.params || -1;
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
      (session) => session.id === Number(sessionId)
    );

    if (!sessionExists) {
      return ctx.badRequest("Session ID is incorrect");
    }

    const session = await strapi.query("api::session.session").findOne({
        where: {id: sessionId},
        populate: ["messages"]
    });
    if(session.messages) {
        const messageIds = session.messages.map((message) => message.id)
        messageIds?.length > 0 && await strapi.query("api::message.message").deleteMany({
            where: {
                id: {
                    $in: messageIds,
                }
            }
        })
    }
    const sessionDeleted = await strapi.query('api::session.session').delete({
        where: { id: sessionId }
    })
    return sessionDeleted;
  },
}));
