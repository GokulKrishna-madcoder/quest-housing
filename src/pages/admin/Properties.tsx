import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit2, Trash2, X, Upload, Home, MapPin, Filter, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteModal } from '../../components/admin/DeleteModal';
import { toast } from 'sonner';

const PROPERTY_TYPES = ['1 BHK', '2 BHK', '3 BHK', 'Villa', 'PG / Hostel', 'Studio'];
const FURNISHING_OPTS = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
const STATUS_OPTS = ['Available', 'Rented', 'Under Maintenance'];

const emptyForm = {
  title: '', description: '', type: '1 BHK', price: 0, deposit: 0,
  locality: '', pincode: '', furnishing: 'Unfurnished', admin_status: 'Available',
  amenities: '', bhk: 1, bathrooms: 1, area: 0,
};

export default function AdminProperties() {
  type UnifiedImage = 
    | { type: 'existing'; url: string }
    | { type: 'new'; file: File; preview: string; id: string };

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<UnifiedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
    const channel = supabase.channel('public:properties')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, (payload) => {
        if (payload.eventType === 'INSERT') setProperties(c => [payload.new, ...c]);
        else if (payload.eventType === 'UPDATE') setProperties(c => c.map(p => p.id === payload.new.id ? payload.new : p));
        else if (payload.eventType === 'DELETE') setProperties(c => c.filter(p => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchAll() {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (data) setProperties(data);
    setLoading(false);
  }

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setImages([]);
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      title: p.title, description: p.description || '', type: p.type,
      price: p.price, deposit: p.deposit || 0,
      locality: p.locality, pincode: p.pincode || '',
      furnishing: p.furnishing, admin_status: p.admin_status,
      amenities: (p.amenities || []).join(', '),
      bhk: p.bhk || 1, bathrooms: p.bathrooms || 1, area: p.area || 0,
    });
    setImages((p.images || []).map((url: string) => ({ type: 'existing', url })));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.locality || !form.price) {
      toast.error('Title, Location, and Rent are required.');
      return;
    }
    setSaving(true);
    try {
      const finalUrls: string[] = [];
      for (const img of images) {
        if (img.type === 'existing') {
          finalUrls.push(img.url);
        } else {
          const fileName = `${Date.now()}-${img.file.name.replace(/\s+/g, '-')}`;
          const { error: upErr } = await supabase.storage.from('property-images').upload(fileName, img.file);
          if (upErr) throw upErr;
          const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
          finalUrls.push(urlData.publicUrl);
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        price: Number(form.price),
        deposit: Number(form.deposit),
        locality: form.locality,
        pincode: form.pincode,
        furnishing: form.furnishing,
        admin_status: form.admin_status,
        availability_status: form.admin_status,
        amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
        bhk: Number(form.bhk),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        images: finalUrls,
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        const { error } = await supabase.from('properties').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Property updated.');
      } else {
        const { error } = await supabase.from('properties').insert(payload);
        if (error) throw error;
        toast.success('Property added.');
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) toast.error('Delete failed: ' + error.message);
    else toast.success('Property deleted.');
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newArr = [...prev];
      if (newArr[index].type === 'new') {
        URL.revokeObjectURL((newArr[index] as any).preview);
      }
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setImages(prev => {
      const newArr = [...prev];
      if (direction === 'left' && index > 0) {
        [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
      } else if (direction === 'right' && index < newArr.length - 1) {
        [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
      }
      return newArr;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: UnifiedImage[] = files.map(file => ({
      type: 'new',
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const filtered = properties.filter(p =>
    (statusFilter === 'All' || p.admin_status === statusFilter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.locality.toLowerCase().includes(search.toLowerCase()))
  );

  const updateField = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-2">Properties</h2>
          <p className="text-navy/50 text-sm">Manage your property inventory.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
            <input type="text" placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy" />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy appearance-none font-medium text-navy cursor-pointer">
              <option value="All">All</option>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={openAdd}
            className="bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-navy/90 transition-colors cursor-pointer">
            <Plus size={16} /> Add Property
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy/50">Loading properties...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-navy/50">
          <Home size={48} className="mx-auto mb-4 text-navy/20" />
          <p>No properties found. Add your first listing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-navy/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="aspect-video bg-navy/5 overflow-hidden relative">
                {p.images?.length > 0 ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Home size={40} className="text-navy/15" /></div>
                )}
                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                  p.admin_status === 'Available' ? 'bg-green-500 text-white' :
                  p.admin_status === 'Rented' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-navy'
                }`}>{p.admin_status}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-medium text-navy text-lg mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-navy/50 flex items-center gap-1 mb-3"><MapPin size={12} /> {p.locality}</p>
                <p className="text-2xl font-display font-medium text-navy mb-3">₹{p.price?.toLocaleString()}<span className="text-sm text-navy/40 font-normal">/month</span></p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{p.type}</span>
                  <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{p.furnishing}</span>
                  <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{p.bhk} Bed</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-navy bg-navy/5 hover:bg-navy/10 px-3 py-2 rounded transition-colors cursor-pointer">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(p.id)}
                    className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded transition-colors cursor-pointer">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="px-8 py-5 border-b border-navy/10 bg-light flex justify-between items-center">
                  <h3 className="text-xl font-display font-medium text-navy">{editId ? 'Edit Property' : 'Add Property'}</h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-navy/5 rounded-full cursor-pointer"><X size={20} className="text-navy/60" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Title *</label>
                      <input value={form.title} onChange={e => updateField('title', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" placeholder="Modern 2BHK in HSR Layout" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Description</label>
                      <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={3}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg resize-none" placeholder="Spacious apartment with great amenities..." />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Type *</label>
                      <select value={form.type} onChange={e => updateField('type', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg cursor-pointer">
                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Furnishing</label>
                      <select value={form.furnishing} onChange={e => updateField('furnishing', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg cursor-pointer">
                        {FURNISHING_OPTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Rent (₹/month) *</label>
                      <input type="number" value={form.price || ''} onChange={e => updateField('price', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" placeholder="25000" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Deposit (₹)</label>
                      <input type="number" value={form.deposit || ''} onChange={e => updateField('deposit', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" placeholder="50000" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Locality *</label>
                      <input value={form.locality} onChange={e => updateField('locality', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" placeholder="HSR Layout" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Pincode</label>
                      <input value={form.pincode} onChange={e => updateField('pincode', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" placeholder="560102" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">BHK</label>
                      <input type="number" value={form.bhk} onChange={e => updateField('bhk', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Bathrooms</label>
                      <input type="number" value={form.bathrooms} onChange={e => updateField('bathrooms', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Area (sqft)</label>
                      <input type="number" value={form.area || ''} onChange={e => updateField('area', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" placeholder="1200" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Status</label>
                      <select value={form.admin_status} onChange={e => updateField('admin_status', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg cursor-pointer">
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Amenities (comma separated)</label>
                      <input value={form.amenities} onChange={e => updateField('amenities', e.target.value)}
                        className="w-full bg-white border border-navy/15 text-navy text-sm p-3 focus:border-primary focus:outline-none rounded-lg" placeholder="WiFi, Parking, Gym, Power Backup" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">Images</label>
                      <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-navy/20 rounded-lg cursor-pointer hover:bg-navy/5 transition-colors text-sm text-navy/50">
                        <Upload size={16} /> Click to upload images
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {images.map((img, i) => (
                            <div key={img.type === 'existing' ? img.url : img.id} className={`relative w-24 h-16 rounded-lg overflow-hidden group/thumb ${img.type === 'new' ? 'border-2 border-primary' : ''}`}>
                              <img src={img.type === 'existing' ? img.url : img.preview} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                {i > 0 && (
                                  <button onClick={(e) => { e.preventDefault(); moveImage(i, 'left'); }} className="p-1 hover:bg-white/20 rounded text-white cursor-pointer"><ArrowLeft size={14} /></button>
                                )}
                                <button onClick={(e) => { e.preventDefault(); removeImage(i); }} className="p-1 hover:bg-red-500 rounded text-white cursor-pointer"><Trash2 size={14} /></button>
                                {i < images.length - 1 && (
                                  <button onClick={(e) => { e.preventDefault(); moveImage(i, 'right'); }} className="p-1 hover:bg-white/20 rounded text-white cursor-pointer"><ArrowRight size={14} /></button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-8 py-4 border-t border-navy/10 flex justify-end gap-3">
                  <button onClick={() => setShowForm(false)}
                    className="text-navy/50 hover:text-navy text-xs uppercase tracking-widest cursor-pointer px-4 py-2">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-8 py-3 rounded-lg hover:bg-navy/90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all">
                    {saving ? 'Saving…' : editId ? 'Update' : 'Add Property'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)} />
    </motion.div>
  );
}
