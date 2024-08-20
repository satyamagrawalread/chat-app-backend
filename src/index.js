"use strict";

const server = require("../config/server");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const { Server } = require("socket.io");
    var io = new Server(strapi.server.httpServer, {
      cors: {
        // cors setup
        origin: ['*'],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });
    io.use(async (socket, next) => {
      try {
        //Socket Authentication
        console.log(socket.handshake.query.token)
        let result = await await strapi.service('plugin::users-permissions.jwt').verify(socket.handshake.query.token)
            //Save the User ID to the socket connection
            // socket.user = result.id;
            next();
          } catch (error) {
            console.log(error)
          }
    }).on("connection", function (socket) {
      //Listening for a connection from the frontend
      socket.on("join", ({ sessionId }) => {
        // Listening for a join connection
        if (sessionId) {
          socket.join(`session-${sessionId}`); // Adding the user to the group
          socket.emit("welcome", {
            // Sending a welcome message to the User
            user: "Server",
            text: `Welcome to the chat`,
          });
        } else {
          socket.emit("error", {
            message: "Session ID invalid",
          });
        }
      });
      socket.on("clientMessage", async ({ userId, message, sessionId }) => {
        // Listening for a sendMessage connection
        let strapiData = {
          text: message,
          session: sessionId,
        };
        const clientMessage = await strapi
          .service("api::message.message")
          .create({
            data: { ...strapiData, sender: userId, receiver: 2 },
          });
        const serverMessage = await strapi
          .service("api::message.message")
          .create({
            data: { ...strapiData, sender: 2, receiver: userId },
          });
        socket.emit("serverMessage", {
          id: serverMessage.id,
          message: serverMessage.text,
          userId: 2,
          name: "Server",
          createdAt: serverMessage.createdAt,
        });
      });
    });
  },
};
