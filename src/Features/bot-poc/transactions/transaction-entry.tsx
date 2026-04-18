import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Trash2, Calendar, Save, Bot } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import { BASE_URL } from '@/lib/constants';

// 1. Define Zod Schema for a single row
const transactionSchema = z.object({
  exceptionId: z.number().optional(), // Store the ID for the POST payload
  source_system: z.string().min(1, "Required"),
  txn_date: z.string().min(1, "Required"),
  account_no: z.string().min(1, "Required"),
  product_code: z.string().min(1, "Required"),
  txn_ref: z.string().min(1, "Required"),
  debit: z.coerce.number().min(0, "Must be positive"),
  credit: z.coerce.number().min(0, "Must be positive"),
  currency: z.string().min(1, "Required"),
});

// 2. Define Schema for the entire form
const formSchema = z.object({
  transactions: z.array(transactionSchema).min(1, "At least one transaction is required"),
});

type FormValues = z.infer<typeof formSchema>;

// Default empty state for a new row
const defaultRow = {
  exceptionId: undefined,
  source_system: '',
  txn_date: '',
  account_no: '',
  product_code: '',
  txn_ref: '',
  debit: '' as unknown as number,
  credit: '' as unknown as number,
  currency: 'INR',
};

const CreateTransactionScreen = () => {
  const [isBotTyping, setIsBotTyping] = useState(false);
  const typingRef = useRef(true);

  // 3. Initialize React Hook Form
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactions: [defaultRow],
    },
  });

  // 4. useFieldArray enables dynamic adding/removing of rows
  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

  const watchTransactions = useWatch({
    control,
    name: "transactions",
  });

  // Delay helper for the bot simulation
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 5. Fetch and simulate bot typing on mount
  useEffect(() => {
    typingRef.current = true;

    const fetchAndFillExceptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/exceptions/`);
        const exceptions = response.data.filter((exc: any) => exc.status !== 'HANDLED');

        if (exceptions && exceptions.length > 0) {
          // setIsBotTyping(true);
          // toast("Bot has started filling the form...", { icon: <Bot className="h-5 w-5 text-blue-500" /> });

          // Clear initial default row
          remove(0);

          for (let i = 0; i < exceptions.length; i++) {
            if (!typingRef.current) break; // Stop if unmounted
            const exc = exceptions[i];

            // Format date to YYYY-MM-DD for the date input
            const formattedDate = exc.createdAt ? exc.createdAt.split('T')[0] : '';

            // Add a new blank row
            append(defaultRow);
            await delay(400);

            // Sequentially fill fields to simulate bot typing
            setValue(`transactions.${i}.exceptionId`, exc.id);

            setValue(`transactions.${i}.source_system`, exc.sourceSystem || 'FINACLE', { shouldValidate: true });
            await delay(300);

            setValue(`transactions.${i}.txn_date`, formattedDate, { shouldValidate: true });
            await delay(300);

            setValue(`transactions.${i}.account_no`, exc.accountNo || '', { shouldValidate: true });
            await delay(300);

            setValue(`transactions.${i}.product_code`, 'AL', { shouldValidate: true });
            await delay(300);

            setValue(`transactions.${i}.txn_ref`, exc.txnRef || '', { shouldValidate: true });
            await delay(300);

            setValue(`transactions.${i}.debit`, exc.debit || 0, { shouldValidate: true });
            await delay(300);

            setValue(`transactions.${i}.credit`, exc.credit || 0, { shouldValidate: true });
            await delay(300);

            setValue(`transactions.${i}.currency`, 'INR', { shouldValidate: true });
            await delay(500);
          }

          if (typingRef.current) {
            setIsBotTyping(false);
            // toast.success("Bot finished pre-filling data. Ready for submission.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch exceptions:", error);
        toast.error("Failed to fetch pending exceptions.");
        setIsBotTyping(false);
      }
    };

    fetchAndFillExceptions();

    return () => {
      typingRef.current = false; // Cleanup on unmount
    };
  }, [append, remove, setValue]);

  // 6. Form Submit Handler
  const onSubmit = async (data: FormValues) => {
    try {
      // Map the form data to the specific API payload structure
      const promises = data.transactions.map(txn => {
        const payload = {
          exceptionId: txn.exceptionId,
          txnDate: txn.txn_date, // Already in YYYY-MM-DD format
          debit: txn.debit,
          credit: txn.credit,
          currency: txn.currency
        };

        return axios.post(`${BASE_URL}/api/resolve-missing`, payload);
      });

      // Wait for all rows to submit
      await Promise.all(promises);

      toast.success("Transaction entries resolved successfully!");
      reset({ transactions: [defaultRow] }); // Clear form

    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("An error occurred while resolving the transactions.");
    }
  };

  const headerClasses = "px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider";
  const cellClasses = "px-2 py-2 whitespace-nowrap align-top";

  return (
    <div className="min-h-screen p-2">

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Entry</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add multiple transaction records and submit them all at once.
          </p>
        </div>
        {/* {isBotTyping && (
          <div className="flex items-center gap-2 text-blue-600 animate-pulse font-medium">
            <Bot className="h-5 w-5" />
            <span>Bot is typing...</span>
          </div>
        )} */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto overflow-y-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className={headerClasses} style={{ minWidth: '130px' }}>System</th>
                <th className={headerClasses} style={{ minWidth: '140px' }}>Txn Date</th>
                <th className={headerClasses} style={{ minWidth: '140px' }}>Account No</th>
                <th className={headerClasses} style={{ minWidth: '120px' }}>Product</th>
                <th className={headerClasses} style={{ minWidth: '140px' }}>Txn Ref</th>
                <th className={headerClasses} style={{ minWidth: '110px' }}>Debit</th>
                <th className={headerClasses} style={{ minWidth: '110px' }}>Credit</th>
                <th className={headerClasses} style={{ minWidth: '90px' }}>Currency</th>
                <th className={headerClasses} style={{ minWidth: '120px' }}>Net Amount</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field, index) => {
                const currentTxn = watchTransactions[index] || {};
                const debitVal = Number(currentTxn.debit) || 0;
                const creditVal = Number(currentTxn.credit) || 0;
                const netAmount = creditVal - debitVal;

                const hasError = (fieldName: keyof typeof transactionSchema.shape) =>
                  !!errors.transactions?.[index]?.[fieldName];

                const inputClass = (fieldName: keyof typeof transactionSchema.shape) =>
                  `w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${hasError(fieldName) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } ${isBotTyping ? 'bg-gray-50' : 'bg-white'}`;

                return (
                  <tr key={field.id} className="hover:bg-gray-50/50">

                    <td className={cellClasses}>
                      {/* Added "Bank" option to match potential API sourceSystem response */}
                      <select {...register(`transactions.${index}.source_system`)} disabled={isBotTyping} className={inputClass('source_system')}>
                        <option value="">Select...</option>
                        <option value="FINACLE">FINACLE</option>
                        <option value="ORACLE_GL">ORACLE_GL</option>
                        <option value="PENNANT">PENNANT</option>
                        <option value="Bank">Bank</option>
                      </select>
                    </td>

                    <td className={cellClasses}>
                      <div className="relative">
                        <input type="date" disabled={isBotTyping} {...register(`transactions.${index}.txn_date`)} className={`${inputClass('txn_date')} pl-8`} />
                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </td>

                    <td className={cellClasses}>
                      <input type="text" disabled={isBotTyping} placeholder="LOAN001" {...register(`transactions.${index}.account_no`)} className={inputClass('account_no')} />
                    </td>

                    <td className={cellClasses}>
                      <select {...register(`transactions.${index}.product_code`)} disabled={isBotTyping} className={inputClass('product_code')}>
                        <option value="">Code...</option>
                        <option value="HL">HL</option>
                        <option value="PL">PL</option>
                        <option value="AL">AL</option>
                      </select>
                    </td>

                    <td className={cellClasses}>
                      <input type="text" disabled={isBotTyping} placeholder="TXN1001" {...register(`transactions.${index}.txn_ref`)} className={inputClass('txn_ref')} />
                    </td>

                    <td className={cellClasses}>
                      <input type="number" disabled={isBotTyping} placeholder="0" min="0" {...register(`transactions.${index}.debit`)} className={inputClass('debit')} />
                    </td>

                    <td className={cellClasses}>
                      <input type="number" disabled={isBotTyping} placeholder="0" min="0" {...register(`transactions.${index}.credit`)} className={inputClass('credit')} />
                    </td>

                    <td className={cellClasses}>
                      <select {...register(`transactions.${index}.currency`)} disabled={isBotTyping} className={inputClass('currency')}>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </td>

                    <td className={cellClasses}>
                      <div className={`w-full rounded-md border border-gray-200 bg-gray-100 p-2 text-sm font-semibold cursor-not-allowed ${netAmount < 0 ? 'text-red-600' : netAmount > 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                        {netAmount.toLocaleString()}
                      </div>
                    </td>

                    <td className={`${cellClasses} text-center`}>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => append(defaultRow)}
                          disabled={isBotTyping}
                          className="rounded text-blue-600 hover:bg-blue-100 p-1.5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1 || isBotTyping}
                          className="rounded text-red-500 hover:bg-red-100 p-1.5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Object.keys(errors.transactions || {}).length > 0 && (
          <p className="text-sm font-semibold text-red-500 text-right">
            Please fill in all highlighted fields before submitting.
          </p>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isBotTyping || isSubmitting}
            className="flex items-center gap-2 rounded-md bg-green-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {isSubmitting ? 'Resolving...' : 'Submit Transactions'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTransactionScreen;