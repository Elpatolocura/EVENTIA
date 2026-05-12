import { memo, useRef, useEffect } from 'react';
import ChatMessageBubble from './ChatMessageBubble';

const ChatMessageList = memo(({ messages, appearance, openUserProfile, openImageViewer, onDelete, onReply, onScrollToMessage, onProfileLongPress }: {
  messages: any[];
  appearance: any;
  openUserProfile: (id: string) => void;
  openImageViewer: (imgs: string[], idx: number) => void;
  onDelete: (id: string) => void;
  onReply: (msg: any) => void;
  onScrollToMessage: (id: string) => void;
  onProfileLongPress: (id: string) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" style={{ backgroundColor: appearance.backgroundColor }}>
      {messages.map((msg) => (
        <ChatMessageBubble
          key={msg.id}
          msg={msg}
          appearance={appearance}
          openUserProfile={openUserProfile}
          openImageViewer={openImageViewer}
          onDelete={onDelete}
          onReply={onReply}
          onScrollToMessage={onScrollToMessage}
          onProfileLongPress={onProfileLongPress}
        />
      ))}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
          <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center mb-8">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 className="text-xl font-black text-foreground tracking-tight mb-3">No hay mensajes aún</h3>
          <p className="text-muted-foreground text-[14px] font-medium leading-relaxed max-w-[240px]">Sé el primero en enviar uno. <span className="text-primary font-bold">¡Rompe el hielo!</span></p>
        </div>
      )}
    </div>
  );
});

export default ChatMessageList;