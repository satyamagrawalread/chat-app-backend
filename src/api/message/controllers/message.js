'use strict';

/**
 * message controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::message.message', ({ strapi }) => ({
    async create(ctx) {
        const userId = ctx.state.user.id;
        const message = ctx.request.body["text"] || "";
        if(!message) {
            return ctx.badRequest('Message is required');
        }
        return await strapi.service('api::message.message').create({
            data: {
                text: message,
                sender: userId
            }
        })
    }
  }));
