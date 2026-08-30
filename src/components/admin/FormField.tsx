import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary-700 mb-1.5">
        {label}
        {required && <span className="text-error-500"> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-primary-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-error-500 mt-1">{error}</p>}
    </div>
  );
}

const inputBase = 'w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:ring-1 focus:ring-accent-saffron focus:border-accent-saffron';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className = '', ...rest } = props;
  return (
    <input
      className={`${inputBase} ${error ? 'border-error-300 bg-error-50' : 'border-primary-200'} ${className}`}
      {...rest}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  const { error, className = '', rows = 4, ...rest } = props;
  return (
    <textarea
      rows={rows}
      className={`${inputBase} resize-y ${error ? 'border-error-300 bg-error-50' : 'border-primary-200'} ${className}`}
      {...rest}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props;
  return (
    <select className={`${inputBase} border-primary-200 bg-white ${className}`} {...rest}>
      {children}
    </select>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-accent-saffron' : 'bg-primary-300'}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
      <span className="text-sm text-primary-700">{label}</span>
    </div>
  );
}
