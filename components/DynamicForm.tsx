'use client';

import { useState, useEffect } from 'react';

interface FormField {
    id: string;
    fieldKey: string;
    label: string;
    type: string;
    placeholder?: string;
    helpText?: string;
    defaultValue?: string;
    options?: string[];
    validation?: any;
}

interface DynamicFormProps {
    formType?: string;
    values?: Record<string, any>;
    onChange?: (fieldKey: string, value: any) => void;
    readOnly?: boolean;
    userRole?: 'ADMIN' | 'COORDINATOR';
}

export default function DynamicForm({
    formType = 'service',
    values = {},
    onChange,
    readOnly = false,
    userRole = 'COORDINATOR'
}: DynamicFormProps) {
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(true);
    const [localValues, setLocalValues] = useState<Record<string, any>>(values);

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch(`/api/admin/formfields?formType=${formType}`);
                const data = await res.json();
                setFields(data);

                // Set default values
                const defaults: Record<string, any> = {};
                data.forEach((field: FormField) => {
                    if (field.defaultValue && !values[field.fieldKey]) {
                        defaults[field.fieldKey] = field.defaultValue;
                    }
                });
                setLocalValues({ ...defaults, ...values });
            } catch (err) {
                console.error('Failed to load form fields:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, [formType, values]);

    const handleChange = (fieldKey: string, value: any) => {
        setLocalValues(prev => ({ ...prev, [fieldKey]: value }));
        onChange?.(fieldKey, value);
    };

    const renderField = (field: FormField) => {
        const value = localValues[field.fieldKey] ?? '';

        switch (field.type) {
            case 'TEXT':
                return (
                    <input
                        type="text"
                        className="form-input"
                        value={value}
                        onChange={e => handleChange(field.fieldKey, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={readOnly}
                    />
                );

            case 'TEXTAREA':
                return (
                    <textarea
                        className="form-input"
                        rows={4}
                        value={value}
                        onChange={e => handleChange(field.fieldKey, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={readOnly}
                    />
                );

            case 'NUMBER':
                return (
                    <input
                        type="number"
                        className="form-input"
                        value={value}
                        onChange={e => handleChange(field.fieldKey, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={readOnly}
                    />
                );

            case 'DATE':
                return (
                    <input
                        type="date"
                        className="form-input"
                        value={value}
                        onChange={e => handleChange(field.fieldKey, e.target.value)}
                        disabled={readOnly}
                    />
                );

            case 'DATETIME':
                return (
                    <input
                        type="datetime-local"
                        className="form-input"
                        value={value}
                        onChange={e => handleChange(field.fieldKey, e.target.value)}
                        disabled={readOnly}
                    />
                );

            case 'SELECT':
                return (
                    <select
                        className="form-input"
                        value={value}
                        onChange={e => handleChange(field.fieldKey, e.target.value)}
                        disabled={readOnly}
                    >
                        <option value="">{field.placeholder || 'Seçiniz...'}</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case 'MULTISELECT':
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div className="multiselect-container">
                        {field.options?.map(opt => (
                            <label key={opt} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(opt)}
                                    onChange={e => {
                                        const newValues = e.target.checked
                                            ? [...selectedValues, opt]
                                            : selectedValues.filter(v => v !== opt);
                                        handleChange(field.fieldKey, newValues);
                                    }}
                                    disabled={readOnly}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                );

            case 'CHECKBOX':
                return (
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={e => handleChange(field.fieldKey, e.target.checked)}
                            disabled={readOnly}
                        />
                        {field.placeholder || 'Evet'}
                    </label>
                );

            case 'RADIO':
                return (
                    <div className="radio-group">
                        {field.options?.map(opt => (
                            <label key={opt} className="radio-label">
                                <input
                                    type="radio"
                                    name={field.fieldKey}
                                    value={opt}
                                    checked={value === opt}
                                    onChange={e => handleChange(field.fieldKey, e.target.value)}
                                    disabled={readOnly}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                );

            case 'FILE':
                return (
                    <input
                        type="file"
                        className="form-input"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleChange(field.fieldKey, file.name);
                            }
                        }}
                        disabled={readOnly}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        className="form-input"
                        value={value}
                        onChange={e => handleChange(field.fieldKey, e.target.value)}
                        disabled={readOnly}
                    />
                );
        }
    };

    if (loading) {
        return <div className="loading">⏳ Alanlar yükleniyor...</div>;
    }

    if (fields.length === 0) {
        return null;
    }

    return (
        <div className="dynamic-form">
            <h4 className="form-section-title">📋 Ek Bilgiler</h4>
            {fields.map(field => (
                <div key={field.id} className="form-group">
                    <label className="form-label">
                        {field.label}
                    </label>
                    {renderField(field)}
                    {field.helpText && (
                        <small className="help-text">{field.helpText}</small>
                    )}
                </div>
            ))}

            <style jsx>{`
                .dynamic-form {
                    margin-top: var(--space-lg);
                    padding-top: var(--space-lg);
                    border-top: 1px solid var(--color-border);
                }

                .form-section-title {
                    margin-bottom: var(--space-md);
                    color: var(--color-text-muted);
                }

                .multiselect-container,
                .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-xs);
                }

                .checkbox-label,
                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    cursor: pointer;
                }

                .checkbox-label input,
                .radio-label input {
                    width: 18px;
                    height: 18px;
                }

                .help-text {
                    display: block;
                    margin-top: 4px;
                    color: var(--color-text-muted);
                    font-size: 0.85rem;
                }

                .loading {
                    text-align: center;
                    padding: var(--space-md);
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
}

// Export helper to get all form values
export function getFormValues(formType: string): Record<string, any> {
    // This would be called from parent component to get all custom field values
    // The actual values are managed by parent via onChange callback
    return {};
}
