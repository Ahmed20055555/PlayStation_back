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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const admin = yield prismaClient_1.default.admin.findUnique({ where: { username } });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValid = yield bcrypt_1.default.compare(password, admin.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, username: admin.username });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Setup initial admin if none exists
router.post('/setup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminCount = yield prismaClient_1.default.admin.count();
        if (adminCount > 0) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const { username, password } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const admin = yield prismaClient_1.default.admin.create({
            data: { username, password: hashedPassword }
        });
        res.status(201).json({ message: 'Admin created', username: admin.username });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
