import { useState } from "react";
import { ZodType } from "zod";

export const useCustomForm = <T extends Record<string, unknown>>(
  initialValues: T,
  schema: ZodType<T>,
) => {
  const [formState, setFormState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  
  const handleChange = (field: keyof T, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({
      ...prev,
      [field]: ""
    }));
  };

  const validate = () => {
    const result = schema.safeParse(formState);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};
      for (const key in fieldErrors) {
        if (!Object.hasOwn(fieldErrors, key)) continue;
        formattedErrors[key] = fieldErrors[key]?.[0] || "";
      }
      setErrors(formattedErrors as Record<keyof T, string>);
      return false;
    }

    return true;
  };

  const handleSubmit =
    (callback: (data: T) => void) => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const isValid = validate();
      if (!isValid) return;

      callback(formState);
    };

  return { formState, errors, handleSubmit, handleChange };
};
