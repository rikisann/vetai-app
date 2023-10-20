import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type ButtonProps = {
    className?: string;
} & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

export default function Button({ className = "", ...props }: ButtonProps) {
    return (
        <button className={`rounded-lg ${className}`} {...props} />
    );
};