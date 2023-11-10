import Link from "next/link";
import Button from "./UI/Button";
import { signOut } from "next-auth/react";
import { BsReverseLayoutSidebarInsetReverse } from "react-icons/bs"
import { api } from "~/utils/api";
import { BsChatRightText } from "react-icons/bs"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

const SideNav = () => {
    const [hideSideNav, setHideSideNav] = useState(false)
    const { data: chats } = api.chat.fetchAll.useQuery();

    const hideSideNavSmallScreens = () => {
        if (window.outerWidth <= 768) {
            setHideSideNav(true)
        }
    }

    useEffect(() => {
        hideSideNavSmallScreens()

        window.addEventListener("resize", hideSideNavSmallScreens)
        return () => window.removeEventListener("resize", hideSideNavSmallScreens)
    }, [])


    return (
        <>
            <div className={`z-50 w-64 ${hideSideNav ? "hidden" : "flex"}`}>
                <nav className={`text-gray-200 flex h-full fixed px-3 bg-neutral-700 w-64 py-4 flex-col justify-between `}>
                    <ul className="flex gap-6 flex-col whitespace-nowrap">
                        <div className="flex justify-between gap-4 pr-1">
                            <Link onClick={() => hideSideNavSmallScreens()} className="text-center flex-grow bg-gray-600 hover:bg-gray-400 transition-colors duration-200 hover:text-black" href="/">
                                <h1 className=" p-2 border rounded-md ">New Chat</h1>
                            </Link>
                            <ToggleNavBtn className={`${hideSideNav && "hidden"}`} setHideSideNav={setHideSideNav} />
                        </div>
                        {(chats?.length === 0 || !chats) && <p className="whitespace-normal text-gray-300">Start a new chat by sending a message!</p>}
                        {chats?.length !== 0 && chats?.map(({ id, name }) =>
                            <li key={id}>
                                <Link onClick={() => hideSideNavSmallScreens()} className="flex items-center gap-4" href={`/chat/${id}`}>
                                    <div>
                                        <BsChatRightText />
                                    </div>
                                    <p>
                                        {name.slice(0, 24) + (name.length > 24 ? "..." : "")}
                                    </p>
                                </Link>
                            </li>
                        )}
                    </ul>
                    <div className=" border-gray-400 text-center pt-5 border-t-2">
                        <Button onClick={() => void signOut()}>Logout</Button>
                    </div>
                </nav >
            </div>
            <div className="fixed z-10 mt-8 ml-8 self-start">
                <ToggleNavBtn className={`sticky ${!hideSideNav && "hidden"}`} setHideSideNav={setHideSideNav} />
            </div>
        </>
    );
}

const ToggleNavBtn = ({ setHideSideNav, className, svgClassNames }: { setHideSideNav: Dispatch<SetStateAction<boolean>>, className?: string, svgClassNames?: string }) => {
    return <button className={`hover:text-black duration-150 transition-colors ${className}`} onClick={() => setHideSideNav((oldState) => !oldState)}>
        <BsReverseLayoutSidebarInsetReverse className={`w-5 h-5 ${svgClassNames}`} />
    </button>
}

export default SideNav
