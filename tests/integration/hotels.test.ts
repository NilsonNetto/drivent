import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createUser, createTicketType, createEnrollmentWithAddress, createTicket, createPayment, createTicketTypeWithParams } from "../factories";
import { createHotel, createRoom } from "../factories/hotels-factory";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user doesnt have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 when user doesnt own a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket isnt paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid and paid", () => {
      it("should respond with status 403 when is an online ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(true, false);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when is presential without hotel reservation", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, false);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
      
      it("should respond with status 200 and empty array when there are no hotels created", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([]);
      });

      it("should respond with status 200 and existing hotels when is presential with hotel reservation", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
  
        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual([{
          id: expect.any(Number),
          name: hotel.name,
          image: hotel.image,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }]);
      });
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user doesnt have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 when user doesnt own a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket isnt paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid and paid", () => {
      it("should respond with status 403 when is an online ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(true, false);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when is presential without hotel reservation", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, false);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
      
      it("should respond with status 404 when hotelId doesnt exists", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
  
        const response = await server.get(`/hotels/${hotel.id + 1}`).set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 200 and hotel data when is presential with hotel reservation and valid hotelId", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithParams(false, true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
  
        const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual({
          id: expect.any(Number),
          name: hotel.name,
          image: hotel.image,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          Rooms: [
            {
              id: expect.any(Number),
              name: room.name,
              capacity: room.capacity,
              hotelId: room.hotelId,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }
          ]
        });
      });
    });
  });
});
