import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Au moins 6 caractères"),
  phone: z.string().optional(),
});

export const travelSchema = z.object({
  departureCity: z.string().min(2, "Ville de départ requise"),
  arrivalCity: z.string().min(2, "Ville d'arrivée requise"),
  departureDate: z.string().min(1, "Date de départ requise"),
  departureTime: z.string().min(1, "Heure de départ requise"),
  arrivalDate: z.string().min(1, "Date d'arrivée requise"),
  arrivalTime: z.string().min(1, "Heure d'arrivée requise"),
  availableKg: z.coerce.number().positive("Kilos doit être positif"),
  pricePerKg: z.coerce.number().positive("Prix doit être positif"),
  description: z.string().optional(),
});

export const reservationSchema = z.object({
  kg: z.coerce.number().positive("Kilos doit être positif"),
  notes: z.string().optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message requis"),
  receiverId: z.string(),
  travelId: z.string().optional(),
});

export const searchSchema = z.object({
  departureCity: z.string().optional(),
  arrivalCity: z.string().optional(),
  date: z.string().optional(),
});

export const paymentSchema = z.object({
  reservationId: z.string(),
  cardNumber: z.string().min(16, "Numéro de carte invalide").max(19),
  cardName: z.string().min(2, "Nom requis"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Format MM/AA"),
  cvv: z.string().min(3, "CVV invalide").max(4),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TravelInput = z.infer<typeof travelSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
