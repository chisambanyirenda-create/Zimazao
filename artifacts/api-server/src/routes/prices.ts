import { Router, type IRouter } from "express";

const router: IRouter = Router();

const MARKET_PRICES = [
  {
    crop: "White Maize",
    emoji: "🌽",
    unit: "50kg bag",
    average: 445,
    weeklyChange: 3.1,
    markets: [
      { name: "Lusaka", price: 450, change: 5.2 },
      { name: "Ndola", price: 440, change: 3.1 },
      { name: "Kitwe", price: 445, change: 2.8 },
      { name: "Livingstone", price: 460, change: -1.5 },
      { name: "Chipata", price: 430, change: 4.0 },
    ],
  },
  {
    crop: "Groundnuts (Shelled)",
    emoji: "🥜",
    unit: "25kg bag",
    average: 375,
    weeklyChange: 2.1,
    markets: [
      { name: "Lusaka", price: 380, change: 2.5 },
      { name: "Ndola", price: 370, change: 1.8 },
      { name: "Kitwe", price: 375, change: 2.0 },
      { name: "Livingstone", price: 385, change: -0.5 },
      { name: "Chipata", price: 365, change: 3.2 },
    ],
  },
  {
    crop: "Soybeans",
    emoji: "🫘",
    unit: "50kg bag",
    average: 520,
    weeklyChange: -1.2,
    markets: [
      { name: "Lusaka", price: 520, change: -1.0 },
      { name: "Ndola", price: 515, change: -1.5 },
      { name: "Kitwe", price: 525, change: -0.9 },
      { name: "Livingstone", price: 510, change: -2.1 },
      { name: "Chipata", price: 530, change: 0.5 },
    ],
  },
  {
    crop: "Sunflower Seeds",
    emoji: "🌻",
    unit: "50kg bag",
    average: 280,
    weeklyChange: 4.5,
    markets: [
      { name: "Lusaka", price: 285, change: 4.0 },
      { name: "Ndola", price: 275, change: 5.1 },
      { name: "Kitwe", price: 280, change: 4.5 },
      { name: "Livingstone", price: 290, change: 3.8 },
      { name: "Chipata", price: 270, change: 5.0 },
    ],
  },
  {
    crop: "Cassava (Dried)",
    emoji: "🍠",
    unit: "25kg bag",
    average: 175,
    weeklyChange: 1.5,
    markets: [
      { name: "Lusaka", price: 180, change: 1.2 },
      { name: "Ndola", price: 170, change: 2.1 },
      { name: "Kitwe", price: 175, change: 1.5 },
      { name: "Livingstone", price: 185, change: 0.8 },
      { name: "Chipata", price: 165, change: 2.3 },
    ],
  },
  {
    crop: "Sorghum",
    emoji: "🌾",
    unit: "50kg bag",
    average: 390,
    weeklyChange: -0.8,
    markets: [
      { name: "Lusaka", price: 395, change: -0.5 },
      { name: "Ndola", price: 385, change: -1.2 },
      { name: "Kitwe", price: 390, change: -0.8 },
      { name: "Livingstone", price: 400, change: -0.3 },
      { name: "Chipata", price: 380, change: -1.5 },
    ],
  },
];

router.get("/prices", async (_req, res): Promise<void> => {
  res.json(MARKET_PRICES);
});

export default router;
