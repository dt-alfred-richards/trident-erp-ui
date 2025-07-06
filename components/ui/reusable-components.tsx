import { Dispatch, SetStateAction } from "react";
import { Input } from "./input";

export const DateInput = ({ selectedDate, setState = () => { }, placeholder = "", disabled = false }: { selectedDate: Date | undefined, placeholder?: string, setState?: Dispatch<SetStateAction<Date | undefined>>, disabled?: boolean }) => {
    return <Input
        placeholder={placeholder}
        value={selectedDate ? selectedDate?.toISOString().split('T')[0] : ''}
        disabled={disabled}
        onChange={e => {
            const dateStr = e.target.value;
            setState(dateStr ? new Date(dateStr) : undefined);
        }}
        type='date'
    />
}