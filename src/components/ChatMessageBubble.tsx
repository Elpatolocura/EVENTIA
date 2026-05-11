import React, { useState, useRef } from 'react';
import {
  Reply, Copy, Forward, Trash2, ShieldAlert,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ChatMessageBubbleProps {
  msg: any;
  appearance: any;
  openUserProfile: (userId: string) => void;
  openImageViewer: (images: string[], index: number) => void;
  onDelete: (msgId: string) => void;
  onReply: (msg: any) => void;
  onScrollToMessage: (msgId: string) => void;
  onProfileLongPress: (userId: string) => void;
}

const ChatMessageBubble = React.memo(({
  msg,
  appearance,
  openUserProfile,
  openImageViewer,
  onDelete,
  onReply,
  onScrollToMessage,
  onProfileLongPress,
}: ChatMessageBubbleProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const images = msg.images || [];
  const isLongMessage = msg.text && msg.text.length > 280;
  const displayText = isExpanded ? msg.text : (msg.text?.slice(0, 280) + (isLongMessage ? '...' : ''));

  const timerRef = useRef<any>(null);
  const handleStart = () => {
    timerRef.current = setTimeout(() => {
      onProfileLongPress(msg.sender_id);
    }, 500);
  };
  const handleEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className={`flex items-end gap-3 mb-4 ${msg.isMe ? 'flex-row-reverse' : ''} group animate-in slide-in-from-bottom-2 duration-300`}>
      {!msg.isMe && (
        <div
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onClick={() => openUserProfile(msg.sender_id)}
          className="w-11 h-11 rounded-[20px] overflow-hidden shadow-lg border-2 border-white shrink-0 mb-1 active:scale-95 active:opacity-80 transition-all cursor-pointer"
        >
          <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover select-none pointer-events-none" loading="lazy" />
        </div>
      )}
      <div className={`flex flex-col gap-1.5 max-w-[78%] min-w-0 ${msg.isMe ? 'items-end' : ''}`}>
        {!msg.isMe && (
          <span className="text-[10px] font-black text-slate-400 ml-3 uppercase tracking-widest">
            {msg.user}
          </span>
        )}

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={`rounded-[24px] text-[13px] font-medium leading-relaxed shadow-sm break-words overflow-hidden relative z-10 select-none cursor-pointer min-w-0 max-w-full transition-colors duration-500 ${
                msg.isMe
                ? 'rounded-br-sm shadow-primary/10'
                : 'rounded-bl-sm border border-border/50'
              }`}
              style={{
                backgroundColor: msg.isMe ? appearance.myBubbleColor : appearance.otherBubbleColor,
                color: msg.isMe ? appearance.textColor : appearance.otherTextColor
              }}
            >

          {msg.replyTo && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onScrollToMessage(msg.replyTo.id);
              }}
              className={`p-2.5 m-2 mb-0 rounded-xl text-[11px] border-l-[3px] overflow-hidden flex flex-col min-w-0 cursor-pointer hover:opacity-80 transition-opacity`}
              style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderLeftColor: msg.isMe ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                color: 'inherit',
                opacity: 0.8
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1 h-1 rounded-full ${msg.isMe ? 'bg-white/50' : 'bg-primary'}`}></div>
                <span className={`font-black uppercase tracking-widest text-[9px] opacity-70`}>
                  {msg.replyTo.user || (msg.replyTo.isMe ? t('chat_room.you') : 'Usuario')}
                </span>
              </div>
              <span className="truncate italic opacity-80 leading-snug">
                {msg.replyTo.text || 'Archivo multimedia'}
              </span>
            </div>
          )}

          {(images.length > 0 || msg.video) && (
            <div className="p-1.5 flex flex-col gap-1.5 relative group/media">
              {images.length > 0 && (
                <div className={`overflow-hidden rounded-2xl ${images.length > 1 ? 'grid grid-cols-2 gap-1.5 w-[240px] sm:w-[260px]' : ''}`}>
                  {images.map((img: string, idx: number) => (
                    <button
                      key={`${msg.id}-img-${idx}`}
                      onClick={() => openImageViewer(images, idx)}
                      className="w-full block transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      <img src={img} alt="Attachment" loading="lazy" className={`${images.length > 1 ? 'aspect-square object-cover w-full' : 'w-[240px] sm:w-[260px] max-w-full h-auto object-cover rounded-2xl'}`} />
                    </button>
                  ))}
                </div>
              )}

              {msg.video && (
                <div className="overflow-hidden rounded-2xl bg-black shadow-inner">
                  <video src={msg.video} controls className="w-[240px] sm:w-[260px] max-w-full max-h-[300px] object-contain" />
                </div>
              )}

              {!msg.text && (
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 opacity-0 group-hover/media:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{msg.time}</span>
                  {msg.isMe && <span className="text-primary text-[10px] font-black">✓✓</span>}
                </div>
              )}
            </div>
          )}

          {msg.text && (
            <div className={`px-4 py-3 sm:px-5 sm:py-3.5 ${(images.length > 0 || msg.video) ? 'pt-1 sm:pt-1.5' : ''} flex flex-col`}>
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {displayText}
              </div>

              <div className="flex items-center justify-end gap-1.5 mt-1 -mr-1">
                <span className={`text-[9px] font-black uppercase tracking-widest opacity-60`}>
                  {msg.time}
                </span>
                {msg.isMe && <span className="text-[10px] font-black opacity-80">✓✓</span>}
              </div>

              {isLongMessage && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`mt-2 block text-[10px] font-black uppercase tracking-widest transition-colors text-left opacity-70 hover:opacity-100`}
                >
                  {isExpanded ? t('chat_room.view_less') : t('chat_room.view_more')}
                </button>
              )}
            </div>
          )}
        </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56 rounded-2xl border-border bg-card shadow-xl p-2">
            <ContextMenuItem
              onClick={() => onReply(msg)}
              className="px-4 py-2.5 rounded-xl hover:bg-secondary focus:bg-secondary cursor-pointer text-[13px] font-bold text-foreground flex items-center gap-3"
            >
              <Reply className="w-4 h-4 text-slate-400" /> {t('chat_room.reply')}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                if (msg.text) {
                  navigator.clipboard.writeText(msg.text);
                  toast.success(t('chat_room.copied'));
                } else {
                  toast.error(t('chat_room.no_text_copy'));
                }
              }}
              className="px-4 py-2.5 rounded-xl hover:bg-secondary focus:bg-secondary cursor-pointer text-[13px] font-bold text-foreground flex items-center gap-3"
            >
              <Copy className="w-4 h-4 text-slate-400" /> {t('chat_room.copy_text')}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => toast.success(t('chat_room.forward_soon'))}
              className="px-4 py-2.5 rounded-xl hover:bg-secondary focus:bg-secondary cursor-pointer text-[13px] font-bold text-foreground flex items-center gap-3"
            >
              <Forward className="w-4 h-4 text-slate-400" /> {t('chat_room.forward')}
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1 bg-border" />

            {msg.isMe ? (
              <ContextMenuItem
                onClick={() => onDelete(msg.id)}
                className="px-4 py-2.5 rounded-xl hover:bg-rose-50 focus:bg-rose-50 cursor-pointer text-[13px] font-bold text-rose-500 flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4" /> {t('common.delete')}
              </ContextMenuItem>
            ) : (
              <ContextMenuItem
                onClick={() => toast.error(t('chat_room.reported'))}
                className="px-4 py-2.5 rounded-xl hover:bg-rose-50 focus:bg-rose-50 cursor-pointer text-[13px] font-bold text-rose-500 flex items-center gap-3"
              >
                <ShieldAlert className="w-4 h-4" /> {t('chat_room.report')}
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
});

export default ChatMessageBubble;