import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { allCategories, categoryEmojis } from '@/data/mockData';
import { Check, Sparkles, X, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { colombiaCities, type ColombiaCity } from '@/data/colombiaData';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: ''
  });

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState<ColombiaCity[]>(colombiaCities);

  useEffect(() => {
    const filtered = colombiaCities.filter(city => 
      city.name.toLowerCase().includes(citySearch.toLowerCase()) || 
      city.department.toLowerCase().includes(citySearch.toLowerCase())
    );
    setFilteredCities(filtered.slice(0, 50)); // Limit to 50 for performance
  }, [citySearch]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const user = session.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        let phoneValue = user.user_metadata?.phone || profile?.phone || '';
        // If phone doesn't have +57, we add it for the UI
        if (phoneValue && !phoneValue.startsWith('+57')) {
          phoneValue = phoneValue.replace(/^\+?/, '+57 ');
        }

        setFormData({
          full_name: profile?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: phoneValue,
          location: user.user_metadata?.location || profile?.location || '',
          bio: profile?.bio || user.user_metadata?.bio || '',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || ''
        });

        if (profile?.preferences) {
          setSelectedPreferences(profile.preferences);
        } else if (user.user_metadata?.preferences) {
          setSelectedPreferences(user.user_metadata.preferences);
        }

        // Check premium status
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        setIsPremium(subs && subs.length > 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Usar FileReader para mostrar y guardar la imagen en Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
      toast.success('Foto actualizada (Recuerda guardar)');
    };
    reader.readAsDataURL(file);
  };

  const togglePreference = (category: string) => {
    if (selectedPreferences.includes(category)) {
      setSelectedPreferences(selectedPreferences.filter(c => c !== category));
    } else {
      setSelectedPreferences([...selectedPreferences, category]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      // 1. Save EVERYTHING to the profiles table (source of truth for ProfilePage)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          preferences: selectedPreferences,
          tags: selectedPreferences, // Keep tags in sync for backward compatibility
          location: formData.location,
          phone: formData.phone,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error('Error saving to profiles:', profileError);
        throw new Error('No se pudo actualizar el perfil en la base de datos');
      }

      // 2. Also update user_metadata for session consistency
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.full_name, 
          avatar_url: formData.avatar_url,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          preferences: selectedPreferences
        }
      });

      if (authError) throw authError;

      // Dispatch event for ProfilePage to refresh
      window.dispatchEvent(new Event('profile-updated'));

      toast.success('Perfil actualizado correctamente');
      setTimeout(() => goBack(), 500);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Error al actualizar el perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const improveBioWithAI = async () => {
    if (!isPremium) {
      toast.error('Esta función es exclusiva para usuarios Premium', {
        action: {
          label: 'Ver Planes',
          onClick: () => navigate('/premium')
        },
        duration: 5000
      });
      return;
    }

    if (!formData.bio) {
      toast.error('Escribe algo primero para poder mejorar la biografía');
      return;
    }

    setIsAiLoading(true);
    
    // Simulating AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const improvements = [
      `Apasionado por la vida y los eventos únicos. Siempre buscando nuevas experiencias y personas increíbles con quienes compartir momentos inolvidables. ✨`,
      `Entusiasta de la cultura y el entretenimiento. Me encanta descubrir lugares nuevos, asistir a los mejores eventos de la ciudad y conectar con la comunidad local. 🚀`,
      `Organizador y asistente frecuente. Mi objetivo es aprovechar al máximo cada oportunidad social y vivir experiencias que valgan la pena contar. 💎`,
      `Explorador de eventos locales. Especializado en encontrar los planes más exclusivos y disfrutar de la mejor energía de la ciudad junto a gente con mis mismos intereses.`
    ];

    const randomImp = improvements[Math.floor(Math.random() * improvements.length)];
    setFormData(prev => ({ ...prev, bio: randomImp }));
    setIsAiLoading(false);
    toast.success('Biografía mejorada con IA');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Información Personal</h1>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="sm"
          className="rounded-xl px-4 gap-2 font-bold"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar
        </Button>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          <input 
            type="file" 
            id="avatar-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoUpload}
          />
          <div 
            onClick={() => document.getElementById('avatar-upload')?.click()}
            className="relative w-28 h-28 rounded-full bg-secondary border-4 border-background shadow-lg flex items-center justify-center overflow-hidden cursor-pointer group"
          >
            {formData.avatar_url ? (
              <img src={formData.avatar_url} loading="lazy" alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 flex justify-center group-hover:bg-black/60 transition-colors">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium">Toca para cambiar la foto</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent text-muted-foreground cursor-not-allowed opacity-70"
              />
            </div>
            <p className="text-[10px] text-muted-foreground px-1">El correo no se puede cambiar por seguridad.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Teléfono</Label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-2 pointer-events-none">
                <span className="text-lg">🇨🇴</span>
                <span className="text-sm font-bold text-foreground">+57</span>
                <div className="w-[1px] h-4 bg-border ml-1" />
              </div>
              <Input 
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone.replace('+57 ', '').replace('+57', '')}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: val ? `+57 ${val}` : '' });
                }}
                placeholder="300 123 4567"
                className="pl-20 h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary/20 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="location" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ubicación (Colombia)</Label>
            <div 
              className="relative cursor-pointer"
              onClick={() => setShowCitySelector(true)}
            >
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <div className="w-full pl-10 pr-10 h-12 flex items-center rounded-xl bg-secondary/50 border-transparent text-sm font-medium">
                {formData.location || "Selecciona tu ciudad"}
              </div>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            <AnimatePresence>
              {showCitySelector && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-sm bg-background rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
                  >
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Selecciona tu Ciudad</h3>
                        <button 
                          onClick={() => setShowCitySelector(false)}
                          className="p-2 rounded-full hover:bg-muted"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          autoFocus
                          placeholder="Buscar ciudad o departamento..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="pl-10 h-11 rounded-xl bg-secondary/50 border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city, idx) => (
                          <button
                            key={`${city.name}-${idx}`}
                            onClick={() => {
                              setFormData({ ...formData, location: `${city.name}, ${city.department}` });
                              setShowCitySelector(false);
                              setCitySearch('');
                            }}
                            className={`w-full flex flex-col items-start p-3 rounded-2xl transition-colors hover:bg-primary/10 ${
                              formData.location === `${city.name}, ${city.department}` ? 'bg-primary/5 border border-primary/20' : ''
                            }`}
                          >
                            <span className="font-bold text-sm">{city.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{city.department}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground italic">
                          No encontramos esa ciudad...
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="bio" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Biografía</Label>
              <button 
                onClick={improveBioWithAI}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                IA Mejorar
              </button>
            </div>
            <textarea 
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos un poco sobre ti..."
              rows={4}
              className="w-full p-4 rounded-xl bg-secondary/50 border-transparent focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none transition-all"
            />
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Tus Intereses
            </Label>
            <span className="text-[10px] font-bold text-primary">Mín. 3</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {allCategories.map((category) => (
              <motion.button
                key={category}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePreference(category)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedPreferences.includes(category)
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                <span className="text-lg">{categoryEmojis[category]}</span>
                <span className="text-[11px] font-bold capitalize">{category}</span>
                {selectedPreferences.includes(category) && (
                  <Check className="w-3.5 h-3.5 ml-auto" />
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="pt-2">
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${Math.min((selectedPreferences.length / 3) * 100, 100)}%` }}
                className={`h-full ${selectedPreferences.length >= 3 ? 'bg-green-500' : 'bg-primary'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
