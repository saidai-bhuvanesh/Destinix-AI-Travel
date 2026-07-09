import { Response } from "express";
import { ItineraryService } from "../services/itineraryService";

// Safe number conversion with validation
const safeNumber = (value: any, fieldName: string): number => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return num;
};

export class ItineraryController {
  static async createItineraryItem(req: any, res: Response) {
    try {
      const groupId = req.params.id;
      const { title, description, dayNumber } = req.body;
      const createdBy = req.user.id;

      const item = await ItineraryService.createItineraryItem(
        groupId,
        title,
        description,
        safeNumber(dayNumber, "dayNumber"),
        createdBy
      );
      
      if (req.io) {
        req.io.to(groupId).emit("itinerary:created", item);
      }

      return res.status(201).json(item);
    } catch (error: any) {
      console.error("Create itinerary item error:", error);
      return res.status(500).json({ error: error.message || "Failed to create itinerary item" });
    }
  }

  static async updateItineraryItem(req: any, res: Response) {
    try {
      const itemId = req.params.id;
      const { title, description, dayNumber, tripGroupId } = req.body;
      const updatedBy = req.user.id;

      const item = await ItineraryService.updateItineraryItem(
        itemId,
        title,
        description,
        safeNumber(dayNumber, "dayNumber"),
        updatedBy
      );

      if (req.io && tripGroupId) {
        req.io.to(tripGroupId).emit("itinerary:updated", item);
      }

      return res.json(item);
    } catch (error: any) {
      console.error("Update itinerary item error:", error);
      return res.status(500).json({ error: error.message || "Failed to update itinerary item" });
    }
  }

  static async deleteItineraryItem(req: any, res: Response) {
    try {
      const itemId = req.params.id;
      const { tripGroupId } = req.query;

      await ItineraryService.deleteItineraryItem(itemId);

      if (req.io && tripGroupId) {
        req.io.to(tripGroupId as string).emit("itinerary:updated", { id: itemId, deleted: true });
      }

      return res.json({ success: true, message: "Itinerary item deleted" });
    } catch (error: any) {
      console.error("Delete itinerary item error:", error);
      return res.status(500).json({ error: error.message || "Failed to delete itinerary item" });
    }
  }

  static async getItinerary(req: any, res: Response) {
    try {
      const groupId = req.params.id;
      const itinerary = await ItineraryService.getItinerary(groupId);
      return res.json(itinerary);
    } catch (error: any) {
      console.error("Get itinerary error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch itinerary" });
    }
  }
}
