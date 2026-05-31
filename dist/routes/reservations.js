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
// Get all reservations
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reservations = yield prismaClient_1.default.reservation.findMany({
            include: { room: true },
            orderBy: { startTime: 'desc' }
        });
        res.json(reservations);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get pending-payment reservations (for dashboard)
router.get('/pending', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reservations = yield prismaClient_1.default.reservation.findMany({
            where: { status: 'pending_payment' },
            include: { room: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reservations);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Create a reservation (pending_payment by default)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, customerName, customerPhone, transferToNumber, isOpentime, startTime, endTime } = req.body;
        const room = yield prismaClient_1.default.room.findUnique({ where: { id: roomId } });
        if (!room)
            return res.status(404).json({ message: 'Room not found' });
        const start = new Date(startTime);
        // Use discount rate if active at this hour
        const currentHour = start.getHours();
        let effectiveRate = room.hourlyRate;
        if (room.discountRate != null && room.discountStart != null && room.discountEnd != null) {
            const s = room.discountStart;
            const e = room.discountEnd;
            const inWindow = s < e
                ? currentHour >= s && currentHour < e
                : currentHour >= s || currentHour < e;
            if (inWindow)
                effectiveRate = room.discountRate;
        }
        let totalPrice = 0;
        let end = null;
        if (isOpentime) {
            totalPrice = effectiveRate; // 1 hour deposit for open time
        }
        else {
            end = new Date(endTime);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            totalPrice = hours * effectiveRate;
        }
        const reservation = yield prismaClient_1.default.reservation.create({
            data: {
                roomId: roomId,
                customerName,
                customerPhone,
                transferToNumber,
                isOpentime: isOpentime || false,
                startTime: start,
                endTime: end,
                totalPrice,
                status: 'pending_payment'
            }
        });
        res.status(201).json(reservation);
    }
    catch (error) {
        console.error('POST /reservations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Confirm payment → set status to active
router.patch('/:id/confirm-payment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reservation = yield prismaClient_1.default.reservation.update({
            where: { id: req.params.id },
            data: { status: 'active' },
            include: { room: true }
        });
        res.json(reservation);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Reject payment → cancel the reservation
router.patch('/:id/reject-payment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reservation = yield prismaClient_1.default.reservation.update({
            where: { id: req.params.id },
            data: { status: 'cancelled' },
            include: { room: true }
        });
        res.json(reservation);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Complete/Cancel a reservation
router.patch('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const reservation = yield prismaClient_1.default.reservation.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(reservation);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
