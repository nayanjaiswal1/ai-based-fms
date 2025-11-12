import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format } from 'date-fns';

export const investmentSchema = z.object({
  name: z.string().min(1, 'Investment name is required').max(200),
  type: z.enum(['stock', 'bond', 'mutual_fund', 'etf', 'crypto', 'real_estate', 'other'], {
    required_error: 'Type is required',
  }),
  symbol: z.string().optional(),
  investedAmount: z.number().positive('Invested amount must be greater than 0'),
  currentValue: z.number().positive('Current value must be greater than 0'),
  quantity: z.number().positive().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  notes: z.string().optional(),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;

export function getInvestmentFormConfig(investment?: any): FormConfig<InvestmentFormData> {
  return {
    title: investment ? 'Edit Investment' : 'Add Investment',
    description: 'Track your investment portfolio',
    sections: [
      {
        fields: [
          {
            name: 'name',
            label: 'Investment Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Apple Inc.',
          },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { value: 'stock', label: 'Stock' },
              { value: 'bond', label: 'Bond' },
              { value: 'mutual_fund', label: 'Mutual Fund' },
              { value: 'etf', label: 'ETF' },
              { value: 'crypto', label: 'Cryptocurrency' },
              { value: 'real_estate', label: 'Real Estate' },
              { value: 'other', label: 'Other' },
            ],
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'symbol',
            label: 'Symbol/Ticker',
            type: 'text',
            placeholder: 'e.g., AAPL',
            description: 'Optional: Stock ticker symbol',
          },
          {
            name: 'purchaseDate',
            label: 'Purchase Date',
            type: 'date',
            required: true,
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'investedAmount',
            label: 'Invested Amount',
            type: 'currency',
            required: true,
            placeholder: '0.00',
          },
          {
            name: 'currentValue',
            label: 'Current Value',
            type: 'currency',
            required: true,
            placeholder: '0.00',
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: 'e.g., 100',
            description: 'Optional: Number of shares/units',
          },
        ],
        columns: 3,
      },
      {
        fields: [
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Add any additional notes...',
            rows: 3,
          },
        ],
      },
    ],
    schema: investmentSchema,
    defaultValues: {
      name: investment?.name || '',
      type: investment?.type || 'stock',
      symbol: investment?.symbol || '',
      investedAmount: investment?.investedAmount || 0,
      currentValue: investment?.currentValue || 0,
      quantity: investment?.quantity || undefined,
      purchaseDate: investment?.purchaseDate
        ? format(new Date(investment.purchaseDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      notes: investment?.notes || '',
    },
  };
}
