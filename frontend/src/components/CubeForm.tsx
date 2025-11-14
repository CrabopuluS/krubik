import { FormEvent, useCallback, useMemo, useState } from 'react';

const ALLOWED_CHARS = new Set(['U', 'D', 'F', 'B', 'L', 'R']);

const normalize = (value: string) => value.replace(/\s+/g, '').toUpperCase();

type CubeFormProps = {
  onSubmit: (state: string) => Promise<void>;
  isLoading: boolean;
};

type ValidationResult = {
  normalized: string;
  errors: string[];
};

const validate = (raw: string): ValidationResult => {
  const normalized = normalize(raw);
  const errors: string[] = [];

  if (normalized.length !== 54) {
    errors.push(`Строка должна содержать 54 символа, получено ${normalized.length}.`);
  }

  const invalidCharacters = Array.from(new Set(normalized)).filter(
    (char) => !ALLOWED_CHARS.has(char),
  );
  if (invalidCharacters.length > 0) {
    errors.push(`Недопустимые символы: ${invalidCharacters.join(', ')}.`);
  }

  ALLOWED_CHARS.forEach((char) => {
    const occurrences = normalized.split(char).length - 1;
    if (occurrences !== 9) {
      errors.push(`Символ ${char} встречается ${occurrences} раз(а); требуется 9.`);
    }
  });

  return { normalized, errors };
};

const CubeForm = ({ onSubmit, isLoading }: CubeFormProps) => {
  const [rawValue, setRawValue] = useState('');
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);

  const { normalized, errors } = useMemo(() => validate(rawValue), [rawValue]);
  const shouldShowLiveErrors = submissionErrors.length > 0 || rawValue.length > 0;
  const displayedErrors = submissionErrors.length > 0 ? submissionErrors : errors;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmissionErrors(errors);
      if (errors.length === 0) {
        await onSubmit(normalized);
      }
    },
    [errors, normalized, onSubmit],
  );

  return (
    <form className="cube-form" onSubmit={handleSubmit} noValidate data-testid="cube-form">
      <label className="cube-form__label" htmlFor="cube-state">
        Состояние кубика
      </label>
      <textarea
        id="cube-state"
        name="cube-state"
        className={`cube-form__textarea${
          shouldShowLiveErrors && errors.length > 0 ? ' cube-form__textarea--error' : ''
        }`}
        placeholder="Например: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
        value={rawValue}
        onChange={(event) => {
          setRawValue(event.target.value);
          setSubmissionErrors([]);
        }}
        disabled={isLoading}
        aria-invalid={shouldShowLiveErrors && errors.length > 0}
        aria-describedby={
          shouldShowLiveErrors && errors.length > 0 ? 'cube-state-errors' : undefined
        }
      />
      <div className="cube-form__hint">
        Пробелы и переводы строк будут удалены автоматически.
      </div>
      {shouldShowLiveErrors && errors.length > 0 && (
        <ul id="cube-state-errors" className="cube-form__errors">
          {displayedErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <button className="cube-form__submit" type="submit" disabled={isLoading}>
        {isLoading ? 'Решаем…' : 'Решить'}
      </button>
    </form>
  );
};

export default CubeForm;
