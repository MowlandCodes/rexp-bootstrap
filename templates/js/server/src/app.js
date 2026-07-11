import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "@/middlewares/errorHandler";
import { notFoundHandler } from "@/middlewares/notFound";
import routes from "@/routes";

const app = express();

app.use(helmet());
app.use(cors());
app.disable("x-powered-by");
app.set("etag", false);

app.use(morgan("dev"));
app.use(express.json());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
