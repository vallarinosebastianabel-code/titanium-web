import { z } from "zod";

export const testimonialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().optional(),
  /** Vehículo entregado, ej. "2021 Toyota Camry SE". */
  vehicle: z.string().min(1),
  quote: z.string().min(10).max(320),
  rating: z.number().int().min(1).max(5),
  /** Ruta relativa al bucket. */
  photo: z.object({ src: z.string().min(1), alt: z.string().min(1) }),
  deliveredAt: z.string().optional(),
});

export const testimonialsFileSchema = z.object({
  testimonials: z.array(testimonialSchema),
});

export const faqItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["financiamiento", "requisitos", "inventario"]),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const faqFileSchema = z.object({
  faqs: z.array(faqItemSchema),
});

export type Testimonial = z.infer<typeof testimonialSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
