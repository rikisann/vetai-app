import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./root";
import SuperJSON from "superjson";
import type { Session } from "next-auth";
import { createInnerTRPCContext } from "./trpc"

export function ssgHelper(session: Session) {
    return createServerSideHelpers({
        router: appRouter,
        ctx: createInnerTRPCContext({ session }),
        transformer: SuperJSON,
    });
}
