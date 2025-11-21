import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const loginFormConfig: FormConfig<LoginFormData> = {
  title: 'Welcome Back',
  description: 'Sign in to your account to continue',
  sections: [
    {
      fields: [
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'you@example.com',
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          placeholder: '••••••••',
        },
      ],
    },
  ],
  schema: loginSchema,
  defaultValues: {
    email: '',
    password: '',
  },
};

// Register Schema
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const registerFormConfig: FormConfig<RegisterFormData> = {
  title: 'Create Account',
  description: 'Sign up to start managing your finances',
  sections: [
    {
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          required: true,
          placeholder: 'John',
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          required: true,
          placeholder: 'Doe',
        },
      ],
      columns: 2,
    },
    {
      fields: [
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'you@example.com',
        },
      ],
    },
    {
      fields: [
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          placeholder: '••••••••',
          description: 'At least 6 characters',
        },
        {
          name: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          required: true,
          placeholder: '••••••••',
        },
      ],
      columns: 2,
    },
  ],
  schema: registerSchema,
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
};

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const forgotPasswordFormConfig: FormConfig<ForgotPasswordFormData> = {
  title: 'Reset Password',
  description: 'Enter your email to receive reset instructions',
  sections: [
    {
      fields: [
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'you@example.com',
        },
      ],
    },
  ],
  schema: forgotPasswordSchema,
  defaultValues: {
    email: '',
  },
};

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[\d!@#$%^&*(),.?":{}|<>]/, 'Must contain a number or special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const resetPasswordFormConfig: FormConfig<ResetPasswordFormData> = {
  title: 'Set New Password',
  description: 'Create a strong password for your account',
  sections: [
    {
      fields: [
        {
          name: 'password',
          label: 'New Password',
          type: 'password',
          required: true,
          placeholder: '••••••••',
          description: 'Min 8 chars, uppercase, lowercase, & number/special',
        },
        {
          name: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          required: true,
          placeholder: '••••••••',
        },
      ],
    },
  ],
  schema: resetPasswordSchema,
  defaultValues: {
    password: '',
    confirmPassword: '',
  },
};
