import {
    type DetailedHTMLProps,
    type TextareaHTMLAttributes,
    type RefObject,
    useCallback,
    useEffect,
    useState,
    useRef,
    ChangeEvent,
} from "react";

type InputProps = {
    className?: string;
    formRef?: RefObject<HTMLFormElement>;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
} & DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
>;

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return;
    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
}

/**
 * Attaches an event listener for the Enter key on the input component.
 * If the Enter key is pressed, it prevents the default behavior, submits the form, and stops the event propagation.
 * @param {MutableRefObject} formRef Reference to the form the input belongs to.
 */
function attachEnterKeyListener(
    formRef: RefObject<HTMLFormElement> | undefined
) {
    if (formRef && formRef.current) {
        formRef.current.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                event.preventDefault();
                formRef.current?.requestSubmit();
                event.stopImmediatePropagation();
            }
        });
    }
}

/**
 * Renders an input component.
 * @param {string} className The class name for the input component.
 * @param {MutableRefObject} formRef Reference to the form the input belonngs to. Only passed down if user wishes to attach an event listener for Enter Key and submit form
 * @returns {JSX.Element} The input component.
 */
export default function Input({
    className = "",
    formRef,
    ...props
}: InputProps) {
    const [inputValue, setInputValue] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>();

    useEffect(() => {
        attachEnterKeyListener(formRef);
    }, [formRef]);

    // Sets the input ref and updates the text area size.
    const inputRef = useCallback(
        (textArea: HTMLTextAreaElement) => {
            updateTextAreaSize(textArea);
            textAreaRef.current = textArea;
        },
        [textAreaRef]
    );

    const updateInputValue = (e: ChangeEvent<HTMLTextAreaElement>) => {
        props.onChange ? props.onChange(e) : setInputValue(e.target.value)
    }

    useEffect(() => {
        updateTextAreaSize(textAreaRef.current);
    }, [inputValue, props.value]);

    return (
        <textarea
            {...props}
            style={{ height: 0 }}
            ref={inputRef}
            value={props.value || inputValue}
            className={`resize-none overflow-hidden rounded-md bg-black px-4 py-4 text-white drop-shadow-2xl focus:outline-none ${className}`}
            onChange={updateInputValue}
        />
    );
}
