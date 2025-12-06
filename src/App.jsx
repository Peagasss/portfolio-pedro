import React, { useState, useEffect } from 'react';
import { 
  Facebook, Twitter, Instagram, ArrowRight, X, ExternalLink, 
  Layers, Smartphone, PenTool, Mail, MapPin, Plus, Trash2, 
  Edit2, Save, Lock, LogOut, User, Grid, Briefcase, Layout, Globe,
  Linkedin, Github, Dribbble, MessageCircle, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORTANTE: Importar o banco de dados ---
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db as firestoreDB } from "./firebaseConfig"; 

// --- CONFIGURAÇÃO ---
const SOCIAL_PLATFORMS = {
  instagram: { icon: Instagram, label: "Instagram" },
  linkedin: { icon: Linkedin, label: "LinkedIn" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  workana: { icon: Briefcase, label: "Workana" },
  behance: { icon: Layout, label: "Behance" },
  dribbble: { icon: Dribbble, label: "Dribbble" },
  github: { icon: Github, label: "GitHub" },
  twitter: { icon: Twitter, label: "X / Twitter" },
  email: { icon: Mail, label: "E-mail (Link)" },
  site: { icon: Globe, label: "Outro Site" }
};

const SERVICE_ICONS = {
  Layers: Layers, Smartphone: Smartphone, PenTool: PenTool,
  Layout: Layout, Briefcase: Briefcase, Grid: Grid
};

const INITIAL_DB = {
  profile: {
    name: "PEDRO HENRIQUE",
    role: "DESIGNER GRÁFICO",
    email: "contato@pedro.design",
    bioTitle: "CRIANDO MARCAS QUE FICAM NA MEMÓRIA.",
    bioText: "Especialista em transformar ideias abstratas em identidades visuais poderosas e funcionais."
  },
  socials: [],
  services: [],
  projects: []
};

// --- COMPONENTES VISUAIS (NAVBAR, MODAL, ETC) MANTIDOS IGUAIS ---
const Navbar = ({ profile }) => (
  <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-6 z-40 bg-[#121214]/90 backdrop-blur-md">
    <div className="flex flex-col leading-none select-none">
      <span className="font-black text-xl text-white tracking-tighter cursor-default">{profile.name}</span>
      <span className="text-[10px] text-purple-400 font-bold tracking-[0.3em] mt-1 uppercase">{profile.role}</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest text-gray-400">
      <a href="#projects" className="hover:text-white transition-all">TRABALHOS</a>
      <a href="#services" className="hover:text-white transition-all">SERVIÇOS</a>
      <a href="#contact" className="px-6 py-2 border border-purple-500/50 rounded-sm text-purple-400 hover:bg-purple-600 hover:text-white transition-all">CONTATO</a>
    </div>
  </nav>
);

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#1e1e24] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white z-10 hover:bg-white/20 transition-colors"><X size={20} /></button>
        <div className="relative h-64 md:h-80 w-full">
          <img src={project.coverImage} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e24] to-transparent"></div>
          <div className="absolute bottom-6 left-6">
            <span className="px-3 py-1 bg-purple-600 text-[10px] font-bold tracking-widest rounded-full text-white mb-3 inline-block">{project.category}</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">{project.title}</h2>
          </div>
        </div>
        <div className="p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 text-gray-300 text-sm leading-relaxed">{project.fullDescription}
            <h4 className="text-white font-bold mt-8 mb-4 border-b border-white/5 pb-2">Galeria do Projeto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.gallery && project.gallery.map((img, i) => (
                <img key={i} src={img} className="rounded w-full h-48 object-cover hover:opacity-90 transition-opacity" />
              ))}
            </div>
          </div>
          <div className="bg-black/20 p-6 rounded-xl h-fit">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Ficha Técnica</h4>
            <div className="space-y-2 text-sm text-gray-300"><p>Ano: {project.year}</p></div>
            <div className="mt-4 flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-1 rounded">#{tag}</span>)}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- PORTFOLIO VIEW ---
const PortfolioView = ({ db, isLoading }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  const renderServiceIcon = (iconName) => {
    const IconComponent = SERVICE_ICONS[iconName] || Layers;
    return <IconComponent size={32} className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" />;
  };

  const renderSocialIcon = (platformKey) => {
    const socialConfig = SOCIAL_PLATFORMS[platformKey] || SOCIAL_PLATFORMS.site;
    const IconComponent = socialConfig.icon;
    return <IconComponent className="text-white" size={20} />;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#121214] flex items-center justify-center"><Loader className="animate-spin text-purple-500" size={40}/></div>;
  }

  return (
    <div className="bg-[#121214] min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white scroll-smooth relative">
      <Navbar profile={db.profile} />
      <AnimatePresence>{selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}</AnimatePresence>

      <section className="min-h-screen flex items-center pt-20 px-8 md:px-20 relative overflow-hidden">
        <div className="w-full md:w-1/2 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-6"><div className="h-[2px] w-10 bg-purple-500"></div><span className="text-purple-400 font-bold tracking-[0.3em] text-xs uppercase">{db.profile.role}</span></div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6">{db.profile.bioTitle}</h1>
            <p className="text-gray-400 max-w-md leading-relaxed mb-8">{db.profile.bioText}</p>
            <a href="#projects" className="inline-flex items-center gap-2 text-white font-bold border-b border-purple-500 pb-1 hover:text-purple-400 transition-colors">VER PORTFOLIO <ArrowRight size={16} /></a>
          </motion.div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full hidden md:flex items-center justify-center opacity-60"><div className="w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[100px] absolute"></div></div>
      </section>

      <section id="projects" className="py-20 px-8 md:px-20">
        <div className="mb-20"><h2 className="text-4xl font-black mb-4">PROJETOS SELECIONADOS</h2><div className="h-1 w-20 bg-purple-600"></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {db.projects.length === 0 && <p className="text-gray-500">Nenhum projeto adicionado ainda.</p>}
          {db.projects.map((project) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group cursor-pointer" onClick={() => setSelectedProject(project)}>
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/3] bg-gray-800 shadow-lg">
                <img src={project.coverImage} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-purple-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><span className="px-6 py-3 bg-white text-black font-bold text-xs tracking-widest rounded-full">VER DETALHES</span></div>
              </div>
              <h3 className="text-2xl font-bold mb-1 group-hover:text-purple-400">{project.title}</h3>
              <span className="text-xs font-bold text-gray-500 tracking-widest">{project.category}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="services" className="py-20 px-8 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {db.services.map((service) => (
            <motion.div key={service.id} whileHover={{ y: -5 }} className="p-8 rounded-2xl bg-[#1e1e24] shadow-lg hover:shadow-purple-500/10 transition-all group">
              {renderServiceIcon(service.icon)}
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-400 text-sm">{service.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" className="py-20 px-8 md:px-20">
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div>
            <h2 className="text-4xl font-black mb-6">VAMOS CONVERSAR?</h2>
            <div className="space-y-6">
              {db.socials && db.socials.map((social) => (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer">
                  <div className="p-3 bg-[#1e1e24] rounded-lg group-hover:bg-purple-600 transition-colors shadow-md">{renderSocialIcon(social.platform)}</div>
                  <div><p className="text-xs text-gray-500 font-bold uppercase group-hover:text-purple-400 transition-colors">{SOCIAL_PLATFORMS[social.platform]?.label || "Link"}</p><p className="text-white group-hover:underline">{social.label}</p></div>
                </a>
              ))}
            </div>
          </div>
          <form className="space-y-6 bg-[#1e1e24] p-8 rounded-2xl shadow-xl">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Envie um email direto</h4>
            <input type="text" className="w-full bg-[#121214] rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600" placeholder="Nome" />
            <input type="email" className="w-full bg-[#121214] rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600" placeholder="Email" />
            <textarea rows="3" className="w-full bg-[#121214] rounded-lg p-3 text-white outline-none resize-none focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600" placeholder="Mensagem"></textarea>
            <button className="w-full py-4 bg-purple-600 font-bold rounded-lg text-xs tracking-widest hover:bg-purple-500 transition-all shadow-lg hover:shadow-purple-500/20">ENVIAR</button>
          </form>
        </div>
      </section>

      <footer className="py-8 text-center bg-[#121214] text-gray-600 text-[10px] tracking-widest relative">
        <p>© {new Date().getFullYear()} {db.profile.name}.</p>
        <a href="?mode=admin" target="_blank" rel="noopener noreferrer" className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 p-2 text-purple-500" title="Acessar Painel Admin"><Lock size={12} /></a>
      </footer>
    </div>
  );
};

// --- ADMIN AREA ---
const AdminArea = ({ db, onUpdateDb }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [editingItem, setEditingItem] = useState(null);
  const [newSocial, setNewSocial] = useState({ platform: 'instagram', label: '', url: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin') setIsAuthenticated(true);
    else alert('Senha incorreta (Dica: admin)');
  };

  const handleLogout = () => window.close();

  // Função centralizada para salvar no Firebase
  const handleSaveToFirebase = async (newData) => {
    setIsSaving(true);
    try {
      // Salva no Firestore
      await setDoc(doc(firestoreDB, "content", "portfolio-data"), newData);
      // Atualiza o estado local para ver a mudança na hora
      onUpdateDb(newData);
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
    setIsSaving(false);
  };

  const handleProfileChange = (e) => {
    const newData = { ...db, profile: { ...db.profile, [e.target.name]: e.target.value } };
    handleSaveToFirebase(newData);
  };

  const addSocial = (e) => {
    e.preventDefault();
    const socialToAdd = { ...newSocial, id: Date.now() };
    const updatedSocials = db.socials ? [...db.socials, socialToAdd] : [socialToAdd];
    const newData = { ...db, socials: updatedSocials };
    handleSaveToFirebase(newData);
    setNewSocial({ platform: 'instagram', label: '', url: '' }); 
  };

  const removeSocial = (id) => {
    const newData = { ...db, socials: db.socials.filter(s => s.id !== id) };
    handleSaveToFirebase(newData);
  };

  const saveProject = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const galleryText = formData.get('gallery') || "";
    const galleryArray = galleryText.split('\n').filter(url => url.trim() !== "");

    const newProject = {
      id: editingItem?.id || Date.now(),
      title: formData.get('title'),
      category: formData.get('category'),
      coverImage: formData.get('coverImage'),
      shortDescription: formData.get('shortDescription'),
      fullDescription: formData.get('fullDescription'),
      year: formData.get('year'),
      gallery: galleryArray,
      tags: formData.get('tags').split(',').map(t => t.trim())
    };
    
    const updatedProjects = editingItem?.id ? db.projects.map(p => p.id === newProject.id ? newProject : p) : [...db.projects, newProject];
    const newData = { ...db, projects: updatedProjects };
    handleSaveToFirebase(newData);
    setEditingItem(null);
  };

  const deleteProject = (id) => { 
    if (window.confirm('Deletar projeto?')) {
      const newData = { ...db, projects: db.projects.filter(p => p.id !== id) };
      handleSaveToFirebase(newData);
    }
  };

  const saveService = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newService = {
      id: editingItem?.id || Date.now(),
      title: formData.get('title'),
      text: formData.get('text'),
      icon: formData.get('icon')
    };
    const updatedServices = editingItem?.id ? db.services.map(s => s.id === newService.id ? newService : s) : [...db.services, newService];
    const newData = { ...db, services: updatedServices };
    handleSaveToFirebase(newData);
    setEditingItem(null);
  };

  const deleteService = (id) => { 
    if (window.confirm('Deletar serviço?')) {
      const newData = { ...db, services: db.services.filter(s => s.id !== id) };
      handleSaveToFirebase(newData);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center text-white">
        <form onSubmit={handleLogin} className="bg-[#1e1e24] p-10 rounded-2xl border border-purple-500/30 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
          <h2 className="text-2xl font-black text-center mb-4 text-purple-500">ADMIN PAINEL</h2>
          <input type="password" autoFocus placeholder="Senha (admin)" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="bg-black/40 border border-white/10 p-3 rounded text-white outline-none focus:border-purple-500 transition-colors" />
          <button className="bg-purple-600 py-3 rounded font-bold hover:bg-purple-500 transition-colors">ENTRAR</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white flex font-sans">
      <aside className="w-64 bg-[#1e1e24] border-r border-white/5 flex flex-col p-6">
        <h2 className="text-xl font-black text-white mb-10 tracking-tighter">ADMIN <span className="text-purple-500">DASHBOARD</span></h2>
        {isSaving && <div className="text-xs text-green-400 font-bold mb-4 animate-pulse">SALVANDO NA NUVEM...</div>}
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('projects'); setEditingItem(null); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'projects' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Briefcase size={18} /> Projetos</button>
          <button onClick={() => { setActiveTab('services'); setEditingItem(null); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'services' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Grid size={18} /> Serviços</button>
          <button onClick={() => { setActiveTab('profile'); setEditingItem(null); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><User size={18} /> Perfil & Social</button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold mt-auto pt-6 border-t border-white/5"><LogOut size={16} /> Sair</button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto h-screen">
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold">Gerenciar Projetos</h1><button onClick={() => setEditingItem({})} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Novo</button></div>
            {editingItem ? (
              <form onSubmit={saveProject} className="bg-[#1e1e24] p-8 rounded-xl border border-white/10 max-w-2xl space-y-4">
                <input name="title" defaultValue={editingItem.title} placeholder="Título" required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" />
                <input name="category" defaultValue={editingItem.category} placeholder="Categoria" required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" />
                <input name="coverImage" defaultValue={editingItem.coverImage} placeholder="Link da Imagem Capa" required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" />
                <textarea name="shortDescription" defaultValue={editingItem.shortDescription} placeholder="Descrição Curta" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" rows="2" />
                <textarea name="fullDescription" defaultValue={editingItem.fullDescription} placeholder="Descrição Completa" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" rows="5" />
                <div className="grid grid-cols-2 gap-4"><input name="year" defaultValue={editingItem.year} placeholder="Ano" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" /><input name="tags" defaultValue={editingItem.tags?.join(', ')} placeholder="Tags" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" /></div>
                
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Imagens da Galeria (Cole um link por linha)</label>
                    <textarea 
                        name="gallery" 
                        defaultValue={editingItem.gallery?.join('\n')} 
                        placeholder="https://imagem1.jpg&#10;https://imagem2.jpg" 
                        className="w-full bg-black/30 p-3 rounded border border-white/10 text-white font-mono text-sm" 
                        rows="5" 
                    />
                </div>

                <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 px-4">Cancelar</button><button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded font-bold">Salvar</button></div>
              </form>
            ) : (
              <div className="grid gap-4">{db.projects.map(p => (<div key={p.id} className="bg-[#1e1e24] p-4 rounded-lg flex justify-between items-center border border-white/5"><div className="flex items-center gap-4"><img src={p.coverImage} className="w-12 h-12 rounded object-cover" /><div><h4 className="font-bold">{p.title}</h4></div></div><div className="flex gap-2"><button onClick={() => setEditingItem(p)} className="p-2 bg-blue-600/20 text-blue-400 rounded"><Edit2 size={16}/></button><button onClick={() => deleteProject(p.id)} className="p-2 bg-red-600/20 text-red-400 rounded"><Trash2 size={16}/></button></div></div>))}</div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold">Gerenciar Serviços</h1><button onClick={() => setEditingItem({})} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Novo</button></div>
            {editingItem ? (
              <form onSubmit={saveService} className="bg-[#1e1e24] p-8 rounded-xl border border-white/10 max-w-2xl space-y-4">
                <input name="title" defaultValue={editingItem.title} placeholder="Nome do Serviço" required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" />
                <textarea name="text" defaultValue={editingItem.text} placeholder="Descrição" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" rows="3" />
                <select name="icon" defaultValue={editingItem.icon || 'Layers'} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white">
                  {Object.keys(SERVICE_ICONS).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                </select>
                <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 px-4">Cancelar</button><button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded font-bold">Salvar</button></div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{db.services.map(s => (<div key={s.id} className="bg-[#1e1e24] p-4 rounded-lg flex justify-between items-start border border-white/5"><div><h4 className="font-bold">{s.title}</h4><p className="text-xs text-gray-500">{s.text}</p></div><div className="flex gap-2"><button onClick={() => setEditingItem(s)} className="p-2 bg-blue-600/20 text-blue-400 rounded"><Edit2 size={16}/></button><button onClick={() => deleteService(s.id)} className="p-2 bg-red-600/20 text-red-400 rounded"><Trash2 size={16}/></button></div></div>))}</div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h1 className="text-3xl font-bold mb-8">Editar Dados</h1>
              <div className="space-y-6">
                <input name="name" value={db.profile.name} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" placeholder="Seu Nome" />
                <input name="role" value={db.profile.role} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" placeholder="Sua Profissão" />
                <input name="email" value={db.profile.email} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" placeholder="Seu Email (Principal)" />
                <div className="pt-6 border-t border-white/10"><h4 className="text-purple-400 font-bold mb-4">Texto Principal</h4><input name="bioTitle" value={db.profile.bioTitle} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white font-bold" /><textarea name="bioText" value={db.profile.bioText} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" rows="3" /></div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-8">Gerenciar Redes Sociais</h1>
              <form onSubmit={addSocial} className="bg-[#1e1e24] p-6 rounded-xl border border-white/10 mb-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-400">Adicionar Nova Rede</h4>
                <select value={newSocial.platform} onChange={e => setNewSocial({...newSocial, platform: e.target.value})} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white">
                  {Object.entries(SOCIAL_PLATFORMS).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}
                </select>
                <input placeholder="Nome do Perfil (ex: @pedro)" value={newSocial.label} onChange={e => setNewSocial({...newSocial, label: e.target.value})} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" required />
                <input placeholder="Link / URL (ex: https://...)" value={newSocial.url} onChange={e => setNewSocial({...newSocial, url: e.target.value})} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" required />
                <button className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded font-bold text-sm">Adicionar</button>
              </form>
              <div className="space-y-3">
                {db.socials && db.socials.map(social => (
                  <div key={social.id} className="flex justify-between items-center bg-[#1e1e24] p-3 rounded border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="text-purple-500">{React.createElement(SOCIAL_PLATFORMS[social.platform]?.icon || Globe, { size: 18 })}</div>
                      <div><p className="text-xs font-bold uppercase text-gray-500">{SOCIAL_PLATFORMS[social.platform]?.label}</p><p className="text-sm font-bold">{social.label}</p></div>
                    </div>
                    <button onClick={() => removeSocial(social.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- APP ---
export default function App() {
  const [db, setDb] = useState(INITIAL_DB);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Conectar ao Firebase ao iniciar
    const carregarDados = async () => {
      try {
        const docRef = doc(firestoreDB, "content", "portfolio-data");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDb(docSnap.data());
        } else {
          // Se não existir dados no banco, cria o inicial
          await setDoc(docRef, INITIAL_DB);
        }
      } catch (error) {
        console.error("Erro ao conectar no banco:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') { setIsAdminMode(true); document.title = "Admin Painel"; }
  }, []);

  if (isAdminMode) return <AdminArea db={db} onUpdateDb={setDb} />;
  return <PortfolioView db={db} isLoading={loading} />;
}