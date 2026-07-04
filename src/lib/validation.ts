import { z } from 'zod';

// Auth validation
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au least 8 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requis'),
});

// Service validation
export const createServiceSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  category: z.string().min(1, 'La catégorie est requise'),
  iconCode: z.number().int(),
  features: z.array(z.string()).min(1, 'Au moins une fonctionnalité est requise'),
  priceDisplay: z.string().min(1, 'Le prix est requis'),
});

export const updateServiceSchema = createServiceSchema.partial();

// Product validation
export const createProductSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être positif'),
  category: z.string().min(1, 'La catégorie est requise'),
  imageUrl: z.string().url('URL invalide'),
  stock: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Promotion validation
export const createPromotionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  imageUrl: z.string().url('URL invalide'),
  discountPercentage: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial();

// Review validation
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Le titre est requis'),
  comment: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères'),
});

// Cyber Ticket validation
export const createTicketSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export const updateTicketSchema = z.object({
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignedTo: z.string().optional(),
});

// Computer validation
export const createComputerSchema = z.object({
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  status: z.enum(['available', 'in-use', 'maintenance', 'retired']).optional(),
  location: z.string().optional(),
});

export const updateComputerSchema = createComputerSchema.partial();

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
