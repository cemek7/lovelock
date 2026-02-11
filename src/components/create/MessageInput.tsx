"use client";

interface MessageInputProps {
  message: string;
  senderName: string;
  onMessageChange: (v: string) => void;
  onNameChange: (v: string) => void;
}

export default function MessageInput({
  message,
  senderName,
  onMessageChange,
  onNameChange,
}: MessageInputProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm text-white/50">
          Your name
        </label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="What should they see you as?"
          maxLength={100}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/50">
          Love message <span className="text-white/20">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Write something they'll see after solving..."
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
        />
        <div className="mt-1 text-right text-xs text-white/15">
          {message.length}/500
        </div>
      </div>
    </div>
  );
}
