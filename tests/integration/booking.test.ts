import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createUser,
  createEnrollmentWithAddress,
  createTicket,
  createTicketTypeWithParams,
  createHotel,
  createRoom,
  createBooking } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user doesnt have a booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id, 3);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        userId: booking.userId,
        roomId: booking.roomId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Room: {
          id: expect.any(Number),
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }
      });
    });
  });
});
describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    describe("when user is not allowed to make a booking", () => {
      it("should respond with status 400 if body param roomId is missing", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        await createRoom(hotel.id, 3);

        const body = { };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 400 if body param roomId is invalid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        await createRoom(hotel.id, 3);

        const body = { roomId: 0 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 403 if user doesnt have an enrollment", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3);

        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 if user doesnt have a ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3);
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 if user have an online ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(true, false);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);        
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3); 
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 if user have a presential ticket without hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, false);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);        
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3); 
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 if user have an unpaid ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED); 
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3);
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 if user have an unpaid ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3);
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if user already has a booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3);
        await createBooking(user.id, room.id); 
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
    });

    describe("when user can make a booking", () => {
      it("should respond with status 404 if given roomId doesnt exist", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 3);
  
        const body = { roomId: (room.id + 1) };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      
      it("should respond with status 403 if given roomId is at maximum capacity", async () => {
        const user = await createUser();
        const otherUser = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 1);
        await createBooking(otherUser.id, room.id);
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 200 and with booking data", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 1);
  
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: expect.any(Number),
          roomId: room.id,
          userId: user.id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });

      it("should insert a new booking in the database", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id, 1);
  
        const beforeCount = await prisma.booking.count();

        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
  
        const afterCount = await prisma.booking.count();

        expect(response.status).toBe(httpStatus.OK);
        expect(beforeCount).toBe(0);
        expect(afterCount).toBe(1);
      });
    });    
  });
});
