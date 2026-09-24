import type { Dictionary } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequired(value: string, dict: Dictionary) {
  if (!value.trim()) return dict.validation.required;
  return "";
}

export function validateEmail(value: string, dict: Dictionary, required = false) {
  const trimmed = value.trim();
  if (!trimmed) return required ? dict.validation.required : "";
  if (!EMAIL_RE.test(trimmed)) return dict.validation.emailInvalid;
  return "";
}

export function validateMinLength(value: string, min: number, dict: Dictionary) {
  if (value.trim().length < min) return dict.validation.minLength;
  return "";
}

export function validatePhone(value: string, dict: Dictionary, required = false) {
  const trimmed = value.trim();
  if (!trimmed) return required ? dict.validation.required : "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8) return dict.validation.phoneInvalid;
  return "";
}
