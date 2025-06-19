import app from "./server";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
app.use(cors(
    {
        origin: process.env.CLIENT_URL
    }
));


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(` ✨ Server started at http://localhost:${port}`);
});