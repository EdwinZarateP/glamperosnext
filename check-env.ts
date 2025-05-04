import * as dotenv from "dotenv";
import * as path from "path";

// Cargar manualmente el archivo .env.local
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

console.log("WORDPRESS_API:", process.env.WORDPRESS_API);
