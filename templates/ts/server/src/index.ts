import "dotenv/config";
import app from "@/app";
import { env } from "@/config/env";

const PORT = env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
