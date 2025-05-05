
import { Product } from "../types";

export const products: Product[] = [
  {
    id: 1,
    name: "Sona Masoori Rice (5kg)",
    price: 350,
    image: "/placeholder.svg",
    category: "Grains",
    description: "Premium quality Sona Masoori rice, perfect for daily cooking."
  },
  {
    id: 2,
    name: "Toor Dal (1kg)",
    price: 160,
    image: "/placeholder.svg",
    category: "Grains",
    description: "High-quality split pigeon peas, essential for soups and curries."
  },
  {
    id: 3,
    name: "Refined Sunflower Oil (1L)",
    price: 130,
    image: "/placeholder.svg",
    category: "Oils",
    description: "Pure refined sunflower oil for healthier cooking."
  },
  {
    id: 4,
    name: "Cold Pressed Sesame Oil (500ml)",
    price: 210,
    image: "/placeholder.svg",
    category: "Oils",
    description: "Traditional wood-pressed sesame oil with authentic flavor."
  },
  {
    id: 5,
    name: "Lays Classic Salted (Family Pack)",
    price: 90,
    image: "/placeholder.svg",
    category: "Snacks",
    description: "Crispy potato chips with just the right amount of salt."
  },
  {
    id: 6,
    name: "Mixed Namkeen (400g)",
    price: 120,
    image: "/placeholder.svg",
    category: "Snacks",
    description: "Crunchy mix of savory snacks, perfect for tea time."
  },
  {
    id: 7,
    name: "Dove Soap (3x75g)",
    price: 140,
    image: "/placeholder.svg",
    category: "Soaps",
    description: "Moisturizing beauty bar for soft and smooth skin."
  },
  {
    id: 8,
    name: "Dettol Soap (4x75g)",
    price: 160,
    image: "/placeholder.svg",
    category: "Soaps",
    description: "Antibacterial soap that provides protection against germs."
  },
  {
    id: 9,
    name: "Red Chilli Powder (100g)",
    price: 60,
    image: "/placeholder.svg",
    category: "Spices",
    description: "Pure ground red chilli for adding heat to your dishes."
  },
  {
    id: 10,
    name: "Turmeric Powder (100g)",
    price: 45,
    image: "/placeholder.svg",
    category: "Spices",
    description: "High-quality turmeric powder with rich color and aroma."
  },
  {
    id: 11,
    name: "Jaggery Block (500g)",
    price: 70,
    image: "/placeholder.svg",
    category: "Others",
    description: "Natural sweetener made from concentrated sugarcane juice."
  },
  {
    id: 12,
    name: "Tamarind Block (250g)",
    price: 90,
    image: "/placeholder.svg",
    category: "Others",
    description: "Tangy tamarind pulp, ideal for chutneys and curries."
  }
];

export const categories: string[] = ["All", "Grains", "Oils", "Snacks", "Soaps", "Spices", "Others"];
