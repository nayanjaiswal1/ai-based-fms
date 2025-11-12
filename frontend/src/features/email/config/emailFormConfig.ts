import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';

export const emailSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'yahoo'], {
    required_error: 'Provider is required',
  }),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  authMethod: z.enum(['oauth', 'basic'], {
    required_error: 'Authentication method is required',
  }),
  password: z.string().optional(),
}).refine(
  (data) => {
    // If using basic auth, password is required
    if (data.authMethod === 'basic') {
      return !!data.password && data.password.length > 0;
    }
    return true;
  },
  {
    message: 'Password is required for basic authentication',
    path: ['password'],
  }
);

export type EmailFormData = z.infer<typeof emailSchema>;

export function getEmailFormConfig(): FormConfig<EmailFormData> {
  return {
    title: 'Connect Email Account',
    description: 'Link your email account to track expenses from receipts',
    sections: [
      {
        fields: [
          {
            name: 'provider',
            label: 'Email Provider',
            type: 'select',
            required: true,
            options: [
              { value: 'gmail', label: 'Gmail' },
              { value: 'outlook', label: 'Outlook' },
              { value: 'yahoo', label: 'Yahoo' },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'your.email@example.com',
          },
        ],
      },
      {
        fields: [
          {
            name: 'authMethod',
            label: 'Authentication Method',
            type: 'select',
            required: true,
            options: [
              { value: 'oauth', label: 'OAuth (Recommended)' },
              { value: 'basic', label: 'Password/App Password' },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'password',
            label: 'Password or App Password',
            type: 'password',
            required: false,
            description: 'For Gmail, you need to use an App Password. Regular passwords won\'t work.',
            condition: (values) => values.authMethod === 'basic',
          },
        ],
      },
    ],
    schema: emailSchema,
    defaultValues: {
      provider: 'gmail',
      email: '',
      authMethod: 'oauth',
      password: '',
    },
  };
}
