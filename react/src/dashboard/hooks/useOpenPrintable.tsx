import { useContext } from 'react';
import { printableContext } from '../modules/printable/context/PrintableContext';

export default function useOpenPrintable() {
    return useContext(printableContext).openPrintable;
}
