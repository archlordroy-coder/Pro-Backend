import { Service, Product, Promotion, Review, CyberTicket, Computer, User } from '../types/entities';

export const mockServices: Service[] = [
  {
    id: '1',
    title: 'Réparation PC',
    description: 'Réparation et maintenance de PC',
    iconCode: 58709,
    features: ['Diagnostic', 'Réparation', 'Maintenance'],
    category: 'Réparation',
    priceDisplay: 'À partir de 5 000 FCFA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Développement Web',
    description: 'Création de sites web professionnels',
    iconCode: 58842,
    features: ['Design', 'Développement', 'SEO'],
    category: 'Développement',
    priceDisplay: 'À partir de 50 000 FCFA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Cybersécurité',
    description: 'Audit et protection de vos données',
    iconCode: 58844,
    features: ['Audit', 'Protection', 'Formation'],
    category: 'Sécurité',
    priceDisplay: 'Sur devis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ordinateur Portable HP',
    description: 'PC portable performant pour le travail',
    price: 150000,
    priceDisplay: '150 000 FCFA',
    category: 'Ordinateurs',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 5,
    rating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Clavier Mécanique',
    description: 'Clavier gaming RGB',
    price: 25000,
    priceDisplay: '25 000 FCFA',
    category: 'Accessoires',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 15,
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Souris Gaming',
    description: 'Souris haute précision',
    price: 15000,
    priceDisplay: '15 000 FCFA',
    category: 'Accessoires',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 20,
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Écran 24 pouces',
    description: 'Écran Full HD IPS',
    price: 80000,
    priceDisplay: '80 000 FCFA',
    category: 'Écrans',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 8,
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Promo Été',
    description: '-20% sur tous les ordinateurs portables',
    imageUrl: 'https://via.placeholder.com/400',
    discountPercentage: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Pack Gaming',
    description: 'Clavier + Souris à -30%',
    imageUrl: 'https://via.placeholder.com/400',
    discountPercentage: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: 'user1',
    rating: 5,
    title: 'Excellent produit',
    comment: 'Très satisfait de cet ordinateur portable',
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockTickets: CyberTicket[] = [
  {
    id: '1',
    title: 'Attaque potentielle détectée',
    description: 'Activité suspecte observée sur le serveur',
    status: 'in-progress',
    priority: 'high',
    userId: 'user1',
    assignedTo: 'admin1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockComputers: Computer[] = [
  {
    id: '1',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    status: 'available',
    location: 'Bureau principal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@proinformatique.local',
    password: '$2b$10$placeholder', // hashed
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
