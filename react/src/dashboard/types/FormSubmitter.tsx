import { FormEvent } from 'react';

type FormSubmitter<T, D> = (values: T, e?: FormEvent<HTMLFormElement>, data?: D) => Promise<unknown> | null | void;

export default FormSubmitter;
