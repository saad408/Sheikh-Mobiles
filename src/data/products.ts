import { Product } from '@/store/cartStore';

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1199,
    image: '/products/iphone15.jpg',
    category: 'Apple',
    description: 'The most powerful iPhone ever. Featuring the A17 Pro chip, 48MP camera system with 5x optical zoom, titanium design, and all-day battery life. Experience desktop-class performance in your pocket.',
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299,
    image: '/products/samsung-s24.jpg',
    category: 'Samsung',
    description: 'Galaxy AI is here. The ultimate smartphone with built-in S Pen, 200MP camera, and titanium frame. Powered by Snapdragon 8 Gen 3 for Galaxy with advanced AI features.',
    colors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'],
  },
  {
    id: '3',
    name: 'Google Pixel 8 Pro',
    price: 999,
    image: '/products/pixel8.jpg',
    category: 'Google',
    description: 'The best of Google AI in a phone. Pro-level camera with Magic Eraser and Best Take. 7 years of OS and security updates. Tensor G3 chip for smarter experiences.',
    colors: ['Bay', 'Obsidian', 'Porcelain'],
  },
  {
    id: '4',
    name: 'OnePlus 12',
    price: 799,
    image: '/products/oneplus12.jpg',
    category: 'OnePlus',
    description: 'Flagship killer returns. Snapdragon 8 Gen 3, Hasselblad camera system, 100W SUPERVOOC charging, and stunning 2K 120Hz ProXDR display. Unmatched performance.',
    colors: ['Flowy Emerald', 'Silky Black'],
  },
  {
    id: '5',
    name: 'Xiaomi 14 Ultra',
    price: 1099,
    image: '/products/xiaomi14.jpg',
    category: 'Xiaomi',
    description: 'Photography reimagined. Leica Summilux lenses, 1-inch sensor, variable aperture. Professional-grade photos in every shot. Snapdragon 8 Gen 3 power.',
    colors: ['White', 'Black'],
  },
  {
    id: '6',
    name: 'Nothing Phone (2)',
    price: 599,
    image: '/products/nothing2.jpg',
    category: 'Nothing',
    description: 'Unique design meets powerful tech. Iconic Glyph Interface, Snapdragon 8+ Gen 1, and a stunning 6.7" OLED display. Stand out from the ordinary.',
    colors: ['White', 'Dark Grey'],
  },
];

export const categories = ['All', 'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing'];
