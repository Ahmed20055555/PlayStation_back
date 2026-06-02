import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get settings
router.get("/", async (req, res) => {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          playstationName: "PLAYSTATION NAME",
        },
      });
    }
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings
router.post("/", async (req, res) => {
  try {
    const { playstationName, logoImage, instapayNumber, vodafoneCashNumber } = req.body;
    let settings = await prisma.settings.findFirst();
    
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          playstationName,
          logoImage,
          instapayNumber,
          vodafoneCashNumber,
        },
      });
    } else {
      settings = await prisma.settings.create({
        data: {
          playstationName: playstationName || "PLAYSTATION NAME",
          logoImage,
          instapayNumber,
          vodafoneCashNumber,
        },
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
