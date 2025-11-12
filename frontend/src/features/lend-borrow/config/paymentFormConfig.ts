import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format } from 'date-fns';

export const paymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  date: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export function getPaymentFormConfig(record: any): FormConfig<PaymentFormData> {
  const remaining = record.amount - record.paidAmount;

  return {
    title: 'Record Payment',
    description: `Record a payment for ${record.personName}`,
    sections: [
      {
        fields: [
          {
            name: 'amount',
            label: 'Payment Amount',
            type: 'currency',
            required: true,
            description: `Max: $${remaining.toFixed(2)}`,
          },
          {
            name: 'date',
            label: 'Payment Date',
            type: 'date',
            required: true,
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Add any notes about this payment...',
            rows: 3,
          },
        ],
      },
    ],
    schema: paymentSchema,
    defaultValues: {
      amount: remaining,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  };
}
