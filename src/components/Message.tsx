import type { ReactNode } from "react";
import { BiSolidUser } from "react-icons/bi"
import { FaUserDoctor } from "react-icons/fa6"

export default function Message({ children, user = true }: { children: ReactNode, user?: boolean }) {
    return (
        <div className={`flex mx-auto rounded-md gap-5 p-4 text-left md:items-center ${!user && "bg-gray-500"}`}>
            <div className="rounded-full">
                <div className={`border-2 p-3 rounded-xl  ${!user && "border-green-500 text-green-500"}`}>
                    {user ? <BiSolidUser size="1.2rem" /> : <FaUserDoctor size="1.2rem" />}
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};