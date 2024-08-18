'use strict';

/**
 * session controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::session.session', ({ strapi }) => ({
    async create(ctx) {
        const userId = ctx.state.user.id;
        const name = ctx.request.body["name"] || "";
        if(!name) {
            return ctx.badRequest('Name is required');
        }
        return await strapi.service('api::session.session').create({
            data: {
                name: name,
                owner: userId
            }
        })
    },
  }));

