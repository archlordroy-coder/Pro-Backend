import { Timestamps } from './common';

// Service
export interface Service extends Timestamps {
  id: string;
  title: string;
  description: string;
  category: string;
  iconCode: number;
  features: string[];
  priceDisplay: string;
}

// Product
export interface Product extends Timestamps {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  category: string;
  imageUrl: string;
  stock?: number;
  rating?: number;
}

// Review
export interface Review extends Timestamps {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verified?: boolean;
}

// Promotion
export interface Promotion extends Timestamps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
}

// CyberTicket
export interface CyberTicket extends Timestamps {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  assignedTo?: string;
}

// Computer
export interface Computer extends Timestamps {
  id: string;
  brand: string;
  model: string;
  specifications?: Record<string, any>;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location?: string;
}

// User
export interface User extends Timestamps {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: 'user' | 'admin' | 'moderator';
  lastLogin?: string;
  isActive: boolean;
}

// Auth DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
