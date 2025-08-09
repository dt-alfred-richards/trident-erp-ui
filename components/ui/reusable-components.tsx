import { Dispatch, SetStateAction } from "react";
import { Input } from "./input";

export const DateInput = ({ selectedDate, setState = () => { }, placeholder = "", disabled = false, allowPastSelection = true }: { selectedDate: Date | undefined, placeholder?: string, setState?: Dispatch<SetStateAction<Date | undefined>>, disabled?: boolean, allowPastSelection?: boolean }) => {
    return <Input
        placeholder={placeholder}
        value={selectedDate ? selectedDate?.toISOString().split('T')[0] : ''}
        disabled={disabled}
        min={!allowPastSelection ? new Date().toISOString().split('T')[0] : undefined}
        onChange={e => {
            const dateStr = e.target.value;
            setState(dateStr ? new Date(dateStr) : undefined);
        }}
        type='date'
    />
}