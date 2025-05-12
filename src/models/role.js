import { z } from "zod";

export const schema = z.enum(["user", "admin"]);

export default schema;
