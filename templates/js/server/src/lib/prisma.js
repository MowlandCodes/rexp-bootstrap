import { PrismaClient } from "@db/client";
import __ADAPTER_IMPORT__ from "__ADAPTER_PACKAGE__";

const adapter = __ADAPTER_INIT__;
export const prisma = new PrismaClient({ adapter });
