// /src/vigas/components/ui/InputComponents.tsx
// Componentes reutilizables para inputs y labels

import React from 'react';

// ===== COMPONENTE LABEL =====
interface LabelProps {
    children: React.ReactNode;
    htmlFor?: string;
    size?: 'xs' | 'sm' | 'base';
    color?: 'gray' | 'blue' | 'green' | 'red' | 'purple';
    required?: boolean;
    className?: string;
}

export const Label: React.FC<LabelProps> = ({
    children,
    htmlFor,
    size = 'sm',
    color = 'gray',
    required = false,
    className = ''
}) => {
    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base'
    };

    const colorClasses = {
        gray: 'text-gray-700',
        blue: 'text-blue-700',
        green: 'text-green-700',
        red: 'text-red-700',
        purple: 'text-purple-700'
    };

    return (
        <label
            htmlFor={htmlFor}
            className={`block font-medium mb-1 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
};

// ===== COMPONENTE INPUT NUMÉRICO =====
interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    size?: 'sm' | 'base' | 'lg';
    disabled?: boolean;
    className?: string;
    id?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    placeholder,
    min,
    max,
    step = 0.1,
    size = 'base',
    disabled = false,
    className = '',
    id
}) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        base: 'px-3 py-2',
        lg: 'px-4 py-3 text-lg'
    };

    return (
        <input
            id={id}
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={`
                w-full border border-gray-300 rounded-md text-black
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-colors
                ${sizeClasses[size]}
                ${className}
            `}
        />
    );
};

// ===== COMPONENTE INPUT DE TEXTO =====
interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    size?: 'sm' | 'base' | 'lg';
    disabled?: boolean;
    className?: string;
    id?: string;
    maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
    value,
    onChange,
    placeholder,
    size = 'base',
    disabled = false,
    className = '',
    id,
    maxLength
}) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        base: 'px-3 py-2',
        lg: 'px-4 py-3 text-lg'
    };

    return (
        <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`
                w-full border border-gray-300 rounded-md text-black
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-colors
                ${sizeClasses[size]}
                ${className}
            `}
        />
    );
};

// ===== COMPONENTE SELECT =====
interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    size?: 'sm' | 'base' | 'lg';
    disabled?: boolean;
    className?: string;
    id?: string;
    placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    size = 'base',
    disabled = false,
    className = '',
    id,
    placeholder
}) => {
    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        base: 'px-4 py-3',
        lg: 'px-5 py-4 text-lg'
    };

    return (
        <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`
                w-full border border-gray-300 rounded-md text-black
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-colors bg-white
                ${sizeClasses[size]}
                ${className}
            `}
        >
            {placeholder && (
                <option value="" disabled>
                    {placeholder}
                </option>
            )}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

// ===== COMPONENTE TEXTAREA =====
interface TextAreaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    size?: 'sm' | 'base' | 'lg';
    disabled?: boolean;
    className?: string;
    id?: string;
    maxLength?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
    value,
    onChange,
    placeholder,
    rows = 3,
    size = 'base',
    disabled = false,
    className = '',
    id,
    maxLength
}) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        base: 'px-3 py-2',
        lg: 'px-4 py-3 text-lg'
    };

    return (
        <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            maxLength={maxLength}
            className={`
                w-full border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-colors resize-vertical
                ${sizeClasses[size]}
                ${className}
            `}
        />
    );
};

// ===== COMPONENTE CAMPO COMPLETO (LABEL + INPUT) =====
interface FieldProps {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    hint?: string;
    labelColor?: 'gray' | 'blue' | 'green' | 'red' | 'purple';
    className?: string;
    id?: string;
}

export const Field: React.FC<FieldProps> = ({
    label,
    children,
    required = false,
    error,
    hint,
    labelColor = 'gray',
    className = '',
    id
}) => {
    return (
        <div className={className}>
            <Label
                htmlFor={id}
                color={error ? 'red' : labelColor}
                required={required}
            >
                {label}
            </Label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="mt-1 text-xs text-gray-500">
                    {hint}
                </p>
            )}
        </div>
    );
};

// ===== TIPOS PARA OPCIONES DE SOPORTE =====
export const SOPORTE_OPTIONS: SelectOption[] = [
    { value: 'simple', label: 'Simple' },
    { value: 'roller', label: 'Rodillo' },
    { value: 'fixed', label: 'Empotrado' }
];

// ===== COMPONENTE GRID PARA FORMULARIOS =====
interface FormGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: 'sm' | 'base' | 'lg';
    className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
    children,
    columns = 3,
    gap = 'base',
    className = ''
}) => {
    const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
        6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
    };

    const gapClasses = {
        sm: 'gap-2',
        base: 'gap-3',
        lg: 'gap-4'
    };

    return (
        <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    );
};