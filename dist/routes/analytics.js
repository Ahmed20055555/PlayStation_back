"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const router = express_1.default.Router();
// Get monthly revenue
router.get('/revenue', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Get all completed reservations for the current month
        const reservations = yield prismaClient_1.default.reservation.findMany({
            where: {
                status: 'completed',
                endTime: {
                    gte: firstDayOfMonth
                }
            }
        });
        // const totalRevenue = reservations.reduce((sum, res) => sum + (res.totalPrice || 0), 0);
        // const totalRevenue = reservations.reduce((sum: number, res) => sum + (res.totalPrice || 0), 0);
        const totalRevenue = reservations.reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);
        // Also get active rooms count
        const activeReservations = yield prismaClient_1.default.reservation.count({
            where: { status: 'active' }
        });
        res.json({
            monthlyRevenue: totalRevenue,
            activeRooms: activeReservations,
            totalCompleted: reservations.length
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
