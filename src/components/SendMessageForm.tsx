'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendMessage } from '../lib/api';
import { SendMessageRequest } from '../types';

// Validation schema for sending messages
const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(500, 'Message is too long (max 500 characters)'),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface SendMessageFormProps {
  recipientUsername: string;
  onMessageSent?: () => void;
}

export default function SendMessageForm({ recipientUsername, onMessageSent }: SendMessageFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  });

  const processSubmit = async (data: MessageFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const messageData: SendMessageRequest = {
        content: data.content,
      };
      
      await sendMessage(recipientUsername, messageData);
      setSuccess(true);
      reset(); // Clear the form
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Send Anonymous Message</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Message sent successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Message to {recipientUsername}
          </label>
          <textarea
            id="content"
            rows={4}
            {...register('content')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your anonymous message here..."
            disabled={loading}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}