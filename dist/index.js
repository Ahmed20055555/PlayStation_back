"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const analytics_1 = __importDefault(require("./routes/analytics"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/reservations', reservations_1.default);
app.use('/api/analytics', analytics_1.default);
app.get('/', (req, res) => {
    res.send('PlayStation Lounge API is running');
});
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
exports.default = app;
