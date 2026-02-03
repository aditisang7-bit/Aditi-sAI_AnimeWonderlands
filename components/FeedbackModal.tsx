import React, { useState } from 'react';
import { Star, MessageSquare, Send, X, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, toolName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('feedbacks').insert({
          user_id: user.id,
          tool_used: toolName,
          rating: rating,
          comment: comment
        });
      }
      
      setIsSent(true);
      setTimeout(() => {
        onClose();
        // Reset for next time
        setTimeout(() => {
            setIsSent(false);
            setRating(0);
            setComment('');
        }, 500);
      }, 1500);

    } catch (error) {
      console.error("Feedback error", error);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0 pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
      
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-6 relative pointer-events-auto shadow-2xl animate-fade-in-up transform transition-all">
        
        {isSent ? (
           <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 animate-bounce">
                 <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Thank You!</h3>
              <p className="text-slate-400 text-sm mt-2">Your feedback helps us improve.</p>
           </div>
        ) : (
           <>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
                </button>

                <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white">How was the result?</h3>
                <p className="text-xs text-slate-400">Rate your {toolName} experience</p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-full transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-700'}`}
                    >
                    <Star size={32} fill={rating >= star ? "currentColor" : "none"} strokeWidth={rating >= star ? 0 : 1.5} />
                    </button>
                ))}
                </div>

                <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any suggestions? (Optional)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-purple-500 focus:outline-none resize-none mb-4 h-24"
                />

                <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>
           </>
        )}
      </div>
    </div>
  );
};