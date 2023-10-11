import Link from "next/link";
import Button from "./Button";
import { signOut } from "next-auth/react";

import { api } from "~/utils/api";
import { BsChatRightText } from "react-icons/bs"


const SideNav = () => {
    const { data: chats } = api.chat.fetchAll.useQuery();

    return (
        <nav className="text-gray-200 sticky top-0 px-3 py-4 flex flex-col justify-between bg-neutral-700 overflow-hidden w-60 ">
            <ul className="flex gap-6 flex-col whitespace-nowrap">
                <Link className="text-center bg-gray-600 hover:bg-gray-400 transition-colors duration-200 hover:text-black" href="/">
                    <h1 className=" p-2 border rounded-md ">New Chat</h1>
                </Link>
                {chats?.length === 0 || !chats && <p className="whitespace-normal text-gray-300">Start a new chat by sending a message!</p>}
                {chats?.length !== 0 && chats?.map(({ id, name }) =>
                    <li key={id}>
                        <Link className="flex items-center gap-4" href={`/chat/${id}`}>
                            <div>
                                <BsChatRightText />
                            </div>
                            <p>
                                {name.slice(0, 22) + (name.length > 22 ? "..." : "")}
                            </p>
                        </Link>
                    </li>
                )}
            </ul>
            <div className=" border-gray-400 text-center pt-5 border-t-2">
                <Button onClick={() => void signOut()}>Logout</Button>
            </div>
        </nav >
    );
}

export default SideNav
