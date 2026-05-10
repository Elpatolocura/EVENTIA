import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { 
  ArrowLeft, Bell, BellOff, Pin, PinOff, EyeOff, 
  MessageSquare, History, ShieldAlert, Trash2, 
  ChevronRight, ExternalLink, Image as ImageIcon,
  Check, Info, Share2, Users, Palette, Type, Layout, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Facebook, Copy } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

const ChatRoomSettingsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useSmartBack(`/chat/${id}`);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    isPinned: false,
    isHidden: false,
    persistentMessages: true
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const [appearance, setAppearance] = useState({
    myBubbleColor: '#00c853',
    otherBubbleColor: '#f1f5f9',
    textColor: '#ffffff',
    otherTextColor: '#0f172a',
    backgroundColor: '#ffffff'
  });

  useEffect(() => {
    if (id) {
      // Load appearance
      const savedAppearance = localStorage.getItem(`chat_appearance_${id}`);
      if (savedAppearance) {
        setAppearance(JSON.parse(savedAppearance));
      }
      
      // Load settings
      const savedSettings = localStorage.getItem(`chat_settings_${id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [id]);

  const updateAppearance = (newValues: Partial<typeof appearance>) => {
    const updated = { ...appearance, ...newValues };
    setAppearance(updated);
    if (id) {
      localStorage.setItem(`chat_appearance_${id}`, JSON.stringify(updated));
    }
    // Dispatch custom event for real-time update in ChatRoomPage
    window.dispatchEvent(new Event('chatAppearanceUpdate'));
  };

  useEffect(() => {
    if (!id) return;
    const fetchRoomInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_rooms')
          .select(`
            *,
            events (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data.type === 'event' && data.events) {
          data.name = data.events.title;
          data.avatar = data.events.image_url;
        }
        
        setRoomInfo(data);
      } catch (error) {
        console.error("Error fetching room info", error);
        toast.error("Error al cargar la información del chat");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomInfo();
  }, [id]);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    if (id) {
      localStorage.setItem(`chat_settings_${id}`, JSON.stringify(newSettings));
      // Dispatch event to notify ChatPage or other components that need to re-sort/re-filter
      window.dispatchEvent(new Event('chatSettingsUpdate'));
    }
    toast.success("Ajuste actualizado correctamente");
  };

  const handleClearHistory = async () => {
    if (id) {
      setIsClearing(true);
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const now = new Date().toISOString();
      localStorage.setItem(`chat_clear_timestamp_${id}`, now);
      
      setIsClearing(false);
      setClearSuccess(true);
      
      // Redirect after showing success for a moment
      setTimeout(() => {
        setShowClearConfirm(false);
        navigate('/chat');
      }, 2000);
    }
  };

  const handleReportEvent = () => {
    if (id) {
      navigate(`/report/event/${id}`);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-20">
      {/* Header */}
      <header className="px-6 py-5 bg-background border-b border-border flex items-center gap-4 sticky top-0 z-50">
        <button onClick={goBack} className="p-2.5 rounded-2xl hover:bg-secondary transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-foreground">Ajustes del Chat</h1>
      </header>

      <div className="p-6 space-y-8 max-w-md mx-auto">
        {/* Event Profile Card */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative cursor-pointer group">
                <div className="w-32 h-32 rounded-[40px] overflow-hidden shadow-2xl border-4 border-background group-hover:scale-105 transition-all duration-500 ring-1 ring-border/50">
                  {roomInfo?.avatar ? (
                    <img src={roomInfo.avatar} alt={roomInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white text-4xl font-black">
                      {roomInfo?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-2xl shadow-xl animate-bounce">
                  <ImageIcon className="w-4 h-4" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
              <DialogTitle className="sr-only">Foto del Evento: {roomInfo?.name}</DialogTitle>
              <img src={roomInfo?.avatar} alt={roomInfo?.name} className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl" />
            </DialogContent>
          </Dialog>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight">{roomInfo?.name}</h2>
            <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Chat del Evento</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-2xl border-border px-6 h-11 gap-2 font-bold"
              onClick={() => navigate(`/event/${roomInfo.event_id}`)}
            >
              <ExternalLink className="w-4 h-4" /> Ver Evento
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-2xl border-border w-11 h-11 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all active:scale-90"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-3xl border-border shadow-xl">
                <DropdownMenuItem 
                  onClick={() => {
                    const url = `https://wa.me/?text=${encodeURIComponent(`¡Únete al chat de ${roomInfo?.name} en Eventia! ${window.location.origin}/chat/${id}`)}`;
                    window.open(url, '_blank');
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold">WhatsApp</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/chat/${id}`)}`;
                    window.open(url, '_blank');
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center">
                    <Facebook className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold">Facebook</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/chat/${id}`);
                    toast.success("Enlace copiado al portapapeles");
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer focus:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Copy className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-bold">Copiar Enlace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 mb-2">Apariencia del Chat</h3>
          <div className="bg-card rounded-[32px] border border-border p-6 shadow-sm space-y-6">
            
            {/* Color Pickers Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* My Bubble Color */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Mi Burbuja</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 rounded-2xl border-2 border-border/50 flex items-center justify-between px-4 hover:border-primary/30 transition-all group">
                      <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: appearance.myBubbleColor }}></div>
                      <Palette className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 rounded-3xl border-border shadow-2xl">
                    <div className="grid grid-cols-5 gap-2">
                      {['#00c853', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#6366f1', '#0f172a'].map(color => (
                        <button 
                          key={color}
                          onClick={() => updateAppearance({ myBubbleColor: color })}
                          className="w-10 h-10 rounded-xl transition-all active:scale-90 hover:scale-110 shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {appearance.myBubbleColor === color && <Check className="w-4 h-4 text-white mx-auto" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Other Bubble Color */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Otras Burbujas</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 rounded-2xl border-2 border-border/50 flex items-center justify-between px-4 hover:border-primary/30 transition-all group">
                      <div className="w-6 h-6 rounded-lg shadow-inner border border-border/20" style={{ backgroundColor: appearance.otherBubbleColor }}></div>
                      <Palette className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 rounded-3xl border-border shadow-2xl">
                    <div className="grid grid-cols-5 gap-2">
                      {['#f1f5f9', '#e2e8f0', '#ffedd5', '#fee2e2', '#f3e8ff', '#fce7f3', '#ecfeff', '#d1fae5', '#e0e7ff', '#ffffff'].map(color => (
                        <button 
                          key={color}
                          onClick={() => updateAppearance({ otherBubbleColor: color, otherTextColor: color === '#ffffff' || color === '#f1f5f9' ? '#0f172a' : '#1e293b' })}
                          className="w-10 h-10 rounded-xl border border-border/10 transition-all active:scale-90 hover:scale-110 shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {appearance.otherBubbleColor === color && <Check className="w-4 h-4 text-slate-500 mx-auto" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Color de Texto</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 rounded-2xl border-2 border-border/50 flex items-center justify-between px-4 hover:border-primary/30 transition-all group">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center border border-border/20" style={{ backgroundColor: appearance.textColor }}>
                        <Type className="w-3 h-3 text-slate-400" />
                      </div>
                      <Palette className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 rounded-3xl border-border shadow-2xl">
                    <div className="grid grid-cols-5 gap-2">
                      {['#ffffff', '#f8fafc', '#e2e8f0', '#0f172a', '#1e293b', '#334155', '#ecfeff', '#fffbeb', '#f0fdf4', '#000000'].map(color => (
                        <button 
                          key={color}
                          onClick={() => updateAppearance({ textColor: color })}
                          className="w-10 h-10 rounded-xl border border-border/10 transition-all active:scale-90 hover:scale-110 shadow-sm flex items-center justify-center"
                          style={{ backgroundColor: color }}
                        >
                          <Type className={`w-3 h-3 ${color === '#ffffff' || color.startsWith('#f') ? 'text-slate-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Fondo</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 rounded-2xl border-2 border-border/50 flex items-center justify-between px-4 hover:border-primary/30 transition-all group">
                      <div className="w-6 h-6 rounded-lg shadow-inner border border-border/20" style={{ backgroundColor: appearance.backgroundColor }}>
                        <Layout className="w-3 h-3 text-slate-400" />
                      </div>
                      <Palette className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 rounded-3xl border-border shadow-2xl">
                    <div className="grid grid-cols-5 gap-2">
                      {['#ffffff', '#f8fafc', '#f1f5f9', '#0f172a', '#111827', '#020617', '#ecfeff', '#fffbeb', '#f0fdf4', '#faf5ff'].map(color => (
                        <button 
                          key={color}
                          onClick={() => updateAppearance({ backgroundColor: color })}
                          className="w-10 h-10 rounded-xl border border-border/10 transition-all active:scale-90 hover:scale-110 shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {appearance.backgroundColor === color && <Check className={`w-4 h-4 mx-auto ${color === '#ffffff' || color.startsWith('#f') ? 'text-slate-400' : 'text-white'}`} />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Preview Section */}
            <div className="pt-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1">Vista Previa</p>
              <div className="rounded-2xl p-4 space-y-3 transition-colors duration-500" style={{ backgroundColor: appearance.backgroundColor }}>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-none p-3 shadow-sm transition-colors duration-500" style={{ backgroundColor: appearance.otherBubbleColor, color: appearance.otherTextColor }}>
                    <p className="text-[12px] font-medium leading-relaxed">¡Hola! ¿Cómo estás?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-none p-3 shadow-sm transition-colors duration-500" style={{ backgroundColor: appearance.myBubbleColor, color: appearance.textColor }}>
                    <p className="text-[12px] font-medium leading-relaxed">¡Todo bien! Me encanta el nuevo diseño.</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                updateAppearance({
                  myBubbleColor: '#00c853',
                  otherBubbleColor: '#f1f5f9',
                  textColor: '#ffffff',
                  otherTextColor: '#0f172a',
                  backgroundColor: '#ffffff'
                });
                toast.success("Apariencia restablecida");
              }}
              className="w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              Restablecer valores
            </button>
          </div>
        </div>

        {/* Settings Group */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 mb-2">Preferencia del Chat</h3>
          <div className="bg-card rounded-[32px] border border-border overflow-hidden divide-y divide-border shadow-sm">
            {/* Notifications */}
            <div className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${settings.notifications ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {settings.notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground leading-none mb-1">Notificaciones</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Recibir avisos de nuevos mensajes</p>
                </div>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={() => toggleSetting('notifications')}
              />
            </div>

            {/* Pin Chat */}
            <div className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${settings.isPinned ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                  {settings.isPinned ? <Pin className="w-5 h-5 fill-amber-500" /> : <PinOff className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground leading-none mb-1">Fijar Chat</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Mantener en la parte superior</p>
                </div>
              </div>
              <Switch 
                checked={settings.isPinned} 
                onCheckedChange={() => toggleSetting('isPinned')}
              />
            </div>

            {/* Hide Chat */}
            <div className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${settings.isHidden ? 'bg-indigo-500/10 text-indigo-500' : 'bg-muted text-muted-foreground'}`}>
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground leading-none mb-1">Ocultar Chat</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Mover a la sección de archivados</p>
                </div>
              </div>
              <Switch 
                checked={settings.isHidden} 
                onCheckedChange={() => toggleSetting('isHidden')}
              />
            </div>

            {/* Persistent Messages */}
            <div className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${settings.persistentMessages ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground leading-none mb-1">Mensajes Persistentes</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Guardar historial para siempre</p>
                </div>
              </div>
              <Switch 
                checked={settings.persistentMessages} 
                onCheckedChange={() => toggleSetting('persistentMessages')}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] px-4 mb-2">Zona de Peligro</h3>
          <div className="bg-rose-500/5 rounded-[32px] border border-rose-500/10 overflow-hidden divide-y divide-rose-500/10 shadow-sm">
            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
              <DialogTrigger asChild>
                <button 
                  className="w-full p-4 flex items-center gap-4 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-rose-600 leading-none mb-1">Vaciar Mensajes</p>
                    <p className="text-[11px] text-rose-500/60 font-medium">Eliminar todo el historial para ti</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-rose-500/30 ml-auto" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[350px] rounded-[40px] p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
                {!clearSuccess ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[36px] bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 animate-pulse">
                      <Trash2 className="w-12 h-12" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">¿Estás seguro?</DialogTitle>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 font-bold leading-relaxed mb-10 px-2">
                      Esta acción ocultará permanentemente todos los mensajes actuales del chat <span className="text-rose-500 underline decoration-2">solo para ti</span>.
                    </p>
                    <div className="flex flex-col gap-3 w-full">
                      <Button 
                        variant="destructive"
                        disabled={isClearing}
                        onClick={handleClearHistory}
                        className="w-full h-16 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2"
                      >
                        {isClearing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Vaciando...
                          </>
                        ) : 'Sí, vaciar historial'}
                      </Button>
                      <Button 
                        variant="ghost"
                        disabled={isClearing}
                        onClick={() => setShowClearConfirm(false)}
                        className="w-full h-16 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        No, cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-4 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 shadow-inner shadow-emerald-500/20">
                      <Check className="w-12 h-12 stroke-[3px] animate-in zoom-in spin-in-90 duration-700" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">¡Vaciado con éxito!</DialogTitle>
                    <p className="text-[15px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.1em] mb-2">
                      Operación satisfecha
                    </p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      El historial ha sido eliminado correctamente de tu vista local. Redirigiendo...
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <button 
              onClick={handleReportEvent}
              className="w-full p-4 flex items-center gap-4 hover:bg-rose-500/10 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-rose-600 leading-none mb-1">Reportar Evento</p>
                <p className="text-[11px] text-rose-500/60 font-medium">Si detectas contenido inapropiado</p>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-500/30 ml-auto" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col items-center text-center p-4">
          <div className="flex items-center gap-2 text-muted-foreground/40 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{roomInfo?.participants_count || 0} Participantes</span>
          </div>
          <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
            Este es un chat cifrado de extremo a extremo.<br />Solo los asistentes confirmados tienen acceso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomSettingsPage;
